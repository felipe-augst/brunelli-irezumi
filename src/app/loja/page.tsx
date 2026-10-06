import { getProducts } from '@/lib/products'
import { ProductGrid } from '@/components/shop/ProductGrid'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartReconciler } from '@/components/shop/CartReconciler'
import Image from 'next/image'

export default async function LojaPage() {
  const products = await getProducts()
  const catalog = products.map((product) => ({
    id: product.id,
    title: product.title,
    priceCents: product.priceCents,
    promoPriceCents: product.promoPriceCents,
    tags: product.tags,
    imageUrl: product.images[0]?.url ?? null,
  }))

  return (
    <>
      <CartReconciler catalog={catalog} />
      <Header />
      <main className="bg-surface min-h-dvh pt-24 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="relative mb-16 aspect-16/6 overflow-hidden">
            <Image
              src="/images/services/shop1000p.webp"
              alt="Loja Brunelli Irezumi"
              fill
              quality={90}
              priority
              className="object-cover object-[center_100%] opacity-50"
              sizes="100vw"
            />
            <div className="from-surface absolute inset-0 bg-linear-to-t via-transparent to-transparent" />
            <div className="absolute bottom-0 flex w-full items-center justify-center p-8">
              <h1 className="font-headline border-accent/60 border-b text-4xl font-black tracking-widest uppercase md:text-7xl">
                Loja
              </h1>
            </div>
          </div>
          <ProductGrid products={products} />
        </div>
      </main>
      <Footer />
    </>
  )
}
