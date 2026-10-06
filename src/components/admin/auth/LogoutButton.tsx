'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', {
      method: 'POST',
    })
    router.push('/admin/login')
  }

  return (
    <button onClick={handleLogout} aria-label="Sair">
      <LogOut size={18} />
    </button>
  )
}
