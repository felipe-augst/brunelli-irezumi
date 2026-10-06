'use client'

import { useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
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
        className="text-on-surface-variant hover:text-on-surface absolute top-4 right-4 z-10 cursor-pointer p-2 transition-colors"
        aria-label="Fechar"
      >
        <X size={28} aria-hidden="true" />
      </button>

      {/* Seta anterior */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPrev()
          }}
          className="absolute top-1/2 left-2 z-10 -translate-y-1/2 cursor-pointer p-2 transition-transform hover:scale-110 md:left-4"
          aria-label="Imagem anterior"
        >
          <ChevronLeft
            className="text-accent size-10 md:size-16"
            aria-hidden="true"
          />
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
          className="absolute top-1/2 right-2 z-10 -translate-y-1/2 cursor-pointer p-2 transition-transform hover:scale-110 md:right-4"
          aria-label="Próxima imagem"
        >
          <ChevronRight
            className="text-accent size-10 md:size-16"
            aria-hidden="true"
          />
        </button>
      )}

      {/* Contador ex: 2 / 9 */}
      <div className="font-body text-on-surface-variant absolute bottom-4 text-sm tracking-widest">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  )
}
