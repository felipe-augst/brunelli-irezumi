import { describe, expect, it } from 'vitest'
import type { CartItem } from '@/types/cart'
import {
  addToCart,
  canAddToCart,
  cartItemCount,
  cartTotalCents,
  decreaseQuantity,
  increaseQuantity,
  parseCart,
  reconcileCart,
  removeFromCart,
  type CatalogProduct,
} from './cart'

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: 'p1',
    title: 'Camiseta',
    priceCents: 10000,
    promoPriceCents: null,
    quantity: 1,
    imageUrl: 'https://img/p1.webp',
    ...overrides,
  }
}

function makeProduct(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    id: 'p1',
    title: 'Camiseta',
    priceCents: 10000,
    promoPriceCents: null,
    tags: [],
    imageUrl: 'https://img/p1.webp',
    ...overrides,
  }
}

describe('parseCart', () => {
  it('devolve [] para JSON inválido', () => {
    expect(parseCart('{oops')).toEqual([])
  })

  it('devolve [] para string vazia', () => {
    expect(parseCart('')).toEqual([])
  })

  it('devolve [] quando não é array', () => {
    expect(parseCart('{"a":1}')).toEqual([])
    expect(parseCart('null')).toEqual([])
    expect(parseCart('"x"')).toEqual([])
  })

  it('lê um carrinho válido', () => {
    const items = [makeItem(), makeItem({ productId: 'p2', quantity: 3 })]
    expect(parseCart(JSON.stringify(items))).toEqual(items)
  })

  it('mantém só os itens válidos numa mistura', () => {
    const valid = makeItem()
    const raw = JSON.stringify([valid, null, 'x', 42, { foo: 1 }, []])
    expect(parseCart(raw)).toEqual([valid])
  })

  it('descarta quantity decimal, negativa, zero ou string', () => {
    const raw = JSON.stringify([
      makeItem({ productId: 'a', quantity: 1.5 }),
      makeItem({ productId: 'b', quantity: -1 }),
      makeItem({ productId: 'c', quantity: 0 }),
      { ...makeItem({ productId: 'd' }), quantity: '2' },
    ])
    expect(parseCart(raw)).toEqual([])
  })

  it('descarta priceCents zero, negativo ou decimal', () => {
    const raw = JSON.stringify([
      makeItem({ productId: 'a', priceCents: 0 }),
      makeItem({ productId: 'b', priceCents: -5 }),
      makeItem({ productId: 'c', priceCents: 10.5 }),
    ])
    expect(parseCart(raw)).toEqual([])
  })

  it('descarta promoPriceCents inválido, mas aceita null', () => {
    const raw = JSON.stringify([
      makeItem({ productId: 'a', promoPriceCents: 0 }),
      makeItem({ productId: 'b', promoPriceCents: 1.5 }),
      makeItem({ productId: 'c', promoPriceCents: 500 }),
      makeItem({ productId: 'd', promoPriceCents: null }),
    ])
    expect(parseCart(raw).map((i) => i.productId)).toEqual(['c', 'd'])
  })

  it('descarta itens com campos faltando', () => {
    const semTitle: Partial<CartItem> = makeItem({ productId: 'a' })
    delete semTitle.title
    const semImage: Partial<CartItem> = makeItem({ productId: 'b' })
    delete semImage.imageUrl
    const semPromo: Partial<CartItem> = makeItem({ productId: 'c' })
    delete semPromo.promoPriceCents
    const raw = JSON.stringify([
      semTitle,
      semImage,
      semPromo,
      makeItem({ productId: '' }),
    ])
    expect(parseCart(raw)).toEqual([])
  })

  it('descarta campos extras', () => {
    const raw = JSON.stringify([{ ...makeItem(), extra: 'x', admin: true }])
    const [item] = parseCart(raw)
    expect(item).toEqual(makeItem())
    expect(Object.keys(item as CartItem).sort()).toEqual(
      Object.keys(makeItem()).sort(),
    )
  })

  it('mantém o primeiro em productId duplicado', () => {
    const raw = JSON.stringify([
      makeItem({ title: 'Primeiro', quantity: 2 }),
      makeItem({ title: 'Segundo', quantity: 5 }),
    ])
    expect(parseCart(raw)).toEqual([
      makeItem({ title: 'Primeiro', quantity: 2 }),
    ])
  })
})

describe('addToCart', () => {
  it('acrescenta item novo', () => {
    const a = makeItem()
    const b = makeItem({ productId: 'p2' })
    expect(addToCart([a], b)).toEqual([a, b])
  })

  it('soma 1 à quantity de item existente', () => {
    const result = addToCart(
      [makeItem({ quantity: 2 })],
      makeItem({ quantity: 9 }),
    )
    expect(result).toEqual([makeItem({ quantity: 3 })])
  })
})

