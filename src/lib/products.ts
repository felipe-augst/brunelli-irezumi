import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function getProducts() {
  return unstable_cache(
    async () => {
      return prisma.product.findMany({
        where: { active: true },
        include: { images: { orderBy: { order: 'asc' } } },
      })
    },
    ['products'],
    { tags: ['products'] },
  )()
}
