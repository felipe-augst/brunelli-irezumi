import { metadata } from '@/app/loja/page'
import { SITE_URL } from '@/data/site'

vi.mock('@/lib/products', () => ({ getProducts: vi.fn() }))

describe('metadata da loja', () => {
  it('define título, descrição e canonical', () => {
    expect(metadata.title).toBe('Loja')
    expect(metadata.description).toBeTruthy()
    expect(metadata.alternates?.canonical).toBe('/loja')
  })

  it('openGraph aponta para a loja com www e mantém imagem e site', () => {
    const og = metadata.openGraph
    expect(og?.url).toBe(`${SITE_URL}/loja`)
    expect(og?.siteName).toBe('Brunelli Irezumi')
    expect(og?.images).toBeDefined()
  })
})
