export type CartItem = {
  productId: string
  title: string
  priceCents: number
  promoPriceCents: number | null
  quantity: number
  imageUrl: string | null
}
