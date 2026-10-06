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
  const [serverError, setServerError] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]
    if (selected) setFile(selected)
  }

  const handleUpload = async () => {
    if (!file) return

    setServerError(null)
    setUploading(true)
    let step = 'Falha ao comprimir a imagem'
    try {
      const compressedImg = await compressImage(file)

      step = 'Falha ao preparar o envio da imagem'
      const urlResponse = await fetch('/api/admin/gallery/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: 'image/webp' }),
      })
      if (!urlResponse.ok) throw new Error(`${step} (${urlResponse.status})`)
      const body: unknown = await urlResponse.json()
      const { uploadUrl, key } = (body ?? {}) as Record<string, unknown>
      if (typeof uploadUrl !== 'string' || typeof key !== 'string') {
        throw new Error(`${step}: resposta inesperada`)
      }

      step = 'Falha ao enviar a imagem'
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/webp' },
        body: compressedImg,
      })
      if (!uploadResponse.ok) {
        throw new Error(`${step} (${uploadResponse.status})`)
      }

      step = 'Falha ao registrar a imagem'
      const createResponse = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, category }),
      })
      if (!createResponse.ok) {
        throw new Error(`${step} (${createResponse.status})`)
      }

      // A imagem já foi registrada: erro daqui em diante não é falha de registro
      step = 'Falha ao atualizar a lista'
      router.refresh()
      setFile(null)
      setInputKey((prev) => prev + 1)
    } catch (error) {
      console.error(step, error)
      setServerError(step)
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

      {serverError && (
        <p role="alert" className="text-secondary-container text-sm">
          {serverError}
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
