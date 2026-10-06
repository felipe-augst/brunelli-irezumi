'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { markSkeletonShown } from '@/actions/skeleton'

const GREETINGS = [
  { welcome: 'ブ' },
  { welcome: 'ル' },
  { welcome: 'ネ' },
  { welcome: 'リ' },
]

type SkeletonProps = {
  initialShown: boolean
}

export function Skeleton({ initialShown }: SkeletonProps) {
  const [faded, setFaded] = useState(false)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const languageInterval = setInterval(() => {
      setIndex((prev) => (prev + 1) % GREETINGS.length)
    }, 250)

    const fadeTimer = setTimeout(() => {
      setFaded(true)
      void markSkeletonShown()
      clearInterval(languageInterval)
    }, 3000)

    return () => {
      clearInterval(languageInterval)
      clearTimeout(fadeTimer)
    }
  }, [])

  if (initialShown) return null

  const currentGreeting = GREETINGS[index]
  if (!currentGreeting) return null

  return (
    <div
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
