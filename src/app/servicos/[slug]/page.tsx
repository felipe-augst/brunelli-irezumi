import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SERVICES, WHATSAPP_URL } from '@/data/projects'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import type { Metadata } from 'next'
import { GalleryGrid } from '@/components/ui/GalleryGrid'
import { getGalleryImages } from '@/lib/gallery'
import type { GalleryCategory } from '@/generated/prisma/client'

type Props = {
  params: Promise<{ slug: string }>
}

const SLUG_TO_CATEGORY: Record<string, GalleryCategory> = {
  tradicional: 'PAINTING',
  coverup: 'COVERUP',
}

export async function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const service = SERVICES.find((s) => s.slug === slug)
  if (!service) return {}

  return {
    title: service.title,
    description: service.description,
    alternates: {
      canonical: `/servicos/${slug}`,
    },
    openGraph: {
      title: `${service.title} | Brunelli Irezumi`,
      description: service.description,
      url: `https://brunelli-irezumi.com.br/servicos/${slug}`,
      images: [
        {
          url: `https://brunelli-irezumi.com.br${service.image.src}`,
          alt: service.image.alt,
        },
      ],
    },
  }
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params
  const service = SERVICES.find((s) => s.slug === slug)
  const category = SLUG_TO_CATEGORY[slug]
  const images = category ? await getGalleryImages(category) : []

  if (!service) notFound()

  return (
    <>
      <Header />
      <main className="bg-surface min-h-dvh pt-24 pb-24">
        <div className="mx-auto max-w-7xl">
          {/* Hero do serviço */}
          <div className="relative mb-16 aspect-16/6 overflow-hidden">
            <Image
              src={service.image.src}
              alt={service.image.alt}
              fill
              quality={90}
              priority
              className="object-cover opacity-50"
              sizes="100vw"
            />
            <div className="from-surface absolute inset-0 bg-linear-to-t via-transparent to-transparent" />
            <div className="absolute bottom-0 flex w-full items-center justify-center p-8">
              <h1 className="font-headline border-accent/60 border-b text-4xl font-black tracking-widest uppercase md:text-7xl">
                {service.title}
              </h1>
            </div>
          </div>

          {/* Grid de imagens */}
          <GalleryGrid images={images} />

          {/* CTA */}
          <div className="border-outline-variant/20 mt-16 flex flex-col justify-between gap-6 border-t px-6 pt-12 sm:flex-row md:items-center">
            <Link
              href="/#servicos"
              className="font-headline hover:text-secondary text-accent text-sm tracking-widest uppercase transition-colors"
            >
              ← Voltar
            </Link>
            <Link
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-headline text-primary border-accent/80 gap-3 border px-8 py-5 text-center text-lg font-black tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
            >
              Solicitar Orçamento
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
