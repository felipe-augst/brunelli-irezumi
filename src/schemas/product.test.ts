import { describe, expect, it } from 'vitest'
import { createProductSchema, updateProductSchema } from './product'

const validProduct = {
  title: 'Tenugui Koi',
  description: 'Pano de algodão estampado',
  priceCents: 8000,
  category: 'TENUGUI',
  tags: [],
}

function createError(overrides: Record<string, unknown>) {
  const result = createProductSchema.safeParse({
    ...validProduct,
    ...overrides,
  })
  return result.success ? null : result.error.issues[0]
}

describe('createProductSchema', () => {
  it('aceita um produto válido', () => {
    expect(createProductSchema.safeParse(validProduct).success).toBe(true)
  })

  it('limita o título a 120 caracteres', () => {
    expect(createError({ title: 'a'.repeat(120) })).toBeNull()
    expect(createError({ title: 'a'.repeat(121) })?.message).toBe(
      'Título deve ter no máximo 120 caracteres',
    )
  })

  it('limita a descrição a 2000 caracteres', () => {
    expect(createError({ description: 'a'.repeat(2000) })).toBeNull()
    expect(createError({ description: 'a'.repeat(2001) })?.message).toBe(
      'Descrição deve ter no máximo 2000 caracteres',
    )
  })

  it('limita o preço a R$ 100.000,00', () => {
    expect(createError({ priceCents: 10_000_000 })).toBeNull()
    expect(createError({ priceCents: 10_000_001 })?.message).toBe(
      'Preço deve ser no máximo R$ 100.000,00',
    )
  })

  it('limita o preço promocional a R$ 100.000,00', () => {
    const issue = createError({
      promoPriceCents: 10_000_001,
      tags: ['ON_SALE'],
    })
    expect(issue?.path).toEqual(['promoPriceCents'])
    expect(issue?.message).toBe(
      'Preço promocional deve ser no máximo R$ 100.000,00',
    )
  })

  it('exige preço fora de sob encomenda', () => {
    const issue = createError({ priceCents: undefined })
    expect(issue?.path).toEqual(['priceCents'])
    expect(issue?.message).toBe('Preço é obrigatório')
  })

  it('aceita sob encomenda sem preço', () => {
    expect(
      createError({ priceCents: undefined, tags: ['MADE_TO_ORDER'] }),
    ).toBeNull()
  })

  it('rejeita promoção em produto sob encomenda', () => {
    const issue = createError({
      promoPriceCents: 5000,
      tags: ['MADE_TO_ORDER', 'ON_SALE'],
    })
    expect(issue?.path).toEqual(['promoPriceCents'])
  })

  it('rejeita promoção maior ou igual ao preço', () => {
    const issue = createError({ promoPriceCents: 8000, tags: ['ON_SALE'] })
    expect(issue?.path).toEqual(['promoPriceCents'])
    expect(issue?.message).toBe(
      'Preço promocional deve ser menor que o preço normal',
    )
  })

  it('rejeita promoção sem a tag ON_SALE', () => {
    const issue = createError({ promoPriceCents: 5000 })
    expect(issue?.path).toEqual(['tags'])
  })

  it('rejeita a tag ON_SALE sem promoção', () => {
    const issue = createError({ tags: ['ON_SALE'] })
    expect(issue?.path).toEqual(['promoPriceCents'])
  })

  it('aceita promoção válida com a tag ON_SALE', () => {
    expect(createError({ promoPriceCents: 5000, tags: ['ON_SALE'] })).toBeNull()
  })
})

describe('updateProductSchema', () => {
  it('aplica os mesmos limites de tamanho', () => {
    expect(
      updateProductSchema.safeParse({ title: 'a'.repeat(121) }).success,
    ).toBe(false)
    expect(
      updateProductSchema.safeParse({ description: 'a'.repeat(2001) }).success,
    ).toBe(false)
    expect(
      updateProductSchema.safeParse({ priceCents: 10_000_001 }).success,
    ).toBe(false)
    expect(
      updateProductSchema.safeParse({ promoPriceCents: 10_000_001 }).success,
    ).toBe(false)
  })

  it('aceita priceCents null (preço removido em produto sob encomenda)', () => {
    const result = updateProductSchema.safeParse({ priceCents: null })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.priceCents).toBeNull()
  })

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
