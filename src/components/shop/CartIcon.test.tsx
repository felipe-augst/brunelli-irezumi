import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { CartProvider } from './CartProvider'
import { CartIcon } from './CartIcon'
import { persistCart } from '@/lib/cart-storage'
import type { CartItem } from '@/types/cart'

function makeItem(id: string, quantity: number): CartItem {
  return {
    productId: id,
    title: id,
    priceCents: 1000,
    promoPriceCents: null,
    quantity,
    imageUrl: null,
  }
}

function renderIcon(items: CartItem[]) {
  act(() => persistCart(items))
  return render(
    <CartProvider>
      <CartIcon />
    </CartProvider>,
  )
}

describe('CartIcon', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('inclui a quantidade total no nome acessível', () => {
    renderIcon([makeItem('a', 2), makeItem('b', 1)])
    expect(
      screen.getByRole('button', { name: 'Abrir carrinho, 3 itens' }),
    ).toBeInTheDocument()
  })

  it('usa o singular com um item', () => {
    renderIcon([makeItem('a', 1)])
    expect(
      screen.getByRole('button', { name: 'Abrir carrinho, 1 item' }),
    ).toBeInTheDocument()
  })
})
