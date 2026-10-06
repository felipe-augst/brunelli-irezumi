import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CartItem } from '@/types/cart'

const item: CartItem = {
  productId: 'p1',
  title: 'Camiseta',
  priceCents: 10000,
  promoPriceCents: null,
  quantity: 1,
  imageUrl: null,
}

async function loadStorage() {
  vi.resetModules()
  return import('./cart-storage')
}

describe('cart-storage', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('grava e lê do localStorage no caminho feliz', async () => {
    const storage = await loadStorage()
    storage.persistCart([item])
    expect(storage.getCartSnapshot()).toBe(JSON.stringify([item]))
  })

  it('setItem lançando mantém o carrinho em memória', async () => {
    const storage = await loadStorage()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => storage.persistCart([item])).not.toThrow()
    expect(console.error).toHaveBeenCalled()
    const snapshot = storage.getCartSnapshot()
    expect(typeof snapshot).toBe('string')
    expect(snapshot).toBe(JSON.stringify([item]))
    expect(storage.getCartSnapshot()).toBe(snapshot)
  })

  it('getItem lançando devolve [] sem valor em memória', async () => {
    const storage = await loadStorage()
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(storage.getCartSnapshot()).toBe('[]')
  })

  it('setItem voltando a funcionar limpa a memória', async () => {
    const storage = await loadStorage()
    const setItem = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementationOnce(() => {
        throw new Error('QuotaExceededError')
      })
    storage.persistCart([item])
    expect(storage.getCartSnapshot()).toBe(JSON.stringify([item]))

    storage.persistCart([])
    expect(setItem).toHaveBeenCalledTimes(2)
    expect(storage.getCartSnapshot()).toBe('[]')
    expect(localStorage.getItem('cart')).toBe('[]')
  })
})
