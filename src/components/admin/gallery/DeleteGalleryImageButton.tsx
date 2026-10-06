'use client'

import { useRouter } from 'next/navigation'
import { Trash } from 'lucide-react'

export function DeleteGalleryImageButton({ id }: { id: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) return
    try {
      const response = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Não foi possível excluir a imagem da galeria')
      }
      router.refresh()
    } catch (error) {
      console.error('Não foi possível excluir a imagem da galeria:', error)
    }
  }

  return (
    <button
      onClick={handleDelete}
      aria-label="Excluir imagem"
      className="text-secondary-container hover:text-on-secondary"
    >
      <Trash size={16} />
    </button>
  )
}
