import { describe, expect, it } from 'vitest'
import { MAX_UPLOAD_BYTES, uploadSizeSchema } from './upload'

describe('uploadSizeSchema', () => {
  it('aceita um tamanho normal', () => {
    expect(uploadSizeSchema.safeParse(350_000).success).toBe(true)
  })

  it('aceita 1 byte e o teto exato', () => {
    expect(uploadSizeSchema.safeParse(1).success).toBe(true)
    expect(uploadSizeSchema.safeParse(MAX_UPLOAD_BYTES).success).toBe(true)
  })

  it('rejeita tamanho ausente', () => {
    expect(uploadSizeSchema.safeParse(undefined).success).toBe(false)
  })

  it('rejeita valor não numérico', () => {
    expect(uploadSizeSchema.safeParse('1000').success).toBe(false)
    expect(uploadSizeSchema.safeParse(null).success).toBe(false)
    expect(uploadSizeSchema.safeParse(NaN).success).toBe(false)
  })

  it('rejeita zero, negativo e decimal', () => {
    expect(uploadSizeSchema.safeParse(0).success).toBe(false)
    expect(uploadSizeSchema.safeParse(-5).success).toBe(false)
    expect(uploadSizeSchema.safeParse(10.5).success).toBe(false)
  })

  it('rejeita acima do teto', () => {
    expect(uploadSizeSchema.safeParse(MAX_UPLOAD_BYTES + 1).success).toBe(false)
  })
})
