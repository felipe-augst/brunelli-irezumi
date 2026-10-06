// Cookie que marca a abertura (Skeleton) como já vista no dia. Lido e gravado
// só no navegador, para o layout raiz não depender de cookies() e as páginas
// poderem ser estáticas.
export const SKELETON_COOKIE_NAME = 'skeleton_shown'
export const SKELETON_SEEN_CLASS = 'skeleton-seen'

const ONE_DAY_SECONDS = 60 * 60 * 24

export function hasSkeletonCookie(cookieString: string): boolean {
  return cookieString
    .split(';')
    .some((part) => part.trim() === `${SKELETON_COOKIE_NAME}=1`)
}

export function buildSkeletonCookie({ secure }: { secure: boolean }): string {
  const base = `${SKELETON_COOKIE_NAME}=1; Max-Age=${ONE_DAY_SECONDS}; Path=/; SameSite=Lax`
  return secure ? `${base}; Secure` : base
}

// Roda no <head>, antes da pintura: marca o <html> para o CSS esconder o
// overlay sem esperar a hidratação (evita o flash do Skeleton).
export const SKELETON_HEAD_SCRIPT = `try{if(document.cookie.split(';').some(function(c){return c.trim()==='${SKELETON_COOKIE_NAME}=1'})){document.documentElement.classList.add('${SKELETON_SEEN_CLASS}')}}catch(e){}`
