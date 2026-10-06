import { beforeEach, describe, expect, it, vi } from 'vitest'

const { requireAdmin, create } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  create: vi.fn(),
}))

vi.mock('@/lib/require-admin', () => ({ requireAdmin }))
vi.mock('@/lib/prisma', () => ({ prisma: { product: { create } } }))
vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }))

import { POST } from './route'

const validBody = {
  title: 'Tenugui Carpa',
  description: 'Tenugui de algodão',
  priceCents: 5000,
  category: 'TENUGUI',
  tags: [],
}

function post(body: unknown) {
  return POST(
    new Request('http://localhost/api/admin/products', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  )
}

describe('POST /api/admin/products', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAdmin.mockResolvedValue({ id: 'admin-1' })
  })

  it('responde 401 sem sessão de admin', async () => {
    requireAdmin.mockResolvedValue(null)

    const res = await post(validBody)

    expect(res.status).toBe(401)
    expect(create).not.toHaveBeenCalled()
  })

  it('400 com a mensagem de preço quando há promoção sem a tag Promoção', async () => {
    const res = await post({ ...validBody, promoPriceCents: 4000 })

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({
      error: 'Marque a tag Promoção ao definir um preço promocional',
    })
    expect(create).not.toHaveBeenCalled()
  })

  it('400 com a mensagem de preço quando a tag Promoção não tem promoção', async () => {
    const res = await post({ ...validBody, tags: ['ON_SALE'] })

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({
      error: 'A tag Promoção exige um preço promocional',
    })
  })

  it('400 genérico, sem texto do Zod, quando outro campo é inválido', async () => {
    const res = await post({ ...validBody, tags: false })

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Dados do produto inválidos' })
  })
})
