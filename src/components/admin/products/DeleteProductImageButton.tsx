'use client'

import { useRouter } from 'next/navigation'
import { Trash } from 'lucide-react'

export function DeleteProductImageButton({
  productId,
  imageId,
}: {
  productId: string
  imageId: string
}) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir esta imagem do produto?'))
      return
    try {
      const response = await fetch(
        `/api/admin/products/${productId}/images/${imageId}`,
        {
          method: 'DELETE',
        },
      )
      if (!response.ok) {
        throw new Error('Erro ao excluir imagem do produto')
      }
      router.refresh()
    } catch (error) {
      console.error(
        'Não foi possível excluir a imagem do produto da loja:',
        error,
      )
    }
  }

  return (
    <button
      onClick={handleDelete}
      aria-label="Excluir imagem "
      className="text-secondary-container hover:text-on-secondary"
    >
      <Trash size={16} />
    </button>
  )
}
