import { createProductSchema } from '@/schemas/product'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidateTag } from 'next/cache'
import { requireAdmin } from '@/server/auth'

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const parsed = createProductSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados do produto inválidos' },
        { status: 400 },
      )
    }

    const product = await prisma.product.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        priceCents: parsed.data.priceCents,
        promoPriceCents: parsed.data.promoPriceCents,
        category: parsed.data.category,
        tags: { set: parsed.data.tags },
      },
    })
    revalidateTag('products', { expire: 0 })
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar produto', error)
    return NextResponse.json(
      { error: 'Algo de errado aconteceu...' },
      { status: 500 },
    )
  }
}
