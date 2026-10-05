import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPublicUrl } from '@/lib/r2'
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
    const { key } = body as { key?: unknown }

    if (typeof key !== 'string' || !key.startsWith('products/')) {
      return NextResponse.json({ error: 'Chave inválida' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 },
      )
    }

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
