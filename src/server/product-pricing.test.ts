import { describe, expect, it } from 'vitest'
import { isPromoPriceValid } from './product-pricing'

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
