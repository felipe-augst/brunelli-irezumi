import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deleteObject } from '@/lib/r2'
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
    const galleryItem = await prisma.galleryImage.findUnique({
      where: { id },
    })
    if (!galleryItem) {
      return NextResponse.json(
        { error: 'Imagem não encontrada' },
        { status: 404 },
      )
    }

    const key = galleryItem.url.replace(`${process.env.R2_PUBLIC_URL}/`, '')

    await deleteObject(key)
    await prisma.galleryImage.delete({
      where: { id },
    })
    revalidateTag('gallery', { expire: 0 })

    return NextResponse.json(
      { message: 'Imagem da galeria excluída com sucesso' },
      { status: 200 },
    )
  } catch (error) {
    console.error('Erro ao excluir imagem da galeria:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir imagem da galeria' },
      { status: 500 },
    )
  }
}
