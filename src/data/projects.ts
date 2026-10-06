import type { NavLink, ServiceCard } from '@/types'

export const WHATSAPP_URL = 'https://wa.me/5511976624286'
export const INSTAGRAM_URL = 'https://instagram.com/brunelli.irezumi/'
export const MAPS_URL = 'https://maps.app.goo.gl/UkwhKQAUF1nbwSTF7'
export const TIKTOK_URL = 'https://www.tiktok.com/@brunelli.irezumi'

export const STUDIO_NAME = 'Brunelli Irezumi'
export const STUDIO_TAGLINE = 'The Modern Shokunin'

export const STUDIO_ADDRESS = {
  street: 'R. Baronesa do Japi, 199 - Centro',
  city: 'Jundiaí',
  state: 'SP',
  cep: '13207-684',
  complement: 'The Garden Estudio',
}

export const STUDIO_HOURS = 'Segunda a Sábado: 10h às 20h'

export const NAV_LINKS: NavLink[] = [
  { label: 'O Artista', href: '/#sobre' },
  { label: 'Especialidades', href: '/#servicos' },
  { label: 'Portfólio', href: '/#galeria' },
  { label: 'Shop', href: '/loja' },
]

export const HERO_IMG_CONTENT = {
  src: '/images/hero/hero1900p.webp',
  alt: 'Felipe Brunelli aplicando uma tatuagem tradicional japonesa.',
}

export const CTA_IMAGE = {
  src: '/images/cta/studio2.webp',
  alt: 'Imagem do estúdio de tatuagem Brunelli Irezumi',
}

export const SERVICES: ServiceCard[] = [
  {
    id: 1,
    slug: 'tradicional',
    title: 'Pinturas',
    description: 'Arte original. Feita à mão. ',
    cta: 'Saiba mais',
    image: {
      src: '/images/services/tradicional1000p.webp',
      alt: 'Quadros de tatuagens tradicionais japonesas mostrando a arte do Irezumi',
    },
  },
  {
    id: 2,
    slug: 'coverup',
    title: 'Coberturas',
    description: 'Resgate sua autoestima.',
    cta: 'Saiba mais',
    image: {
      src: '/images/services/cover1000p.webp',
      alt: 'Cobertura de tatuagem nas costas feita à mão por Felipe Brunelli',
    },
  },
]

export const ABOUT_IMG = {
  src: '/images/about/about800p.webp',
  alt: 'Imagem do Felipe Brunelli',
}