describe('removeFromCart', () => {
  it('remove só o item indicado', () => {
    const a = makeItem()
    const b = makeItem({ productId: 'p2' })
    expect(removeFromCart([a, b], 'p1')).toEqual([b])
  })
})

describe('increaseQuantity', () => {
  it('soma 1 só ao item indicado', () => {
    const a = makeItem()
    const b = makeItem({ productId: 'p2' })
    expect(increaseQuantity([a, b], 'p2')).toEqual([
      a,
      makeItem({ productId: 'p2', quantity: 2 }),
    ])
  })
})

describe('decreaseQuantity', () => {
  it('subtrai 1', () => {
    expect(
      decreaseQuantity([makeItem({ quantity: 3 })], 'p1')[0]?.quantity,
    ).toBe(2)
  })

  it('para em 1 e não remove o item', () => {
    const result = decreaseQuantity([makeItem({ quantity: 1 })], 'p1')
    expect(result).toHaveLength(1)
    expect(result[0]?.quantity).toBe(1)
  })
})

describe('cartTotalCents', () => {
  it('soma sem promoção', () => {
    expect(cartTotalCents([makeItem({ quantity: 2 })])).toBe(20000)
  })

  it('usa o preço promocional quando existe', () => {
    expect(
      cartTotalCents([
        makeItem({ promoPriceCents: 8000, quantity: 2 }),
        makeItem({ productId: 'p2', priceCents: 5000 }),
      ]),
    ).toBe(21000)
  })

  it('carrinho vazio soma 0', () => {
    expect(cartTotalCents([])).toBe(0)
  })
})

describe('cartItemCount', () => {
  it('soma as quantities', () => {
    expect(
      cartItemCount([
        makeItem({ quantity: 2 }),
        makeItem({ productId: 'p2', quantity: 3 }),
      ]),
    ).toBe(5)
  })

  it('vazio soma 0', () => {
    expect(cartItemCount([])).toBe(0)
  })
})

describe('canAddToCart', () => {
  it('permite sem tags impeditivas', () => {
    expect(canAddToCart([])).toBe(true)
    expect(canAddToCart(['NEW'])).toBe(true)
  })

  it('bloqueia MADE_TO_ORDER', () => {
    expect(canAddToCart(['MADE_TO_ORDER'])).toBe(false)
  })

  it('bloqueia SOLD_OUT', () => {
    expect(canAddToCart(['NEW', 'SOLD_OUT'])).toBe(false)
  })
})

describe('reconcileCart', () => {
  it('descarta item cujo produto não está no catálogo', () => {
    const result = reconcileCart([makeItem()], [])
    expect(result).toEqual({ items: [], changed: true })
  })

  it('descarta MADE_TO_ORDER', () => {
    const result = reconcileCart(
      [makeItem()],
      [makeProduct({ tags: ['MADE_TO_ORDER'] })],
    )
    expect(result).toEqual({ items: [], changed: true })
  })

  it('descarta SOLD_OUT', () => {
    const result = reconcileCart(
      [makeItem()],
      [makeProduct({ tags: ['SOLD_OUT'] })],
    )
    expect(result).toEqual({ items: [], changed: true })
  })

  it('atualiza preço, promoção, título e imagem preservando quantity', () => {
    const result = reconcileCart(
      [makeItem({ quantity: 4 })],
      [
        makeProduct({
          title: 'Novo título',
          priceCents: 12000,
          promoPriceCents: 9000,
          imageUrl: null,
        }),
      ],
    )
    expect(result.changed).toBe(true)
    expect(result.items).toEqual([
      makeItem({
        title: 'Novo título',
        priceCents: 12000,
        promoPriceCents: 9000,
        imageUrl: null,
        quantity: 4,
      }),
    ])
  })

  it('remove a promoção quando o catálogo não tem mais', () => {
    const result = reconcileCart(
      [makeItem({ promoPriceCents: 8000 })],
      [makeProduct({ promoPriceCents: null })],
    )
    expect(result.changed).toBe(true)
    expect(result.items[0]?.promoPriceCents).toBeNull()
  })

  it('devolve a mesma referência quando nada muda', () => {
    const items = [makeItem(), makeItem({ productId: 'p2', quantity: 2 })]
    const result = reconcileCart(items, [
      makeProduct(),
      makeProduct({ id: 'p2' }),
      makeProduct({ id: 'p3' }),
    ])
    expect(result.changed).toBe(false)
    expect(result.items).toBe(items)
  })

  it('carrinho vazio não muda', () => {
    const items: CartItem[] = []
    const result = reconcileCart(items, [makeProduct()])
    expect(result.changed).toBe(false)
    expect(result.items).toBe(items)
  })

  it('mantém os itens válidos ao descartar outros', () => {
    const result = reconcileCart(
      [makeItem(), makeItem({ productId: 'p2' })],
      [makeProduct()],
    )
    expect(result.changed).toBe(true)
    expect(result.items.map((i) => i.productId)).toEqual(['p1'])
  })
})
