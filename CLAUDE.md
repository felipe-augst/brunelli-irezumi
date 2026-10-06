/

Claude · MD

# CLAUDE.md — Brunelli Irezumi

Contexto do projeto para uso com Claude Code e GitHub Copilot. Este arquivo é a fonte de verdade das convenções: se o código e este arquivo divergirem, avise em vez de escolher um dos dois em silêncio.

---

## Sobre o projeto

Site de um estúdio de tatuagem japonesa em Jundiaí-SP, com painel administrativo e loja. O cliente atualiza portfólio, pinturas, coberturas e produtos sozinho, pelo celular.

- **v1 (em produção):** site institucional estático.
- **v2 (em `develop`):** fullstack. Painel admin, galerias dinâmicas, loja e carrinho com checkout via WhatsApp.
  **Stack:** Next.js 16 (App Router, Turbopack) · React · TypeScript strict · Tailwind CSS v4 · Prisma 7 + PostgreSQL (Neon) · Cloudflare R2 · jose (JWT) · bcryptjs · Zod · React Hook Form · Vitest + Testing Library.

**Domínio canônico:** `https://www.brunelli-irezumi.com.br` (com `www`).

---

## Estrutura de pastas

```
src/
├── app/
│   ├── layout.tsx                 # Root: fontes, metadata, JSON-LD, CartProvider
│   ├── page.tsx                   # Home (async; busca o portfólio no banco)
│   ├── loja/page.tsx              # Vitrine pública
│   ├── servicos/[slug]/page.tsx   # Páginas de serviço (galerias do banco)
│   ├── admin/
│   │   ├── login/page.tsx         # Fora do grupo (panel): sem layout do painel
│   │   └── (panel)/               # Rotas protegidas, com layout do painel
│   │       ├── page.tsx
│   │       ├── gallery/[category]/page.tsx   # portfolio | painting | coverup
│   │       └── products/ (+ [id]/edit)
│   ├── api/
│   │   ├── auth/ (login, logout)
│   │   └── admin/ (gallery, products)        # Todas exigem admin
│   ├── sitemap.ts · robots.ts · globals.css
├── proxy.ts                       # Antigo middleware (renomeado no Next 16)
├── components/
│   ├── layout/ · sections/ · ui/  # Site público
│   ├── shop/                      # ProductGrid, ProductCard, CategoryFilter, Cart*
│   └── admin/ (auth, gallery, products, layout)
├── contexts/                      # CartContext
├── hooks/                         # useCart
├── data/                          # projects.ts, product-labels.ts (dados e labels, sem UI)
├── lib/                           # prisma, r2, auth (JWT), require-admin, gallery, products,
│                                  # format-currency, compress-image, cart-storage, parse-json-body
├── server/                        # Lógica pura e testável (ex.: isAccountLocked)
├── schemas/                       # Zod (login, gallery, product)
├── types/
├── actions/                       # Server Actions
└── generated/prisma/              # Client gerado (NÃO versionado)
prisma/                            # schema.prisma, migrations, seed.ts
prisma.config.ts                   # URL do banco para o CLI (Prisma 7)
public/images/                     # Imagens estáticas do site, em .webp
```

Regra de organização: `ui/` = reutilizável e genérico; `sections/` = composição específica do projeto; `data/` e `types/` nunca importam de React nem de libs de UI (ícones e imagens são referenciados por identificador e resolvidos no componente).

---

## Convenções de código

### TypeScript

- `strict`, `noUncheckedIndexedAccess`, sem `any` (usar `unknown` + narrowing), sem `enum` (usar `as const` ou union).
- **`type` sempre, nunca `interface`.** `import type` quando o import só aparece em posição de tipo.
- Tipos que derivam de schema Zod usam `z.infer` / `z.input` (formulários com `.default()` usam `z.input`). Nunca reescrever o tipo à mão em paralelo ao schema.
- Props de componente sempre tipadas com `type`.

### Componentes

