import { Header } from '@/components/layout/Header'
import { HeroSection } from '@/components/sections/HeroSection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { GallerySection } from '@/components/sections/GallerySection'
import { Cta } from '@/components/sections/Cta'
import { LocationSection } from '@/components/sections/LocationSection'
import { Footer } from '@/components/layout/Footer'
import { RevealOnScroll } from '@/components/ui/RevealOnScroll'
import { getGalleryImages } from '@/lib/gallery'

export default async function Home() {
  const portfolioImages = await getGalleryImages('PORTFOLIO')

  return (
    <>
      <Header />
      <main id="main-content">
        <RevealOnScroll delay={0.1}>
          <HeroSection />
        </RevealOnScroll>
        <RevealOnScroll delay={0.2}>
          <AboutSection />
        </RevealOnScroll>
        <RevealOnScroll delay={0.3}>
          <ServicesSection />
        </RevealOnScroll>
        <RevealOnScroll delay={0.4}>
          <GallerySection images={portfolioImages} />
        </RevealOnScroll>
        <RevealOnScroll delay={0.5}>
          <Cta />
        </RevealOnScroll>
        <RevealOnScroll delay={0.6}>
          <LocationSection />
        </RevealOnScroll>
      </main>
      <Footer />
    </>
  )
}
