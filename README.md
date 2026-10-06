# Brunelli Irezumi

Site de um estúdio de tatuagem japonesa em Jundiaí-SP, com painel administrativo e loja. O estúdio atualiza portfólio, pinturas, coberturas e produtos sozinho, pelo celular.

- **Site público:** home, páginas de serviço com galerias dinâmicas e loja com carrinho. O checkout é uma mensagem formatada aberta no WhatsApp.
- **Painel admin (`/admin`):** login, gerenciamento das galerias (portfólio, pintura e cobertura) e dos produtos, com upload de imagens.
- **Domínio:** `https://www.brunelli-irezumi.com.br`

> As convenções detalhadas do projeto estão em [`CLAUDE.md`](CLAUDE.md), que é a fonte de verdade. Se o código e esse arquivo divergirem, avise em vez de escolher um dos dois em silêncio.

## Stack

- **Next.js 16** (App Router, Turbopack), **React 19**, **TypeScript** strict
- **Tailwind CSS v4**, com tokens em `globals.css`
- **Prisma 7** + **PostgreSQL** (Neon), via driver adapter `PrismaPg`
- **Cloudflare R2** para imagens (SDK S3, URLs assinadas)
- **jose** (JWT) e **bcryptjs** para a autenticação do admin
- **Zod** e **React Hook Form** para validação e formulários
- **Framer Motion** (animações de scroll) e **Lucide React** (ícones)
- **next/font** (Epilogue + Manrope) e **next/image**

## Arquitetura

```
src/
├── app/
│   ├── layout.tsx            # Root: fontes, metadata, JSON-LD, CartProvider
│   ├── page.tsx              # Home (busca o portfólio no banco)
│   ├── loja/                 # Vitrine pública
│   ├── servicos/[slug]/      # Páginas de serviço (galerias do banco)
│   ├── admin/
│   │   ├── login/            # Fora do grupo (panel): sem layout do painel
│   │   └── (panel)/          # Rotas protegidas: gallery/[category], products
│   ├── api/
│   │   ├── auth/             # login, logout
│   │   └── admin/            # gallery, products (todas exigem admin)
│   └── sitemap.ts · robots.ts · globals.css
├── proxy.ts                  # Antigo middleware (renomeado no Next 16)
├── components/               # layout, sections, ui, shop, admin
├── contexts/ · hooks/        # CartContext, useCart
├── data/                     # Textos, URLs, labels (sem UI)
├── lib/                      # prisma, r2, auth, gallery, products, cart, whatsapp...
├── server/                   # Lógica pura e testável
├── schemas/                  # Zod
├── types/ · actions/
└── generated/prisma/         # Client gerado (não versionado)
prisma/                       # schema.prisma, migrations, seed.ts
prisma.config.ts              # URL do banco para o CLI (Prisma 7)
scripts/                      # admin-reset-password.ts, setup-worktree.sh
public/images/                # Imagens estáticas do site, em .webp
.github/workflows/main.yml    # Pipeline de CI
```

### Upload de imagens

1. O navegador converte a imagem para WebP (máx. 2000px, qualidade 0.85).
2. `POST …/upload-url` devolve uma URL assinada (5 min) e a `key`. Só aceita `image/webp` e `key`s com prefixo `gallery/` ou `products/`.
3. `PUT` direto no R2 com a URL assinada: o arquivo não passa pelo servidor.
4. `POST` registra a imagem no banco com a `key`.

Produto nasce com `active: false` e só é ativado depois de todas as imagens subirem. Se algo falhar na criação, o produto é apagado.

### Cache

As páginas públicas leem o banco por `lib/gallery.ts` e `lib/products.ts`, com `unstable_cache` e as tags `gallery` e `products`. As rotas do admin que alteram dados chamam `revalidateTag(tag, { expire: 0 })`.

### Segurança do admin

Toda rota em `/api/admin/*` tem duas camadas: o `proxy.ts` e o `requireAdmin()` no início de cada handler. Páginas do painel que leem dados chamam `requireAdminPage()`. A sessão é um JWT em cookie `httpOnly`, com validade de 7 dias.

## Instalação

Requer Node.js 20+ e um banco PostgreSQL.

```bash
npm ci                  # também roda `prisma generate` (postinstall)
cp .env.example .env    # preencha as variáveis (ver abaixo)
npx prisma migrate dev  # aplica as migrations
npx prisma db seed      # cria o admin inicial
npm run dev
```

Acesse em `http://localhost:3000`. O painel fica em `/admin`.

O seed não sobrescreve a senha de um admin que já existe.

### Redefinir a senha do admin

```bash
npm run admin:reset-password
```

O script pede o e-mail do admin e a nova senha (sem eco no terminal, exige TTY). Ele roda contra o banco apontado por `DATABASE_URL`, inclusive o de produção: mostra o host (sem credenciais) e pede confirmação antes de gravar. Também zera as tentativas de login e o bloqueio da conta. Nunca imprime senha nem hash.