- **Server Component por padrão.** `'use client'` só com estado, evento ou API do navegador. Se só uma parte é interativa, extrair essa parte como Client e manter o pai como Server.
- Named export em componentes. Exceções obrigatórias do Next: `page`, `layout`, `route`, `error`, `not-found` e `proxy`.
- Um componente por arquivo. Componente grande demais deve ser dividido.
- Aceitar `className?: string` em primitivos de UI e usar `cn()` (`clsx` + `tailwind-merge`) para classes condicionais.
- Dados do site (textos, URLs, contatos) ficam em `src/data/`, não hardcoded no componente. Labels de enum (`CATEGORY_LABELS`, `TAG_LABELS`) vivem só em `data/product-labels.ts`.

### Idioma

- Identificadores (variáveis, funções, tipos, rotas, pastas): **inglês**.
- Texto visível ao usuário e mensagens de erro de API: **pt-BR**.
- Comentários: pt-BR.

### Arquivos e nomes

- Componentes `.tsx` em PascalCase; demais arquivos em kebab-case; constantes de dados em UPPER_SNAKE_CASE.

---

## Tailwind v4

- Tokens definidos em `globals.css` via `@theme inline`. Usar sempre os tokens, nunca hex ou cores nativas do Tailwind (ex.: `orange-500`).
- Sintaxe v4 é a correta neste projeto: `bg-linear-to-t`, `aspect-3/4`, `min-h-dvh`. Não use `bg-gradient-to-*`, `aspect-[3/4]` nem `min-h-screen`.
- **Mobile-first:** estilo base para mobile, `md:`/`lg:` para ampliar.
- Fontes: `font-headline` (Epilogue: títulos, labels, botões) e `font-body` (Manrope). Carregadas via `next/font/google`, nunca por `@import` de CSS.
  | Token | Uso |
  |---|---|
  | `bg-surface` | Fundo padrão (`#131313`). Substitui o antigo `background` |
  | `bg-surface-container(-low/-high)` | Superfícies elevadas, cards |
  | `text-on-surface` / `text-on-surface-variant` | Texto primário / secundário |
  | `border-outline-variant` | Bordas discretas |
  | `text-accent` / `bg-accent` | Laranja de destaque (`#f97316`) |
  | `bg-secondary-container` | Vinho: ações destrutivas, erros |
  | `text-secondary` | Rosa: hover e links |

**Duas linguagens visuais:** o site público é editorial (bold, `uppercase`, `tracking-widest`, `font-headline`). O painel admin é compacto e utilitário (texto pequeno, `rounded-sm`, fonte discreta).

---

## Imagens

- Sempre `next/image`, nunca `<img>`. Em container com `relative` e proporção definida (`aspect-*`): `fill` + `sizes` correto.
- O `quality` usado precisa estar em `images.qualities` do `next.config.ts` (hoje `[75, 85, 90, 95]`).
- Hosts remotos liberados em `images.remotePatterns` (R2 e `lh3.googleusercontent.com`).
- `priority` apenas no elemento principal acima da dobra.
- `alt` descritivo; `alt=""` só em imagem decorativa. Botão só com ícone exige `aria-label`.
- Uploads do admin são convertidos para WebP no navegador (`compress-image.ts`, máx. 2000px, qualidade 0.85) antes de ir ao R2.

---

## Banco de dados (Prisma 7)

Modelos: `AdminUser`, `Product`, `ProductImage` (1:N com cascade), `GalleryImage`. Enums: `ProductCategory`, `ProductTag`, `GalleryCategory` (valores em inglês; tradução para pt-BR só na renderização).

Modelagem que deve ser preservada:

- Preço em **centavos (`Int`)**, nunca `Float`. Formatar só na exibição com `formatCentsToBRL`.
- Promoção = `promoPriceCents` preenchido. Não existe booleano `isOnSale`. A tag `ON_SALE` é só o selo, e o servidor rejeita (`getPricingError`) promoção sem a tag e a tag sem promoção.
- `priceCents` é `Int?`: só produto `MADE_TO_ORDER` pode ficar sem preço (e não pode ter promoção).
- Esconder produto com `active: false`, não apagar.
- `order` de imagens: galeria começa em **1**, imagens de produto começam em **0**. Reordenação troca ou desloca valores dentro de `$transaction`.
  Particularidades do Prisma 7 que já causaram erro:
