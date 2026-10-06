import { describe, expect, it } from 'vitest'
import nextConfig from '../../next.config'

describe('next.config headers', () => {
  it('envia a CSP em modo Report-Only em todas as rotas', async () => {
    const rules = (await nextConfig.headers?.()) ?? []
    const rule = rules.find((r) => r.source === '/:path*')
    const csp = rule?.headers.find(
      (h) => h.key === 'Content-Security-Policy-Report-Only',
    )

    expect(csp?.value).toContain("default-src 'self'")
    // Em teste NODE_ENV não é 'production', então vale a variante de dev.
    expect(csp?.value).toContain("'unsafe-eval'")
    expect(rule?.headers.some((h) => h.key === 'Content-Security-Policy')).toBe(
      false,
    )
  })
})
