import type { CartItem } from '@/types/cart'

export type CatalogProduct = {
  id: string
  title: string
  priceCents: number
  promoPriceCents: number | null
  tags: readonly string[]
  imageUrl: string | null
}

function isPositiveInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

export function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.productId === 'string' &&
    v.productId.length > 0 &&
    typeof v.title === 'string' &&
    isPositiveInt(v.priceCents) &&
    (v.promoPriceCents === null || isPositiveInt(v.promoPriceCents)) &&
    isPositiveInt(v.quantity) &&
    (typeof v.imageUrl === 'string' || v.imageUrl === null)
  )
}

/** Lê o carrinho salvo; qualquer dado inválido é descartado e nunca lança. */
export function parseCart(raw: string): CartItem[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []

  const seen = new Set<string>()
  const result: CartItem[] = []
  for (const entry of parsed as unknown[]) {
    if (!isCartItem(entry) || seen.has(entry.productId)) continue
    seen.add(entry.productId)
    result.push({
      productId: entry.productId,
      title: entry.title,
      priceCents: entry.priceCents,
      promoPriceCents: entry.promoPriceCents,
      quantity: entry.quantity,
      imageUrl: entry.imageUrl,
    })
  }
  return result
}

export function addToCart(items: CartItem[], newItem: CartItem): CartItem[] {
  const exists = items.some((item) => item.productId === newItem.productId)
  return exists
    ? items.map((item) =>
        item.productId === newItem.productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      )
    : [...items, newItem]
}

export function removeFromCart(
  items: CartItem[],
  productId: string,
): CartItem[] {
  return items.filter((item) => item.productId !== productId)
}

export function increaseQuantity(
  items: CartItem[],
  productId: string,
): CartItem[] {
  return items.map((item) =>
    item.productId === productId
      ? { ...item, quantity: item.quantity + 1 }
      : item,
  )
}

export function decreaseQuantity(
  items: CartItem[],
  productId: string,
): CartItem[] {
  return items.map((item) =>
    item.productId === productId
      ? { ...item, quantity: Math.max(1, item.quantity - 1) }
      : item,
  )
}

export function cartTotalCents(items: CartItem[]): number {
  return items.reduce(
    (sum, item) =>
      sum + (item.promoPriceCents ?? item.priceCents) * item.quantity,
    0,
  )
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export function canAddToCart(tags: readonly string[]): boolean {
  return !tags.includes('MADE_TO_ORDER') && !tags.includes('SOLD_OUT')
}

/**
 * Sincroniza o carrinho com o catálogo atual. Sem mudanças, devolve a mesma
 * referência de `items`.
 */
export function reconcileCart(
  items: CartItem[],
  catalog: CatalogProduct[],
): { items: CartItem[]; changed: boolean } {
  const byId = new Map(catalog.map((product) => [product.id, product]))
  let changed = false
  const result: CartItem[] = []

  for (const item of items) {
    const product = byId.get(item.productId)
    if (!product || !canAddToCart(product.tags)) {
      changed = true
      continue
    }
    const same =
      item.title === product.title &&
      item.priceCents === product.priceCents &&
      item.promoPriceCents === product.promoPriceCents &&
      item.imageUrl === product.imageUrl
    if (same) {
      result.push(item)
    } else {
      changed = true
      result.push({
        ...item,
        title: product.title,
        priceCents: product.priceCents,
        promoPriceCents: product.promoPriceCents,
        imageUrl: product.imageUrl,
      })
    }
  }

  return changed ? { items: result, changed } : { items, changed }
}
