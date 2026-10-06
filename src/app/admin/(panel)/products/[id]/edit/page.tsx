import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import { formatCentsToBRL } from '@/lib/format-currency'
import { DeleteProductButton } from '@/components/admin/products/DeleteProductButton'
import { notFound } from 'next/navigation'
import { ReorderProductImageButtons } from '@/components/admin/products/ReorderProductImageButtons'
import { DeleteProductImageButton } from '@/components/admin/products/DeleteProductImageButton'

import { ProductForm } from '@/components/admin/products/ProductForm'

export const metadata: Metadata = {
  title: 'Produtos',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!product) {
    notFound()
  }

  return (
    <div className="mt-5 flex flex-col gap-4 lg:items-center">
      <Link
        href="/admin/products"
        className="text-on-surface-variant pb-4 text-start underline"
      >
        Voltar
      </Link>

      <h1 className="text-on-surface text-center text-2xl font-semibold tracking-widest uppercase">
        Editar Produto
      </h1>
      <ProductForm product={product} />
      <div>
        <div
          key={product.id}
          className="border-outline-variant bg-surface-container text-on-surface max-w-xl place-items-center rounded-sm border p-4"
        >
          <div className="flex flex-col gap-2">
            {product.images.map((image, index) => (
              <div
                key={image.id}
                className="border-outline-variant flex items-center gap-3 rounded-sm border p-2"
              >
                <Image
                  src={image.url}
                  alt={product.title}
                  width={80}
                  height={80}
                  className="h-20 w-20 object-cover"
                />
                <ReorderProductImageButtons
                  productId={product.id}
                  imageId={image.id}
                  isFirst={index === 0}
                  isLast={index === product.images.length - 1}
                />
                <DeleteProductImageButton
                  productId={product.id}
                  imageId={image.id}
                />
              </div>
            ))}
          </div>
          <h2 className="text-on-surface mt-2 mb-3 text-xl font-semibold tracking-wider">
            {product.title}
          </h2>
          <p className="text-on-surface-variant text-center text-sm">
            {product.description}
          </p>
          <div className="mt-2 flex gap-2">
            <span className="text-on-surface-variant text-sm">
              {formatCentsToBRL(product.priceCents)}
            </span>
          </div>
          <div className="mt-2 flex w-full justify-end">
            <DeleteProductButton id={product.id} />
          </div>
        </div>
      </div>
      <Link
        href="/admin/products"
        className="border-accent bg-surface-container text-accent rounded-sm border p-2 text-center tracking-widest uppercase"
      >
        Concluir
      </Link>
    </div>
  )
}
