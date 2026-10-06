import { describe, expect, it } from 'vitest'
import {
  getPricingError,
  getPricingIssueMessage,
  isPromoPriceValid,
} from './product-pricing'

describe('getPricingError', () => {
  it('aceita produto com preço e sem promoção', () => {
    expect(getPricingError({ priceCents: 10000, tags: [] })).toBeNull()
  })

  it('exige preço quando o produto não é sob encomenda', () => {
    expect(getPricingError({ priceCents: null, tags: ['LIMITED'] })).toEqual({
      field: 'priceCents',
      message: 'Preço é obrigatório',
    })
    expect(getPricingError({ priceCents: undefined, tags: [] })?.field).toBe(
      'priceCents',
    )
  })

  it('aceita sob encomenda sem preço', () => {
    expect(
      getPricingError({ priceCents: null, tags: ['MADE_TO_ORDER'] }),
    ).toBeNull()
  })

  it('aceita sob encomenda com preço de referência', () => {
    expect(
      getPricingError({ priceCents: 10000, tags: ['MADE_TO_ORDER'] }),
    ).toBeNull()
  })

  it('rejeita promoção em produto sob encomenda', () => {
    expect(
      getPricingError({
        priceCents: 10000,
        promoPriceCents: 8000,
        tags: ['MADE_TO_ORDER', 'ON_SALE'],
      })?.field,
    ).toBe('promoPriceCents')
  })

  it('rejeita promoção maior ou igual ao preço', () => {
    expect(
      getPricingError({
        priceCents: 10000,
        promoPriceCents: 10000,
        tags: ['ON_SALE'],
      }),
    ).toEqual({
      field: 'promoPriceCents',
      message: 'Preço promocional deve ser menor que o preço normal',
    })
  })

  it('rejeita promoção sem a tag ON_SALE', () => {
    expect(
      getPricingError({ priceCents: 10000, promoPriceCents: 8000, tags: [] }),
    ).toEqual({
      field: 'tags',
      message: 'Marque a tag Promoção ao definir um preço promocional',
    })
  })

  it('rejeita a tag ON_SALE sem promoção', () => {
    expect(getPricingError({ priceCents: 10000, tags: ['ON_SALE'] })).toEqual({
      field: 'promoPriceCents',
      message: 'A tag Promoção exige um preço promocional',
    })
  })

  it('aceita promoção válida com a tag ON_SALE', () => {
    expect(
      getPricingError({
        priceCents: 10000,
        promoPriceCents: 8000,
        tags: ['ON_SALE'],
      }),
    ).toBeNull()
  })
})

describe('isPromoPriceValid', () => {
  it('é válido sem promoção (null)', () => {
    expect(isPromoPriceValid(10000, null)).toBe(true)
  })

  it('é válido sem promoção (undefined)', () => {
    expect(isPromoPriceValid(10000, undefined)).toBe(true)
  })

  it('é válido quando a promoção é menor que o preço', () => {
    expect(isPromoPriceValid(10000, 8000)).toBe(true)
  })

  it('é inválido quando a promoção é igual ao preço', () => {
    expect(isPromoPriceValid(10000, 10000)).toBe(false)
  })

  it('é inválido quando a promoção é maior que o preço', () => {
    expect(isPromoPriceValid(10000, 12000)).toBe(false)
  })
})

describe('getPricingIssueMessage', () => {
  it('devolve a mensagem de issue custom em campo de preço', () => {
    expect(
      getPricingIssueMessage([
        { code: 'custom', path: ['tags'], message: 'Marque a tag Promoção' },
      ]),
    ).toBe('Marque a tag Promoção')
  })

  it('ignora issue custom fora dos campos de preço e issues que não são custom', () => {
    expect(
      getPricingIssueMessage([
        { code: 'custom', path: ['title'], message: 'outro refine' },
        { code: 'too_small', path: ['promoPriceCents'], message: 'Too small' },
        { code: 'custom', path: [], message: 'sem caminho' },
      ]),
    ).toBeNull()
  })
})
