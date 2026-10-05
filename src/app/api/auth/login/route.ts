import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { loginSchema } from '@/schemas/login'
import { isAccountLocked } from '@/server/auth'
import { parseJsonBody } from '@/lib/parse-json-body'

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000

const DUMMY_HASH = bcrypt.hashSync('dummy-password', 10)

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

    if (adminUser.lockedUntil) {
      await prisma.adminUser.update({
        where: { id: adminUser.id },
        data: { failedAttempts: 0, lockedUntil: null },
      })
      adminUser.failedAttempts = 0
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      adminUser.passwordHash,
    )

    if (!isPasswordValid) {
      const updated = await prisma.adminUser.update({
        where: { id: adminUser.id },
        data: { failedAttempts: { increment: 1 } },
      })

      if (updated.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        await prisma.adminUser.update({
          where: { id: adminUser.id },
          data: { lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS) },
        })
      }

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
