import { describe, expect, it } from 'vitest'
import { buildCspReportOnly } from './csp'

function directive(policy: string, name: string) {
  return policy
    .split('; ')
    .find((part) => part === name || part.startsWith(`${name} `))
}

describe('buildCspReportOnly', () => {
  it('restringe a origem padrão ao próprio site', () => {
    expect(directive(buildCspReportOnly(false), 'default-src')).toBe(
      "default-src 'self'",
    )
  })

  it('libera as imagens do Google e do R2', () => {
    const img = directive(
      buildCspReportOnly(false, 'https://pub-abc.r2.dev/'),
      'img-src',
    )
    expect(img).toContain('https://lh3.googleusercontent.com')
    expect(img).toContain('https://pub-abc.r2.dev')
    expect(img).not.toContain('r2.dev/')
    expect(img).toContain('blob:')
  })

  it('omite o host do R2 quando R2_PUBLIC_URL n�o est� definida', () => {
    expect(directive(buildCspReportOnly(false), 'img-src')).not.toContain(
      'r2.dev',
    )
  })

  it('libera o PUT de upload para o R2 em connect-src', () => {
    expect(directive(buildCspReportOnly(false), 'connect-src')).toContain(
      'https://*.r2.cloudflarestorage.com',
    )
  })

  it('libera só o Google Maps em frame-src', () => {
    expect(directive(buildCspReportOnly(false), 'frame-src')).toBe(
      'frame-src https://www.google.com',
    )
  })

  it('bloqueia o site em frames de terceiros', () => {
    expect(directive(buildCspReportOnly(false), 'frame-ancestors')).toBe(
      "frame-ancestors 'none'",
    )
  })

  it('permite script inline em produção, mas não eval', () => {
    const script = directive(buildCspReportOnly(false), 'script-src')
    expect(script).toBe("script-src 'self' 'unsafe-inline'")
  })

  it("só permite 'unsafe-eval' em desenvolvimento", () => {
    expect(directive(buildCspReportOnly(true), 'script-src')).toContain(
      "'unsafe-eval'",
    )
    expect(buildCspReportOnly(false)).not.toContain('unsafe-eval')
  })
})
