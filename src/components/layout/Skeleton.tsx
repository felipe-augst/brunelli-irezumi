'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { cn } from '@/lib/utils'
import { buildSkeletonCookie, hasSkeletonCookie } from '@/lib/skeleton-cookie'

const GREETINGS = [
  { welcome: 'ブ' },
  { welcome: 'ル' },
  { welcome: 'ネ' },
  { welcome: 'リ' },
]

// Cookie não emite evento: o valor só é relido a cada render.
const subscribeNoop = () => () => {}

// O overlay sempre vai no HTML estático. Na segunda visita do dia, o script do
// <head> (ver layout.tsx) marca o <html> e o CSS esconde o overlay antes da
// pintura; aqui só evitamos animar e regravar o cookie.
export function Skeleton() {
  const [fadedByTimer, setFaded] = useState(false)
  const [index, setIndex] = useState(0)
  // Servidor e hidratação veem false; depois do mount vale o cookie real.
  const alreadySeen = useSyncExternalStore(
    subscribeNoop,
    () => hasSkeletonCookie(document.cookie),
    () => false,
  )
  // Com o cookie presente o overlay some mesmo se o script do <head> não
  // tiver marcado o <html>.
  const faded = fadedByTimer || alreadySeen

  useEffect(() => {
    if (alreadySeen) return

    const languageInterval = setInterval(() => {
      setIndex((prev) => (prev + 1) % GREETINGS.length)
    }, 250)

    const fadeTimer = setTimeout(() => {
      setFaded(true)
      document.cookie = buildSkeletonCookie({
        secure: window.location.protocol === 'https:',
      })
      clearInterval(languageInterval)
    }, 3000)

    return () => {
      clearInterval(languageInterval)
      clearTimeout(fadeTimer)
    }
  }, [alreadySeen])

  const currentGreeting = GREETINGS[index]
  if (!currentGreeting) return null

  return (
    <div
      data-skeleton
      aria-hidden="true"
      className={cn(
        'fixed inset-0 z-100',
        'bg-surface flex flex-col items-center justify-center gap-8',
        'transition-opacity duration-700',
        faded ? 'pointer-events-none opacity-0' : 'opacity-100',
      )}
    >
      <div className="font-body text-accent flex flex-col items-center text-center text-5xl font-light tracking-[0.03em] md:text-7xl">
        <div key={index} className="animate-fade-in">
          {currentGreeting.welcome}{' '}
        </div>
      </div>
    </div>
  )
}
