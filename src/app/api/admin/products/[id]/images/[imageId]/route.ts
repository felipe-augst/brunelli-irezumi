import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deleteObject } from '@/lib/r2'
import { revalidateTag } from 'next/cache'
import { requireAdmin } from '@/lib/require-admin'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id, imageId } = await params

  try {
    const image = await prisma.productImage.findUnique({
      where: {
        id: imageId,
      },
    })
    if (!image) {
      return NextResponse.json(
        { error: 'Imagem não encontrada' },
        { status: 404 },
      )
    }

    if (image.productId !== id) {
      return NextResponse.json(
        { error: 'Imagem não pertence a este produto' },
        { status: 400 },
      )
    }

    const key = image.url.replace(`${process.env.R2_PUBLIC_URL}/`, '')

    // Banco primeiro; falha no R2 vira só log (objeto órfão)
    await prisma.productImage.delete({
      where: {
        id: imageId,
      },
    })
    try {
      await deleteObject(key)
    } catch (r2Error) {
      console.error(
        `Objeto órfão no R2 após excluir imagem de produto (key: ${key})`,
        r2Error,
      )
    }
    revalidateTag('products', { expire: 0 })
    return NextResponse.json(
      { message: 'Imagem excluída com sucesso' },
      { status: 200 },
    )
  } catch (error) {
    console.error('Erro ao excluir imagem do produto:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar a imagem' },
      { status: 500 },
    )
  }
}
