import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidateTag } from 'next/cache'
import { requireAdmin } from '@/lib/require-admin'
import { parseJsonBody } from '@/lib/parse-json-body'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await parseJsonBody(request)
  if (body === null) {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })
  }

  try {
    const { id } = await params
    const { direction } = body as { direction?: string }

    const image = await prisma.galleryImage.findUnique({
      where: { id },
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
        neighbor = await prisma.galleryImage.findFirst({
          where: { category: image.category, order: { lt: image.order } },
          orderBy: { order: 'desc' },
        })
      } else {
        neighbor = await prisma.galleryImage.findFirst({
          where: { category: image.category, order: { gt: image.order } },
          orderBy: { order: 'asc' },
        })
      }

      if (!neighbor) {
        return NextResponse.json({ success: true })
      }

      await prisma.$transaction([
        prisma.galleryImage.update({
          where: { id: image.id },
          data: { order: neighbor.order },
        }),
        prisma.galleryImage.update({
          where: { id: neighbor.id },
          data: { order: image.order },
        }),
      ])

      revalidateTag('gallery', { expire: 0 })
      return NextResponse.json({ success: true })
    }

    if (direction === 'start') {
      await prisma.$transaction([
        prisma.galleryImage.updateMany({
          where: { category: image.category, order: { lt: image.order } },
          data: { order: { increment: 1 } },
        }),
        prisma.galleryImage.update({
          where: { id: image.id },
          data: { order: 1 },
        }),
      ])
      revalidateTag('gallery', { expire: 0 })
      return NextResponse.json({ success: true })
    }

    if (direction === 'end') {
      const last = await prisma.galleryImage.findFirst({
        where: { category: image.category },
        orderBy: { order: 'desc' },
      })

      if (!last) {
        return NextResponse.json({ success: true })
      }

      await prisma.$transaction([
        prisma.galleryImage.updateMany({
          where: { category: image.category, order: { gt: image.order } },
          data: { order: { decrement: 1 } },
        }),
        prisma.galleryImage.update({
          where: { id: image.id },
          data: { order: last.order },
        }),
      ])
      revalidateTag('gallery', { expire: 0 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Direção inválida' }, { status: 400 })
  } catch (error) {
    console.error('Erro ao reordenar imagem da galeria:', error)
    return NextResponse.json(
      { error: 'Erro ao reordenar imagem da galeria' },
      { status: 500 },
    )
  }
}
