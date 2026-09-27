import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export type LockStatus = {
  lockedUntil: Date | null
}

export function isAccountLocked(adminUser: LockStatus) {
  if (!adminUser.lockedUntil) {
    return false
  }
  const now = new Date()
  return adminUser.lockedUntil > now
}

export async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) return null

  return verifyToken(token)
}
