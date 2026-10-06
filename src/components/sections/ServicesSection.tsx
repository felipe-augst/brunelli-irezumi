import Image from 'next/image'
import Link from 'next/link'
import { SERVICES } from '@/data/projects'

export function ServicesSection() {
  return (
    <section className="bg-surface-container-low py-12 md:py-24" id="servicos">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="px-3 lg:px-6">
            <span className="font-headline text-accent text-sm font-bold tracking-[0.3em] uppercase">
              Especialidades
            </span>
            <h2 className="font-headline mt-2 text-4xl font-black tracking-wide uppercase md:text-6xl">
              Arte Irezumi
            </h2>
          </div>
          <div className="bg-outline-variant/20 mx-8 hidden h-0.5 flex-1 lg:block" />
        </div>

        <div className="md:bg-outline-variant/10 grid gap-5 px-3 md:grid-cols-2 md:gap-px lg:px-6">
          {SERVICES.map((service) => (
            <div
              key={service.id}
              className="group bg-surface relative aspect-3/2 overflow-hidden"
            >
              <Image
                src={service.image.src}
                alt={service.image.alt}
                fill
                quality={90}
                className="object-cover opacity-40 transition-transform duration-700 group-hover:scale-105 md:opacity-50"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="from-surface absolute inset-0 bg-linear-to-t via-transparent to-transparent" />

              <div className="absolute bottom-0 p-4">
                <h3 className="font-headline text-2xl font-bold tracking-wider uppercase md:text-3xl">
                  {service.title}
                </h3>
                <p className="text-on-surface/70 font-body md:text-on-surface-variant mb-6 max-w-sm tracking-wider">
                  {service.description}
                </p>
                <Link
                  href={`/servicos/${service.slug}`}
                  className="font-body text-accent flex items-center gap-2 text-sm font-bold tracking-widest uppercase transition-transform group-hover:translate-x-2"
                >
                  {service.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
