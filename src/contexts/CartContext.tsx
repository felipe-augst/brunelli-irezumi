import { createContext } from 'react'
import type { CartItem } from '@/types/cart'
import type { CatalogProduct } from '@/lib/cart'

export type CartContextValue = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  increaseQuantity: (productId: string) => void
  decreaseQuantity: (productId: string) => void
  reconcileWith: (catalog: CatalogProduct[]) => void
  isDrawerOpen: boolean
  toggleDrawer: () => void
}

export const CartContext = createContext<CartContextValue | undefined>(
  undefined,
)
