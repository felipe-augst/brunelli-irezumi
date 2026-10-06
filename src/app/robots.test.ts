import robots from '@/app/robots'
import { SITE_URL } from '@/data/site'

describe('robots', () => {
  const result = robots()
  const rules = Array.isArray(result.rules) ? result.rules : [result.rules]

  it('bloqueia /admin e /api', () => {
    const disallow = rules.flatMap((rule) => rule.disallow ?? [])
    expect(disallow).toContain('/admin')
    expect(disallow).toContain('/api')
  })

  it('continua permitindo o restante do site', () => {
    const allow = rules.flatMap((rule) => rule.allow ?? [])
    expect(allow).toContain('/')
  })

  it('aponta o sitemap com www', () => {
    expect(result.sitemap).toBe(`${SITE_URL}/sitemap.xml`)
  })
})
