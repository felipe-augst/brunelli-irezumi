'use client'

import { useController, type Control } from 'react-hook-form'
import {
  productTagSchema,
  type CreateProductData,
  type ProductTagValue,
} from '@/schemas/product'
import { TAG_LABELS } from '@/data/product-labels'

type TagCheckboxesProps = {
  control: Control<CreateProductData>
}

// Controlado de propósito: `register` em checkboxes entrega `false` (em vez de
// lista) quando o campo nunca foi tocado, e o schema estourava com mensagem do Zod.
export function TagCheckboxes({ control }: TagCheckboxesProps) {
  const { field, fieldState } = useController({
    name: 'tags',
    control,
  })
  const selected = field.value ?? []

  function toggle(tag: ProductTagValue, checked: boolean) {
    const next = checked
      ? [...selected, tag]
      : selected.filter((t) => t !== tag)
    field.onChange(next)
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-on-surface-variant text-sm">Tags</legend>
      {productTagSchema.options.map((tag) => (
        <label
          key={tag}
          className="text-on-surface flex items-center gap-2 text-sm"
        >
          <input
            type="checkbox"
            value={tag}
            checked={selected.includes(tag)}
            onChange={(e) => toggle(tag, e.target.checked)}
            onBlur={field.onBlur}
          />
          {TAG_LABELS[tag]}
        </label>
      ))}
      {fieldState.error && (
        <p role="alert" className="text-secondary text-sm">
          {fieldState.error.message}
        </p>
      )}
    </fieldset>
  )
}
