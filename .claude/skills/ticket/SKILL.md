---
name: ticket
description: Implementa uma issue do GitHub do projeto, com plano aprovado, review e checagens, sem publicar nada.
argument-hint: <número da issue>
disable-model-invocation: true
---

Implemente a issue #$ARGUMENTS. Siga o critério de aceite e o CLAUDE.md.

## 1. Pré-checagem (pare e avise se falhar)

- `git branch --show-current` precisa ser o branch da issue (`Branch sugerida` no corpo). Nunca `develop` nem `main`.
- `git status` precisa estar limpo.
- Se `node_modules` ou `.env` não existirem (worktree novo), rode `bash scripts/setup-worktree.sh` (copia o `.env` do worktree principal e roda `npm ci`).
- Leia a issue com `gh issue view $ARGUMENTS`. Se houver "Blocked by", cheque se o bloqueador já foi mergeado.

## 2. Plano (espere o meu ok)

Mostre os arquivos que vai alterar ou criar e os testes que pretende escrever. Aponte decisões que dependem de mim. Não escreva código antes do ok.

## 3. Implementação

- TDD em pequena escala (`/tdd`), tipagem a cada passo, um arquivo de teste por vez.
- Só o escopo da issue. O que sobrar vira rascunho de issue para eu aprovar com `/to-tickets`.

## 4. Review e checagens

- Rode `/code-review`.
- Rode `format:check`, `lint`, `tsc --noEmit`, `test:run` e `build`. Diga se rodou com `rtk proxy`.
- Mostre `git status`, as cinco checagens e os achados do review, ordenados por severidade.

## 5. Pare

Não commite, não faça push, não abra PR e não edite nada no GitHub. Quando eu disser "commita": commit por arquivo, no padrão do commitlint, `git fetch` e rebase em `origin/develop`, e rode as checagens de novo. Entregue o título e o corpo do PR com `Closes #$ARGUMENTS`.
