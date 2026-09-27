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
