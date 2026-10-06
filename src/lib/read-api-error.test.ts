import { describe, expect, it } from 'vitest'
import { readApiError } from './read-api-error'

describe('readApiError', () => {
  it('devolve o campo error do corpo JSON', async () => {
    const res = new Response(JSON.stringify({ error: 'Corpo inválido' }), {
      status: 400,
    })
    expect(await readApiError(res)).toBe('Corpo inválido')
  })

  it('devolve null para corpo que não é JSON, sem error ou com error vazio ou não texto', async () => {
    expect(await readApiError(new Response('<html>'))).toBeNull()
    expect(await readApiError(new Response('{}'))).toBeNull()
    expect(await readApiError(new Response('{"error":""}'))).toBeNull()
    expect(await readApiError(new Response('{"error":42}'))).toBeNull()
    expect(await readApiError(new Response('null'))).toBeNull()
  })
})
