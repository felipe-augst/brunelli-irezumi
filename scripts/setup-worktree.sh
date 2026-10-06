#!/usr/bin/env bash
# Prepara um worktree novo: copia o .env do worktree principal e instala as
# dependências (o postinstall roda `prisma generate`).
# Uso: bash scripts/setup-worktree.sh
set -euo pipefail

root="$(git rev-parse --show-toplevel)"
main="$(git worktree list --porcelain | awk '/^worktree /{print substr($0, 10); exit}')"

cd "$root"

if [ -f .env ]; then
  echo ".env já existe, mantendo."
elif [ "$root" = "$main" ]; then
  echo "Este é o worktree principal e não tem .env: crie a partir de .env.example." >&2
  exit 1
elif [ -f "$main/.env" ]; then
  cp "$main/.env" .env
  echo ".env copiado de $main"
else
  echo "Sem .env no worktree principal: crie a partir de .env.example." >&2
  exit 1
fi

npm ci
