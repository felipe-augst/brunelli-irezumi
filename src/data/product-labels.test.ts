import { describe, expect, it } from 'vitest'
import { productTagSchema } from '@/schemas/product'
import { TAG_LABELS } from './product-labels'

describe('TAG_LABELS', () => {
  it('tem um rótulo para cada tag do schema (e nenhum a mais)', () => {
    expect(Object.keys(TAG_LABELS).sort()).toEqual(
      [...productTagSchema.options].sort(),
    )
  })
})
