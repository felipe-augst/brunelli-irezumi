import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ChangePasswordForm } from './ChangePasswordForm'

const fetchMock = vi.fn()

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body } as Response
}

async function fillAndSubmit(
  values: { current?: string; next?: string; confirm?: string } = {},
) {
  const user = userEvent.setup()
  render(<ChangePasswordForm />)
  await user.type(
    screen.getByLabelText('Senha atual'),
    values.current ?? 'senha-atual-123',
  )
  await user.type(
    screen.getByLabelText('Nova senha'),
    values.next ?? 'uma-senha-nova-forte',
  )
  await user.type(
    screen.getByLabelText('Repetir nova senha'),
    values.confirm ?? values.next ?? 'uma-senha-nova-forte',
  )
  await user.click(screen.getByRole('button', { name: 'Trocar senha' }))
  return user
}

describe('ChangePasswordForm', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('não envia nada quando a nova senha é curta e mostra o erro', async () => {
    await fillAndSubmit({ next: 'curta' })

    expect(await screen.findByText(/ao menos 12 caracteres/)).toBeVisible()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('não envia nada quando a confirmação não confere', async () => {
    await fillAndSubmit({ confirm: 'outra-senha-qualquer' })

    expect(await screen.findByText(/não confere/)).toBeVisible()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('envia os três campos para a rota de troca de senha', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true }))

    await fillAndSubmit()

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/admin/password')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({
      currentPassword: 'senha-atual-123',
      newPassword: 'uma-senha-nova-forte',
      confirmNewPassword: 'uma-senha-nova-forte',
    })
  })

  it('confirma o sucesso e limpa os campos', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true }))

    await fillAndSubmit()

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Senha alterada',
    )
    expect(screen.getByLabelText('Senha atual')).toHaveValue('')
    expect(screen.getByLabelText('Nova senha')).toHaveValue('')
    expect(screen.getByLabelText('Repetir nova senha')).toHaveValue('')
  })

  it('mostra o erro da API e mantém os campos preenchidos', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: 'Credenciais inválidas' }, false, 401),
    )

    await fillAndSubmit()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Credenciais inválidas',
    )
    expect(screen.getByLabelText('Nova senha')).toHaveValue(
      'uma-senha-nova-forte',
    )
  })

  it('mostra erro genérico quando a requisição falha na rede', async () => {
    fetchMock.mockRejectedValueOnce(new Error('rede'))

    await fillAndSubmit()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Erro ao trocar a senha',
    )
  })
})
