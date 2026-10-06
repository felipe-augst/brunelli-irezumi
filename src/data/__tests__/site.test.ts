import { SITE_URL } from '@/data/site'

describe('SITE_URL', () => {
  it('usa o domínio canônico com www', () => {
    expect(SITE_URL).toBe('https://www.brunelli-irezumi.com.br')
  })

  it('não termina com barra', () => {
    expect(SITE_URL.endsWith('/')).toBe(false)
  })
})
