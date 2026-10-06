// Uma sessão só vale se o token foi emitido a partir da última troca de senha.
// O iat do JWT tem resolução de segundos, então um token antigo emitido no mesmo
// segundo da troca ainda passa (janela de 1s, aceita).
export function isSessionValid(
  iat: number | undefined,
  passwordChangedAt: Date | null,
) {
  if (!passwordChangedAt) return true
  if (iat === undefined) return false
  return iat >= Math.floor(passwordChangedAt.getTime() / 1000)
}
