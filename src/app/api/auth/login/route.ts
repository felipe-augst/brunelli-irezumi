import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { loginSchema } from '@/schemas/login'
import { isAccountLocked } from '@/server/auth'
import {
  DUMMY_HASH,
  clearExpiredLock,
  registerFailedAttempt,
} from '@/server/login-attempts'
import { parseJsonBody } from '@/lib/parse-json-body'

export async function POST(req: Request) {
  const body = await parseJsonBody(req)
  if (body === null) {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })
  }

  try {
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados de login inválidos' },
        { status: 400 },
      )
    }
    const { email, password } = parsed.data

    const adminUser = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!adminUser) {
      await bcrypt.compare(password, DUMMY_HASH)
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 },
      )
    }

    if (isAccountLocked(adminUser)) {
      await bcrypt.compare(password, DUMMY_HASH)
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 },
      )
    }

    await clearExpiredLock(adminUser)

    const isPasswordValid = await bcrypt.compare(
      password,
      adminUser.passwordHash,
    )

    if (!isPasswordValid) {
      await registerFailedAttempt(adminUser.id)

      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 },
      )
    }

    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { failedAttempts: 0, lockedUntil: null },
    })

    const token = await signToken({
      sub: adminUser.id,
    })
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
      { error: 'Erro ao processar login' },
      { status: 500 },
    )
  }
}
