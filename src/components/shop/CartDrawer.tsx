'use client'

import { useEffect, useId, useRef } from 'react'
import Image from 'next/image'
import { X, Trash2 } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useDialogA11y } from '@/hooks/useDialogA11y'
import { cartTotalCents, lineTotalCents, MAX_CART_QUANTITY } from '@/lib/cart'
import { formatCentsToBRL } from '@/lib/format-currency'
import { buildOrderMessage, buildWhatsAppUrl } from '@/lib/whatsapp'
import { WHATSAPP_URL } from '@/data/projects'

export function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
  } = useCart()

  const panelRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useDialogA11y({
    isOpen: isDrawerOpen,
    onClose: closeDrawer,
    containerRef: panelRef,
    ignore: [backdropRef],
  })

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isDrawerOpen])

  const total = cartTotalCents(items)

  return (
    <>
      {isDrawerOpen && (
        <div
          ref={backdropRef}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={closeDrawer}
        />
      )}

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        inert={!isDrawerOpen}
        className={`bg-surface fixed top-0 right-0 z-50 h-full w-full transition-transform duration-300 lg:w-96 ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="border-outline-variant flex items-center justify-between border-b p-4">
          <h2
            id={titleId}
            className="font-headline text-accent justify-center text-lg font-semibold tracking-widest uppercase"
          >
            Carrinho
          </h2>
          <button onClick={closeDrawer} aria-label="Fechar carrinho">
            <X className="text-outline" size={22} />
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-on-surface-variant p-4 text-sm">
            Seu carrinho está vazio.
          </p>
        ) : (
          <div className="flex flex-col gap-3 p-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="border-outline-variant flex items-center gap-3 border-b pb-3"
              >
                {item.imageUrl && (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-on-surface text-sm font-medium">
                    {item.title}
                  </p>
                  <p className="text-accent text-sm font-bold">
                    {formatCentsToBRL(lineTotalCents(item))}
                  </p>
                </div>
                <div className="border-outline-variant flex gap-6 rounded-full border px-3 py-1.5">
                  <button
                    disabled={item.quantity === 1}
                    onClick={() => decreaseQuantity(item.productId)}
                    aria-label={`Diminuir quantidade de ${item.title}`}
                    className="text-on-surface disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    -
                  </button>
                  {item.quantity}
                  <button
                    disabled={item.quantity >= MAX_CART_QUANTITY}
                    onClick={() => increaseQuantity(item.productId)}
                    aria-label={`Aumentar quantidade de ${item.title}`}
                    className="text-on-surface disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.productId)}
                  aria-label={`Remover ${item.title} do carrinho`}
                  className="text-secondary hover:text-on-surface"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3">
              <span className="text-on-surface font-medium">Total</span>
              <span className="text-accent font-bold">
                {formatCentsToBRL(total)}
              </span>
            </div>
            <button
              onClick={() => {
                window.open(
                  buildWhatsAppUrl(WHATSAPP_URL, buildOrderMessage(items)),
                  '_blank',
                )
              }}
              className="bg-accent text-on-accent hover:bg-accent-hover mt-4 w-full rounded-full py-3 text-sm font-bold transition-colors"
            >
              Finalizar pedido no WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  )
}
