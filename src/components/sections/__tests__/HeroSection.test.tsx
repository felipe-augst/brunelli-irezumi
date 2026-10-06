import { render, screen } from '@testing-library/react'
import { HeroSection } from '../HeroSection'

describe('HeroSection', () => {
  it('renderiza o título e o botão sem depender de reveal por scroll', () => {
    const { container } = render(<HeroSection />)

    expect(
      screen.getByRole('heading', { level: 1, name: /tatuagem japonesa/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /solicitar orçamento/i }),
    ).toBeInTheDocument()
    expect(container.querySelector('[data-reveal]')).toBeNull()
  })
})
