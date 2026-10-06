'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="border-outline-variant bg-surface-container flex items-center justify-between gap-4 border-b px-4 py-2 lg:justify-center lg:gap-20">
      <Link
        href="/admin/gallery/portfolio"
        className={`text-sm ${pathname === '/admin/gallery/portfolio' ? 'text-accent' : 'text-on-surface-variant hover:text-accent'}`}
      >
        Portfólio
      </Link>
      <Link
        href="/admin/gallery/painting"
        className={`text-sm ${pathname === '/admin/gallery/painting' ? 'text-accent' : 'text-on-surface-variant hover:text-accent'}`}
      >
        Pinturas
      </Link>
      <Link
        href="/admin/gallery/coverup"
        className={`text-sm ${pathname === '/admin/gallery/coverup' ? 'text-accent' : 'text-on-surface-variant hover:text-accent'}`}
      >
        Coberturas
      </Link>
      <Link
        href="/admin/products"
        className={`text-sm ${pathname === '/admin/products' ? 'text-accent' : 'text-on-surface-variant hover:text-accent'}`}
      >
        Loja
      </Link>
    </nav>
  )
}
