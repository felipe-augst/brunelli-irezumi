import { beforeEach, describe, expect, it, vi } from 'vitest'

const { requireAdmin, findUnique, update } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
}))

vi.mock('@/lib/require-admin', () => ({ requireAdmin }))
vi.mock('@/lib/prisma', () => ({
  prisma: { product: { findUnique, update } },
}))
vi.mock('@/lib/r2', () => ({ deleteObject: vi.fn() }))
vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }))

import { PATCH } from './route'

const current = {
  id: 'p1',
  priceCents: 5000,
  promoPriceCents: null,
  tags: [],
}

function patch(body: unknown) {
  return PATCH(
    new Request('http://localhost/api/admin/products/p1', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id: 'p1' }) },
  )
}

describe('PATCH /api/admin/products/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAdmin.mockResolvedValue({ id: 'admin-1' })
    findUnique.mockResolvedValue(current)
  })

  it('400 com a mensagem de preço quando há promoção sem a tag Promoção', async () => {
    const res = await patch({ promoPriceCents: 4000, tags: [] })

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({
      error: 'Marque a tag Promoção ao definir um preço promocional',
    })
    expect(update).not.toHaveBeenCalled()
  })

  it('400 genérico, sem texto do Zod, quando tags não é uma lista', async () => {
    const res = await patch({ tags: false })

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Dados do produto inválidos' })
  })
})
