import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const rawEmail = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!rawEmail || !password) {
    throw new Error(
      'ADMIN_EMAIL e ADMIN_PASSWORD precisam estar definidos no .env',
    )
  }

  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD precisa ter no mínimo 12 caracteres')
  }

  const email = rawEmail.toLowerCase()

  const admin = await prisma.adminUser.findUnique({
    where: { email },
  })

  if (admin) {
    console.log('Admin já existe, nada a fazer:', admin.email)
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const created = await prisma.adminUser.create({
    data: { email, passwordHash },
  })

  console.log('Admin criado:', created.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
