import Link from 'next/link'
import {
  INSTAGRAM_URL,
  TIKTOK_URL,
  NAV_LINKS,
  STUDIO_NAME,
  WHATSAPP_URL,
} from '@/data/projects'

const SOCIAL_LINKS = [
  { label: 'Instagram', href: INSTAGRAM_URL },
  { label: 'WhatsApp', href: WHATSAPP_URL },
  { label: 'TikTok', href: TIKTOK_URL },
]

export function Footer() {
  return (
    <footer className="bg-surface-container border-outline-variant border-t">
      {/* Container Principal: Usa Grid para distribuir o espaço */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 px-6 py-16 md:grid-cols-12">
        {/* Lado Esquerdo: Logo e Descrição (Ocupa 5 colunas no desktop) */}
        <div className="m-auto flex flex-col items-center justify-center text-center md:col-span-5 md:items-start md:text-left">
          <h2 className="font-headline text-on-surface mb-2 text-3xl font-bold md:text-4xl lg:text-5xl">
            {STUDIO_NAME}
          </h2>
          <p className="font-body text-on-surface/90 mb-4 max-w-xs text-center text-sm leading-relaxed">
            Eterno estudante da{' '}
            <strong className="text-accent">tatuagem japonesa</strong>
          </p>
          ブ<br />ル<br />ネ<br />リ
        </div>

        {/* Divisor Vertical (Apenas Desktop) - Ocupa 1 coluna */}
        <div className="hidden justify-center md:col-span-1 md:flex">
          <div className="bg-outline-variant/20 h-32 w-px"></div>
        </div>

        {/* Lado Direito: Links (Ocupa 6 colunas) */}
        <div className="grid w-full grid-cols-2 gap-8 md:col-span-6">
          {/* Coluna Menu */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-headline text-accent mb-6 text-xs font-bold tracking-widest uppercase">
              Navegação
            </h3>
            <ul className="space-y-4 text-center md:text-left">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-on-surface/60 hover:text-secondary font-body text-sm transition-all"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna Social */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-headline text-accent mb-6 text-xs font-bold tracking-widest uppercase">
              Social
            </h3>
            <ul className="space-y-4 text-center md:text-left">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-on-surface/60 hover:text-secondary font-body text-sm transition-all"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-outline-variant/10 text-on-surface border-t px-2 py-8 text-center text-[10px] tracking-[0.2em] uppercase">
        {new Date().getFullYear()} Criado e desenvolvido por{' '}
        <strong>
          <a
            href="https://felipeaugustodev.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-secondary-container transition-colors"
          >
            Felipe Augusto
          </a>
        </strong>{' '}
        🍃
      </div>
    </footer>
  )
}
