import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SKELETON_COOKIE_NAME } from '@/lib/skeleton-cookie'
import { Skeleton } from './Skeleton'

function clearCookie() {
  document.cookie = `${SKELETON_COOKIE_NAME}=; Max-Age=0; Path=/`
}

describe('Skeleton', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    clearCookie()
  })

  afterEach(() => {
    vi.useRealTimers()
    clearCookie()
  })

  it('renderiza o overlay marcado com data-skeleton', () => {
    const { container } = render(<Skeleton />)
    expect(container.querySelector('[data-skeleton]')).not.toBeNull()
  })

  it('grava o cookie ao fim da abertura', () => {
    render(<Skeleton />)
    expect(document.cookie).not.toContain(`${SKELETON_COOKIE_NAME}=1`)

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(document.cookie).toContain(`${SKELETON_COOKIE_NAME}=1`)
  })

  it('esconde o overlay sozinho quando o cookie existe mas a classe não foi aplicada', () => {
    document.cookie = `${SKELETON_COOKIE_NAME}=1; Path=/`

    const { container } = render(<Skeleton />)

    expect(container.querySelector('[data-skeleton]')?.className).toContain(
      'opacity-0',
    )
  })

  it('não regrava o cookie quando a abertura já foi vista', () => {
    document.cookie = `${SKELETON_COOKIE_NAME}=1; Path=/`
    const setter = vi.spyOn(document, 'cookie', 'set')

    render(<Skeleton />)
    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(setter).not.toHaveBeenCalled()
  })
})
