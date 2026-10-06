import { useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Lightbox } from '../Lightbox'
import type { GalleryImage } from '@/types'

const MOCK_IMAGES: GalleryImage[] = [
  { id: '1', src: '/img/foto1.webp', alt: 'Foto 1' },
  { id: '2', src: '/img/foto2.webp', alt: 'Foto 2' },
  { id: '3', src: '/img/foto3.webp', alt: 'Foto 3' },
]

const onClose = vi.fn()
const onNext = vi.fn()
const onPrev = vi.fn()

beforeEach(() => {
  onClose.mockClear()
  onNext.mockClear()
  onPrev.mockClear()
})

describe('Lightbox', () => {
  it('renderiza a imagem atual corretamente', () => {
    render(
      <Lightbox
        images={MOCK_IMAGES}
        currentIndex={0}
        onClose={onClose}
        onNext={onNext}
        onPrev={onPrev}
      />,
    )
    expect(screen.getByAltText('Foto 1')).toBeInTheDocument()
  })

  it('mostra o contador correto', () => {
    render(
      <Lightbox
        images={MOCK_IMAGES}
        currentIndex={1}
        onClose={onClose}
        onNext={onNext}
        onPrev={onPrev}
      />,
    )
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
  })

  it('chama onClose ao clicar no overlay', async () => {
    const user = userEvent.setup()
    render(
      <Lightbox
        images={MOCK_IMAGES}
        currentIndex={0}
        onClose={onClose}
        onNext={onNext}
        onPrev={onPrev}
      />,
    )
    await user.click(screen.getByRole('dialog'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('chama onClose ao pressionar Escape', () => {
    render(
      <Lightbox
        images={MOCK_IMAGES}
        currentIndex={0}
        onClose={onClose}
        onNext={onNext}
        onPrev={onPrev}
      />,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('chama onNext ao pressionar ArrowRight', () => {
    render(
      <Lightbox
        images={MOCK_IMAGES}
        currentIndex={1}
        onClose={onClose}
        onNext={onNext}
        onPrev={onPrev}
      />,
    )
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('chama onPrev ao pressionar ArrowLeft', () => {
    render(
      <Lightbox
        images={MOCK_IMAGES}
        currentIndex={1}
        onClose={onClose}
        onNext={onNext}
        onPrev={onPrev}
      />,
    )
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(onPrev).toHaveBeenCalledTimes(1)
  })

  it('não mostra seta anterior na primeira imagem', () => {
    render(
      <Lightbox
        images={MOCK_IMAGES}
        currentIndex={0}
        onClose={onClose}
        onNext={onNext}
        onPrev={onPrev}
      />,
    )
    expect(
      screen.queryByRole('button', { name: 'Imagem anterior' }),
    ).not.toBeInTheDocument()
  })

  it('não mostra seta próxima na última imagem', () => {
    render(
      <Lightbox
        images={MOCK_IMAGES}
        currentIndex={2}
        onClose={onClose}
        onNext={onNext}
        onPrev={onPrev}
      />,
    )
    expect(
      screen.queryByRole('button', { name: 'Próxima imagem' }),
    ).not.toBeInTheDocument()
  })

  it('não renderiza nada com index inválido', () => {
    render(
      <Lightbox
        images={MOCK_IMAGES}
        currentIndex={99}
        onClose={onClose}
        onNext={onNext}
        onPrev={onPrev}
      />,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  describe('acessibilidade', () => {
    function renderOpen(currentIndex = 1) {
      return render(
        <Lightbox
          images={MOCK_IMAGES}
          currentIndex={currentIndex}
          onClose={onClose}
          onNext={onNext}
          onPrev={onPrev}
        />,
      )
    }

    it('move o foco para o botão de fechar ao abrir', () => {
      renderOpen()
      expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus()
    })

    it('prende Tab e Shift+Tab dentro do diálogo', async () => {
      const user = userEvent.setup()
      renderOpen()
      const dialog = screen.getByRole('dialog')
      const close = screen.getByRole('button', { name: 'Fechar' })
      const next = screen.getByRole('button', { name: 'Próxima imagem' })

      await user.tab()
      await user.tab()
      expect(dialog).toContainElement(document.activeElement as HTMLElement)
      expect(next).toHaveFocus()

      await user.tab()
      expect(close).toHaveFocus()

      await user.tab({ shift: true })
      expect(next).toHaveFocus()
    })

    it('marca o conteúdo de fundo como inert enquanto aberto', () => {
      const { unmount } = render(
        <>
          <button>Miniatura</button>
          <Lightbox
            images={MOCK_IMAGES}
            currentIndex={0}
            onClose={onClose}
            onNext={onNext}
            onPrev={onPrev}
          />
        </>,
      )
      const thumb = screen.getByText('Miniatura')
      expect(thumb).toHaveAttribute('inert')
      unmount()
      expect(thumb).not.toHaveAttribute('inert')
    })

    it('devolve o foco ao elemento que abriu ao fechar', async () => {
      const user = userEvent.setup()
      function Host() {
        const [open, setOpen] = useState(false)
        return (
          <>
            <button onClick={() => setOpen(true)}>Abrir</button>
            {open && (
              <Lightbox
                images={MOCK_IMAGES}
                currentIndex={0}
                onClose={() => setOpen(false)}
                onNext={onNext}
                onPrev={onPrev}
              />
            )}
          </>
        )
      }
      render(<Host />)
      const opener = screen.getByRole('button', { name: 'Abrir' })
      await user.click(opener)
      expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus()

      await user.click(screen.getByRole('button', { name: 'Fechar' }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(opener).toHaveFocus()
    })

    it('os botões mantêm o aria-label e não expõem texto de ícone', () => {
      renderOpen()
      for (const name of ['Fechar', 'Imagem anterior', 'Próxima imagem']) {
        const button = screen.getByRole('button', { name })
        expect(button.textContent).toBe('')
        expect(button.querySelector('svg')).toBeInTheDocument()
      }
    })
  })
})
