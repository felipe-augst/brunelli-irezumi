'use client'

import { useEffect } from 'react'
import { useCart } from '@/hooks/useCart'
import type { CatalogProduct } from '@/lib/cart'

type CartReconcilerProps = {
  catalog: CatalogProduct[]
}

export function CartReconciler({ catalog }: CartReconcilerProps) {
  const { reconcileWith } = useCart()

  useEffect(() => {
    reconcileWith(catalog)
  }, [catalog, reconcileWith])

  return null
}
