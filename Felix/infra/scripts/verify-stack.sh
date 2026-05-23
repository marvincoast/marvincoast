#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

DC="./infra/scripts/felix-compose.sh"
SUPABASE_NET="${SUPABASE_DOCKER_NETWORK:-supabase_network_felix-empire-trading}"

echo "==> Containers"
$DC ps

echo ""
echo "==> Aguardando Traefik (ate 30s)"
for _ in $(seq 1 15); do
  if curl -sf -o /dev/null http://localhost:8081/ping 2>/dev/null; then
    break
  fi
  sleep 2
done

echo ""
echo "==> HTTP (host)"
code_root=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ || echo "000")
echo "http://localhost/          ${code_root}"
code_3000=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo "000")
echo "http://localhost:3000/     ${code_3000}"
code_ping=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/ping || echo "000")
echo "http://localhost:8081/ping ${code_ping}"
code_api=$(curl -s -o /dev/null -w "%{http_code}" \
  "http://localhost/api/courses/c0000000-0000-0000-0000-000000000001" || echo "000")
echo "http://localhost/api/courses/... ${code_api} (401=rota OK sem token)"

echo ""
echo "==> Health (in-container)"
for c in felix-course felix-assessment felix-certificate felix-ranking felix-rag felix-notification; do
  if docker ps --format '{{.Names}}' | grep -qx "$c"; then
    out=$(docker exec "$c" wget -qO- "http://localhost:3000/health" 2>/dev/null || true)
    if [[ -n "$out" ]]; then
      echo "$c OK: $out"
    else
      echo "$c FAIL: no /health"
    fi
  fi
done

echo ""
echo "==> Supabase from course-service"
supabase_ok=0
if docker ps --format '{{.Names}}' | grep -qx felix-course; then
  env_url=$(docker exec felix-course printenv SUPABASE_URL 2>/dev/null || true)
  [[ -n "$env_url" ]] && echo "SUPABASE_URL no container: ${env_url}"

  if docker inspect felix-course --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' | grep -qF "$SUPABASE_NET"; then
    echo "Rede ${SUPABASE_NET}: conectada"
  else
    echo "AVISO: felix-course NÃO está em ${SUPABASE_NET}"
    echo "  Rode: ./infra/scripts/connect-supabase-network.sh"
  fi

  try_supabase_url() {
    local base="$1"
    docker exec felix-course wget -q --spider --timeout=5 "${base}/rest/v1/" 2>/dev/null
  }

  for base in \
    "${env_url:-}" \
    "http://kong:8000" \
    "http://api-gw:8000" \
    "http://supabase_kong_felix-empire-trading:8000" \
    "http://host.docker.internal:54321"; do
    [[ -z "$base" ]] && continue
    if try_supabase_url "$base"; then
      echo "${base} OK"
      supabase_ok=1
      break
    fi
  done

  if [[ "$supabase_ok" -eq 0 ]]; then
    echo "Supabase FAIL — rode: npx supabase start && ./infra/scripts/connect-supabase-network.sh"
    echo "  .env.local: SUPABASE_URL=http://kong:8000"
    docker exec felix-course wget -S --timeout=3 http://kong:8000/rest/v1/ 2>&1 | head -3 || true
  fi
fi

echo ""
echo "==> VITE no bundle web (deve conter 127.0.0.1:54321)"
if docker exec felix-web sh -c "grep -r '127.0.0.1:54321' /usr/share/nginx/html/assets/*.js 2>/dev/null | head -1" | grep -q .; then
  echo "VITE_SUPABASE_URL embutida no build OK"
else
  echo "AVISO: VITE não encontrada no JS — rode: ./infra/scripts/felix-compose.sh build --no-cache web"
fi

echo ""
if [[ "$code_root" == "200" || "$code_root" == "304" ]] && [[ "$code_3000" == "200" || "$code_3000" == "304" ]] && [[ "$supabase_ok" -eq 1 ]]; then
  echo "Resumo: stack OK para dev local."
elif [[ "$code_root" == "200" || "$code_root" == "304" ]] && [[ "$code_3000" == "200" || "$code_3000" == "304" ]]; then
  echo "Resumo: frontend OK; corrija Supabase (acima) para curso/login com dados."
else
  echo "Resumo: verifique Traefik ou use http://localhost:3000"
fi
echo "Done."
