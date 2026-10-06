import { describe, it, expect, vi, beforeEach } from 'vitest'

// Dublê que registra qualquer acesso ou chamada: se um handler tocar banco
// ou R2 sem sessão, o teste enxerga.
const { touched, makeSpy, cookieValue } = vi.hoisted(() => {
  const touched: string[] = []
  const makeSpy = (name: string): unknown =>
    new Proxy(function () {}, {
      get: (_t, prop) => {
        touched.push(`${name}.${String(prop)}`)
        return makeSpy(`${name}.${String(prop)}`)
      },
      apply: () => {
        touched.push(`${name}()`)
        return Promise.resolve(null)
      },
    })
  return {
    touched,
    makeSpy,
    cookieValue: { current: undefined as string | undefined },
  }
})

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === 'token' && cookieValue.current !== undefined
        ? { name, value: cookieValue.current }
        : undefined,
  }),
}))
vi.mock('next/cache', () => ({
  revalidateTag: (...args: unknown[]) => {
    touched.push(`revalidateTag(${String(args[0])})`)
  },
}))
vi.mock('@/lib/prisma', () => ({ prisma: makeSpy('prisma') }))
vi.mock(
  '@/lib/r2',
  () =>
    new Proxy(
      {},
      {
        get: (_t, prop) =>
          prop === 'then' ? undefined : makeSpy(`r2.${String(prop)}`),
      },
    ),
)

type Handler = (
  request: Request,
  context: { params: Promise<Record<string, string>> },
) => Promise<Response>

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const

// Chave: "<caminho relativo da rota> <MÉTODO>"
const COVERED = [
  'gallery POST',
  'gallery/upload-url POST',
  'gallery/[id] DELETE',
  'gallery/[id]/reorder POST',
  'products POST',
  'products/upload-url POST',
  'products/[id] DELETE',
  'products/[id] PATCH',
  'products/[id]/images POST',
  'products/[id]/images/[imageId] DELETE',
  'products/[id]/images/[imageId]/reorder POST',
]

// Os tipos de import.meta.glob (vite/client) não estão no tsconfig; tipagem local
const routeModules = (
  import.meta as unknown as {
    glob: (
      pattern: string,
    ) => Record<string, () => Promise<Record<string, unknown>>>
  }
).glob('../**/route.ts')

function routeKey(path: string) {
  return path.replace(/^\.\.\//, '').replace(/\/route\.ts$/, '')
}

async function discoverHandlers() {
  const found: { key: string; handler: Handler }[] = []
  for (const [path, load] of Object.entries(routeModules)) {
    const mod = await load()
    for (const method of METHODS) {
      const handler = mod[method]
      if (typeof handler === 'function') {
        found.push({
          key: `${routeKey(path)} ${method}`,
          handler: handler as Handler,
        })
      }
    }
  }
  return found
}

const handlers = await discoverHandlers()

const params = Promise.resolve({ id: 'x', imageId: 'y' })

function callHandler(handler: Handler) {
  return handler(
    new Request('http://localhost/api/admin/x', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    }),
    { params },
  )
}

beforeEach(() => {
  touched.length = 0
  cookieValue.current = undefined
})

describe('/api/admin/*: autenticação', () => {
  it('descobre as rotas sozinho e cada handler está na tabela de cobertura', () => {
    expect(handlers.length).toBeGreaterThan(0)
    const missing = handlers
      .map((h) => h.key)
      .filter((key) => !COVERED.includes(key))
    expect(missing, 'handler sem teste de autenticação').toEqual([])
  })

  it('toda entrada da tabela corresponde a um handler existente', () => {
    const keys = handlers.map((h) => h.key)
    expect(COVERED.filter((key) => !keys.includes(key))).toEqual([])
  })

  describe.each(handlers)('$key', ({ handler }) => {
    it('responde 401 em JSON sem cookie e não toca banco nem R2', async () => {
      const res = await callHandler(handler)

      expect(res.status).toBe(401)
      expect(res.headers.get('content-type')).toContain('application/json')
      const body = (await res.json()) as { error: unknown }
      expect(typeof body.error).toBe('string')
      expect(touched).toEqual([])
    })

    it('responde 401 com token inválido e não toca banco nem R2', async () => {
      cookieValue.current = 'token-invalido'

      const res = await callHandler(handler)

      expect(res.status).toBe(401)
      expect(touched).toEqual([])
    })
  })
})
