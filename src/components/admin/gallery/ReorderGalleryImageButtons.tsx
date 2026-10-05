'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUp, ArrowDown, ChevronsUp, ChevronsDown } from 'lucide-react'

type ReorderGalleryImageButtonsProps = {
  id: string
  isFirst: boolean
  isLast: boolean
}

export function ReorderGalleryImageButtons({
  id,
  isFirst,
  isLast,
}: ReorderGalleryImageButtonsProps) {
  const router = useRouter()
  const [requesting, setRequesting] = useState(false)
  const [refreshing, startRefresh] = useTransition()
  const busy = requesting || refreshing

  const handleReorder = async (direction: 'up' | 'down' | 'start' | 'end') => {
    if (busy) return
    setRequesting(true)
    try {
      const response = await fetch(`/api/admin/gallery/${id}/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ direction }),
      })

      if (response.ok) {
        // Mantém os botões desabilitados até o servidor re-renderizar
        startRefresh(() => router.refresh())
      } else {
        console.error('Erro ao reordenar imagem da galeria')
      }
    } catch (error) {
      console.error('Erro ao reordenar imagem da galeria:', error)
    } finally {
      setRequesting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {!isFirst && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={busy}
            onClick={() => handleReorder('start')}
            aria-label="Mover para o início"
            className="text-on-surface hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronsUp size={18} />
          </button>
          <button
            disabled={busy}
            onClick={() => handleReorder('up')}
            aria-label="Mover para cima"
            className="text-on-surface hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowUp size={18} />
          </button>
        </div>
      )}
      {!isLast && (
        <>
          <button
            disabled={busy}
            onClick={() => handleReorder('down')}
            aria-label="Mover para baixo"
            className="text-on-surface hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowDown size={18} />
          </button>
          <button
            disabled={busy}
            onClick={() => handleReorder('end')}
            aria-label="Mover para o fim"
            className="text-on-surface hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronsDown size={18} />
          </button>
        </>
      )}
    </div>
  )
}
