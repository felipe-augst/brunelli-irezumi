import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GalleryGrid } from '../GalleryGrid'
import type { GalleryImage } from '@/types'

const MOCK_IMAGES: GalleryImage[] = [
  { id: '1', src: '/img/foto1.webp', alt: 'Foto 1' },
  { id: '2', src: '/img/foto2.webp', alt: 'Foto 2' },
  { id: '3', src: '/img/foto3.webp', alt: 'Foto 3' },
]

describe('GalleryGrid', () => {
  it('renderiza um botão para cada imagem', () => {
    render(<GalleryGrid images={MOCK_IMAGES} />)
    const buttons = screen.getAllByRole('button')

    expect(buttons).toHaveLength(MOCK_IMAGES.length)
  })

  it('cada botão tem aria-label descritivo', () => {
    render(<GalleryGrid images={MOCK_IMAGES} />)
    MOCK_IMAGES.forEach((img) => {
      expect(
        screen.getByRole('button', { name: `Abrir: ${img.alt}` }),
      ).toBeInTheDocument()
    })
  })

  it('lightbox não está no DOM antes de clicar', () => {
    render(<GalleryGrid images={MOCK_IMAGES} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('abre o lightbox ao clicar em uma imagem', async () => {
    const user = userEvent.setup()
    render(<GalleryGrid images={MOCK_IMAGES} />)

    await user.click(screen.getByRole('button', { name: 'Abrir: Foto 1' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('fecha o lightbox ao clicar no botão fechar', async () => {
    const user = userEvent.setup()
    render(<GalleryGrid images={MOCK_IMAGES} />)

    await user.click(screen.getByRole('button', { name: 'Abrir: Foto 1' }))
    await user.click(screen.getByRole('button', { name: 'Fechar' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
