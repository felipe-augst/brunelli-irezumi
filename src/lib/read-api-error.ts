// Lê o `error` (pt-BR e genérico) de uma resposta de erro da API. Devolve null
// quando o corpo não é JSON ou não tem o campo; o chamador decide o fallback.
export async function readApiError(res: Response): Promise<string | null> {
  try {
    const body: unknown = await res.json()
    if (
      typeof body === 'object' &&
      body !== null &&
      'error' in body &&
      typeof body.error === 'string' &&
      body.error
    ) {
      return body.error
    }
  } catch {
    // corpo não é JSON
  }
  return null
}
