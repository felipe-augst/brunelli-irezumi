import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { RevealOnScroll } from '../RevealOnScroll'

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void

let triggerIntersection: ObserverCallback
const observe = vi.fn()
const disconnect = vi.fn()

function mockMatchMedia(reducedMotion: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: reducedMotion && query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
}

// No jsdom o layout é todo zero: simula o elemento na posição pedida
function mockElementTop(top: number) {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    top,
  } as DOMRect)
}

beforeEach(() => {
  mockElementTop(2000)
  observe.mockClear()
  disconnect.mockClear()
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: ObserverCallback) {
        triggerIntersection = callback
      }
      observe = observe
      disconnect = disconnect
    },
  )
  mockMatchMedia(false)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('RevealOnScroll', () => {
  it('esconde o conteúdo só depois de montar no navegador', () => {
    render(<RevealOnScroll>Conteúdo</RevealOnScroll>)

    expect(screen.getByText('Conteúdo')).toHaveAttribute(
      'data-reveal',
      'hidden',
    )
    expect(observe).toHaveBeenCalledTimes(1)
  })

  it('revela o conteúdo ao entrar na viewport e para de observar', () => {
    render(<RevealOnScroll>Conteúdo</RevealOnScroll>)

    triggerIntersection([{ isIntersecting: true }])

    expect(screen.getByText('Conteúdo')).toHaveAttribute('data-reveal', 'shown')
    expect(disconnect).toHaveBeenCalled()
  })

  it('ignora entradas que ainda não cruzaram a viewport', () => {
    render(<RevealOnScroll>Conteúdo</RevealOnScroll>)

    triggerIntersection([{ isIntersecting: false }])

    expect(screen.getByText('Conteúdo')).toHaveAttribute(
      'data-reveal',
      'hidden',
    )
  })

  it('não esconde conteúdo que já está visível ao montar', () => {
    mockElementTop(100)
    render(<RevealOnScroll>Conteúdo</RevealOnScroll>)

    expect(screen.getByText('Conteúdo')).not.toHaveAttribute('data-reveal')
    expect(observe).not.toHaveBeenCalled()
  })

  it('para de observar ao desmontar', () => {
    const { unmount } = render(<RevealOnScroll>Conteúdo</RevealOnScroll>)

    unmount()

    expect(disconnect).toHaveBeenCalled()
  })

  it('com movimento reduzido não esconde nem observa', () => {
    mockMatchMedia(true)
    render(<RevealOnScroll>Conteúdo</RevealOnScroll>)

    expect(screen.getByText('Conteúdo')).not.toHaveAttribute('data-reveal')
    expect(observe).not.toHaveBeenCalled()
  })

  it('sem IntersectionObserver mantém o conteúdo visível', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    render(<RevealOnScroll>Conteúdo</RevealOnScroll>)

    expect(screen.getByText('Conteúdo')).not.toHaveAttribute('data-reveal')
  })

  it('repassa delay, duração, deslocamento e className', () => {
    render(
      <RevealOnScroll delay={0.3} duration={0.8} y={40} className="extra">
        Conteúdo
      </RevealOnScroll>,
    )
    const el = screen.getByText('Conteúdo')

    expect(el).toHaveClass('extra')
    expect(el.style.getPropertyValue('--reveal-delay')).toBe('0.3s')
    expect(el.style.getPropertyValue('--reveal-duration')).toBe('0.8s')
    expect(el.style.getPropertyValue('--reveal-y')).toBe('40px')
  })
})
