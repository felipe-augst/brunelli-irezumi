import { z } from 'zod'

export const productCategorySchema = z.enum(
  ['DRAWING', 'PRINT', 'TENUGUI', 'SOCKS', 'ECOBAG', 'CUSTOM'],
  { message: 'Selecione uma categoria' },
)

export const productTagSchema = z.enum([
  'MADE_TO_ORDER',
  'LIMITED',
  'SOLD_OUT',
  'ON_SALE',
])

const productShape = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  priceCents: z
    .number({ message: 'Preço é obrigatório' })
    .int()
    .positive('Preço deve ser maior que zero'),
  promoPriceCents: z.number().int().positive().optional(),
  category: productCategorySchema,
  tags: z.array(productTagSchema).default([]),
})

export const createProductSchema = productShape.refine(
  (data) => !data.promoPriceCents || data.promoPriceCents < data.priceCents,
  {
    message: 'Preço promocional deve ser menor que o preço normal',
    path: ['promoPriceCents'],
  },
)

// null em promoPriceCents remove a promoção; a regra promo < preço é
// validada na rota, pois depende do preço atual quando ele é omitido.
export const updateProductSchema = productShape
  .extend({
    promoPriceCents: z.number().int().positive().nullable(),
    active: z.boolean(),
    // Sem default: omitir tags no PATCH não pode apagar as tags atuais
    tags: z.array(productTagSchema),
  })
  .partial()

export type CreateProductData = z.input<typeof createProductSchema>
export type UpdateProductData = z.input<typeof updateProductSchema>
