import type { Metadata } from 'next'
import { LogoutButton } from '@/components/admin/auth/LogoutButton'
import { AdminNav } from '@/components/admin/layout/AdminNav'
import { requireAdminPage } from '@/lib/require-admin-page'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdminPage()

  return (
    <div className="bg-surface min-h-screen">
      <header className="border-outline-variant flex justify-between border-b px-4 py-3 text-center">
        <p className="text-on-surface text-sm">
          Olá, <span className="font-medium">Felipe</span>, seja bem-vindo
        </p>
        <LogoutButton />
      </header>
      <AdminNav />
      <main className="px-4 py-6">{children}</main>
    </div>
  )
}
