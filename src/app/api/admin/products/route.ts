import { createProductSchema } from '@/schemas/product'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidateTag } from 'next/cache'
import { requireAdmin } from '@/lib/require-admin'
import { parseJsonBody } from '@/lib/parse-json-body'
import { getPricingIssueMessage } from '@/server/product-pricing'

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
    const parsed = createProductSchema.safeParse(body)

    if (!parsed.success) {
      // Só as regras de preço têm mensagem própria em pt-BR; o resto do Zod
      // nunca vai para o cliente
      const pricingMessage = getPricingIssueMessage(parsed.error.issues)
      return NextResponse.json(
        { error: pricingMessage ?? 'Dados do produto inválidos' },
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
        // O formulário ativa o produto depois que todas as imagens subirem
        active: false,
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
