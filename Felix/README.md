# Felix Empire Trading

> Plataforma de ensino interativa para **tape reading e análise de fluxo do Dólar Futuro (B3)** — com design de mercado financeiro, simulados fullscreen, prova final, certificado PDF, ranking sazonal e tutor RAG. Tudo neste repositório.

![status](https://img.shields.io/badge/etapa-9%20visual%20redesign%20conclu%C3%ADdo-brightgreen)
![stack](https://img.shields.io/badge/stack-React%2019%20%2B%20NestJS%20%2B%20Supabase-blue)
![types](https://img.shields.io/badge/types-TypeScript%20strict-3178c6)
![design](https://img.shields.io/badge/design-financial%20market%20theme-c9a227)

---

## Visão geral

| Área | Tecnologia |
|------|------------|
| Monorepo | pnpm 9 + Turborepo 2 |
| Frontend | React 19 + Vite + TailwindCSS + TanStack Query + i18next |
| Design System | `@felix/ui` — tokens, preset Tailwind, componentes market |
| Microserviços | NestJS 10 + Pino + Zod (6 serviços) |
| API Gateway | Traefik v3 (TLS, rate limit, CSP, HSTS) |
| Banco / Auth / Storage | Supabase (Postgres 16 + pgvector + RLS) |
| RAG | pgvector + prompts versionados em `apps/rag-service/prompts/` |
| Observabilidade | OpenTelemetry + Pino |
| Testes | Vitest + Jest + Playwright + axe-core |
| CI | GitHub Actions — lint / typecheck / test / docker / audit |

---

## Design — tema mercado financeiro

A plataforma usa uma identidade visual de **terminal de análise financeira**, construída sobre um sistema de tokens centralizado em `packages/ui`.

### Paleta de cores

| Token | Cor | Uso |
|-------|-----|-----|
| `brand-gold` | `#C9A227` | Marca, CTAs, destaque |
| `flow-bid` | `#00C853` | Compra — valores positivos |
| `flow-ask` | `#FF5252` | Venda — valores negativos |
| `bg-base` | `#0B0F14` | Fundo principal |
| `bg-surface` | `#101720` | Cards e painéis |
| `bg-elevated` | `#161E2A` | Dropdowns e camadas superiores |

### Componentes de UI

| Componente | Localização | Descrição |
|------------|-------------|-----------|
| `GlassCard` | `apps/web/src/components/ui/` | Card com glassmorphism, 3 variantes de profundidade |
| `StatCard` | `apps/web/src/components/ui/` | Métrica com ícone, tendência e estado de carregamento |
| `ProgressBar` | `apps/web/src/components/ui/` | Barra animada com variantes bid/ask/gold |
| `MarketBadge` | `apps/web/src/components/ui/` | Badge temático de mercado |
| `MarketTicker` | `apps/web/src/components/market/` | Faixa de cotações com scroll infinito |
| `PriceDisplay` | `apps/web/src/components/market/` | Preço colorizado com animação de variação |
| `TapeReadingVisualization` | `apps/web/src/components/market/` | Visualizador de fluxo de ordens |
| `DataGrid` | `apps/web/src/components/market/` | Tabela financeira com sorting |

---

## Estrutura do projeto

```
Felix/
├── apps/
│   ├── web/                   # SPA React (frontend)
│   ├── course-service/        # NestJS — conteúdo e progresso
│   ├── assessment-service/    # NestJS — scoring server-side, anti-cheat
│   ├── certificate-service/   # NestJS — PDF + QR + SHA-256
│   ├── ranking-service/       # NestJS — leaderboard sazonal
│   ├── rag-service/           # NestJS — tutor RAG + pgvector
│   └── notification-service/  # NestJS — e-mails via Resend
├── packages/
│   ├── ui/                    # design tokens, Tailwind preset, utilitários
│   ├── shared-types/          # Zod + tipos de domínio compartilhados
│   └── eslint-config/         # ESLint/Prettier centralizado
├── supabase/                  # migrations, seeds, config.toml
├── infra/
│   ├── docker/                # Dockerfiles por serviço
│   ├── traefik/               # traefik.yml, routers, middlewares
│   └── scripts/               # up-local.sh, build-services.sh, verify-stack.sh
├── docs/                      # ARCHITECTURE, ADRs, SECURITY, RUNBOOK...
├── .github/workflows/         # CI (8 stages)
├── docker-compose.yml
├── turbo.json
├── tsconfig.base.json
└── pnpm-workspace.yaml
```

---

## Pré-requisitos

| Ferramenta | Versão | Instalação |
|------------|--------|------------|
| **Node.js** | 20 LTS | use `.nvmrc` — `nvm use` |
| **pnpm** | 9.x | `corepack enable && corepack prepare pnpm@9.12.0 --activate` |
| **Docker** + Compose v2 | qualquer recente | [docs.docker.com](https://docs.docker.com/engine/install/) |
| **Supabase CLI** | 2.x | `npm install -g supabase` |
| **WSL2** (Windows) | — | recomendado — clone o repo **dentro** do WSL |

> **Windows:** clone o repositório em `~/Felix` no WSL, não em `/mnt/c/Projetos/Felix`. Repositórios em `/mnt/c` fazem o Docker build 10–40× mais lento por causa do overhead do sistema de arquivos do Windows.

---

## Como rodar — passo a passo

### 1. Clonar e instalar dependências

```bash
git clone <url-do-repo> Felix
cd Felix

# Copiar e preencher variáveis de ambiente
cp .env.example .env.local
```

### 2. Iniciar o Supabase local

```bash
npx supabase start
```

Aguarde o comando terminar. Depois, anote as chaves exibidas:

```
API URL: http://127.0.0.1:54321
anon key: eyJ...
service_role key: eyJ...
Studio URL: http://127.0.0.1:54323
Inbucket URL: http://127.0.0.1:54324
```

### 3. Preencher o `.env.local`

Abra `.env.local` e substitua os valores:

```env
# URL da API (Traefik local)
VITE_API_BASE_URL=http://localhost/api

# Supabase — browser usa 127.0.0.1, containers usam http://kong:8000
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<anon key do supabase start>

# Supabase — acesso dos microserviços dentro da rede Docker
SUPABASE_URL=http://kong:8000
SUPABASE_SERVICE_ROLE_KEY=<service_role key do supabase start>
```

### 4. Subir toda a stack

```bash
# Primeira vez — faz o build do frontend e sobe todos os containers
FELIX_BUILD_WEB=1 ./infra/scripts/up-local.sh
```

O script:
1. Verifica se o Supabase já está rodando
2. Faz o **build do Docker do frontend** com as variáveis `VITE_*` embutidas
3. Sobe todos os microserviços + Traefik + Ollama (perfil LLM)
4. Conecta os serviços à rede do Supabase
5. Roda smoke tests automáticos e exibe as URLs

Saída esperada ao final:

```
=== URLs ===
App:        http://localhost  |  http://localhost:3000
Login:      http://localhost/login
Traefik:    http://localhost:8081
Supabase:   http://127.0.0.1:54323
Mailpit:    http://127.0.0.1:54324
```

### 5. Popular o banco (somente na primeira vez)

Se o banco estiver vazio:

```bash
npx supabase db reset
```

Isso roda todas as migrations e o seed com os 8 módulos e 48 aulas do curso.

### 6. Fazer login

1. Acesse **http://localhost/login**
2. Informe um e-mail e clique em "Enviar link de acesso"
3. Abra **http://127.0.0.1:54324** (Mailpit) e clique no link do e-mail
4. Você será redirecionado para o dashboard

---

## Comandos do dia a dia

### Subir sem rebuild (uso cotidiano, mais rápido)

```bash
./infra/scripts/up-local.sh
```

### Forçar rebuild só do frontend (após mudanças de CSS/código React)

```bash
FELIX_BUILD_WEB=1 ./infra/scripts/up-local.sh
```

### Forçar rebuild de todos os microserviços

```bash
FELIX_BUILD=1 ./infra/scripts/up-local.sh
# ou, um serviço de cada vez:
./infra/scripts/build-services.sh course-service
./infra/scripts/felix-compose.sh up -d --force-recreate course-service
```

### Verificar status dos containers

```bash
./infra/scripts/felix-compose.sh ps
./infra/scripts/verify-stack.sh
```

### Ver logs de um serviço

```bash
./infra/scripts/felix-compose.sh logs felix-web --tail 50
./infra/scripts/felix-compose.sh logs felix-traefik --tail 30
```

### Desligar tudo

```bash
./infra/scripts/felix-compose.sh down
npx supabase stop
```

### Desenvolvimento frontend puro (sem Docker)

```bash
npx supabase start
pnpm install
pnpm --filter @felix/web dev
# http://localhost:5173
```

---

## URLs de acesso

| Serviço | URL |
|---------|-----|
| **Aplicação** (recomendado) | http://localhost |
| Frontend direto | http://localhost:3000 |
| Login | http://localhost/login |
| Dashboard | http://localhost/dashboard |
| Traefik (métricas) | http://localhost:8081 |
| Supabase Studio | http://127.0.0.1:54323 |
| Mailpit (e-mails) | http://127.0.0.1:54324 |

**APIs** (prefixo `/api` via Traefik):

| Serviço | Rota |
|---------|------|
| Cursos e progresso | `http://localhost/api/courses/...` |
| Simulados | `http://localhost/api/assessments/...` |
| Certificados | `http://localhost/api/certificates/...` |
| Ranking | `http://localhost/api/ranking/...` |
| Tutor RAG | `http://localhost/api/rag/...` |

---

## Scripts raiz (Turborepo)

| Comando | O que faz |
|---------|-----------|
| `pnpm dev` | Watch mode em todos os pacotes (Turbo) |
| `pnpm build` | Build incremental de todos os pacotes |
| `pnpm lint` | ESLint em todo o monorepo |
| `pnpm typecheck` | `tsc --noEmit` em todos os pacotes |
| `pnpm test` | Vitest/Jest em todos os pacotes |
| `pnpm test:e2e` | Playwright e2e (login, a11y, verify) |
| `pnpm format` | Prettier write |

---

## Solução de problemas comuns

| Sintoma | Solução |
|---------|---------|
| Build Docker leva 30+ min | Repositório está em `/mnt/c`. Mova para `~/Felix` no WSL para builds em segundos |
| `felix-web` sobe mas mostra versão antiga | `FELIX_BUILD_WEB=1 ./infra/scripts/up-local.sh` — força rebuild sem cache |
| `404` no http://localhost | `./infra/scripts/felix-compose.sh up -d --force-recreate traefik` |
| Curso redireciona para `/404` na porta `:3000` | Use `http://localhost` (via Traefik) em vez da porta direta |
| Página em branco / erro Supabase no console | Verifique `VITE_SUPABASE_URL` no `.env.local` e faça rebuild do web |
| `Supabase FAIL` no smoke test | `npx supabase start` → `./infra/scripts/connect-supabase-network.sh` |
| `ERR_CONNECTION_RESET` no Studio | `npx supabase stop && npx supabase start` |
| `bash\r: No such file or directory` | `sed -i 's/\r$//' infra/scripts/*.sh` |
| Browser Windows não abre mas `curl` no WSL funciona | Use `http://localhost:3000` ou ative mirrored networking no WSL2 |

Mais detalhes operacionais: [`docs/RUNBOOK.md`](docs/RUNBOOK.md).

---

## Documentação

| Documento | Link |
|-----------|------|
| Arquitetura | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| ADRs | [`docs/adr/`](docs/adr/) |
| Segurança | [`docs/SECURITY.md`](docs/SECURITY.md) |
| LGPD / Privacidade | [`docs/PRIVACY.md`](docs/PRIVACY.md) |
| Guia de conteúdo (questões) | [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md) |
| Runbook (WSL, Docker, VPS) | [`docs/RUNBOOK.md`](docs/RUNBOOK.md) |
| Roadmap | [`docs/ROADMAP.md`](docs/ROADMAP.md) |
| Contribuição | [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) |

---

## Princípios de engenharia

1. **Type-safety ponta a ponta** — TypeScript strict + Zod compartilhado entre frontend e serviços
2. **Contratos antes de código** — OpenAPI gerado dos DTOs NestJS
3. **Secure by default** — RLS em todas as tabelas, scoring server-side, gabarito nunca trafega ao browser
4. **Observabilidade desde o dia 1** — Pino structured logs + OpenTelemetry em todos os serviços
5. **Engenharia de contexto versionada** — prompts RAG imutáveis com regressão automática
6. **Decisões documentadas** — todas as ADRs em `docs/adr/`
7. **Acessibilidade** — WCAG AA, ARIA, testes axe-core no CI

---

## Status das etapas

- ✅ **Etapa 1 — Bootstrap & contexto**: monorepo pnpm+Turborepo, TS strict, ESLint/Prettier/Husky, Docker, Traefik, docs completos
- ✅ **Etapa 2 — Auth + design system**: Supabase Auth magic link, profiles + RLS, shell, i18n pt-BR, login page, dashboard
- ✅ **Etapa 3 — Domínio do curso**: migrations + seed (8 módulos, 48 aulas), course-service NestJS, UI com desbloqueio sequencial
- ✅ **Etapa 4 — Avaliações**: 100 questões de tape reading, assessment-service, SimuladoPage fullscreen com timer e anti-cheat
- ✅ **Etapa 5 — Prova final + ranking**: ranking-service, leaderboard público com pódio, badge Mesa Proprietária
- ✅ **Etapa 6 — Certificado + e-mail**: certificate-service (SHA-256 + QR), notification-service (Resend), /verify/:hash público
- ✅ **Etapa 7 — RAG Tutor**: rag-service com pgvector, ingestão versionada, TutorPage com citações e guardrails
- ✅ **Etapa 8 — Hardening + CI/CD**: TLS 1.3, rate limits, Playwright e2e, CI com 8 stages, Trivy, SBOM, backup
- ✅ **Etapa 9 — Visual redesign (tema mercado financeiro)**: design system `@felix/ui` com tokens, glassmorphism, glows, `MarketTicker`, `TapeReadingVisualization`, split-layout login, sidebar com gradiente gold, animações escalonadas
