import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PasswordInput } from '../PasswordInput'

describe('PasswordInput', () => {
  it('começa oculto, com o botão oferecendo mostrar a senha', () => {
    render(<PasswordInput id="password" aria-label="Senha" />)

    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password')
    expect(
      screen.getByRole('button', { name: 'Mostrar senha' }),
    ).toHaveAttribute('aria-pressed', 'false')
  })

  it('alterna entre mostrar e ocultar sem perder o que foi digitado', async () => {
    const user = userEvent.setup()
    render(<PasswordInput id="password" aria-label="Senha" />)
    const input = screen.getByLabelText('Senha')
    await user.type(input, 'segredo-123')

    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }))
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveValue('segredo-123')
    expect(
      screen.getByRole('button', { name: 'Ocultar senha' }),
    ).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: 'Ocultar senha' }))
    expect(input).toHaveAttribute('type', 'password')
    expect(input).toHaveValue('segredo-123')
  })

  it('repassa as props do input (id, autoComplete, onChange)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <PasswordInput
        id="new"
        aria-label="Nova"
        autoComplete="new-password"
        onChange={onChange}
      />,
    )
    const input = screen.getByLabelText('Nova')

    await user.type(input, 'a')

    expect(input).toHaveAttribute('id', 'new')
    expect(input).toHaveAttribute('autocomplete', 'new-password')
    expect(onChange).toHaveBeenCalled()
    expect(
      screen.getByRole('button', { name: 'Mostrar senha' }),
    ).toHaveAttribute('aria-controls', 'new')
  })

  it('não envia o formulário ao clicar no botão', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <PasswordInput id="password" aria-label="Senha" />
      </form>,
    )

    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('aceita className extra no input', () => {
    render(<PasswordInput id="p" aria-label="Senha" className="w-1/2" />)

    expect(screen.getByLabelText('Senha')).toHaveClass('w-1/2')
  })
})
