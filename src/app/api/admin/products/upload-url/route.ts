import { NextResponse } from 'next/server'
import { getUploadUrl } from '@/lib/r2'
import { randomUUID } from 'crypto'
import { requireAdmin } from '@/server/auth'

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }
  try {
    const { contentType } = await request.json()
    if (!contentType || !contentType.startsWith('image/')) {
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
