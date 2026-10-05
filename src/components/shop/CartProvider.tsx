'use client'

import { useMemo, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { CartContext } from '@/contexts/CartContext'
import type { CartItem } from '@/types/cart'
import {
  addToCart,
  decreaseQuantity as decreaseCartQuantity,
  increaseQuantity as increaseCartQuantity,
  parseCart,
  removeFromCart,
} from '@/lib/cart'
import {
  subscribeToCart,
  getCartSnapshot,
  getCartServerSnapshot,
  persistCart,
} from '@/lib/cart-storage'

/**
 * CartProvider component that manages the shopping cart state and provides cart-related functionality to its children components.
 * It uses React's Context API to share cart data and methods across the application.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  // Use useSyncExternalStore to subscribe to cart changes, with snapshot and server snapshot functions
  const rawItems = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getCartServerSnapshot,
  )
  // Dados inválidos no storage viram um carrinho vazio, sem lançar exceção
  const items = useMemo(() => parseCart(rawItems), [rawItems])

  // State to control the visibility of the cart drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  function toggleDrawer() {
    setIsDrawerOpen((prev) => !prev)
  }

  function addItem(newItem: CartItem) {
    persistCart(addToCart(items, newItem))
  }

  function removeItem(productId: string) {
    persistCart(removeFromCart(items, productId))
  }

  function increaseQuantity(productId: string) {
    persistCart(increaseCartQuantity(items, productId))
  }

  function decreaseQuantity(productId: string) {
    persistCart(decreaseCartQuantity(items, productId))
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        increaseQuantity,
        decreaseQuantity,
        isDrawerOpen,
        toggleDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