- O `datasource` no `schema.prisma` **não** tem `url`; a URL fica em `prisma.config.ts`.
- Generator `prisma-client` com `output = "../src/generated/prisma"`. Importar de `@/generated/prisma/client`, nunca de `@prisma/client`.
- O client exige driver adapter (`PrismaPg`). O singleton está em `src/lib/prisma.ts`.
- Rodar `npx prisma generate` após qualquer mudança no schema (também roda no `postinstall`). Client desatualizado gera erros de tipo enganosos.
- Campo de lista escalar (`tags`) usa `{ set: [...] }` no create e update.
- Seed: `npx prisma db seed` (usa `tsx`). Não sobrescreve a senha de um admin existente.

---

## Segurança (regras não negociáveis)

- **Toda rota em `/api/admin/*` tem duas camadas:** o `proxy.ts` (matcher cobre `/admin/*` e `/api/admin/*`; API sem sessão responde 401 em JSON) **e** `requireAdmin()` chamado no início de cada handler. O proxy nunca é a única barreira.
- Ordem padrão de um handler: `requireAdmin()` → `parseJsonBody()` (400 se inválido) → validação Zod com `safeParse` (400 se falhar) → `try/catch` com a lógica.
- Respostas de erro são genéricas. O detalhe vai para `console.error` no servidor. Nunca devolver stack trace nem `error.message` ao cliente.
- Login: sempre 401 para qualquer falha (usuário inexistente, bloqueio, senha errada); roda bcrypt mesmo quando o usuário não existe (hash fictício) para igualar o tempo de resposta.
- Cookie de sessão: `httpOnly`, `sameSite: 'lax'`, `secure` em produção. JWT só com `sub`.
- Segredos são variáveis de ambiente do servidor. Nunca usar `NEXT_PUBLIC_` para segredo.
- Upload: `upload-url` aceita só `image/webp`; as `key`s devem ter prefixo validado (`gallery/` ou `products/`). Rotas de sub-recurso confirmam que o recurso pertence ao pai (ex.: `image.productId === id`).
- Lógica de negócio que precisa de teste fica em `src/server/` ou `src/lib/` **sem** importar `server-only` (esse import quebra o Vitest). Por isso `requireAdmin` mora em `lib/require-admin.ts` e não em `server/auth.ts`.
- O Vitest tem dois projetos (`vitest.config.ts`): `web` (jsdom, `vitest.setup.tsx`) e `server` (node, `vitest.setup.server.ts`), que cobre `src/app/api/**/*.test.ts` e `src/proxy.test.ts`. Só o `server` stuba `server-only` e define `JWT_SECRET` de teste: teste de rota ou de proxy vai nesses caminhos.

---

## Cache e revalidação

- Páginas públicas leem do banco por `lib/gallery.ts` e `lib/products.ts`, com `unstable_cache` e tags `gallery` / `products`.
- A chave do cache **deve incluir os parâmetros** da função (ex.: `['gallery-images', category]`). Chave fixa mistura resultados.
- Rotas do admin que alteram dados chamam `revalidateTag(tag, { expire: 0 })`. No Next 16 o segundo argumento é obrigatório. `updateTag` só funciona em Server Action, não em route handler.
- Se o dev server servir dado antigo após mexer em código de cache, rode `rm -rf .next` (o cache persiste em disco).

---

## Upload de imagens (fluxo)

1. Navegador comprime para WebP.
2. `POST …/upload-url` devolve URL assinada (5 min) e a `key`.
3. `PUT` direto no R2 com a URL assinada (o arquivo não passa pelo servidor).
4. `POST` registra a imagem no banco com a `key`.
   Produto: nasce com `active: false`, sobe cada imagem em sequência e só no fim é ativado (detalhes em "Produtos: regras de escrita"). Exclusão: ver a mesma seção.
   CORS do bucket: `localhost:3000` e os domínios de produção. Previews da Vercel ficam de fora por decisão.

---

## Produtos: regras de escrita

