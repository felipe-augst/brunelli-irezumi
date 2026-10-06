import { describe, it, expect, vi, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const { cookieValue, findUnique, update } = vi.hoisted(() => ({
  cookieValue: { current: undefined as string | undefined },
  findUnique: vi.fn(),
  update: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === 'token' && cookieValue.current !== undefined
        ? { name, value: cookieValue.current }
        : undefined,
  }),
}))
vi.mock('@/lib/prisma', () => ({
  prisma: { adminUser: { findUnique, update } },
}))

import { POST } from './route'
import { verifyToken } from '@/lib/auth'
import { BCRYPT_COST } from '@/server/password'
import { MAX_FAILED_ATTEMPTS } from '@/server/auth'

const CURRENT = 'senha-atual-123'
const NEW = 'uma-senha-nova-forte'
const secret = new TextEncoder().encode(process.env.JWT_SECRET)

// Custo baixo só para o teste ficar rápido; a rota compara com qualquer custo
const currentHash = bcrypt.hashSync(CURRENT, 4)

function adminRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'admin-1',
    passwordHash: currentHash,
    failedAttempts: 0,
    lockedUntil: null,
    passwordChangedAt: null,
    ...overrides,
  }
}

async function validToken() {
  const now = Math.floor(Date.now() / 1000)
  return new SignJWT({ sub: 'admin-1' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now - 30)
    .setExpirationTime(now + 3600)
    .sign(secret)
}

function post(body: unknown) {
  return POST(
    new Request('http://localhost/api/admin/password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  )
}

const validBody = {
  currentPassword: CURRENT,
  newPassword: NEW,
  confirmNewPassword: NEW,
}

beforeEach(async () => {
  cookieValue.current = await validToken()
  findUnique.mockReset()
  update.mockReset()
  findUnique.mockResolvedValue(adminRecord())
  update.mockResolvedValue({ failedAttempts: 1 })
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('POST /api/admin/password', () => {
  it('responde 401 sem sessão e não toca o banco', async () => {
    cookieValue.current = undefined

    const res = await post(validBody)

    expect(res.status).toBe(401)
    expect(findUnique).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it('responde 400 com corpo que não é JSON', async () => {
    const res = await post('{ não é json')

    expect(res.status).toBe(400)
    expect(update).not.toHaveBeenCalled()
  })

  it('responde 400 com senha nova fraca', async () => {
    const res = await post({
      ...validBody,
      newPassword: 'curta',
      confirmNewPassword: 'curta',
    })

    expect(res.status).toBe(400)
    expect(update).not.toHaveBeenCalled()
  })

  it('responde 400 com senha nova igual à atual', async () => {
    const res = await post({
      currentPassword: CURRENT,
      newPassword: CURRENT,
      confirmNewPassword: CURRENT,
    })

    expect(res.status).toBe(400)
    expect(update).not.toHaveBeenCalled()
  })

  it('responde 400 com confirmação diferente', async () => {
    const res = await post({
      ...validBody,
      confirmNewPassword: 'outra-senha-x',
    })

    expect(res.status).toBe(400)
    expect(update).not.toHaveBeenCalled()
  })

  it('responde 401 genérico com senha atual errada e conta o erro', async () => {
    const res = await post({ ...validBody, currentPassword: 'senha-errada-99' })

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Credenciais inválidas' })
    expect(update).toHaveBeenCalledWith({
      where: { id: 'admin-1' },
      data: { failedAttempts: { increment: 1 } },
    })
  })

  it('bloqueia a conta ao atingir o limite de erros', async () => {
    update.mockResolvedValueOnce({ failedAttempts: MAX_FAILED_ATTEMPTS })

    const res = await post({ ...validBody, currentPassword: 'senha-errada-99' })

    expect(res.status).toBe(401)
    expect(update).toHaveBeenCalledTimes(2)
    const lockCall = update.mock.calls[1]?.[0] as {
      data: { lockedUntil: Date }
    }
    expect(lockCall.data.lockedUntil.getTime()).toBeGreaterThan(Date.now())
  })

  it('responde 401 com conta bloqueada, mesmo com a senha certa', async () => {
    findUnique.mockResolvedValue(
      adminRecord({ lockedUntil: new Date(Date.now() + 60_000) }),
    )

    const res = await post(validBody)

    expect(res.status).toBe(401)
    expect(update).not.toHaveBeenCalled()
  })

  it('zera um bloqueio já expirado antes de validar a senha atual', async () => {
    findUnique.mockResolvedValue(
      adminRecord({
        failedAttempts: MAX_FAILED_ATTEMPTS,
        lockedUntil: new Date(Date.now() - 1000),
      }),
    )

    const res = await post({ ...validBody, currentPassword: 'senha-errada-99' })

    expect(res.status).toBe(401)
    // primeiro update: zera o bloqueio expirado; depois conta o novo erro
    expect(update.mock.calls[0]?.[0]).toEqual({
      where: { id: 'admin-1' },
      data: { failedAttempts: 0, lockedUntil: null },
    })
    expect(update.mock.calls[1]?.[0]).toEqual({
      where: { id: 'admin-1' },
      data: { failedAttempts: { increment: 1 } },
    })
  })

  it('grava o novo hash com o custo padrão e invalida sessões antigas', async () => {
    const before = Date.now()

    const res = await post(validBody)

    expect(res.status).toBe(200)
    expect(update).toHaveBeenCalledTimes(1)
    const call = update.mock.calls[0]?.[0] as {
      where: { id: string }
      data: {
        passwordHash: string
        passwordChangedAt: Date
        failedAttempts: number
        lockedUntil: null
      }
    }
    expect(call.where).toEqual({ id: 'admin-1' })
    expect(await bcrypt.compare(NEW, call.data.passwordHash)).toBe(true)
    expect(bcrypt.getRounds(call.data.passwordHash)).toBe(BCRYPT_COST)
    expect(call.data.passwordChangedAt.getTime()).toBeGreaterThanOrEqual(before)
    expect(call.data.failedAttempts).toBe(0)
    expect(call.data.lockedUntil).toBeNull()
  })

  it('reemite o cookie para quem trocou continuar logado', async () => {
    const res = await post(validBody)

    const setCookie = res.headers.get('set-cookie') ?? ''
    expect(setCookie).toMatch(/token=/)
    expect(setCookie.toLowerCase()).toContain('httponly')
    expect(setCookie.toLowerCase()).toContain('samesite=lax')

    const newToken = /token=([^;]+)/.exec(setCookie)?.[1] ?? ''
    const payload = await verifyToken(newToken)
    const call = update.mock.calls[0]?.[0] as {
      data: { passwordChangedAt: Date }
    }
    expect(payload?.sub).toBe('admin-1')
    expect(payload?.iat).toBeGreaterThanOrEqual(
      Math.floor(call.data.passwordChangedAt.getTime() / 1000),
    )
  })

  it('responde 500 genérico se o banco falhar, sem vazar o erro', async () => {
    update.mockRejectedValue(new Error('detalhe interno do banco'))

    const res = await post(validBody)

    expect(res.status).toBe(500)
    expect(JSON.stringify(await res.json())).not.toContain('detalhe interno')
    expect(console.error).toHaveBeenCalled()
  })
})
