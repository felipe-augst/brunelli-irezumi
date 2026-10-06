// Promoção é válida quando não existe ou quando é menor que o preço normal.
export function isPromoPriceValid(
  priceCents: number,
  promoPriceCents: number | null | undefined,
): boolean {
  if (promoPriceCents === null || promoPriceCents === undefined) return true
  return promoPriceCents < priceCents
}

type PricingInput = {
  priceCents?: number | null
  promoPriceCents?: number | null
  tags: readonly string[]
}

export type PricingError = {
  field: 'priceCents' | 'promoPriceCents' | 'tags'
  message: string
}

// Regras que cruzam preço, promoção e tags. Serve à criação (schema) e ao
// PATCH (estado efetivo, já mesclado com o produto atual).
export function getPricingError({
  priceCents,
  promoPriceCents,
  tags,
}: PricingInput): PricingError | null {
  const isMadeToOrder = tags.includes('MADE_TO_ORDER')
  const isOnSale = tags.includes('ON_SALE')
  const hasPromo = promoPriceCents !== null && promoPriceCents !== undefined
  const hasPrice = priceCents !== null && priceCents !== undefined

  if (!hasPrice && !isMadeToOrder) {
    return { field: 'priceCents', message: 'Preço é obrigatório' }
  }

  if (hasPromo && isMadeToOrder) {
    return {
      field: 'promoPriceCents',
      message: 'Produto sob encomenda não pode ter preço promocional',
    }
  }

  if (hasPromo && hasPrice && !isPromoPriceValid(priceCents, promoPriceCents)) {
    return {
      field: 'promoPriceCents',
      message: 'Preço promocional deve ser menor que o preço normal',
    }
  }

  if (hasPromo && !isOnSale) {
    return {
      field: 'tags',
      message: 'Marque a tag Promoção ao definir um preço promocional',
    }
  }

  if (!hasPromo && isOnSale) {
    return {
      field: 'promoPriceCents',
      message: 'A tag Promoção exige um preço promocional',
    }
  }

  return null
}
