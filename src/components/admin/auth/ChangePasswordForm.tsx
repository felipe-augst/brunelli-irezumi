'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from '@/schemas/password'
import { PasswordInput } from '@/components/ui/PasswordInput'

export function ChangePasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  async function onSubmit(data: ChangePasswordFormData) {
    setServerError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string
        } | null
        setServerError(body?.error ?? 'Erro ao trocar a senha')
        return
      }

      reset()
      setSuccess(true)
    } catch {
      setServerError('Erro ao trocar a senha')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="mx-auto flex w-full max-w-sm flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <label
          htmlFor="currentPassword"
          className="text-on-surface-variant text-sm"
        >
          Senha atual
        </label>
        <PasswordInput
          id="currentPassword"
          autoComplete="current-password"
          {...register('currentPassword')}
        />
        {errors.currentPassword && (
          <p role="alert" className="text-secondary text-xs">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="newPassword"
          className="text-on-surface-variant text-sm"
        >
          Nova senha
        </label>
        <PasswordInput
          id="newPassword"
          autoComplete="new-password"
          {...register('newPassword')}
        />
        {errors.newPassword && (
          <p role="alert" className="text-secondary text-xs">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="confirmNewPassword"
          className="text-on-surface-variant text-sm"
        >
          Repetir nova senha
        </label>
        <PasswordInput
          id="confirmNewPassword"
          autoComplete="new-password"
          {...register('confirmNewPassword')}
        />
        {errors.confirmNewPassword && (
          <p role="alert" className="text-secondary text-xs">
            {errors.confirmNewPassword.message}
          </p>
        )}
      </div>

      {serverError && (
        <p role="alert" className="text-secondary text-sm">
          {serverError}
        </p>
      )}

      {success && (
        <p role="status" className="text-on-surface text-sm">
          Senha alterada. As outras sessões abertas foram encerradas.
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-accent text-on-surface rounded-sm px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50"
      >
        {isSubmitting ? 'Salvando...' : 'Trocar senha'}
      </button>
    </form>
  )
}
