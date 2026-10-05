import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPublicUrl } from '@/lib/r2'
import { galleryImageSchema } from '@/schemas/gallery'
import { revalidateTag } from 'next/cache'
import { requireAdmin } from '@/lib/require-admin'
import { parseJsonBody } from '@/lib/parse-json-body'

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body = await parseJsonBody(request)
  if (body === null) {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })
  }

  try {
    const parsed = galleryImageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Chave ou categoria ausente' },
        { status: 400 },
      )
    }

    const lastImg = await prisma.galleryImage.findFirst({
      where: { category: parsed.data.category },
      orderBy: { order: 'desc' },
    })

    const order = lastImg ? lastImg.order + 1 : 1

    const url = getPublicUrl(parsed.data.key)

    const newImage = await prisma.galleryImage.create({
      data: {
        url,
        category: parsed.data.category,
        order,
      },
    })
    revalidateTag('gallery', { expire: 0 })
    return NextResponse.json(newImage, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar imagem da galeria:', error)
    return NextResponse.json(
      { error: 'Erro ao criar imagem da galeria' },
      { status: 500 },
    )
  }
}
