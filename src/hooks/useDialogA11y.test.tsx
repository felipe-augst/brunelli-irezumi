import { useRef, useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { useDialogA11y } from './useDialogA11y'

type HarnessProps = {
  onClose?: () => void
  withMain?: boolean
  unmountOriginOnClose?: boolean
  withIgnored?: boolean
  ignoredInert?: boolean
}

function Harness({
  onClose,
  withMain = true,
  unmountOriginOnClose = false,
  withIgnored = false,
  ignoredInert = false,
}: HarnessProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showOrigin, setShowOrigin] = useState(true)
  const [count, setCount] = useState(0)
  const [showLast, setShowLast] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const ignoredRef = useRef<HTMLDivElement>(null)

  function close() {
    onClose?.()
    if (unmountOriginOnClose) setShowOrigin(false)
    setIsOpen(false)
  }

  useDialogA11y({
    isOpen,
    onClose: close,
    containerRef: ref,
    ignore: withIgnored ? [ignoredRef] : undefined,
  })

  return (
    <div>
      {showOrigin && <button onClick={() => setIsOpen(true)}>abrir</button>}
      {withMain && <main>conteúdo {count}</main>}
      <button>fora</button>
      {withIgnored && isOpen && (
        <div ref={ignoredRef} data-testid="ignorado" inert={ignoredInert} />
      )}
      <div
        ref={ref}
        role="dialog"
        aria-label="teste"
        tabIndex={-1}
        inert={!isOpen}
      >
        <button>primeiro</button>
        <button onClick={() => setCount((c) => c + 1)}>mais {count}</button>
        <button disabled>desabilitado</button>
        <button onClick={() => setShowLast(false)}>ocultar último</button>
        {showLast && <button>último</button>}
      </div>
    </div>
  )
}

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'abrir' }))
}

describe('useDialogA11y', () => {
  it('move o foco para dentro ao abrir', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await openDialog(user)
    expect(screen.getByRole('button', { name: 'primeiro' })).toHaveFocus()
  })

  it('mantém o foco dentro com Tab e Shift+Tab', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await openDialog(user)

    await user.tab({ shift: true })
    expect(screen.getByRole('button', { name: 'último' })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('button', { name: 'primeiro' })).toHaveFocus()
  })

  it('chama onClose com Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Harness onClose={onClose} />)
    await openDialog(user)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('devolve o foco ao elemento de origem ao fechar', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await openDialog(user)
    await user.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: 'abrir' })).toHaveFocus()
  })

  it('foca o main quando a origem saiu do documento', async () => {
    const user = userEvent.setup()
    render(<Harness unmountOriginOnClose />)
    await openDialog(user)
    await user.keyboard('{Escape}')
    const main = screen.getByRole('main')
    expect(main).toHaveFocus()
    expect(main).toHaveAttribute('tabindex', '-1')
  })

  it('não rouba o foco de volta em re-renders enquanto aberto', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await openDialog(user)
    const plus = screen.getByRole('button', { name: /mais/ })
    await user.click(plus)
    expect(screen.getByRole('button', { name: /mais 1/ })).toHaveFocus()
  })

  it('marca o fundo como inert só enquanto aberto', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    expect(screen.getByRole('main')).not.toHaveAttribute('inert')

    await openDialog(user)
    expect(screen.getByRole('main')).toHaveAttribute('inert')
    expect(screen.getByRole('button', { name: 'fora' })).toHaveAttribute(
      'inert',
    )
    expect(screen.getByRole('dialog')).not.toHaveAttribute('inert')

    await user.keyboard('{Escape}')
    expect(screen.getByRole('main')).not.toHaveAttribute('inert')
    expect(screen.getByRole('button', { name: 'fora' })).not.toHaveAttribute(
      'inert',
    )
  })

  it('não remove inert de quem já estava inerte', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const outside = screen.getByRole('button', { name: 'fora' })
    outside.setAttribute('inert', '')

    await openDialog(user)
    await user.keyboard('{Escape}')

    expect(outside).toHaveAttribute('inert')
    expect(screen.getByRole('main')).not.toHaveAttribute('inert')
  })

  it('trata body como origem inexistente e foca o main ao fechar', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    // fireEvent não move o foco, como o clique em botão no Safari
    fireEvent.click(screen.getByRole('button', { name: 'abrir' }))
    expect(document.body).not.toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.getByRole('main')).toHaveFocus()
  })

  it('remove o inert que marcou ao desmontar com o diálogo aberto', async () => {
    const user = userEvent.setup()
    const outside = document.createElement('div')
    document.body.appendChild(outside)
    const { unmount } = render(<Harness />)
    await openDialog(user)
    expect(outside).toHaveAttribute('inert')

    unmount()
    expect(outside).not.toHaveAttribute('inert')
    outside.remove()
  })

  it('recalcula os focáveis a cada Tab', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await openDialog(user)

    await user.click(screen.getByRole('button', { name: 'ocultar último' }))
    expect(screen.queryByRole('button', { name: 'último' })).toBeNull()

    // 'ocultar último' agora é o último focável: Tab volta ao primeiro
    await user.tab()
    expect(screen.getByRole('button', { name: 'primeiro' })).toHaveFocus()
  })

  it('não marca o elemento ignorado e marca os demais irmãos', async () => {
    const user = userEvent.setup()
    render(<Harness withIgnored />)
    await openDialog(user)

    expect(screen.getByTestId('ignorado')).not.toHaveAttribute('inert')
    expect(screen.getByRole('main')).toHaveAttribute('inert')
    expect(screen.getByRole('button', { name: 'fora' })).toHaveAttribute(
      'inert',
    )
  })

  it('mantém o ignorado sem inert ao fechar e abrir de novo', async () => {
    const user = userEvent.setup()
    render(<Harness withIgnored />)
    await openDialog(user)
    await user.keyboard('{Escape}')
    expect(screen.queryByTestId('ignorado')).toBeNull()

    await openDialog(user)
    expect(screen.getByTestId('ignorado')).not.toHaveAttribute('inert')
    expect(screen.getByRole('main')).toHaveAttribute('inert')
  })

  it('não mexe no inert de um ignorado que já era inerte', async () => {
    const user = userEvent.setup()
    render(<Harness withIgnored ignoredInert />)
    await openDialog(user)
    expect(screen.getByTestId('ignorado')).toHaveAttribute('inert')
    await user.keyboard('{Escape}')
    await openDialog(user)
    expect(screen.getByTestId('ignorado')).toHaveAttribute('inert')
  })
})
