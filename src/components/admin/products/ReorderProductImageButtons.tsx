'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUp, ArrowDown } from 'lucide-react'

type ReorderProductImageButtonsProps = {
  productId: string
  imageId: string
  isFirst: boolean
  isLast: boolean
}

export function ReorderProductImageButtons({
  productId,
  imageId,
  isFirst,
  isLast,
}: ReorderProductImageButtonsProps) {
  const router = useRouter()
  const [requesting, setRequesting] = useState(false)
  const [refreshing, startRefresh] = useTransition()
  const busy = requesting || refreshing

  const handleReorder = async (direction: 'up' | 'down') => {
    if (busy) return
    setRequesting(true)
    try {
      const response = await fetch(
        `/api/admin/products/${productId}/images/${imageId}/reorder`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ direction }),
        },
      )

      if (response.ok) {
        // Mantém os botões desabilitados até o servidor re-renderizar
        startRefresh(() => router.refresh())
      } else {
        console.error('Erro ao reordenar imagem do produto')
      }
    } catch (error) {
      console.error('Erro ao reordenar imagem do produto:', error)
    } finally {
      setRequesting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {!isFirst && (
        <button
          disabled={busy}
          onClick={() => handleReorder('up')}
          aria-label="Mover para cima"
          className="text-on-surface hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowUp size={18} />
        </button>
      )}
      {!isLast && (
        <button
          disabled={busy}
          onClick={() => handleReorder('down')}
          aria-label="Mover para baixo"
          className="text-on-surface hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowDown size={18} />
        </button>
      )}
    </div>
  )
}
