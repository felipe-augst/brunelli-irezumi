import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="bg-surface text-on-surface flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="font-headline text-2xl font-black tracking-widest uppercase md:text-4xl">
        Página não encontrada
      </h1>
      <p className="font-body text-on-surface-variant mt-4 max-w-md text-sm md:text-base">
        O endereço que você acessou não existe ou foi removido.
      </p>
      <Link
        href="/"
        className="font-headline border-accent text-accent hover:bg-accent hover:text-surface mt-8 border px-8 py-3 text-xs font-bold tracking-widest uppercase transition-colors"
      >
        Voltar ao início
      </Link>
    </main>
  )
}
