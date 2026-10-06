import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { requireAdmin } from '@/lib/require-admin'
import { parseJsonBody } from '@/lib/parse-json-body'
import { changePasswordSchema } from '@/schemas/password'
import { isAccountLocked } from '@/server/auth'
import { BCRYPT_COST } from '@/server/password'
import {
  DUMMY_HASH,
  clearExpiredLock,
  registerFailedAttempt,
} from '@/server/login-attempts'

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
    const parsed = changePasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }
    const { currentPassword, newPassword } = parsed.data

    const adminUser = await prisma.adminUser.findUnique({
      where: { id: admin.sub },
    })

    // Mesma resposta do login para qualquer falha de credencial
    const invalidCredentials = () =>
      NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })

    if (!adminUser || isAccountLocked(adminUser)) {
      await bcrypt.compare(currentPassword, DUMMY_HASH)
      return invalidCredentials()
    }

    await clearExpiredLock(adminUser)

    const isCurrentValid = await bcrypt.compare(
      currentPassword,
      adminUser.passwordHash,
    )

    if (!isCurrentValid) {
      await registerFailedAttempt(adminUser.id)
      return invalidCredentials()
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_COST)
    const changedAt = new Date()

    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: {
        passwordHash,
        passwordChangedAt: changedAt,
        failedAttempts: 0,
        lockedUntil: null,
      },
    })

    // O token novo nasce depois de changedAt, então a sessão de quem trocou
    // continua válida; as anteriores passam a ser rejeitadas por requireAdmin
    const token = await signToken({ sub: adminUser.id })
    const response = NextResponse.json({ success: true })
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    return response
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Erro ao trocar a senha' },
      { status: 500 },
    )
  }
}