- Criação: o `POST` cria o produto com `active: false`. O formulário sobe cada imagem em sequência (comprimir, `upload-url`, `PUT`, registrar), checa `res.ok` em cada etapa e só no fim ativa com `PATCH { active: true }`. Se qualquer etapa falhar na criação, chama `DELETE` no produto (melhor esforço) e mantém o formulário preenchido para uma nova tentativa.
- Edição: falha parcial de imagem não desfaz nada. O formulário limpa a seleção de arquivos para um novo envio não duplicar o que já entrou.
- O `PATCH` valida preço, promoção e tags no estado efetivo (valor enviado ou o atual) com `getPricingError` (`server/product-pricing.ts`), só quando a requisição toca nesses campos ou ativa o produto (`active: true`). Distinguir "omitido" de `null` com `=== undefined`, nunca com `??`: `promoPriceCents: null` remove a promoção e `priceCents: null` remove o preço (só sob encomenda). Limites: título 120, descrição 2000, preço 10.000.000 centavos.
- `updateProductSchema` não pode aplicar `.default([])` em `tags`. O `.partial()` mantém o default, e um `PATCH` sem `tags` apagaria as tags do produto.
- Exclusão (produto, imagem de produto e imagem de galeria): apaga o registro no banco primeiro e o objeto no R2 depois. Falha do R2 não vira erro de resposta: `console.error` com a `key` (objeto órfão).
- Botões de reordenação ficam desabilitados da requisição até o `router.refresh()` terminar.

---

## Loja e carrinho

- Checkout é uma mensagem formatada aberta em `wa.me`. Não há gateway de pagamento, pedido persistido nem controle de estoque. `ESGOTADO` é uma tag manual.
- Produto `MADE_TO_ORDER` não entra no carrinho: mostra "Valor a consultar" e leva direto ao WhatsApp.
- Carrinho: `CartContext` + `CartProvider` no layout raiz + hook `useCart`. Persistência em `localStorage` via `useSyncExternalStore` (`lib/cart-storage.ts`).
- Preço em uso: `unitPriceCents` e `lineTotalCents` (`lib/cart.ts`). Qualquer lugar que mostra ou soma preço do carrinho usa esses helpers, nunca a conta inline.
- Quantidade máxima por item: 99 (`MAX_CART_QUANTITY`). Item salvo acima disso é descartado ao ler o carrinho.
- Mensagens do WhatsApp (pedido e consulta) vêm de `lib/whatsapp.ts` e são sempre montadas com `buildWhatsAppUrl`, que aplica `encodeURIComponent` na mensagem inteira. Nunca concatenar título de produto direto na URL.
- A lógica do carrinho vive em funções puras em `lib/cart.ts` (sem React, testadas). O `CartProvider` só liga essas funções ao storage. O `CartItem` está em `types/cart.ts`.
- Produto `SOLD_OUT` não vai ao carrinho: botão desabilitado ("Esgotado"), capa em cinza e "Indisponível no momento" no lugar do preço. A regra de quem pode entrar no carrinho é `canAddToCart`.
- O carrinho é lido de `localStorage` com validação (`parseCart`): dado inválido é descartado item a item e nunca lança exceção. Se a gravação falhar, o carrinho da sessão continua em memória. Ao abrir `/loja`, `CartReconciler` reconcilia o carrinho com o catálogo (remove produto inexistente ou esgotado e atualiza preço e título).

---

## Git

- **Conventional Commits com escopo obrigatório em kebab-case:** `type(scope): descrição`.
- Escopos permitidos (o commitlint rejeita qualquer outro): `hero` `services` `about` `gallery` `location` `header` `footer` `nav` `cta` `ui` `data` `types` `lib` `seo` `config` `ci` `tests` `deps` `db` `auth` `admin` `shop` `cart` `storage` `api`.
- Fluxo: branch a partir de `develop` (`feat/`, `fix/`, `refactor/`, `chore/`, `test/`, `docs/`), PR para `develop` com squash, CI verde. `main` só recebe `develop` em release, com tag.
- `git status` antes de `git add`. `git add` por arquivo, nunca `git add .`. Nunca commitar na `main`.
- Título do PR também segue Conventional Commits (o squash usa o título como mensagem final).
- Hooks: Husky + lint-staged (Prettier/ESLint) + commitlint.

---

## Como o Claude Code deve trabalhar aqui

