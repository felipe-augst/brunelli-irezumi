import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SignJWT } from 'jose'

const { cookieValue, findUnique } = vi.hoisted(() => ({
  cookieValue: { current: undefined as string | undefined },
  findUnique: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === 'token' && cookieValue.current !== undefined
        ? { name, value: cookieValue.current }
        : undefined,
  }),
}))
vi.mock('@/lib/prisma', () => ({
  prisma: { adminUser: { findUnique } },
}))

import { requireAdmin } from '@/lib/require-admin'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

function tokenIssuedAt(seconds: number, sub = 'admin-1') {
  return new SignJWT({ sub })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(seconds)
    .setExpirationTime(seconds + 7 * 24 * 60 * 60)
    .sign(secret)
}

const NOW = Math.floor(Date.now() / 1000)
const changedAt = new Date((NOW - 600) * 1000)

beforeEach(() => {
  cookieValue.current = undefined
  findUnique.mockReset()
})

describe('requireAdmin', () => {
  it('devolve null sem cookie e não consulta o banco', async () => {
    expect(await requireAdmin()).toBeNull()
    expect(findUnique).not.toHaveBeenCalled()
  })

  it('devolve null com token inválido e não consulta o banco', async () => {
    cookieValue.current = 'token-invalido'

    expect(await requireAdmin()).toBeNull()
    expect(findUnique).not.toHaveBeenCalled()
  })

  it('rejeita token de usuário inexistente', async () => {
    cookieValue.current = await tokenIssuedAt(NOW - 10)
    findUnique.mockResolvedValue(null)

    expect(await requireAdmin()).toBeNull()
    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'admin-1' } }),
    )
  })

  it('falha fechado (null) e registra o erro se o banco falhar', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    cookieValue.current = await tokenIssuedAt(NOW - 10)
    findUnique.mockRejectedValue(new Error('banco fora do ar'))

    expect(await requireAdmin()).toBeNull()
    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it('aceita token quando a senha nunca foi trocada', async () => {
    cookieValue.current = await tokenIssuedAt(NOW - 10)
    findUnique.mockResolvedValue({ id: 'admin-1', passwordChangedAt: null })

    expect(await requireAdmin()).toMatchObject({ sub: 'admin-1' })
  })

  it('rejeita token emitido antes da troca de senha', async () => {
    cookieValue.current = await tokenIssuedAt(NOW - 3600)
    findUnique.mockResolvedValue({
      id: 'admin-1',
      passwordChangedAt: changedAt,
    })

    expect(await requireAdmin()).toBeNull()
  })

  it('aceita token emitido depois da troca de senha', async () => {
    cookieValue.current = await tokenIssuedAt(NOW - 60)
    findUnique.mockResolvedValue({
      id: 'admin-1',
      passwordChangedAt: changedAt,
    })

    expect(await requireAdmin()).toMatchObject({ sub: 'admin-1' })
  })
})
