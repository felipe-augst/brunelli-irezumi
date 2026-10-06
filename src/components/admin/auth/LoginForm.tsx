'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/schemas/login'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    setServerError(null)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = await res.json()
      setServerError(body.error ?? 'Erro ao processar login')
      return
    }

    router.push('/admin')
  }

  return (
    <div className="bg-surface flex min-h-screen flex-col items-center justify-center px-4">
      <h2 className="text-on-surface mb-4 text-2xl font-bold">Login</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-on-surface-variant text-sm">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="border-outline-variant bg-surface-container text-on-surface focus-visible:outline-accent rounded-sm border px-3 py-2 text-sm focus-visible:outline"
          />
          {errors.email && (
            <p role="alert" className="text-secondary-container text-xs">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-on-surface-variant text-sm">
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className="border-outline-variant bg-surface-container text-on-surface focus-visible:outline-accent w-full rounded-sm border px-3 py-2 pr-10 text-sm focus-visible:outline"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              className="text-surface-container-low/60 absolute top-1/2 right-3 -translate-y-1/2"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p role="alert" className="text-secondary-container text-xs">
              {errors.password.message}
            </p>
          )}
        </div>

        {serverError && (
          <p role="alert" className="text-secondary-container text-sm">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-accent text-on-surface mt-2 rounded-sm px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
