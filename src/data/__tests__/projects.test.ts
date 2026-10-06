import { SERVICES, WHATSAPP_URL } from '@/data/projects'

describe('SERVICES', () => {
  it('todos os serviços têm campos obrigatórios', () => {
    SERVICES.forEach((service) => {
      expect(service.id).toBeDefined()
      expect(service.slug).toBeTruthy()
      expect(service.title).toBeTruthy()
      expect(service.description).toBeTruthy()
      expect(service.image.src).toBeTruthy()
      expect(service.image.alt).toBeTruthy()
    })
  })

  it('slugs são únicos', () => {
    const slugs = SERVICES.map((s) => s.slug)
    const unique = new Set(slugs)
    expect(unique.size).toBe(slugs.length)
  })

  it('ids são únicos', () => {
    const ids = SERVICES.map((s) => s.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })
})

describe('WHATSAPP_URL', () => {
  it('é uma URL válida', () => {
    expect(() => new URL(WHATSAPP_URL)).not.toThrow()
  })

  it('aponta para wa.me', () => {
    const url = new URL(WHATSAPP_URL)
    expect(url.hostname).toBe('wa.me')
  })
})
