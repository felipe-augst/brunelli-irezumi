export default function AdminDashboardPage() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-2">
      <h1 className="text-on-surface text-center text-xl font-semibold tracking-wide">
        Painel administrativo
      </h1>
      <p className="text-on-surface-variant text-center text-sm leading-relaxed tracking-wide">
        Olá, Felipe! <br />
        Use o menu acima para gerenciar as galerias e a loja do site.
      </p>
    </div>
  )
}
