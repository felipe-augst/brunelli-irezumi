import { describe, it, expect, vi, beforeEach } from 'vitest'

const { requireAdmin, redirect } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  // redirect() do Next interrompe a renderização lançando uma exceção
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

vi.mock('@/lib/require-admin', () => ({ requireAdmin }))
vi.mock('next/navigation', () => ({ redirect }))

import { requireAdminPage } from './require-admin-page'

beforeEach(() => {
  requireAdmin.mockReset()
  redirect.mockClear()
})

describe('requireAdminPage', () => {
  it('devolve a sessão quando requireAdmin aceita', async () => {
    requireAdmin.mockResolvedValue({ sub: 'admin-1', iat: 1 })

    await expect(requireAdminPage()).resolves.toEqual({
      sub: 'admin-1',
      iat: 1,
    })
    expect(redirect).not.toHaveBeenCalled()
  })

  it('redireciona para o login quando a sessão é inválida', async () => {
    requireAdmin.mockResolvedValue(null)

    await expect(requireAdminPage()).rejects.toThrow(
      'NEXT_REDIRECT:/admin/login',
    )
    expect(redirect).toHaveBeenCalledWith('/admin/login')
  })
})
