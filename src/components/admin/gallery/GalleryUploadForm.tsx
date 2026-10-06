'use client'

import { useState } from 'react'
import { compressImage } from '@/lib/compress-image'
import { useRouter } from 'next/navigation'
import type { GalleryCategory } from '@/generated/prisma/client'

export function GalleryUploadForm({ category }: { category: GalleryCategory }) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [inputKey, setInputKey] = useState(0)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]
    if (selected) setFile(selected)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    try {
      const compressedImg = await compressImage(file)

      const urlResponse = await fetch('/api/admin/gallery/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: 'image/webp' }),
      })
      const { uploadUrl, key } = await urlResponse.json()

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/webp' },
        body: compressedImg,
      })

      if (!uploadResponse.ok) {
        throw new Error('Falha ao enviar a imagem')
      }
      console.log('Upload concluído:', key)

      const createResponse = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, category }),
      })

      if (!createResponse.ok) {
        throw new Error('Falha ao criar a imagem da galeria')
      }
      console.log('Imagem da galeria criada com sucesso:', key)
      router.refresh()
      setFile(null)
      setInputKey((prev) => prev + 1)
    } catch (error) {
      console.error('Erro ao comprimir ou enviar imagem:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <form className="border-outline-variant bg-surface-container flex flex-col gap-2 rounded-sm border p-3 sm:flex-row sm:items-center">
      <input
        key={inputKey}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="text-on-surface-variant file:bg-surface-container-high file:text-on-surface flex-1 text-sm file:mr-3 file:rounded-sm file:border-0 file:px-3 file:py-1.5 file:text-sm"
      />

      {uploading && (
        <p className="text-on-surface-variant animate-pulse text-center text-sm">
          Enviando...
        </p>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || uploading}
        className="border-accent text-accent rounded-sm border px-4 py-1.5 text-sm font-medium transition-opacity disabled:opacity-50"
      >
        Enviar
      </button>
    </form>
  )
}
