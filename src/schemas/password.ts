import { z } from 'zod'

export const MIN_PASSWORD_LENGTH = 12
// O bcrypt ignora tudo depois de 72 bytes
const MAX_PASSWORD_BYTES = 72

// Regras da senha nova, compartilhadas com o script de reset
export const newPasswordSchema = z
  .string()
  .min(
    MIN_PASSWORD_LENGTH,
    `A nova senha precisa ter ao menos ${MIN_PASSWORD_LENGTH} caracteres`,
  )
  .refine(
    (value) => new TextEncoder().encode(value).length <= MAX_PASSWORD_BYTES,
    'A nova senha é longa demais',
  )

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: newPasswordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'A nova senha precisa ser diferente da atual',
    path: ['newPassword'],
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'A confirmação não confere com a nova senha',
    path: ['confirmNewPassword'],
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