## Variáveis de ambiente

Modelo em `.env.example`. Nunca commite valores reais. O mesmo conjunto precisa existir na Vercel.

| Variável               | Uso                                                  |
| ---------------------- | ---------------------------------------------------- |
| `DATABASE_URL`         | Conexão PostgreSQL (Neon), com `sslmode=verify-full` |
| `JWT_SECRET`           | Assinatura do JWT de sessão                          |
| `R2_ACCOUNT_ID`        | Conta da Cloudflare                                  |
| `R2_ACCESS_KEY_ID`     | Credencial de acesso ao R2                           |
| `R2_SECRET_ACCESS_KEY` | Credencial de acesso ao R2                           |
| `R2_BUCKET_NAME`       | Bucket das imagens                                   |
| `R2_PUBLIC_URL`        | URL pública do bucket (`r2.dev`)                     |
| `ADMIN_EMAIL`          | E-mail do admin criado no seed                       |
| `ADMIN_PASSWORD`       | Senha do admin criado no seed (usada só pelo seed)   |

Todas são variáveis de servidor: nenhuma usa `NEXT_PUBLIC_`.

## Scripts

```bash
npm run dev                   # Desenvolvimento
npm run build                 # Build de produção
npm run start                 # Serve o build
npm run lint                  # ESLint
npm run lint:fix              # ESLint com correção
npm run format                # Prettier (escreve)
npm run format:check          # Prettier (checa; usado no CI)
npm run typecheck             # TypeScript sem emitir arquivos
npm run test                  # Vitest em modo watch
npm run test:run              # Vitest uma vez (usado no CI)
npm run admin:reset-password  # Redefine a senha do admin
npx prisma generate           # Regenera o client
npx prisma migrate dev        # Cria e aplica migration
npx prisma db seed            # Cria o admin inicial
npx prisma studio             # Inspeção visual do banco
```

## Customização de conteúdo

Textos, URLs, contatos e dados do estúdio ficam em `src/data/`, não nos componentes. Para alterar WhatsApp, endereço ou serviços, edite os arquivos dessa pasta (por exemplo `src/data/projects.ts`). Portfólio, pinturas, coberturas e produtos são gerenciados pelo painel admin.

## Qualidade

- **Vitest + Testing Library:** dois projetos, `web` (jsdom) e `server` (node, para rotas da API e proxy)
- **Prettier** e **ESLint**
- **Husky + lint-staged:** validação no pre-commit
- **commitlint:** Conventional Commits obrigatórios
- **GitHub Actions** (`.github/workflows/main.yml`): format:check → lint → typecheck → test → build, em push e PR para `main` e `develop`

## Conventional Commits

Commits seguem `tipo(scope): descrição`, com escopo obrigatório. Escopos permitidos (os mesmos de `commitlint.config.ts`):

`hero` · `services` · `about` · `gallery` · `location` · `header` · `footer` · `nav` · `cta` · `ui` · `data` · `types` · `lib` · `seo` · `config` · `ci` · `tests` · `deps` · `db` · `auth` · `admin` · `shop` · `cart` · `storage` · `api`

Fluxo: branch a partir de `develop` (`feat/`, `fix/`, `refactor/`, `chore/`, `test/`, `docs/`), PR para `develop` com squash e CI verde. A `main` só recebe `develop` em release, com tag. O título do PR também segue Conventional Commits.

## Decisões conscientes

- **Sem recuperação de senha por e-mail:** admin único. A troca de senha é feita dentro do painel e o reset por script (`npm run admin:reset-password`).
- **Sem gateway de pagamento, sem pedido persistido, sem controle de estoque:** o checkout é uma mensagem aberta no WhatsApp, e o estúdio confere o pedido antes de qualquer pagamento. `ESGOTADO` é uma tag manual.
- **API em Route Handlers do Next:** não há servidor separado (Express ou similar).
- **Admin único, sem papéis.** A conta é bloqueada após tentativas de login erradas; não há rate limit por IP.
- **JWT de 7 dias sem revogação,** exceto na troca de senha: tokens emitidos antes dela são rejeitados.
- **Imagens públicas pelo domínio `r2.dev`:** domínio próprio exigiria mover o DNS inteiro para a Cloudflare.
- **CORS do R2 sem previews da Vercel:** só `localhost:3000` e os domínios de produção.

## SEO

- Metadata com `title.template`, `openGraph` e `twitter` card
- JSON-LD Schema.org `TattooParlor`
- Sitemap e robots dinâmicos via `sitemap.ts` e `robots.ts`
- Google Search Console verificado
- Domínio canônico: `https://www.brunelli-irezumi.com.br`

## Deploy

Vercel, com deploy automático a cada merge na `main`. Em produção, o painel precisa das mesmas variáveis de ambiente configuradas na Vercel e de um admin criado pelo seed (`npx prisma db seed`).
