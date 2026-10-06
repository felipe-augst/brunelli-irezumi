import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/require-admin'

// Versão para páginas e layouts do painel: mesma regra do requireAdmin(), mas
// sessão inválida (assinatura, usuário inexistente ou token anterior à troca de
// senha) redireciona para o login. O layout não é renderizado de novo na
// navegação entre páginas, então cada página que lê dados chama este helper.
export async function requireAdminPage() {
  const admin = await requireAdmin()
  if (!admin) redirect('/admin/login')
  return admin
}
