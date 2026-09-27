import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPublicUrl } from '@/lib/r2'
import { revalidateTag } from 'next/cache'
import { requireAdmin } from '@/lib/require-admin'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const { id } = await params
    const { key } = await request.json()

    const lastImg = await prisma.productImage.findFirst({
      where: { productId: id },
      orderBy: { order: 'desc' },
    })
    const order = lastImg ? lastImg.order + 1 : 0

    const url = getPublicUrl(key)

    const newImage = await prisma.productImage.create({
      data: {
        url,
        order,
        productId: id,
      },
    })

    revalidateTag('products', { expire: 0 })
    return NextResponse.json(newImage, { status: 201 })
  } catch (error) {
    console.error('Erro ao adicionar imagem do produto:', error)
    return NextResponse.json(
      { error: 'Erro ao adicionar imagem do produto' },
      { status: 500 },
    )
  }
}
