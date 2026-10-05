import { z } from 'zod'

export const galleryImageSchema = z.object({
  key: z.string().min(1).startsWith('gallery/', 'Chave inválida'),
  category: z.enum(['PORTFOLIO', 'PAINTING', 'COVERUP']),
})

export type GalleryImage = z.infer<typeof galleryImageSchema>
