import type { Metadata } from 'next'
import { ChangePasswordForm } from '@/components/admin/auth/ChangePasswordForm'

export const metadata: Metadata = {
  title: 'Trocar senha',
  robots: {
    index: false,
    follow: false,
  },
}

export default function PasswordPage() {
  return (
    <div className="mt-5 flex flex-col gap-4 px-4">
      <h1 className="text-on-surface text-center text-2xl font-semibold tracking-widest uppercase">
        Trocar senha
      </h1>
      <ChangePasswordForm />
    </div>
  )
}
