import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

type UseDialogA11yOptions = {
  isOpen: boolean
  onClose: () => void
  containerRef: RefObject<HTMLElement | null>
  // Elementos que não devem ficar inertes (ex.: backdrop que fecha o diálogo)
  ignore?: RefObject<HTMLElement | null>[]
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((el) => !el.closest('[inert]'))
}

// Marca como inertes os irmãos do container e dos seus ancestrais até o body.
// Devolve só o que foi marcado aqui, para não limpar o que já era inerte.
// Um irmão que é (ou contém) um elemento ignorado não é marcado. Se o ignorado
// estiver aninhado, o irmão que o contém inteiro fica ativo (limitação).
function inertBackground(
  container: HTMLElement,
  ignored: HTMLElement[],
): HTMLElement[] {
  const marked: HTMLElement[] = []
  let node: HTMLElement = container
  while (node.parentElement && node !== document.body) {
    const parent: HTMLElement = node.parentElement
    for (const sibling of Array.from(parent.children)) {
      if (
        sibling === node ||
        !(sibling instanceof HTMLElement) ||
        sibling.hasAttribute('inert') ||
        ignored.some((el) => sibling.contains(el)) ||
        ['SCRIPT', 'STYLE', 'LINK'].includes(sibling.tagName)
      ) {
        continue
      }
      sibling.setAttribute('inert', '')
      marked.push(sibling)
    }
    node = parent
  }
  return marked
}

function focusMain() {
  const main = document.querySelector<HTMLElement>('main')
  if (!main) return
  if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1')
  main.focus()
}

/**
 * Acessibilidade de diálogo modal: foco inicial, armadilha de foco, Escape,
 * retorno do foco e inert no conteúdo de fundo. O container precisa de
 * tabIndex={-1} para receber foco quando não há elemento focável dentro.
 */
export function useDialogA11y({
  isOpen,
  onClose,
  containerRef,
  ignore,
}: UseDialogA11yOptions) {
  // Ref para o efeito não depender da identidade de onClose
  const onCloseRef = useRef(onClose)
  const ignoreRef = useRef(ignore)
  useEffect(() => {
    onCloseRef.current = onClose
    ignoreRef.current = ignore
  })

  useEffect(() => {
    const container = containerRef.current
    if (!isOpen || !container) return

    // Body ou null (ex.: Safari não foca botão no clique) = sem origem
    const active = document.activeElement
    const origin =
      active instanceof HTMLElement && active !== document.body ? active : null
    // Lidas na abertura: o ignorado pode só existir com o diálogo aberto
    const ignored = (ignoreRef.current ?? []).flatMap((ref) =>
      ref.current ? [ref.current] : [],
    )
    const markedElements = inertBackground(container, ignored)

    const [first] = getFocusable(container)
    ;(first ?? container).focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab' || !container) return

      const focusable = getFocusable(container)
      const firstEl = focusable[0]
      const lastEl = focusable[focusable.length - 1]
      if (!firstEl || !lastEl) {
        event.preventDefault()
        container.focus()
        return
      }

      const current = document.activeElement
      const outside = !container.contains(current) || current === container
      if (event.shiftKey && (outside || current === firstEl)) {
        event.preventDefault()
        lastEl.focus()
      } else if (!event.shiftKey && (outside || current === lastEl)) {
        event.preventDefault()
        firstEl.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      for (const el of markedElements) el.removeAttribute('inert')
      if (origin?.isConnected) {
        origin.focus()
      } else {
        focusMain()
      }
    }
  }, [isOpen, containerRef])
}
