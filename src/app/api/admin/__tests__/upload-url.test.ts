import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MAX_UPLOAD_BYTES } from '@/schemas/upload'

const { getUploadUrl, requireAdmin } = vi.hoisted(() => ({
  getUploadUrl: vi.fn(),
  requireAdmin: vi.fn(),
}))

vi.mock('@/lib/r2', () => ({ getUploadUrl }))
vi.mock('@/lib/require-admin', () => ({ requireAdmin }))

type Handler = (request: Request) => Promise<Response>

const routes = [
  {
    name: 'gallery',
    prefix: 'gallery/',
    load: () => import('../gallery/upload-url/route'),
  },
  {
    name: 'products',
    prefix: 'products/',
    load: () => import('../products/upload-url/route'),
  },
]

function post(handler: Handler, body: unknown) {
  return handler(
    new Request('http://localhost/api/admin/x/upload-url', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  )
}

beforeEach(() => {
  getUploadUrl.mockReset()
  getUploadUrl.mockResolvedValue('https://r2.test/signed')
  requireAdmin.mockReset()
  requireAdmin.mockResolvedValue({ id: 'admin' })
})

describe.each(routes)('upload-url de $name: tamanho', ({ prefix, load }) => {
  it('assina com o tamanho informado e devolve a key com o prefixo', async () => {
    const { POST } = await load()

    const res = await post(POST, { contentType: 'image/webp', size: 350_000 })

    expect(res.status).toBe(200)
    const body = (await res.json()) as { uploadUrl: string; key: string }
    expect(body.uploadUrl).toBe('https://r2.test/signed')
    expect(body.key.startsWith(prefix)).toBe(true)
    expect(getUploadUrl).toHaveBeenCalledWith(body.key, 'image/webp', 350_000)
  })

  it.each([
    ['ausente', undefined],
    ['texto', '1000'],
    ['zero', 0],
    ['negativo', -1],
    ['decimal', 10.5],
    ['acima do teto', MAX_UPLOAD_BYTES + 1],
  ])('responde 400 sem assinar quando o tamanho é %s', async (_label, size) => {
    const { POST } = await load()

    const res = await post(POST, { contentType: 'image/webp', size })

    expect(res.status).toBe(400)
    expect(getUploadUrl).not.toHaveBeenCalled()
  })
})
