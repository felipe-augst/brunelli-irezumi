import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { CartProvider } from '@/components/shop/CartProvider'
import { NAV_LINKS } from '@/data/projects'
import { Header } from './Header'

function renderHeader() {
  return render(
    <CartProvider>
      <Header />
      <main>página</main>
    </CartProvider>,
  )
}

function getMenu() {
  return document.getElementById('mobile-menu') as HTMLElement
}

describe('Header (menu mobile)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('fechado, o menu é inert e sem aria-hidden', () => {
    renderHeader()
    const menu = getMenu()
    expect(menu).toHaveAttribute('inert')
    expect(menu).not.toHaveAttribute('aria-hidden')
  })

  it('fechado, todos os links do menu estão sob inert', () => {
    renderHeader()
    // O jsdom ignora inert no Tab: o atributo é a verificação que vale
    const links = getMenu().querySelectorAll('a')
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) expect(link.closest('[inert]')).not.toBeNull()
  })

  it('aberto, o foco entra no primeiro link e o fundo fica inert', async () => {
    const user = userEvent.setup()
    renderHeader()
    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))

    const menu = getMenu()
    expect(menu).not.toHaveAttribute('inert')
    const firstLink = NAV_LINKS[0]
    expect(document.activeElement).toBe(
      menu.querySelector(`a[href="${firstLink?.href}"]`),
    )
    expect(screen.getByRole('main')).toHaveAttribute('inert')
  })

  it('o botão do menu continua ativo com o menu aberto', async () => {
    const user = userEvent.setup()
    renderHeader()
    await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
    const toggle = screen.getByRole('button', { name: 'Fechar menu' })
    expect(toggle.closest('[inert]')).toBeNull()

    await user.click(toggle)
    expect(getMenu()).toHaveAttribute('inert')
  })

  it('Escape fecha o menu e devolve o foco ao botão', async () => {
    const user = userEvent.setup()
    renderHeader()
    const opener = screen.getByRole('button', { name: 'Abrir menu' })
    await user.click(opener)
    await user.keyboard('{Escape}')

    expect(getMenu()).toHaveAttribute('inert')
    expect(opener).toHaveFocus()
  })
})
