'use client'

import { useEffect, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'

// Quanto da seção precisa entrar na viewport antes de revelar
const REVEAL_MARGIN_PX = 80

type RevealOnScrollProps = {
  children: ReactNode
  delay?: number
  duration?: number
  y?: number
  className?: string
}

export function RevealOnScroll({
  children,
  delay = 0,
  duration = 0.6,
  y = 30,
  className,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    // Movimento reduzido: o conteúdo nunca é escondido
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Já visível ao montar: não esconde, para não piscar (some e reaparece)
    if (
      el.getBoundingClientRect().top <
      window.innerHeight - REVEAL_MARGIN_PX
    ) {
      return
    }

    // O estado escondido só existe depois da montagem: sem JS (ou antes da
    // hidratação) o conteúdo continua visível no HTML do servidor.
    el.dataset.reveal = 'hidden'

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          el.dataset.reveal = 'shown'
          observer.disconnect()
        }
      },
      { rootMargin: `0px 0px -${REVEAL_MARGIN_PX}px 0px` },
    )
    observer.observe(el)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={
        {
          '--reveal-delay': `${delay}s`,
          '--reveal-duration': `${duration}s`,
          '--reveal-y': `${y}px`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  )
}
