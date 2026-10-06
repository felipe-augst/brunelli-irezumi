import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { CartProvider } from './CartProvider'
import { CartIcon } from './CartIcon'
import { CartDrawer } from './CartDrawer'
import { persistCart } from '@/lib/cart-storage'
import type { CartItem } from '@/types/cart'

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: 'p1',
    title: 'Camiseta',
    priceCents: 5000,
    promoPriceCents: null,
    quantity: 1,
    imageUrl: null,
    ...overrides,
  }
}

function renderShop(items: CartItem[]) {
  localStorage.clear()
  act(() => persistCart(items))
  return render(
    <CartProvider>
      <main>página</main>
      <CartIcon />
      <CartDrawer />
    </CartProvider>,
  )
}

describe('CartDrawer', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('fechado, o painel é inert', () => {
    renderShop([makeItem()])
    expect(document.querySelector('[role="dialog"]')).toHaveAttribute('inert')
  })

  it('aberto, expõe um diálogo nomeado e leva o foco para dentro', async () => {
    const user = userEvent.setup()
    renderShop([makeItem()])
    await user.click(screen.getByRole('button', { name: /Abrir carrinho/ }))

    const dialog = screen.getByRole('dialog', { name: 'Carrinho' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).not.toHaveAttribute('inert')
    expect(dialog).toContainElement(document.activeElement as HTMLElement)
    expect(screen.getByRole('main')).toHaveAttribute('inert')
  })

  it('Escape fecha e devolve o foco ao botão do carrinho', async () => {
    const user = userEvent.setup()
    renderShop([makeItem()])
    const opener = screen.getByRole('button', { name: /Abrir carrinho/ })
    await user.click(opener)
    await user.keyboard('{Escape}')

    expect(document.querySelector('[role="dialog"]')).toHaveAttribute('inert')
    expect(opener).toHaveFocus()
  })

  it('clicar em "+" mantém o foco no "+"', async () => {
    const user = userEvent.setup()
    renderShop([makeItem()])
    await user.click(screen.getByRole('button', { name: /Abrir carrinho/ }))
    const plus = screen.getByRole('button', { name: /Aumentar quantidade/ })
    await user.click(plus)
    expect(plus).toHaveFocus()
  })

  it('remover o último item e fechar leva o foco ao main', async () => {
    const user = userEvent.setup()
    renderShop([makeItem()])
    await user.click(screen.getByRole('button', { name: /Abrir carrinho/ }))
    await user.click(screen.getByRole('button', { name: /Remover Camiseta/ }))
    await user.keyboard('{Escape}')
    expect(screen.getByRole('main')).toHaveFocus()
  })

  it('o backdrop não usa blur-3xl e fecha ao clicar', async () => {
    const user = userEvent.setup()
    const { container } = renderShop([makeItem()])
    await user.click(screen.getByRole('button', { name: /Abrir carrinho/ }))

    const backdrop = container.querySelector('[aria-hidden="true"].fixed')
    expect(backdrop).not.toBeNull()
    expect(backdrop?.className).not.toContain('blur-3xl')

    // O jsdom ignora inert no clique: o atributo é a verificação que vale
    expect(backdrop).not.toHaveAttribute('inert')
    expect(screen.getByRole('dialog')).not.toHaveAttribute('inert')

    await user.click(backdrop as HTMLElement)
    expect(document.querySelector('[role="dialog"]')).toHaveAttribute('inert')
  })
})
