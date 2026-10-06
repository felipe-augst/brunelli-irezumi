'use client'

import { useState, type ComponentProps } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

type PasswordInputProps = Omit<ComponentProps<'input'>, 'type'>

// Campo de senha com botão para mostrar ou ocultar o que foi digitado.
// Aceita o spread de `register` do react-hook-form (o ref é prop no React 19).
export function PasswordInput({ className, id, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        {...props}
        className={cn(
          'border-outline-variant bg-surface-container text-on-surface focus-visible:outline-accent w-full rounded-sm border px-3 py-2 pr-10 text-sm focus-visible:outline',
          className,
        )}
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={visible}
        aria-controls={id}
        className="text-on-surface-variant hover:text-on-surface focus-visible:outline-accent absolute top-1/2 right-3 -translate-y-1/2 focus-visible:outline"
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}
