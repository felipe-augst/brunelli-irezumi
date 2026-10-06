import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ProductForm } from '../ProductForm'

const refresh = vi.fn()

vi.mock('@/lib/compress-image', () => ({
  compressImage: vi.fn(async () => new Blob(['x'], { type: 'image/webp' })),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}))

const existingProduct = {
  id: 'p1',
  title: 'Tenugui Carpa',
  description: 'Tenugui de algodão',
  priceCents: 5000,
  promoPriceCents: null,
  category: 'TENUGUI' as const,
  tags: [] as ('MADE_TO_ORDER' | 'LIMITED' | 'SOLD_OUT' | 'ON_SALE')[],
}

function jsonResponse(body: unknown, status: number) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  )
}

async function fillNewProduct(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Título'), 'Tenugui Carpa')
  await user.type(screen.getByLabelText('Descrição'), 'Tenugui de algodão')
  await user.type(screen.getByLabelText(/^Preço \(/), '5000')
  await user.selectOptions(screen.getByLabelText('Categoria'), 'TENUGUI')
}

describe('ProductForm', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    fetchMock.mockReset()
    refresh.mockReset()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('mostra a mensagem tratada junto das tags quando há promoção sem a tag', async () => {
    const user = userEvent.setup()
    render(<ProductForm product={existingProduct} />)

    await user.type(screen.getByLabelText(/Preço promocional/), '4000')
    await user.click(screen.getByRole('button', { name: 'Atualizar produto' }))

    expect(
      await screen.findByText(
        'Marque a tag Promoção ao definir um preço promocional',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText(/Invalid input/)).not.toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('na criação, sem nenhuma tag marcada, mostra a mensagem tratada (e não a do Zod)', async () => {
    const user = userEvent.setup()
    render(<ProductForm />)
    await fillNewProduct(user)

    await user.type(screen.getByLabelText(/Preço promocional/), '4000')
    await user.click(screen.getByRole('button', { name: 'Criar produto' }))

    expect(
      await screen.findByText(
        'Marque a tag Promoção ao definir um preço promocional',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText(/Invalid input/)).not.toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('mostra mensagem tratada quando a tag Promoção não tem preço promocional', async () => {
    const user = userEvent.setup()
    render(<ProductForm product={existingProduct} />)

    await user.click(screen.getByLabelText('Promoção'))
    await user.click(screen.getByRole('button', { name: 'Atualizar produto' }))

    expect(
      await screen.findByText('A tag Promoção exige um preço promocional'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/Invalid input/)).not.toBeInTheDocument()
  })

  it('envia tags sempre como lista, com 0, 1 ou várias tags', async () => {
    const user = userEvent.setup()
    fetchMock.mockImplementation(() => jsonResponse({ id: 'p1' }, 200))
    render(<ProductForm product={existingProduct} />)
    const submit = () =>
      user.click(screen.getByRole('button', { name: 'Atualizar produto' }))
    const sentTags = () =>
      JSON.parse(fetchMock.mock.lastCall?.[1].body as string).tags

    await submit()
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    expect(sentTags()).toEqual([])

    await user.click(screen.getByLabelText('Edição limitada'))
    await submit()
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(sentTags()).toEqual(['LIMITED'])

    await user.click(screen.getByLabelText('Esgotado'))
    await submit()
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3))
    expect(sentTags()).toEqual(['LIMITED', 'SOLD_OUT'])
  })

  it('exibe a mensagem em pt-BR da API no 400 e mantém o formulário preenchido', async () => {
    const user = userEvent.setup()
    fetchMock.mockImplementation(() =>
      jsonResponse({ error: 'Dados do produto inválidos' }, 400),
    )
    render(<ProductForm product={existingProduct} />)

    await user.click(screen.getByRole('button', { name: 'Atualizar produto' }))

    expect(
      await screen.findByText('Dados do produto inválidos'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/\(400\)/)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Título')).toHaveValue('Tenugui Carpa')
  })

  it('usa a mensagem de falha da etapa quando o 400 não traz corpo legível', async () => {
    const user = userEvent.setup()
    fetchMock.mockImplementation(() =>
      Promise.resolve(new Response('<html>', { status: 400 })),
    )
    render(<ProductForm product={existingProduct} />)

    await user.click(screen.getByRole('button', { name: 'Atualizar produto' }))

    expect(
      await screen.findByText('Falha ao atualizar o produto'),
    ).toBeInTheDocument()
  })

  it('na criação, mostra a mensagem da API no 400 da ativação e desfaz o produto', async () => {
    const user = userEvent.setup()
    fetchMock.mockImplementation((url: string, init?: RequestInit) => {
      if (url === '/api/admin/products')
        return jsonResponse({ id: 'new1' }, 201)
      if (url.endsWith('/upload-url')) {
        return jsonResponse({ uploadUrl: 'https://r2.test/put', key: 'k' }, 200)
      }
      if (url === 'https://r2.test/put') return jsonResponse({}, 200)
      if (url.endsWith('/images')) return jsonResponse({}, 201)
      if (init?.method === 'PATCH') {
        return jsonResponse({ error: 'Preço é obrigatório' }, 400)
      }
      return jsonResponse({}, 200)
    })
    render(<ProductForm />)
    await fillNewProduct(user)
    await user.upload(
      screen.getByLabelText('Imagens'),
      new File(['x'], 'a.png', { type: 'image/png' }),
    )

    await user.click(screen.getByRole('button', { name: 'Criar produto' }))

    expect(await screen.findByText('Preço é obrigatório')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/products/new1', {
      method: 'DELETE',
    })
  })
})
