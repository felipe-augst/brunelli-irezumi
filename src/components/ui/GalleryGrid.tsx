'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Lightbox } from './Lightbox'
import type { GalleryImage } from '@/types'

type GalleryGridProps = {
  images: GalleryImage[]
}

export function GalleryGrid({ images }: GalleryGridProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const handleOpen = useCallback((index: number) => {
    setActiveIndex(index)
  }, [])

  const handleClose = useCallback(() => {
    setActiveIndex(null)
  }, [])

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => {
      if (prev === null) return null
      return prev < images.length - 1 ? prev + 1 : prev
    })
  }, [images.length])

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => {
      if (prev === null) return null
      return prev > 0 ? prev - 1 : prev
    })
  }, [])

  return (
    <>
      <div className="grid grid-cols-2 gap-0.5 px-3 md:grid-cols-3 lg:grid-cols-4 lg:px-6">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => handleOpen(index)}
            className="bg-surface group focus-visible:outline-secondary relative aspect-3/4 cursor-zoom-in overflow-hidden focus-visible:outline"
            aria-label={`Abrir: ${image.alt}`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              quality={85}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </button>
        ))}
      </div>

      {/* Lightbox só monta no DOM quando activeIndex não é null */}
      {activeIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={activeIndex}
          onClose={handleClose}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
    </>
  )
}
