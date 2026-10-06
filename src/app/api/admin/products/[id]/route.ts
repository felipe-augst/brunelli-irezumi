import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deleteObject } from '@/lib/r2'
import { updateProductSchema } from '@/schemas/product'
import { revalidateTag } from 'next/cache'
import { requireAdmin } from '@/lib/require-admin'
import { parseJsonBody } from '@/lib/parse-json-body'
import { getPricingError } from '@/server/product-pricing'

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

    // Só confere as regras de preço quando a requisição toca nesses campos ou
    // publica o produto: um PATCH parcial (ex.: só o título) não pode ser
    // travado por um produto antigo inconsistente, mas ninguém o ativa assim.
    const touchesPricing =
      parsed.data.priceCents !== undefined ||
      parsed.data.promoPriceCents !== undefined ||
      parsed.data.tags !== undefined ||
      parsed.data.active === true

    if (touchesPricing) {
      // Valor enviado ou o atual quando omitido; null remove (preço só sob
      // encomenda, promoção em qualquer caso)
      const pricingError = getPricingError({
        priceCents:
          parsed.data.priceCents === undefined
            ? current.priceCents
            : parsed.data.priceCents,
        promoPriceCents:
          parsed.data.promoPriceCents === undefined
            ? current.promoPriceCents
            : parsed.data.promoPriceCents,
        tags: parsed.data.tags ?? current.tags,
      })

      if (pricingError) {
        return NextResponse.json(
          { error: pricingError.message },
          { status: 400 },
        )
      }
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
