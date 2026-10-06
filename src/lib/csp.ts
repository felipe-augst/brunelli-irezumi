// Política em modo Report-Only: mede o que quebraria sem bloquear nada.
// script-src usa 'unsafe-inline' porque o Next injeta scripts de hidratação
// com conteúdo variável (hash estático não serve) e nonce exigiria layout
// dinâmico (conflita com #68). A política estrita fica para a issue que
// passar a CSP para o modo que bloqueia.
// r2PublicUrl vem de R2_PUBLIC_URL (mesma origem das imagens p�blicas).
export function buildCspReportOnly(
  isDev: boolean,
  r2PublicUrl?: string,
): string {
  const scriptSrc = ["'self'", "'unsafe-inline'"]
  if (isDev) scriptSrc.push("'unsafe-eval'")

  const imgSrc = [
    "'self'",
    'data:',
    'blob:',
    'https://lh3.googleusercontent.com',
  ]
  if (r2PublicUrl) imgSrc.push(new URL(r2PublicUrl).origin)

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src ${imgSrc.join(' ')}`,
    "font-src 'self'",
    "connect-src 'self' https://*.r2.cloudflarestorage.com",
    'frame-src https://www.google.com',
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}
