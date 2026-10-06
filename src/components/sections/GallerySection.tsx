import { GalleryGrid } from '@/components/ui/GalleryGrid'
import Link from 'next/link'
import { INSTAGRAM_URL } from '@/data/projects'
import type { GalleryImage } from '@/types'

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

type GallerySectionProps = {
  images: GalleryImage[]
}

export function GallerySection({ images }: GallerySectionProps) {
  return (
    <section className="bg-surface py-12 md:py-24" id="galeria">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="bg-outline-variant/20 mx-8 hidden h-0.5 flex-1 lg:block" />
          <div className="px-3 lg:px-6">
            <span className="font-headline text-accent text-sm font-bold tracking-[0.3em] uppercase">
              By Felipe Brunelli
            </span>
            <h2 className="font-headline mt-2 text-4xl font-black tracking-wide uppercase md:text-6xl">
              Portfólio
            </h2>
          </div>
        </div>

        <GalleryGrid images={images} />

        <div className="mt-12 flex items-center justify-center text-center">
          <Link
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-on-surface font-headline inline-flex items-center gap-2 text-lg font-bold tracking-widest uppercase"
          >
            Ver mais no <span className="text-accent">Instagram</span>
            <InstagramIcon className="text-accent mb-1 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
