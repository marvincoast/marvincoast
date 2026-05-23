#!/usr/bin/env bash
# Wrapper: sempre usa .env.local (evita WARN e containers sem env).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
if [[ ! -f .env.local ]]; then
  echo "Erro: .env.local não encontrado. Copie de .env.example e preencha."
  exit 1
fi
exec docker-compose --env-file .env.local "$@"
