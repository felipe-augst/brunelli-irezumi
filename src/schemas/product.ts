import { z } from 'zod'
import { getPricingError } from '@/server/product-pricing'

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

const MAX_TITLE_LENGTH = 120
const MAX_DESCRIPTION_LENGTH = 2000
// R$ 100.000,00
const MAX_PRICE_CENTS = 10_000_000

const priceCentsSchema = z
  .number({ message: 'Preço é obrigatório' })
  .int()
  .positive('Preço deve ser maior que zero')
  .max(MAX_PRICE_CENTS, 'Preço deve ser no máximo R$ 100.000,00')

const promoPriceCentsSchema = z
  .number()
  .int()
  .positive()
  .max(MAX_PRICE_CENTS, 'Preço promocional deve ser no máximo R$ 100.000,00')

// O preço só é opcional em produto sob encomenda; essa regra (e as de
// promoção × tag) mora em getPricingError, pois depende das tags.
const productShape = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(
      MAX_TITLE_LENGTH,
      `Título deve ter no máximo ${MAX_TITLE_LENGTH} caracteres`,
    ),
  description: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .max(
      MAX_DESCRIPTION_LENGTH,
      `Descrição deve ter no máximo ${MAX_DESCRIPTION_LENGTH} caracteres`,
    ),
  priceCents: priceCentsSchema.nullish(),
  promoPriceCents: promoPriceCentsSchema.optional(),
  category: productCategorySchema,
  tags: z.array(productTagSchema).default([]),
})

export const createProductSchema = productShape.superRefine((data, ctx) => {
  const error = getPricingError(data)
  if (error) {
    ctx.addIssue({
      code: 'custom',
      message: error.message,
      path: [error.field],
    })
  }
})

// null em priceCents (só sob encomenda) e em promoPriceCents (remove a
// promoção). As regras cruzadas são validadas na rota, pois dependem do
// estado atual do produto quando algum campo é omitido.
export const updateProductSchema = productShape
  .extend({
    promoPriceCents: promoPriceCentsSchema.nullable(),
    active: z.boolean(),
    // Sem default: omitir tags no PATCH não pode apagar as tags atuais
    tags: z.array(productTagSchema),
  })
  .partial()

export type ProductTagValue = z.infer<typeof productTagSchema>
export type CreateProductData = z.input<typeof createProductSchema>
export type UpdateProductData = z.input<typeof updateProductSchema>
