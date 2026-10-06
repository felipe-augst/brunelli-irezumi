import { SERVICES } from '@/data/projects'

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