- Pode commitar localmente na branch de feature (nunca em develop nem em main). A mensagem segue o commitlint: Conventional Commits, escopo da lista de escopos acima e cabeçalho de até 100 caracteres. Nunca usar --no-verify nem --amend em commit já feito. Se o hook rejeitar, corrigir a mensagem e repetir.
- Nunca fazer push, abrir PR nem fazer merge. Quem faz é o desenvolvedor, depois de auditar `git diff develop...HEAD`.
- Nunca usar `git add -A` nem `git add .`: adicionar arquivo por arquivo.
- Não usar /implement-spec nem /wayfinder sem pedido explícito.
- No fim de cada ticket, rodar e reportar: `npm run format:check`, `npm run lint`, `npx tsc --noEmit`, `npm run test:run` e `npm run build`, dizendo se rodaram com `rtk proxy` (saída bruta).
- Issues do GitHub: criar apenas via /to-spec e /to-tickets, depois de eu aprovar o rascunho. Não fechar, editar, comentar nem reatribuir issue por conta própria: elas fecham pelo `Closes #NN` na descrição do PR (a branch padrão é `develop`).
- Nunca usar `gh pr merge`, `gh pr close` nem `gh repo edit`. Escrita via `gh api` só a que o /to-tickets precisa para os vínculos de bloqueio.

---

## Scripts

```bash
npm run dev            # Desenvolvimento
npm run build          # Build de produção
npm run start          # Serve o build
npm run lint           # ESLint
npm run format         # Prettier (escreve)
npm run format:check   # Prettier (checa; usado no CI)
npm run typecheck      # tsc --noEmit
npm run test           # Vitest (watch)
npm run test:run       # Vitest (uma vez; usado no CI)
npx prisma generate    # Regenera o client
npx prisma migrate dev # Cria e aplica migration
npx prisma db seed     # Cria o admin inicial
npx prisma studio      # Inspeção visual do banco
```

Antes de abrir PR: `format:check` → `lint` → `typecheck` → `test:run` → `build`.

---

## Variáveis de ambiente

Documentadas em `.env.example`: `DATABASE_URL` (com `sslmode=verify-full`), `JWT_SECRET`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (esta só para o seed). O mesmo conjunto precisa existir na Vercel e nos secrets do GitHub Actions.

---

## Decisões conscientes (não "consertar" sem conversar)

- Sem recuperação de senha por e-mail: admin único, troca de senha dentro do painel e reset por script.
- Sem gateway de pagamento, sem persistência de pedidos, sem contador de estoque.
- Admin único, sem papéis. Bloqueio de conta por tentativas no login; sem rate limit por IP.
- JWT de 7 dias sem revogação.
- Imagens públicas pelo domínio `r2.dev`; domínio próprio exigiria mover o DNS inteiro para a Cloudflare.
- Previews da Vercel sem CORS liberado no R2.
- Criação de produto com falha de upload é desfeita (`DELETE`) em vez de salvar rascunho.
- A reconciliação do carrinho com o catálogo só roda ao abrir `/loja`; o pedido é conferido pelo estúdio no WhatsApp antes de qualquer pagamento.

## Dívida técnica conhecida

Itens da auditoria ainda abertos (remover daqui quando forem resolvidos): tipo `Product` redeclarado em vários componentes; `url` gravada no banco em vez da `key` do R2 (extração por `replace`, e objeto órfão no R2 quando o `PUT` dá certo mas o registro da imagem falha); lógica de reordenação duplicada entre galeria e produto; sem constraint única em `order` (a troca por dois `update` a violaria no meio da operação); reordenação concorrente entre linhas diferentes; `PATCH` de produto devolve 500 se o produto for apagado entre a leitura e o update (P2025); sem limite de tamanho no `upload-url` (exige mudar `lib/r2.ts`); CSP não configurada; o `eslint.config.mjs` não tem `ignores` (`eslint .` varre `.next`); `DATABASE_URL` com `verify-full` ainda só no `.env` local (falta Vercel e GitHub Actions); testes de rotas, de componentes e do proxy (schemas de produto, precificação e carrinho já têm testes).

## Agent skills

### Issue tracker

Issues vivem no GitHub Issues do repo (CLI `gh`). Ver `docs/agents/issue-tracker.md`.

### Triage labels

Vocabulário padrão: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. Ver `docs/agents/triage-labels.md`.

### Domain docs

Single-context: um `CONTEXT.md` + `docs/adr/` na raiz. Ver `docs/agents/domain.md`.
