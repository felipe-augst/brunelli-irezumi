import type { Metadata } from 'next'
import Link from 'next/link'
import { ProductForm } from '@/components/admin/products/ProductForm'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import { formatCentsToBRL } from '@/lib/format-currency'
import { DeleteProductButton } from '@/components/admin/products/DeleteProductButton'
import { Pencil } from 'lucide-react'
import { CATEGORY_LABELS, TAG_LABELS } from '@/data/product-labels'

export const metadata: Metadata = {
  title: 'Produtos',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      images: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  })

  return (
    <div className="mt-5 flex flex-col gap-4">
      <h1 className="text-on-surface text-center text-2xl font-semibold tracking-widest uppercase">
        Loja
      </h1>
      <ProductForm />
      {products.length === 0 ? (
        <p className="text-on-surface-variant text-sm">
          Nenhum produto cadastrado.
        </p>
      ) : (
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="border-outline-variant bg-surface-container text-on-surface place-items-center rounded-sm border p-4"
            >
              {product.images.length > 0 && (
                <div className="grid w-full grid-cols-4 gap-2 p-2">
                  {product.images.map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-square overflow-hidden"
                    >
                      <Image
                        src={img.url}
                        alt={product.title}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <span className="text-on-surface-variant border-accent/30 rounded-full border px-3 py-1 text-xs">
                  {CATEGORY_LABELS[product.category]}
                </span>
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-on-surface bg-surface-container-high rounded-full px-3 py-1 text-xs"
                  >
                    {TAG_LABELS[tag]}
                  </span>
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
              <div className="mt-2 flex w-full justify-end gap-4">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  aria-label="Editar produto"
                  className="text-on-surface hover:text-accent"
                >
                  <Pencil size={16} />
                </Link>
                <DeleteProductButton id={product.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
