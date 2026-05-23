#!/usr/bin/env bash
# Sobe Supabase (se necessário) + stack Felix completa para dev local.
#
# Por padrão NÃO rebuilda imagens (use quando a stack já foi buildada antes).
# Rebuild completo (lento no /mnt/c):
#   FELIX_BUILD=1 ./infra/scripts/up-local.sh
#   FELIX_BUILD_WEB=1 ./infra/scripts/up-local.sh   # só força rebuild do frontend
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

if [[ "$(pwd)" == /mnt/* ]]; then
  echo "AVISO: projeto em $(pwd) — Docker sobre /mnt/c é muito lento."
  echo "  Para builds: prefira ~/Felix ou use 'up' sem rebuild (padrão deste script)."
  echo ""
fi

echo "==> Supabase"
if command -v supabase >/dev/null 2>&1; then
  npx supabase start || true
else
  echo "Supabase CLI não encontrado; assumindo que já está em http://127.0.0.1:54321"
fi

echo "==> Frontend (build antes de subir containers — evita rodar imagem antiga)"
if [[ "${FELIX_BUILD_WEB:-}" == "1" ]]; then
  echo "    FELIX_BUILD_WEB=1 — rebuild sem cache"
  ./infra/scripts/felix-compose.sh build --no-cache web
else
  echo "    Cache Docker ativo. Forçar rebuild: FELIX_BUILD_WEB=1 $0"
  ./infra/scripts/felix-compose.sh build web
fi

echo "==> Docker (Felix + Ollama)"
if [[ "${FELIX_BUILD:-}" == "1" ]]; then
  echo "    FELIX_BUILD=1 — rebuild de todos os serviços (pode levar muito tempo)"
  ./infra/scripts/build-services.sh
else
  echo "    Sem rebuild dos microserviços. Imagens antigas? FELIX_BUILD=1"
fi
./infra/scripts/felix-compose.sh --profile llm up -d --force-recreate traefik web

echo "==> Rede Supabase (microserviços ↔ Kong)"
chmod +x infra/scripts/connect-supabase-network.sh 2>/dev/null || true
./infra/scripts/connect-supabase-network.sh || true

echo "==> Aguardando healthchecks..."
sleep 12

echo "==> Smoke test"
./infra/scripts/verify-stack.sh

echo ""
echo "=== URLs ==="
echo "App:        http://localhost  |  http://localhost:3000"
echo "Login:      http://localhost/login"
echo "Traefik:    http://localhost:8081"
echo "Supabase:   http://127.0.0.1:54323"
echo "Mailpit:    http://127.0.0.1:54324"
