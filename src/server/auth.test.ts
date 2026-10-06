import { describe, it, expect } from 'vitest'
import { isAccountLocked } from './auth'

describe('isAccountLocked', () => {
  it('retorna false quando lockedUntil é null', () => {
    expect(isAccountLocked({ lockedUntil: null })).toBe(false)
  })

  it('retorna false quando lockedUntil já passou', () => {
    const past = new Date(Date.now() - 1000)
    expect(isAccountLocked({ lockedUntil: past })).toBe(false)
  })

  it('retorna true quando lockedUntil ainda está no futuro', () => {
    const future = new Date(Date.now() + 1000 * 60 * 15)
    expect(isAccountLocked({ lockedUntil: future })).toBe(true)
  })
})
