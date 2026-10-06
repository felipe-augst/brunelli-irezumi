import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { compressImage } from '@/lib/compress-image'
import { GalleryUploadForm } from './GalleryUploadForm'

const refresh = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}))

vi.mock('@/lib/compress-image', () => ({
  compressImage: vi.fn(async (file: File) => file),
}))

const fetchMock = vi.fn()

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body } as Response
}

function okResponse() {
  return jsonResponse({})
}

function uploadUrlResponse() {
  return jsonResponse({ uploadUrl: 'https://r2.test/signed', key: 'gallery/a' })
}

async function selectAndSend() {
  const user = userEvent.setup()
  const { container } = render(<GalleryUploadForm category="PORTFOLIO" />)
  const input = container.querySelector(
    'input[type="file"]',
  ) as HTMLInputElement
  await user.upload(input, new File(['x'], 'foto.png', { type: 'image/png' }))
  await user.click(screen.getByRole('button', { name: 'Enviar' }))
  return { user, input }
}

describe('GalleryUploadForm', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    refresh.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('envia o tamanho do arquivo comprimido ao pedir a URL de upload', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, false, 500))

    await selectAndSend()

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/admin/gallery/upload-url')
    expect(JSON.parse(init.body as string)).toEqual({
      contentType: 'image/webp',
      size: 1,
    })
  })

  it('interrompe o fluxo e avisa quando o upload-url responde não-OK', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, false, 500))

    await selectAndSend()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Falha ao preparar o envio da imagem',
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(refresh).not.toHaveBeenCalled()
  })

  it('avisa quando o PUT no R2 falha', async () => {
    fetchMock
      .mockResolvedValueOnce(uploadUrlResponse())
      .mockResolvedValueOnce(jsonResponse({}, false, 403))

    await selectAndSend()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Falha ao enviar a imagem',
    )
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(refresh).not.toHaveBeenCalled()
  })

  it('avisa quando o registro da imagem falha', async () => {
    fetchMock
      .mockResolvedValueOnce(uploadUrlResponse())
      .mockResolvedValueOnce(okResponse())
      .mockResolvedValueOnce(jsonResponse({}, false, 500))

    await selectAndSend()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Falha ao registrar a imagem',
    )
    expect(refresh).not.toHaveBeenCalled()
  })

  it('no sucesso atualiza a lista e não mostra aviso', async () => {
    fetchMock
      .mockResolvedValueOnce(uploadUrlResponse())
      .mockResolvedValueOnce(okResponse())
      .mockResolvedValueOnce(okResponse())

    await selectAndSend()

    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled()
  })

  it('avisa quando a compressão da imagem falha', async () => {
    vi.mocked(compressImage).mockRejectedValueOnce(new Error('canvas'))

    await selectAndSend()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Falha ao comprimir a imagem',
    )
    expect(fetchMock).not.toHaveBeenCalled()
    expect(refresh).not.toHaveBeenCalled()
  })

  it('avisa quando o fetch rejeita por erro de rede', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    await selectAndSend()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Falha ao preparar o envio da imagem',
    )
    expect(refresh).not.toHaveBeenCalled()
  })

  it('trata corpo inesperado do upload-url como falha na preparação', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ uploadUrl: 'https://r2.test' }),
    )

    await selectAndSend()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Falha ao preparar o envio da imagem',
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('limpa o aviso no próximo envio', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, false, 500))
    const { user } = await selectAndSend()
    expect(await screen.findByRole('alert')).toBeInTheDocument()

    fetchMock
      .mockResolvedValueOnce(uploadUrlResponse())
      .mockResolvedValueOnce(okResponse())
      .mockResolvedValueOnce(okResponse())
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
