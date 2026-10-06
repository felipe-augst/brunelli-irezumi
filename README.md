# Brunelli Irezumi

Site institucional para estúdio de tatuagem japonesa em Jundiaí-SP.

## Stack

- **Next.js 16** (App Router)
- **TypeScript** (strict)
- **Tailwind CSS v4**
- **Framer Motion** — animações de scroll
- **Lucide React** — ícones pontuais
- **next/font** — Epilogue + Manrope otimizadas
- **next/image** — lazy load, WebP e responsividade automáticos

## Qualidade

- **Vitest + Testing Library** — testes unitários e de integração
- **Prettier** — formatação automática
- **ESLint** — análise estática
- **Husky + lint-staged** — validação no pre-commit
- **commitlint** — Conventional Commits obrigatórios
- **GitHub Actions CI** — format:check → lint → typecheck → test → build

## Lighthouse

97 Performance · 100 Acessibilidade · 100 Best Practices · 100 SEO

## Estrutura

```
brunelli-irezumi/
├── .github/
│ └── workflows/
│ └── ci.yml # Pipeline CI
├── src/
│ ├── app/
│ │ ├── layout.tsx # Root layout: fontes, metadata, JSON-LD
│ │ ├── page.tsx # Home (composição das sections)
│ │ ├── globals.css # Tailwind + @theme tokens
│ │ ├── sitemap.ts # Sitemap dinâmico
│ │ ├── robots.ts # Robots dinâmico
│ │ └── servicos/
│ │ └── [slug]/
│ │ └── page.tsx # Página de serviço com galeria e lightbox
│ ├── components/
│ │ ├── layout/ # Header, Footer, MobileNav, Skeleton
│ │ ├── sections/ # Uma section por arquivo
│ │ └── ui/ # GalleryGrid, Lightbox, WhatsAppButton, RevealOnScroll
│ ├── data/
│ │ └── projects.ts # Todos os dados estáticos (textos, URLs, imagens)
│ ├── lib/
│ │ └── utils.ts # cn() — clsx + tailwind-merge
│ ├── types/
│ │ └── index.ts # Tipos TypeScript do projeto
│ └── actions/
│ └── skeleton.ts # Server Action — controle do skeleton inicial
└── public/
└── images/ # Imagens locais em .webp

```

## Instalação

```bash
npm install
npm run dev
```

Acesse em `http://localhost:3000`.

## Scripts

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Serve o build
npm run lint         # ESLint
npm run format       # Prettier
npm run format:check # Verifica formatação (usado no CI)
npm run typecheck    # TypeScript sem emitir arquivos
npm run test         # Vitest em modo watch
npm run test:run     # Vitest single run (usado no CI)
```

## Conventional Commits

Commits seguem o padrão `tipo(scope): descrição`. Scopes permitidos:
`hero` · `services` · `about` · `gallery` · `location` · `header` · `footer` · `nav` · `ui` · `data` · `types` · `lib` · `seo` · `config` · `ci` · `tests` · `deps`

## Customização de conteúdo

Todos os textos, URLs e imagens ficam em `src/data/projects.ts`. Para alterar WhatsApp, endereço, galeria ou serviços, edite apenas esse arquivo.

## SEO

- Metadata com `title.template`, `openGraph` e `twitter` card
- JSON-LD Schema.org `TattooParlor`
- Sitemap e robots dinâmicos via `sitemap.ts` e `robots.ts`
- Google Search Console verificado
- Domínio: `https://www.brunelli-irezumi.com.br`

## Deploy

Vercel com deploy automático a cada merge na `main`.
