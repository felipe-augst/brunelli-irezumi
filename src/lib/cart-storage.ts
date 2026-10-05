import type { CartItem } from '@/types/cart'

const CART_KEY = 'cart'

// Fallback em memória para quando o localStorage recusa a escrita (cota cheia, modo privado)
let memoryCart: string | null = null

export function subscribeToCart(callback: () => void) {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

export function getCartSnapshot(): string {
  if (memoryCart !== null) return memoryCart
  try {
    return localStorage.getItem(CART_KEY) ?? '[]'
  } catch {
    return '[]'
  }
}

export function getCartServerSnapshot(): string {
  return '[]'
}

export function persistCart(items: CartItem[]) {
  const serialized = JSON.stringify(items)
  try {
    localStorage.setItem(CART_KEY, serialized)
    memoryCart = null
  } catch (error) {
    memoryCart = serialized
    console.error('Falha ao salvar o carrinho no localStorage', error)
  }
  window.dispatchEvent(new Event('storage'))
}
