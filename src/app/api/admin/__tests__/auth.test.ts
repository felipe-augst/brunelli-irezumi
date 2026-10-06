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

// Toda rota de /api/admin é protegida. Exceção pública exige justificativa
// aqui, no formato "<caminho relativo da rota> <MÉTODO>" (hoje não há nenhuma).
const PUBLIC_EXCEPTIONS: string[] = []

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
  const found: { key: string; method: string; handler: Handler }[] = []
  for (const [path, load] of Object.entries(routeModules)) {
    const mod = await load()
    for (const method of METHODS) {
      const handler = mod[method]
      if (typeof handler === 'function') {
        found.push({
          key: `${routeKey(path)} ${method}`,
          method,
          handler: handler as Handler,
        })
      }
    }
  }
  return found
}

const handlers = await discoverHandlers()

const params = Promise.resolve({ id: 'x', imageId: 'y' })

const BODY_METHODS = ['POST', 'PUT', 'PATCH']

// Usa o método real do handler; só os que recebem corpo mandam JSON
function callHandler(method: string, handler: Handler) {
  const hasBody = BODY_METHODS.includes(method)
  return handler(
    new Request('http://localhost/api/admin/x', {
      method,
      ...(hasBody && {
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      }),
    }),
    { params },
  )
}

beforeEach(() => {
  touched.length = 0
  cookieValue.current = undefined
})

const protectedHandlers = handlers.filter(
  (h) => !PUBLIC_EXCEPTIONS.includes(h.key),
)

describe('/api/admin/*: autenticação', () => {
  it('descobre as rotas sozinho', () => {
    expect(handlers.length).toBeGreaterThan(0)
  })

  it('toda exceção pública corresponde a um handler existente', () => {
    const keys = handlers.map((h) => h.key)
    expect(PUBLIC_EXCEPTIONS.filter((key) => !keys.includes(key))).toEqual([])
  })

  describe.each(protectedHandlers)('$key', ({ method, handler }) => {
    it('responde 401 em JSON sem cookie e não toca banco nem R2', async () => {
      const res = await callHandler(method, handler)

      expect(res.status).toBe(401)
      expect(res.headers.get('content-type')).toContain('application/json')
      const body = (await res.json()) as { error: unknown }
      expect(typeof body.error).toBe('string')
      expect(touched).toEqual([])
    })

    it('responde 401 com token inválido e não toca banco nem R2', async () => {
      cookieValue.current = 'token-invalido'

      const res = await callHandler(method, handler)

      expect(res.status).toBe(401)
      expect(touched).toEqual([])
    })
  })
})
