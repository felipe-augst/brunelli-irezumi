import { describe, expect, it } from 'vitest'
import type { CartItem } from '@/types/cart'
import { formatCentsToBRL } from './format-currency'
import {
  buildInquiryMessage,
  buildOrderMessage,
  buildWhatsAppUrl,
} from './whatsapp'

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: 'p1',
    title: 'Camiseta',
    priceCents: 10000,
    promoPriceCents: null,
    quantity: 1,
    imageUrl: null,
    ...overrides,
  }
}

describe('buildOrderMessage', () => {
  it('segue o formato do pedido', () => {
    const items = [
      makeItem({ quantity: 2 }),
      makeItem({
        productId: 'p2',
        title: 'Moletom',
        priceCents: 20000,
        promoPriceCents: 15000,
      }),
    ]
    const expected = [
      'Olá Felipe, gostaria de fazer o seguinte pedido:',
      '',
      `- Camiseta (2x) - ${formatCentsToBRL(20000)}`,
      `- Moletom (1x) - ${formatCentsToBRL(15000)}`,
      '',
      `Total: ${formatCentsToBRL(35000)}`,
    ].join('\n')
    expect(buildOrderMessage(items)).toBe(expected)
  })
})

describe('buildInquiryMessage', () => {
  it('segue o formato da consulta', () => {
    expect(buildInquiryMessage('Kimono')).toBe(
      'Olá Felipe, gostaria de mais informações sobre o produto Kimono, como posso encomendar?',
    )
  })
})

describe('buildWhatsAppUrl', () => {
  const base = 'https://wa.me/5511999999999'

  it('monta a URL com o texto codificado', () => {
    expect(buildWhatsAppUrl(base, 'a b')).toBe(`${base}?text=a%20b`)
  })

  it.each([
    'Tee & Co',
    'Hash #1',
    'Pergunta?',
    '100% algodão',
    'Ação café não',
    'Camiseta "Dragão"',
    "It's 'quoted'",
    'Emoji 🐉🔥',
    'Linha 1\nLinha 2',
  ])('título %j sobrevive à codificação', (title) => {
    const message = buildInquiryMessage(title)
    const url = buildWhatsAppUrl(base, message)
    const text = new URL(url).searchParams.get('text')
    expect(text).toBe(message)
    expect(decodeURIComponent(url.slice(url.indexOf('?text=') + 6))).toBe(
      message,
    )
    expect(url.split('?')).toHaveLength(2)
    expect(url).not.toMatch(/[&# \n"]/)
  })

  it('codifica o pedido inteiro', () => {
    const message = buildOrderMessage([makeItem({ title: 'A & B #1' })])
    const url = buildWhatsAppUrl(base, message)
    expect(decodeURIComponent(url.slice(url.indexOf('?text=') + 6))).toBe(
      message,
    )
  })
})
