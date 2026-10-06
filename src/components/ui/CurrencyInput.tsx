'use client'

import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form'
import { formatCentsToBRL } from '@/lib/format-currency'

type CurrencyInputProps<T extends FieldValues> = {
  name: Path<T>
  control: Control<T>
  label: string
}

function formatCents(cents: number | undefined): string {
  if (!cents) return ''
  return formatCentsToBRL(cents)
}

export function CurrencyInput<T extends FieldValues>({
  name,
  control,
  label,
}: CurrencyInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1">
          <label htmlFor={name} className="text-on-surface-variant text-sm">
            {label}
          </label>
          <input
            id={name}
            type="text"
            inputMode="numeric"
            value={formatCents(field.value)}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/\D/g, '')
              const cents = digitsOnly ? parseInt(digitsOnly, 10) : undefined
              field.onChange(cents)
            }}
            className="border-outline-variant bg-surface-container text-on-surface focus-visible:outline-accent rounded-sm border px-3 py-2 text-sm focus-visible:outline"
          />
          {fieldState.error && (
            <p role="alert" className="text-secondary-container text-sm">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  )
}
