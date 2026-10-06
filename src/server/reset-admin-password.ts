import bcrypt from 'bcryptjs'
import { newPasswordSchema } from '@/schemas/password'
import { BCRYPT_COST } from '@/server/password'

export type AdminPasswordUpdate = {
  passwordHash: string
  passwordChangedAt: Date
  failedAttempts: number
  lockedUntil: Date | null
}

// Acesso ao banco injetado: a lógica fica testável sem Prisma
export type AdminStore = {
  findByEmail: (email: string) => Promise<{ id: string } | null>
  updatePassword: (id: string, data: AdminPasswordUpdate) => Promise<void>
}

// Erro causado pela entrada do operador: a mensagem é segura para exibir.
// Qualquer outro erro (banco, driver) pode carregar dados de conexão.
export class ResetInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ResetInputError'
  }
}

export class AdminNotFoundError extends ResetInputError {
  constructor(email: string) {
    super(`Nenhum admin encontrado com o e-mail ${email}`)
    this.name = 'AdminNotFoundError'
  }
}

export function validateNewPassword(password: string): string {
  const parsed = newPasswordSchema.safeParse(password)
  if (!parsed.success) {
    throw new ResetInputError(
      parsed.error.issues[0]?.message ?? 'Senha inválida',
    )
  }
  return parsed.data
}

// Redefine a senha, zera o bloqueio e invalida as sessões abertas
// (passwordChangedAt). Nunca devolve senha nem hash.
export async function resetAdminPassword(
  store: AdminStore,
  input: { email: string; newPassword: string },
): Promise<{ email: string }> {
  const newPassword = validateNewPassword(input.newPassword)

  const email = input.email.trim().toLowerCase()
  const admin = await store.findByEmail(email)
  if (!admin) throw new AdminNotFoundError(email)

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_COST)
  await store.updatePassword(admin.id, {
    passwordHash,
    passwordChangedAt: new Date(),
    failedAttempts: 0,
    lockedUntil: null,
  })

  return { email }
}

// Host, porta e banco do DATABASE_URL, sem usuário nem senha
export function describeDatabaseHost(url: string | undefined): string {
  if (!url) return '(DATABASE_URL ausente)'

  try {
    const { hostname, port, pathname } = new URL(url)
    if (!hostname) return '(DATABASE_URL inválida)'
    return `${hostname}${port ? `:${port}` : ''}${pathname}`
  } catch {
    return '(DATABASE_URL inválida)'
  }
}
