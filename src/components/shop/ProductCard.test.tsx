import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProductCard } from './ProductCard'

vi.mock('@/hooks/useCart', () => ({
  useCart: () => ({ addItem: vi.fn() }),
}))

function makeProduct(overrides = {}) {
  return {
    id: 'p1',
    title: 'Camiseta',
    description: 'Descrição',
    priceCents: 10000,
    promoPriceCents: 8000,
    category: 'CLOTHING',
    tags: ['ON_SALE'],
    images: [],
    ...overrides,
  }
}

describe('ProductCard (contraste)', () => {
  it('o preço riscado usa text-outline, sem opacidade', () => {
    render(<ProductCard product={makeProduct()} onOpenImage={vi.fn()} />)
    const old = screen.getByText(/100,00/)
    expect(old).toHaveClass('line-through', 'text-outline')
    expect(old.className).not.toMatch(/\/40/)
  })

  it('os badges sobre a foto usam fundo quase opaco', () => {
    const { container } = render(
      <ProductCard product={makeProduct()} onOpenImage={vi.fn()} />,
    )
    const badges = container.querySelectorAll('span.backdrop-blur-sm')
    expect(badges.length).toBeGreaterThan(0)
    badges.forEach((badge) => {
      expect(badge).toHaveClass('bg-surface/95')
      expect(badge).not.toHaveClass('bg-surface/80')
    })
  })
})
