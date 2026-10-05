'use client'

import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { cartItemCount } from '@/lib/cart'

export function CartIcon() {
  const { items, toggleDrawer } = useCart()

  const totalItems = cartItemCount(items)

  if (totalItems === 0) return null

  return (
    <button
      onClick={toggleDrawer}
      className="text-on-surface hover:text-accent relative transition-colors lg:mb-2"
    >
      <ShoppingBag size={18} />
      <span className="bg-secondary-container text-on-secondary absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold">
        {totalItems}
      </span>
    </button>
  )
}
