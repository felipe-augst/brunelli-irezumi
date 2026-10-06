import 'dotenv/config'
import { createInterface } from 'node:readline/promises'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import {
  ResetInputError,
  describeDatabaseHost,
  resetAdminPassword,
  validateNewPassword,
  type AdminStore,
} from '../src/server/reset-admin-password'

// Lê uma linha sem eco no terminal. Exige TTY: nunca cai para variável de
// ambiente nem para stdin redirecionado, que deixariam a senha no histórico.
function promptHidden(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const { stdin, stdout } = process
    stdout.write(question)
    stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding('utf8')

    let value = ''
    const finish = (error?: Error) => {
      stdin.setRawMode(false)
      stdin.pause()
      stdin.removeListener('data', onData)
      stdout.write('\n')
      if (error) reject(error)
      else resolve(value)
    }
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === '\r' || char === '\n') return finish()
        if (char === '\u0003') return finish(new ResetInputError('Cancelado'))
        if (char === '\u007f' || char === '\b') {
          // Por caractere, não por code unit: emoji ocupa dois
          value = Array.from(value).slice(0, -1).join('')
        } else if (char >= ' ') {
          value += char
        }
      }
    }
    stdin.on('data', onData)
  })
}

async function main() {
  if (!process.stdin.isTTY) {
    throw new ResetInputError(
      'Este script precisa de um terminal interativo (a senha é digitada sem eco)',
    )
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new ResetInputError('DATABASE_URL precisa estar definido no .env')
  }

  console.log(`Banco de dados: ${describeDatabaseHost(databaseUrl)}`)

  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const defaultEmail = process.env.ADMIN_EMAIL
  const emailAnswer = await rl.question(
    `E-mail do admin${defaultEmail ? ` [${defaultEmail}]` : ''}: `,
  )
  rl.close()

  const email = (emailAnswer.trim() || defaultEmail || '').toLowerCase()
  if (!email) throw new ResetInputError('E-mail é obrigatório')

  const newPassword = await promptHidden('Nova senha: ')
  // Falha cedo: não faz sentido confirmar nem pedir "s" para senha inválida
  validateNewPassword(newPassword)
  const confirmation = await promptHidden('Confirme a nova senha: ')
  if (newPassword !== confirmation) {
    throw new ResetInputError('A confirmação não confere com a nova senha')
  }

  // Digitar o e-mail (e não só "s") evita confirmar por reflexo num banco real
  const confirmRl = createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  const answer = await confirmRl.question(
    `Para redefinir a senha neste banco, digite o e-mail do admin (${email}): `,
  )
  confirmRl.close()
  if (answer.trim().toLowerCase() !== email) {
    console.log('E-mail não confere. Cancelado, nada foi alterado.')
    return
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl })
  const prisma = new PrismaClient({ adapter })

  const store: AdminStore = {
    findByEmail: (found) =>
      prisma.adminUser.findUnique({
        where: { email: found },
        select: { id: true },
      }),
    updatePassword: async (id, data) => {
      await prisma.adminUser.update({ where: { id }, data })
    },
  }

  try {
    const result = await resetAdminPassword(store, { email, newPassword })
    console.log(`Senha redefinida para ${result.email}.`)
    console.log('Sessões abertas foram invalidadas e o bloqueio foi zerado.')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error: unknown) => {
  // Só erros de entrada têm mensagem exibida: erros do banco ou do driver
  // podem carregar host, usuário ou a query
  console.error(
    error instanceof ResetInputError
      ? error.message
      : 'Erro inesperado ao falar com o banco; nada foi exibido para não expor dados de conexão.',
  )
  process.exit(1)
})
