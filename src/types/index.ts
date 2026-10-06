export type GalleryImage = {
  id: string
  src: string
  alt: string
  span?: 'row' | 'col' | 'none'
}

export type ServiceCard = {
  id: number
  slug: string
  title: string
  description: string
  cta: string
  image: {
    src: string
    alt: string
  }
}

export type NavLink = {
  label: string
  href: string
}
