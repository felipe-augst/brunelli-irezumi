import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { GalleryImage } from '@/types'
import type { GalleryCategory } from '@/generated/prisma/client'

const CATEGORY_ALT_LABELS: Record<GalleryCategory, string> = {
  PORTFOLIO: 'Tatuagem - Portfólio',
  PAINTING: 'Tatuagem - Pinturas',
  COVERUP: 'Tatuagem - Coberturas',
}

async function fetchGalleryImages(
  category: GalleryCategory,
): Promise<GalleryImage[]> {
  const images = await prisma.galleryImage.findMany({
    where: { category },
    orderBy: { order: 'asc' },
  })

  return images.map((image) => ({
    id: image.id,
    src: image.url,
    alt: CATEGORY_ALT_LABELS[category],
    span: 'none' as const,
  }))
}

export async function getGalleryImages(category: GalleryCategory) {
  return unstable_cache(
    () => fetchGalleryImages(category),
    ['gallery-images', category],
    { tags: ['gallery'] },
  )()
}
