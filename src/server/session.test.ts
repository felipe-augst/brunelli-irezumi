import { describe, it, expect } from 'vitest'
import { isSessionValid } from './session'

// iat do JWT é em segundos; passwordChangedAt é Date (ms)
const changedAt = new Date('2026-01-01T00:00:10.500Z')
const changedAtSeconds = Math.floor(changedAt.getTime() / 1000)

describe('isSessionValid', () => {
  it('aceita qualquer token quando a senha nunca foi trocada', () => {
    expect(isSessionValid(1, null)).toBe(true)
  })

  it('rejeita token emitido antes da troca de senha', () => {
    expect(isSessionValid(changedAtSeconds - 1, changedAt)).toBe(false)
  })

  it('aceita token emitido no mesmo segundo da troca (sessão reemitida)', () => {
    expect(isSessionValid(changedAtSeconds, changedAt)).toBe(true)
  })

  it('aceita token emitido depois da troca', () => {
    expect(isSessionValid(changedAtSeconds + 60, changedAt)).toBe(true)
  })

  it('rejeita token sem iat quando a senha já foi trocada', () => {
    expect(isSessionValid(undefined, changedAt)).toBe(false)
  })

  it('aceita token sem iat quando a senha nunca foi trocada', () => {
    expect(isSessionValid(undefined, null)).toBe(true)
  })
})
