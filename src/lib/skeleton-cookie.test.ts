import { describe, expect, it, vi } from 'vitest'
import {
  SKELETON_COOKIE_NAME,
  SKELETON_HEAD_SCRIPT,
  SKELETON_SEEN_CLASS,
  buildSkeletonCookie,
  hasSkeletonCookie,
} from './skeleton-cookie'

describe('hasSkeletonCookie', () => {
  it('retorna false sem cookies', () => {
    expect(hasSkeletonCookie('')).toBe(false)
  })

  it('retorna true quando o cookie vale 1', () => {
    expect(hasSkeletonCookie(`${SKELETON_COOKIE_NAME}=1`)).toBe(true)
  })

  it('encontra o cookie entre outros', () => {
    expect(hasSkeletonCookie(`a=b; ${SKELETON_COOKIE_NAME}=1; c=d`)).toBe(true)
  })

  it('ignora valor diferente de 1', () => {
    expect(hasSkeletonCookie(`${SKELETON_COOKIE_NAME}=0`)).toBe(false)
  })

  it('ignora cookie com nome parecido', () => {
    expect(hasSkeletonCookie(`x_${SKELETON_COOKIE_NAME}=1`)).toBe(false)
  })
})

// O script do <head> repete a regra de hasSkeletonCookie em string: os dois
// precisam concordar em todos os casos.
describe('SKELETON_HEAD_SCRIPT', () => {
  const cases = [
    '',
    `${SKELETON_COOKIE_NAME}=1`,
    `a=b; ${SKELETON_COOKIE_NAME}=1; c=d`,
    `${SKELETON_COOKIE_NAME}=0`,
    `x_${SKELETON_COOKIE_NAME}=1`,
  ]

  it.each(cases)('concorda com hasSkeletonCookie para "%s"', (cookie) => {
    const classList = { add: vi.fn() }
    const fakeDocument = { cookie, documentElement: { classList } }

    new Function('document', SKELETON_HEAD_SCRIPT)(fakeDocument)

    expect(classList.add.mock.calls.length > 0).toBe(hasSkeletonCookie(cookie))
    if (hasSkeletonCookie(cookie)) {
      expect(classList.add).toHaveBeenCalledWith(SKELETON_SEEN_CLASS)
    }
  })
})

describe('buildSkeletonCookie', () => {
  it('monta o cookie de 1 dia com path e SameSite=Lax', () => {
    expect(buildSkeletonCookie({ secure: false })).toBe(
      `${SKELETON_COOKIE_NAME}=1; Max-Age=86400; Path=/; SameSite=Lax`,
    )
  })

  it('acrescenta Secure em produção', () => {
    expect(buildSkeletonCookie({ secure: true })).toMatch(/; Secure$/)
  })
})
