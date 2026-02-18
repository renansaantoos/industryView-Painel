# IndustryView Backend - Agent Memory

## Arquitetura do Projeto

- **Backend Node.js**: `/Users/myrko/Desktop/IndustryView/backend/`
  - Framework: Express 4.18
  - Runtime: ts-node-dev com TypeScript 5.x
  - Porta: 3000 (`PORT=3000` no `.env`)
  - Prefixo de API: `/api/v1` (definido por `API_VERSION=v1`)
  - Entry point: `src/index.ts`

- **Frontend React**: `/Users/myrko/Desktop/IndustryView/industryview-react/`
  - Vite 5.x (React + TypeScript)
  - Porta corrigida para: 5173 (era 3000, causava conflito com o backend)
  - Proxy `/api` -> `http://localhost:3000`
  - Vite config: `vite.config.ts`

## Estrutura de Módulos do Backend

- `src/modules/auth/` - Autenticação (signup, login, me, daily-login, password recovery via SendGrid)
- `src/modules/users/` - CRUD de usuários
- `src/modules/projects/` - CRUD de projetos
- `src/modules/sprints/` - Sprints e tasks
- `src/modules/teams/` - Times (leaders, members)
- `src/modules/trackers/` - Rastreadores
- `src/modules/inventory/` - Inventário
- `src/modules/reports/` - Relatórios
- `src/modules/agents/` - AI Agents
- `src/modules/tasks/` - Tasks, templates, unity, discipline
- `src/modules/manufacturers/` - Fabricantes
- `src/modules/stripe/` - Pagamentos Stripe

## Padrões de Código

- **Validação**: Zod (`auth.schema.ts`, `validateBody()` middleware)
- **ORM**: Prisma com PostgreSQL
- **Auth**: JWT (`jsonwebtoken`), bcryptjs para hash de senha
- **Rate limit**: `express-rate-limit` - auth: 5 req/15min; desabilitado em dev para default
- **Erros**: Classes `AppError`, `BadRequestError`, `NotFoundError`, `UnauthorizedError` em `src/utils/errors.ts`
- **BigInt**: Todos IDs do Prisma são BigInt - usar `serializeBigInt()` de `src/utils/bigint.ts` nas respostas

## Bug Resolvido: 404 em POST /api/v1/auth/signup

- **Causa**: Vite (frontend) estava configurado com `port: 3000` no `vite.config.ts`, mesma porta do backend. O Vite interceptava os requests via `localhost` antes do Node.js (que ouvia em `*:3000`).
- **Fix**: Alterado `vite.config.ts` para `port: 5173` + adicionado proxy `/api` -> `http://localhost:3000`.
- **Diagnóstico**: `lsof -iTCP -sTCP:LISTEN -P | grep node` revelou dois processos Node na porta 3000. Curl via `127.0.0.1` (IPv4) vs `localhost` (IPv6) confirmou qual processo respondia.

## Variáveis de Ambiente Importantes (.env)

- `DATABASE_URL`: PostgreSQL via Docker em `localhost:5432/industryview`
- `JWT_SECRET`: Mínimo 32 chars (em dev: `dev-jwt-secret-change-in-production`)
- `NODE_ENV=development` - desabilita rate limit global, habilita logs verbose
- Redis disponível via Docker em `localhost:6379`
