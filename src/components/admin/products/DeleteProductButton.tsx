'use client'

import { useRouter } from 'next/navigation'
import { Trash } from 'lucide-react'

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Erro ao excluir produto')
      }
      router.refresh()
    } catch (error) {
      console.error('Não foi possível excluir o produto da loja:', error)
    }
  }

  return (
    <button
      onClick={handleDelete}
      aria-label="Excluir produto"
      className="text-secondary-container hover:text-on-secondary"
    >
      <Trash size={16} />
    </button>
  )
}
