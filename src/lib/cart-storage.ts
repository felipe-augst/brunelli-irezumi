import type { CartItem } from '@/types/cart'

const CART_KEY = 'cart'

export function subscribeToCart(callback: () => void) {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

export function getCartSnapshot(): string {
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
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  } catch (error) {
    console.error('Falha ao salvar o carrinho no localStorage', error)
  }
  window.dispatchEvent(new Event('storage'))
}
