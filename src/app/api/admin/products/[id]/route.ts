import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deleteObject } from '@/lib/r2'
import { updateProductSchema } from '@/schemas/product'
import { revalidateTag } from 'next/cache'
import { requireAdmin } from '@/lib/require-admin'
import { parseJsonBody } from '@/lib/parse-json-body'
import { isPromoPriceValid } from '@/server/product-pricing'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await params
  try {
    const product = await prisma.product.findUnique({
      where: { id: id },
      include: {
        images: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 },
      )
    }

    // Banco primeiro: falha no R2 deixa só órfãos, nunca produto sem imagem
    await prisma.product.delete({
      where: { id: id },
    })

    const keys = product.images.map((image) =>
      image.url.replace(`${process.env.R2_PUBLIC_URL}/`, ''),
    )
    const results = await Promise.allSettled(keys.map((k) => deleteObject(k)))
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          `Objeto órfão no R2 após excluir produto (key: ${keys[index]})`,
          result.reason,
        )
      }
    })

    revalidateTag('products', { expire: 0 })
    return NextResponse.json(
      { message: 'Produto excluído com sucesso' },
      { status: 200 },
    )
  } catch (error) {
    console.error('Erro ao excluir produto', error)
    return NextResponse.json(
      { error: 'Erro ao excluir produto' },
      { status: 500 },
    )
  }
}

export async function PATCH(
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
    const parsed = updateProductSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados do produto inválidos' },
        { status: 400 },
      )
    }

    const current = await prisma.product.findUnique({ where: { id } })
    if (!current) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 },
      )
    }

    // Valor enviado ou o atual quando omitido; null remove a promoção
    const effectivePrice = parsed.data.priceCents ?? current.priceCents
    const effectivePromo =
      parsed.data.promoPriceCents === undefined
        ? current.promoPriceCents
        : parsed.data.promoPriceCents

    if (!isPromoPriceValid(effectivePrice, effectivePromo)) {
      return NextResponse.json(
        { error: 'Preço promocional deve ser menor que o preço normal' },
        { status: 400 },
      )
    }

    const { tags, ...rest } = parsed.data

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(tags && { tags: { set: tags } }),
      },
    })

    revalidateTag('products', { expire: 0 })
    return NextResponse.json(
      { message: 'Produto atualizado com sucesso', product: updatedProduct },
      { status: 200 },
    )
  } catch (error) {
    console.error('Erro ao atualizar produto', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar produto' },
      { status: 500 },
    )
  }
}
