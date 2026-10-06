export const MAX_FAILED_ATTEMPTS = 5
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000

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
