import { describe, expect, it } from 'vitest'
import { updateProductSchema } from './product'

describe('updateProductSchema', () => {
  it('aceita promoPriceCents null (remover promoção)', () => {
    const result = updateProductSchema.safeParse({ promoPriceCents: null })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.promoPriceCents).toBeNull()
  })

  it('aceita active', () => {
    const result = updateProductSchema.safeParse({ active: true })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.active).toBe(true)
  })

  it('rejeita promoção negativa', () => {
    expect(updateProductSchema.safeParse({ promoPriceCents: -1 }).success).toBe(
      false,
    )
  })

  it('rejeita categoria inválida', () => {
    expect(updateProductSchema.safeParse({ category: 'INVALID' }).success).toBe(
      false,
    )
  })

  it('não preenche tags quando omitidas', () => {
    const result = updateProductSchema.safeParse({ title: 'Novo título' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.tags).toBeUndefined()
  })
})
