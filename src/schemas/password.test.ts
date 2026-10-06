import { describe, it, expect } from 'vitest'
import { changePasswordSchema } from './password'

const valid = {
  currentPassword: 'senha-atual-123',
  newPassword: 'uma-senha-nova-forte',
  confirmNewPassword: 'uma-senha-nova-forte',
}

describe('changePasswordSchema', () => {
  it('aceita dados válidos', () => {
    expect(changePasswordSchema.safeParse(valid).success).toBe(true)
  })

  it('exige a senha atual', () => {
    const result = changePasswordSchema.safeParse({
      ...valid,
      currentPassword: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita senha nova com menos de 12 caracteres', () => {
    const short = 'curta-demais'.slice(0, 11)
    const result = changePasswordSchema.safeParse({
      ...valid,
      newPassword: short,
      confirmNewPassword: short,
    })
    expect(result.success).toBe(false)
  })

  it('aceita senha nova com exatamente 12 caracteres', () => {
    const twelve = 'a'.repeat(12)
    const result = changePasswordSchema.safeParse({
      ...valid,
      newPassword: twelve,
      confirmNewPassword: twelve,
    })
    expect(result.success).toBe(true)
  })

  it('rejeita senha nova com mais de 72 bytes (limite do bcrypt)', () => {
    const long = 'a'.repeat(73)
    const result = changePasswordSchema.safeParse({
      ...valid,
      newPassword: long,
      confirmNewPassword: long,
    })
    expect(result.success).toBe(false)
  })

  it('conta bytes, não caracteres, no limite de 72', () => {
    // 40 caracteres de 2 bytes = 80 bytes
    const multibyte = 'é'.repeat(40)
    const result = changePasswordSchema.safeParse({
      ...valid,
      newPassword: multibyte,
      confirmNewPassword: multibyte,
    })
    expect(result.success).toBe(false)
  })

  it('rejeita senha nova igual à atual', () => {
    const same = 'mesma-senha-12345'
    const result = changePasswordSchema.safeParse({
      currentPassword: same,
      newPassword: same,
      confirmNewPassword: same,
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues.some((i) => i.path[0] === 'newPassword')).toBe(
      true,
    )
  })

  it('rejeita confirmação diferente da senha nova', () => {
    const result = changePasswordSchema.safeParse({
      ...valid,
      confirmNewPassword: 'outra-senha-qualquer',
    })
    expect(result.success).toBe(false)
    expect(
      result.error?.issues.some((i) => i.path[0] === 'confirmNewPassword'),
    ).toBe(true)
  })
})
