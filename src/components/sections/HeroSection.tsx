import Image from 'next/image'
import Link from 'next/link'
import { WHATSAPP_URL, HERO_IMG_CONTENT } from '@/data/projects'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { ShimmerText } from '@/components/ui/ShimmerText'

export function HeroSection() {
  return (
    <section
      id="hero"
      className="bg-surface relative flex min-h-dvh items-center justify-center overflow-hidden pt-20 pb-16 md:pb-0"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <div className="via-surface/60 to-surface absolute inset-0 z-10 bg-linear-to-l from-transparent" />
        <Image
          src={HERO_IMG_CONTENT.src}
          alt={HERO_IMG_CONTENT.alt}
          fill
          priority
          className="object-cover object-[40%_90%] opacity-60 grayscale md:object-[50%_90%]"
          sizes="100vw"
        />
      </div>

      <div className="relative z-20 mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-12">
        <div className="md:col-span-8">
          <RevealOnScroll delay={0.2}>
            <h1 className="font-headline text-on-surface/90 text-[2.9rem] leading-[1.1] font-black tracking-wide uppercase md:text-6xl lg:text-8xl">
              <ShimmerText variant="night" className="block">
                Tatuagem Japonesa <br />
              </ShimmerText>
              <span className="text-accent lg:tracking-widest">
                伝統を尊重する
              </span>
            </h1>
          </RevealOnScroll>

          <RevealOnScroll delay={0.2}>
            <p className="text-on-surface font-body mb-10 max-w-xl pl-2 text-start text-lg leading-relaxed tracking-wide uppercase md:text-xl">
              Respeito à tradição.
            </p>
          </RevealOnScroll>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <RevealOnScroll delay={0.2}>
              <Link
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-headline text-primary border-accent/80 flex items-center gap-3 border px-8 py-5 text-lg font-black tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
              >
                Solicitar Orçamento
              </Link>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  )
}
