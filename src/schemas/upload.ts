import { z } from 'zod'

// Teto folgado: o navegador já limita a 2000px em WebP (compress-image.ts)
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export const uploadSizeSchema = z
  .number()
  .int()
  .positive()
  .max(MAX_UPLOAD_BYTES)
