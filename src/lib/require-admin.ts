import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isSessionValid } from '@/server/session'

export async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  // Assinatura válida não basta: o usuário precisa existir e o token não pode
  // ser anterior à última troca de senha. Se o banco falhar, nega o acesso
  // (fail closed) em vez de deixar a exceção escapar do handler.
  try {
    const adminUser = await prisma.adminUser.findUnique({
      where: { id: payload.sub },
      select: { id: true, passwordChangedAt: true },
    })
    if (!adminUser) return null
    if (!isSessionValid(payload.iat, adminUser.passwordChangedAt)) return null
  } catch (error) {
    console.error(error)
    return null
  }

  return payload
}
