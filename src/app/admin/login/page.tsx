import type { Metadata } from 'next'
import { LoginForm } from '@/components/admin/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Login',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <main>
      <LoginForm />
    </main>
  )
}
