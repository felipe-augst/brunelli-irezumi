'use client'

import { useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useDialogA11y } from '@/hooks/useDialogA11y'
import type { GalleryImage } from '@/types'

type LightboxProps = {
  images: GalleryImage[]
  currentIndex: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}

export function Lightbox({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: LightboxProps) {
  const currentImage = images[currentIndex]
  const dialogRef = useRef<HTMLDivElement>(null)

  // Foco, armadilha, inert, Escape e retorno do foco (o Lightbox só monta aberto)
  useDialogA11y({ isOpen: true, onClose, containerRef: dialogRef })

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'ArrowLeft') onPrev()
    },
    [onNext, onPrev],
  )

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  if (!currentImage) return null

  return (
    // Overlay — clique fora fecha
    <div
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm outline-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Visualizador de imagem"
    >
      {/* Botão fechar */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="absolute top-4 right-4 z-10 text-white/70 transition-colors hover:text-white"
        aria-label="Fechar"
      >
        <span className="text-body cursor-pointer px-1 py-4 text-2xl text-red-600 transition-transform hover:scale-110 hover:text-red-400">
          x
        </span>
      </button>

      {/* Seta anterior */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPrev()
          }}
          className="absolute top-1/2 left-2 z-10 -translate-y-1/2 p-2 text-white/70 transition-colors hover:text-white md:left-4"
          aria-label="Imagem anterior"
        >
          <span className="text-accent text-4xl md:text-7xl">{'<'}</span>
        </button>
      )}

      {/* Imagem — stopPropagation evita fechar ao clicar na imagem */}
      <div
        className="relative h-full max-h-[90vh] w-full max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={currentImage.src}
          alt={currentImage.alt}
          fill
          quality={95}
          className="object-contain"
          sizes="90vw"
        />
      </div>

      {/* Seta próxima */}
      {currentIndex < images.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          className="absolute top-1/2 right-2 z-10 -translate-y-1/2 p-2 text-white/70 transition-colors hover:text-white md:right-4"
          aria-label="Próxima imagem"
        >
          <span className="text-accent text-4xl md:text-7xl">{'>'}</span>
        </button>
      )}

      {/* Contador ex: 2 / 9 */}
      <div className="font-body absolute bottom-4 text-sm tracking-widest text-white/50">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  )
}
