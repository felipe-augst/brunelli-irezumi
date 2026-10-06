import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'

const { verifyToken } = vi.hoisted(() => ({
  verifyToken: vi.fn<(token: string) => Promise<{ sub: string } | null>>(),
}))

vi.mock('@/lib/auth', () => ({ verifyToken }))

import { proxy, config } from './proxy'

const ORIGIN = 'http://localhost:3000'

function makeRequest(path: string, token?: string) {
  return new NextRequest(`${ORIGIN}${path}`, {
    headers: token ? { cookie: `token=${token}` } : undefined,
  })
}

// NextResponse.next() sinaliza a continuação pelo header x-middleware-next
function isNext(res: Response) {
  return res.headers.get('x-middleware-next') === '1'
}

function expectLoginRedirect(res: Response) {
  expect(res.status).toBe(307)
  expect(res.headers.get('location')).toBe(`${ORIGIN}/admin/login`)
}

async function expectUnauthorizedJson(res: Response) {
  expect(res.status).toBe(401)
  expect(res.headers.get('content-type')).toContain('application/json')
  expect(await res.json()).toEqual({ error: 'Não autenticado' })
}

beforeEach(() => {
  verifyToken.mockReset()
  verifyToken.mockResolvedValue(null)
})

describe('proxy: /admin/login', () => {
  it('passa sem token e não valida nada', async () => {
    const res = await proxy(makeRequest('/admin/login'))

    expect(isNext(res)).toBe(true)
    expect(verifyToken).not.toHaveBeenCalled()
  })

  // '/admin/login/' (barra final) entra aqui por documentar o comportamento
  // atual: o Next normaliza a barra antes do proxy, então não chega assim em produção
  it.each(['/admin/login/x', '/admin/login-x', '/admin/login/'])(
    'a exceção é exata: %s continua protegido',
    async (path) => {
      expectLoginRedirect(await proxy(makeRequest(path)))
    },
  )
})

describe('proxy: páginas /admin', () => {
  it('sem token redireciona para /admin/login', async () => {
    expectLoginRedirect(await proxy(makeRequest('/admin')))
    expect(verifyToken).not.toHaveBeenCalled()
  })

  it('com token inválido redireciona para /admin/login', async () => {
    expectLoginRedirect(await proxy(makeRequest('/admin/products', 'ruim')))
    expect(verifyToken).toHaveBeenCalledWith('ruim')
  })

  it('com token válido segue com NextResponse.next()', async () => {
    verifyToken.mockResolvedValue({ sub: 'admin-1' })

    const res = await proxy(makeRequest('/admin', 'bom'))

    expect(isNext(res)).toBe(true)
    expect(verifyToken).toHaveBeenCalledWith('bom')
  })
})

describe('proxy: cookie vazio', () => {
  it('token= vazio conta como sem token e não chama verifyToken', async () => {
    const page = new NextRequest(`${ORIGIN}/admin`, {
      headers: { cookie: 'token=' },
    })
    const api = new NextRequest(`${ORIGIN}/api/admin/products`, {
      headers: { cookie: 'token=' },
    })

    expectLoginRedirect(await proxy(page))
    await expectUnauthorizedJson(await proxy(api))
    expect(verifyToken).not.toHaveBeenCalled()
  })
})

describe('proxy: /api/admin', () => {
  it('sem token responde 401 em JSON', async () => {
    await expectUnauthorizedJson(
      await proxy(makeRequest('/api/admin/products')),
    )
    expect(verifyToken).not.toHaveBeenCalled()
  })

  it('com token inválido responde 401 em JSON', async () => {
    await expectUnauthorizedJson(
      await proxy(makeRequest('/api/admin/gallery', 'ruim')),
    )
    expect(verifyToken).toHaveBeenCalledWith('ruim')
  })

  it('com token válido segue com NextResponse.next()', async () => {
    verifyToken.mockResolvedValue({ sub: 'admin-1' })

    const res = await proxy(makeRequest('/api/admin/products', 'bom'))

    expect(isNext(res)).toBe(true)
  })
})

describe('proxy: matcher', () => {
  const matches = (url: string) => unstable_doesMiddlewareMatch({ config, url })

  it.each([
    '/admin',
    '/admin/',
    '/api/admin',
    '/admin/login',
    '/admin/products/1/edit',
    '/api/admin/products',
    '/api/admin/gallery/1/reorder',
  ])('cobre %s', (url) => {
    expect(matches(url)).toBe(true)
  })

  it.each([
    '/',
    '/loja',
    '/servicos/japones',
    '/api/auth/login',
    '/api/auth/logout',
    '/administrador',
    '/api/administrador',
  ])('não cobre a rota pública %s', (url) => {
    expect(matches(url)).toBe(false)
  })
})
