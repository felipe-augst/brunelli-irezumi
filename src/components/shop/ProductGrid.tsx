'use client'

import { useState } from 'react'
import { Lightbox } from '@/components/ui/Lightbox'
import { CategoryFilter } from '@/components/shop/CategoryFilter'
import { ProductCard } from '@/components/shop/ProductCard'

type Product = {
  id: string
  title: string
  description: string
  priceCents: number
  promoPriceCents: number | null
  category: string
  tags: string[]
  images: { id: string; url: string }[]
}

export function ProductGrid({ products }: { products: Product[] }) {
  const [selectedCategory, setSelectedCategory] = useState('TODOS')
  const [activeProduct, setActiveProduct] = useState<Product | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const filteredProducts = products.filter((product) => {
    if (selectedCategory === 'TODOS') {
      return true
    }
    return product.category === selectedCategory
  })

  const lightboxImages =
    activeProduct?.images.map((img) => ({
      id: img.id,
      src: img.url,
      alt: activeProduct.title,
    })) ?? []

  return (
    <div className="px-6">
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {filteredProducts.length === 0 && (
        <p className="text-on-surface-variant flex h-32 items-center justify-center">
          Nenhum produto encontrado.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOpenImage={(index) => {
              setActiveProduct(product)
              setActiveIndex(index)
            }}
          />
        ))}
      </div>

      {activeProduct && (
        <Lightbox
          images={lightboxImages}
          currentIndex={activeIndex}
          onClose={() => setActiveProduct(null)}
          onNext={() =>
            setActiveIndex((prev) =>
              Math.min(prev + 1, lightboxImages.length - 1),
            )
          }
          onPrev={() => setActiveIndex((prev) => Math.max(prev - 1, 0))}
        />
      )}
    </div>
  )
}
