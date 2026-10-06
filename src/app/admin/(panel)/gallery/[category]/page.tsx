import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { GalleryUploadForm } from '@/components/admin/gallery/GalleryUploadForm'
import { DeleteGalleryImageButton } from '@/components/admin/gallery/DeleteGalleryImageButton'
import { ReorderGalleryImageButtons } from '@/components/admin/gallery/ReorderGalleryImageButtons'
import type { GalleryCategory } from '@/generated/prisma/client'

const CATEGORY_MAP: Record<string, GalleryCategory> = {
  portfolio: 'PORTFOLIO',
  painting: 'PAINTING',
  coverup: 'COVERUP',
}

const CATEGORY_LABELS: Record<GalleryCategory, string> = {
  PORTFOLIO: 'Portfólio',
  PAINTING: 'Pinturas',
  COVERUP: 'Coberturas',
}

type Props = {
  params: Promise<{ category: string }>
}

export default async function GalleryCategoryPage({ params }: Props) {
  const { category: slug } = await params
  const category = CATEGORY_MAP[slug]

  if (!category) {
    notFound()
  }

  const images = await prisma.galleryImage.findMany({
    where: { category },
    orderBy: { order: 'asc' },
  })

  return (
    <div className="mt-5 flex flex-col gap-6">
      <h1 className="text-on-surface text-center text-2xl font-semibold tracking-widest uppercase">
        {CATEGORY_LABELS[category]}
      </h1>

      <GalleryUploadForm category={category} />

      {images.length === 0 ? (
        <p className="text-on-surface-variant text-sm">Álbum vazio</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="border-outline-variant bg-surface-container overflow-hidden rounded-sm border"
            >
              <div className="relative aspect-square">
                <Image
                  src={image.url}
                  alt={'Gallery image'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>

              <div className="border-outline-variant flex items-center justify-between border-t px-2 py-1.5">
                <ReorderGalleryImageButtons
                  id={image.id}
                  isFirst={index === 0}
                  isLast={index === images.length - 1}
                />
                <DeleteGalleryImageButton id={image.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
