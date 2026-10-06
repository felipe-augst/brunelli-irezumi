import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { LOCKOUT_DURATION_MS, MAX_FAILED_ATTEMPTS } from '@/server/auth'
import { BCRYPT_COST } from '@/server/password'

// Hash fictício para igualar o tempo de resposta quando não há senha a comparar
export const DUMMY_HASH = bcrypt.hashSync('dummy-password', BCRYPT_COST)

type AttemptState = {
  id: string
  failedAttempts: number
  lockedUntil: Date | null
}

// Bloqueio já vencido: zera o contador para a conta voltar a ter 5 tentativas
export async function clearExpiredLock(adminUser: AttemptState) {
  if (!adminUser.lockedUntil) return

  await prisma.adminUser.update({
    where: { id: adminUser.id },
    data: { failedAttempts: 0, lockedUntil: null },
  })
  adminUser.failedAttempts = 0
  adminUser.lockedUntil = null
}

// Conta o erro de senha e bloqueia a conta ao atingir o limite
export async function registerFailedAttempt(adminUserId: string) {
  const updated = await prisma.adminUser.update({
    where: { id: adminUserId },
    data: { failedAttempts: { increment: 1 } },
  })

  if (updated.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    await prisma.adminUser.update({
      where: { id: adminUserId },
      data: { lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS) },
    })
  }
}
