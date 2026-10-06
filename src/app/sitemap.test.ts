import sitemap from '@/app/sitemap'
import { SERVICES } from '@/data/projects'
import { SITE_URL } from '@/data/site'

describe('sitemap', () => {
  const urls = sitemap().map((entry) => entry.url)

  it('lista a home, a loja e todos os serviços', () => {
    expect(urls).toContain(SITE_URL)
    expect(urls).toContain(`${SITE_URL}/loja`)
    SERVICES.forEach((service) => {
      expect(urls).toContain(`${SITE_URL}/servicos/${service.slug}`)
    })
  })

  it('todas as URLs usam o domínio canônico com www', () => {
    urls.forEach((url) => {
      expect(url.startsWith(SITE_URL)).toBe(true)
    })
  })

  it('não lista rotas do admin nem da API', () => {
    urls.forEach((url) => {
      expect(url).not.toContain('/admin')
      expect(url).not.toContain('/api')
    })
  })
})
