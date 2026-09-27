import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deleteObject } from '@/lib/r2'
import { updateProductSchema } from '@/schemas/product'
import { revalidateTag } from 'next/cache'
import { requireAdmin } from '@/lib/require-admin'

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

    for (const image of product.images) {
      const key = image.url.replace(`${process.env.R2_PUBLIC_URL}/`, '')
      await deleteObject(key)
    }
    await prisma.product.delete({
      where: { id: id },
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
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = updateProductSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados do produto inválidos' },
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
