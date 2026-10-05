import type { CartItem } from '@/types/cart'
import { cartTotalCents, lineTotalCents } from '@/lib/cart'
import { formatCentsToBRL } from '@/lib/format-currency'

export function buildOrderMessage(items: CartItem[]): string {
  const lines = items.map(
    (item) =>
      `- ${item.title} (${item.quantity}x) - ${formatCentsToBRL(lineTotalCents(item))}`,
  )
  return `Olá Felipe, gostaria de fazer o seguinte pedido:\n\n${lines.join('\n')}\n\nTotal: ${formatCentsToBRL(cartTotalCents(items))}`
}

export function buildInquiryMessage(title: string): string {
  return `Olá Felipe, gostaria de mais informações sobre o produto ${title}, como posso encomendar?`
}

export function buildWhatsAppUrl(baseUrl: string, message: string): string {
  return `${baseUrl}?text=${encodeURIComponent(message)}`
}
