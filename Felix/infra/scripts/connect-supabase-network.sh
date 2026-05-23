#!/usr/bin/env bash
# Garante que microserviços Felix estejam na rede Docker do Supabase CLI.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

NET="${SUPABASE_DOCKER_NETWORK:-supabase_network_felix-empire-trading}"
SERVICES=(
  felix-course
  felix-assessment
  felix-certificate
  felix-ranking
  felix-rag
  felix-notification
)

if ! docker network inspect "$NET" >/dev/null 2>&1; then
  echo "Rede $NET não encontrada. Rode: npx supabase start"
  exit 1
fi

for c in "${SERVICES[@]}"; do
  if ! docker ps --format '{{.Names}}' | grep -qx "$c"; then
    continue
  fi
  if docker inspect "$c" --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' | grep -qF "$NET"; then
    echo "$c já está em $NET"
  else
    echo "Conectando $c → $NET"
    docker network connect "$NET" "$c"
  fi
done
