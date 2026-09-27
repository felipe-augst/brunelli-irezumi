import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidateTag } from 'next/cache'
import { requireAdmin } from '@/server/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const { id, imageId } = await params
    const { direction } = await request.json()

    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Imagem não encontrada' },
        { status: 404 },
      )
    }

    if (direction === 'up' || direction === 'down') {
      let neighbor

      if (direction === 'up') {
        neighbor = await prisma.productImage.findFirst({
          where: { productId: id, order: { lt: image.order } },
          orderBy: { order: 'desc' },
        })
      } else {
        neighbor = await prisma.productImage.findFirst({
          where: { productId: id, order: { gt: image.order } },
          orderBy: { order: 'asc' },
        })
      }

      if (!neighbor) {
        return NextResponse.json({ success: true })
      }

      await prisma.$transaction([
        prisma.productImage.update({
          where: { id: image.id },
          data: { order: neighbor.order },
        }),
        prisma.productImage.update({
          where: { id: neighbor.id },
          data: { order: image.order },
        }),
      ])

      revalidateTag('products', { expire: 0 })
      return NextResponse.json({ success: true })
    }

    if (direction === 'start') {
      await prisma.$transaction([
        prisma.productImage.updateMany({
          where: { productId: id, order: { lt: image.order } },
          data: { order: { increment: 1 } },
        }),
        prisma.productImage.update({
          where: { id: image.id },
          data: { order: 1 },
        }),
      ])
      revalidateTag('products', { expire: 0 })
      return NextResponse.json({ success: true })
    }

    if (direction === 'end') {
      const last = await prisma.productImage.findFirst({
        where: { productId: id },
        orderBy: { order: 'desc' },
      })

      await prisma.$transaction([
        prisma.productImage.updateMany({
          where: { productId: id, order: { gt: image.order } },
          data: { order: { decrement: 1 } },
        }),
        prisma.productImage.update({
          where: { id: image.id },
          data: { order: last!.order },
        }),
      ])
      revalidateTag('products', { expire: 0 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Direção inválida' }, { status: 400 })
  } catch (error) {
    console.error('Erro ao reordenar imagem do produto:', error)
    return NextResponse.json(
      { error: 'Erro ao reordenar imagem do produto' },
      { status: 500 },
    )
  }
}
