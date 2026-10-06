'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProductSchema, type CreateProductData } from '@/schemas/product'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CurrencyInput } from '@/components/ui/CurrencyInput'
import { compressImage } from '@/lib/compress-image'
import { readApiError } from '@/lib/read-api-error'
import { TagCheckboxes } from './TagCheckboxes'
import { CATEGORY_LABELS } from '@/data/product-labels'

type ProductFormProps = {
  product?: {
    id: string
    title: string
    description: string
    priceCents: number | null
    promoPriceCents: number | null
    category: CreateProductData['category']
    tags: CreateProductData['tags']
  }
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [inputKey, setInputKey] = useState(0)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: product
      ? {
          title: product.title,
          description: product.description,
          priceCents: product.priceCents ?? undefined,
          promoPriceCents: product.promoPriceCents ?? undefined,
          category: product.category,
          tags: product.tags,
        }
      : { tags: [] },
  })

  async function onSubmit(data: CreateProductData) {
    setServerError(null)
    setSuccessMessage(null)

    if (!product && files.length === 0) {
      setServerError('É necessário adicionar pelo menos uma imagem')
      return
    }

    const url = product
      ? `/api/admin/products/${product.id}`
      : '/api/admin/products'

    const method = product ? 'PATCH' : 'POST'

    // Na edição, campo vazio vira null para remover o valor (omitir manteria o atual)
    const payload = product
      ? {
          ...data,
          priceCents: data.priceCents ?? null,
          promoPriceCents: data.promoPriceCents ?? null,
        }
      : data

    let step = product
      ? 'Falha ao atualizar o produto'
      : 'Falha ao criar o produto'
    let createdId: string | null = null
    let updated = false
    let apiMessage: string | null = null

    // Falha de qualquer etapa vira erro; no 400 guarda a mensagem da API
    // (pt-BR e genérica) para mostrar ao usuário em vez do texto da etapa
    async function ensureOk(res: Response) {
      if (res.ok) return
      if (res.status === 400) apiMessage = await readApiError(res)
      throw new Error(`${step} (${res.status})`)
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      await ensureOk(res)

      const productId: string = product ? product.id : (await res.json()).id
      if (product) updated = true
      else createdId = productId

      for (const file of files) {
        step = 'Falha ao comprimir a imagem'
        const compressedImage = await compressImage(file)

        step = 'Falha ao preparar o envio da imagem'
        const urlResponse = await fetch('/api/admin/products/upload-url', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            contentType: 'image/webp',
            size: compressedImage.size,
          }),
        })
        await ensureOk(urlResponse)
        const { uploadUrl, key } = await urlResponse.json()

        step = 'Falha ao enviar a imagem'
        const putResponse = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'content-type': 'image/webp' },
          body: compressedImage,
        })
        await ensureOk(putResponse)

        step = 'Falha ao registrar a imagem'
        const registerResponse = await fetch(
          `/api/admin/products/${productId}/images`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ key }),
          },
        )
        await ensureOk(registerResponse)
      }

      if (!product) {
        step = 'Falha ao ativar o produto'
        const activateResponse = await fetch(
          `/api/admin/products/${productId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: true }),
          },
        )
        await ensureOk(activateResponse)
      }
    } catch (error) {
      console.error(step, error)
      setServerError(apiMessage ?? step)

      if (createdId) {
        // Desfaz a criação (melhor esforço) para não deixar produto incompleto
        try {
          const rollback = await fetch(`/api/admin/products/${createdId}`, {
            method: 'DELETE',
          })
          if (!rollback.ok) {
            console.error(
              `Falha ao desfazer produto ${createdId} (${rollback.status})`,
            )
          }
        } catch (rollbackError) {
          console.error(`Falha ao desfazer produto ${createdId}`, rollbackError)
        }
      } else if (updated) {
        // Produto já atualizado: mostra o que entrou, sem desfazer nada.
        // Limpa a seleção para um novo envio não duplicar imagens que já entraram
        setServerError(
          `${step}. O produto foi atualizado; confira as imagens da lista e envie de novo as que faltarem.`,
        )
        setFiles([])
        setInputKey((prev) => prev + 1)
        router.refresh()
      }
      return
    }

    // Sucesso: reset com os valores salvos (na criação, formulário vazio)
    reset(product ? data : undefined)
    setFiles([])
    setInputKey((prev) => prev + 1)
    if (product) setSuccessMessage('Produto atualizado com sucesso')
    router.refresh()
  }

  let submitLabel = product ? 'Atualizar produto' : 'Criar produto'
  if (isSubmitting) submitLabel = 'Salvando...'
  else if (successMessage) submitLabel = successMessage

  return (
    <form
      onSubmit={(e) => {
        handleSubmit(onSubmit)(e)
      }}
      // O change borbulha de todos os campos: voltar a editar some com a mensagem
      onChange={() => setSuccessMessage(null)}
      className="flex flex-col gap-4 md:mx-auto md:min-w-96"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-on-surface-variant text-sm">
          Título
        </label>
        <input
          id="title"
          {...register('title')}
          className="border-outline-variant bg-surface-container text-on-surface rounded-sm border px-3 py-2 text-sm"
        />
        {errors.title && (
          <p role="alert" className="text-secondary text-sm">
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="description"
          className="text-on-surface-variant text-sm"
        >
          Descrição
        </label>
        <textarea
          id="description"
          rows={6}
          {...register('description')}
          className="border-outline-variant bg-surface-container text-on-surface rounded-sm border px-3 py-2 text-sm"
        />
        {errors.description && (
          <p role="alert" className="text-secondary text-sm">
            {errors.description.message}
          </p>
        )}
      </div>

      <CurrencyInput
        name="priceCents"
        control={control}
        label="Preço (opcional só para sob encomenda)"
      />
      <CurrencyInput
        name="promoPriceCents"
        control={control}
        label="Preço promocional (exige a tag Promoção)"
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="category" className="text-on-surface-variant text-sm">
          Categoria
        </label>
        <select
          id="category"
          {...register('category')}
          className="border-outline-variant bg-surface-container text-on-surface rounded-sm border px-3 py-2 text-sm"
        >
          <option value="">Selecione</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p role="alert" className="text-secondary text-sm">
            {errors.category.message}
          </p>
        )}
      </div>

      <TagCheckboxes control={control} />

      {serverError && (
        <p role="alert" className="text-secondary text-sm">
          {serverError}
        </p>
      )}

      <p role="status" aria-live="polite" className="sr-only">
        {successMessage ?? ''}
      </p>

      <div className="flex flex-col gap-1">
        <label htmlFor="images" className="text-on-surface-variant text-sm">
          Imagens
        </label>
        <input
          key={inputKey}
          id="images"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="text-on-surface-variant file:bg-surface-container-high file:text-on-surface flex-1 text-sm file:mr-3 file:rounded-sm file:border-0 file:px-3 file:py-1.5 file:text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="border-accent text-accent cursor-pointer rounded-sm border px-4 py-1.5 text-sm font-medium disabled:opacity-50"
      >
        {submitLabel}
      </button>
    </form>
  )
}
