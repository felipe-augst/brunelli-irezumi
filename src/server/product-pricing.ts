// Promoção é válida quando não existe ou quando é menor que o preço normal.
export function isPromoPriceValid(
  priceCents: number,
  promoPriceCents: number | null | undefined,
): boolean {
  if (promoPriceCents === null || promoPriceCents === undefined) return true
  return promoPriceCents < priceCents
}
