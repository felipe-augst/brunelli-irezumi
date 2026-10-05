import { NextResponse } from 'next/server'
import { getUploadUrl } from '@/lib/r2'
import { randomUUID } from 'crypto'
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
    const { contentType } = body as { contentType?: string }

    if (contentType !== 'image/webp') {
      return NextResponse.json(
        { error: 'Tipo de arquivo inválido' },
        { status: 400 },
      )
    }

    const key = `products/${randomUUID()}.webp`
    const uploadUrl = await getUploadUrl(key, contentType)

    return NextResponse.json({ uploadUrl, key })
  } catch (error) {
    console.error('Erro ao gerar URL de upload:', error)

    return NextResponse.json(
      { error: 'Erro ao gerar URL de upload' },
      { status: 500 },
    )
  }
}
