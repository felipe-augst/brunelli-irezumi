'use client'

import { useEffect } from 'react'
import './globals.css'

type GlobalErrorProps = {
  error: Error & { digest?: string }
  retry: () => void
}

// Substitui o layout raiz: sem next/font, sem CartProvider ou qualquer contexto.
export default function GlobalError({ error, retry }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="pt-BR" className="dark">
      <body>
        <main className="bg-surface text-on-surface flex min-h-dvh flex-col items-center justify-center px-6 text-center">
          <h1 className="font-headline text-2xl font-black tracking-widest uppercase md:text-4xl">
            Algo deu errado
          </h1>
          <p className="font-body text-on-surface-variant mt-4 max-w-md text-sm md:text-base">
            Ocorreu um erro inesperado. Tente novamente em instantes.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            className="font-headline border-accent text-accent hover:bg-accent hover:text-surface mt-8 cursor-pointer border px-8 py-3 text-xs font-bold tracking-widest uppercase transition-colors"
          >
            Tentar novamente
          </button>
          {error.digest && (
            <p className="font-body text-on-surface-variant mt-6 text-xs">
              Código: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  )
}
