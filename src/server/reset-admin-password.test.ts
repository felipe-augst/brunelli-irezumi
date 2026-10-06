import { describe, it, expect, vi } from 'vitest'
import bcrypt from 'bcryptjs'
import {
  AdminNotFoundError,
  ResetInputError,
  describeDatabaseHost,
  resetAdminPassword,
  validateNewPassword,
  type AdminStore,
} from './reset-admin-password'

const NEW_PASSWORD = 'uma-senha-bem-longa-123'

function makeStore(existing: { id: string } | null): AdminStore {
  return {
    findByEmail: vi.fn().mockResolvedValue(existing),
    updatePassword: vi.fn().mockResolvedValue(undefined),
  }
}

describe('resetAdminPassword', () => {
  it('grava o hash novo, zera o bloqueio e invalida as sessões', async () => {
    const store = makeStore({ id: 'admin-1' })
    const before = Date.now()

    await resetAdminPassword(store, {
      email: 'admin@example.com',
      newPassword: NEW_PASSWORD,
    })

    expect(store.updatePassword).toHaveBeenCalledTimes(1)
    const [id, data] = vi.mocked(store.updatePassword).mock.calls[0]!
    expect(id).toBe('admin-1')
    expect(await bcrypt.compare(NEW_PASSWORD, data.passwordHash)).toBe(true)
    expect(data.failedAttempts).toBe(0)
    expect(data.lockedUntil).toBeNull()
    expect(data.passwordChangedAt.getTime()).toBeGreaterThanOrEqual(before)
  })

  it('normaliza o e-mail para minúsculas e sem espaços', async () => {
    const store = makeStore({ id: 'admin-1' })

    const result = await resetAdminPassword(store, {
      email: '  Admin@Example.COM ',
      newPassword: NEW_PASSWORD,
    })

    expect(store.findByEmail).toHaveBeenCalledWith('admin@example.com')
    expect(result).toEqual({ email: 'admin@example.com' })
  })

  it('falha com mensagem clara e não grava nada se o admin não existe', async () => {
    const store = makeStore(null)

    await expect(
      resetAdminPassword(store, {
        email: 'ninguem@example.com',
        newPassword: NEW_PASSWORD,
      }),
    ).rejects.toThrow(AdminNotFoundError)
    await expect(
      resetAdminPassword(store, {
        email: 'ninguem@example.com',
        newPassword: NEW_PASSWORD,
      }),
    ).rejects.toThrow(
      'Nenhum admin encontrado com o e-mail ninguem@example.com',
    )
    expect(store.updatePassword).not.toHaveBeenCalled()
  })

  it('rejeita senha curta antes de acessar o banco', async () => {
    const store = makeStore({ id: 'admin-1' })

    await expect(
      resetAdminPassword(store, {
        email: 'admin@example.com',
        newPassword: 'curta',
      }),
    ).rejects.toThrow('ao menos 12 caracteres')
    expect(store.findByEmail).not.toHaveBeenCalled()
    expect(store.updatePassword).not.toHaveBeenCalled()
  })

  it('rejeita senha acima de 72 bytes antes de acessar o banco', async () => {
    const store = makeStore({ id: 'admin-1' })

    await expect(
      resetAdminPassword(store, {
        email: 'admin@example.com',
        newPassword: 'a'.repeat(73),
      }),
    ).rejects.toThrow('longa demais')
    expect(store.findByEmail).not.toHaveBeenCalled()
  })

  it('não vaza a senha nem o hash no retorno ou nos erros', async () => {
    const store = makeStore({ id: 'admin-1' })
    const result = await resetAdminPassword(store, {
      email: 'admin@example.com',
      newPassword: NEW_PASSWORD,
    })
    const [, data] = vi.mocked(store.updatePassword).mock.calls[0]!

    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain(NEW_PASSWORD)
    expect(serialized).not.toContain(data.passwordHash)

    const failing = makeStore({ id: 'admin-1' })
    vi.mocked(failing.updatePassword).mockRejectedValue(new Error('boom'))
    await expect(
      resetAdminPassword(failing, {
        email: 'admin@example.com',
        newPassword: NEW_PASSWORD,
      }),
    ).rejects.toThrow('boom')
  })
})

describe('validateNewPassword', () => {
  it('aceita uma senha válida', () => {
    expect(() => validateNewPassword(NEW_PASSWORD)).not.toThrow()
  })

  it('lança ResetInputError (mensagem segura para exibir) se inválida', () => {
    expect(() => validateNewPassword('curta')).toThrow(ResetInputError)
    expect(() => validateNewPassword('a'.repeat(73))).toThrow(ResetInputError)
  })

  it('trata admin inexistente como erro de entrada, não como falha interna', () => {
    expect(new AdminNotFoundError('x@y.com')).toBeInstanceOf(ResetInputError)
  })
})

describe('describeDatabaseHost', () => {
  it('mostra host, porta e banco sem usuário nem senha', () => {
    const url =
      'postgresql://user:segredo@ep-x.neon.tech:5432/brunelli?sslmode=verify-full'

    const description = describeDatabaseHost(url)

    expect(description).toBe('ep-x.neon.tech:5432/brunelli')
    expect(description).not.toContain('segredo')
    expect(description).not.toContain('user')
  })

  it('omite a porta quando não informada', () => {
    expect(describeDatabaseHost('postgresql://u:p@host.example/db')).toBe(
      'host.example/db',
    )
  })

  it('não vaza nada quando a URL é inválida ou está ausente', () => {
    expect(describeDatabaseHost('isto-nao-e-url:senha')).toBe(
      '(DATABASE_URL inválida)',
    )
    expect(describeDatabaseHost(undefined)).toBe('(DATABASE_URL ausente)')
  })
})
