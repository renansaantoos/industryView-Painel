# IndustryView Backend - Agent Memory

## Arquitetura do Projeto

- **Backend Node.js**: `/home/luis/Projetos/industryView-Painel/backend/`
  - Framework: Express 4.18
  - Runtime: ts-node-dev com TypeScript 5.x
  - Porta: 3000 (`PORT=3000` no `.env`)
  - Prefixo de API: `/api/v1` (definido por `API_VERSION=v1`)
  - Entry point: `src/index.ts` (~1100 linhas)

- **Frontend React**: `/home/luis/Projetos/industryView-Painel/industryview-react/`
  - Vite 5.x (React + TypeScript)

## Estrutura de Módulos do Backend

Cada módulo em `src/modules/<nome>/` contém:
- `<nome>.schema.ts` - validação Zod
- `<nome>.service.ts` - lógica de negócio com Prisma
- `<nome>.controller.ts` - handlers HTTP
- `<nome>.routes.ts` - rotas Express + middleware
- `index.ts` - re-exports

Módulos: auth, users, projects, sprints, teams, trackers, inventory, reports, agents, tasks, manufacturers, stripe, ppe, employees, work-schedule, clients, contracts, commissioning, environmental, health, material-requisitions, audit, schedule-import, etc.

## Padrões de Código

- **Validação**: Zod (`<nome>.schema.ts`)
- **ORM**: Prisma com PostgreSQL
- **Auth**: JWT (`jsonwebtoken`), bcryptjs para hash de senha
- **Middleware auth**: `import { authenticate } from '../../middleware/auth'` - named export
- **Erros**: Classes `AppError`, `BadRequestError`, `NotFoundError`, `UnauthorizedError` em `src/utils/errors.ts`
- **BigInt**: Todos IDs do Prisma são BigInt - usar `serializeBigInt()` de `src/utils/bigint.ts` nas respostas
- **DB client**: `import { db } from '../../config/database'`

## Docker

- Container Node.js: `industryview-app`
- Container PostgreSQL: `7db4708f8620` (nome: `7db4708f8620_industryview-postgres`)
- Container Redis: `7c332e10ebbf`
- DB: `industryview`, user: `postgres`, password: `postgres`
- Prisma generate: `docker exec industryview-app npx prisma generate`
- Restart: `docker restart industryview-app`

## Registro de Rotas no index.ts

Padrão para adicionar novo módulo em `src/index.ts`:
1. Adicionar import após `employeesRoutes` (linha ~64)
2. Adicionar `app.use(...)` após `app.use(\`${API_PREFIX}/employees\`, employeesRoutes)` (linha ~475)

## Schema Prisma

- Arquivo: `prisma/schema.prisma` (~2800 linhas)
- Model `users` na linha 181, back-relations terminam na linha ~254
- Ao adicionar relação que referencia `users`, sempre adicionar o back-relation na model `users`
- Migrations manuais: criar em `prisma/migrations/<timestamp>_<nome>/migration.sql` e registrar em `_prisma_migrations` via INSERT

## Bug Resolvido: 404 em POST /api/v1/auth/signup (ambiente anterior)

- Causa: Vite frontend estava na porta 3000, mesma do backend
- Fix: Alterado Vite para porta 5173 + proxy `/api` -> `http://localhost:3000`

## Variáveis de Ambiente Importantes (.env)

- `DATABASE_URL`: PostgreSQL via Docker em `postgres:5432/industryview` (dentro do container)
- `JWT_SECRET`: Mínimo 32 chars
- `NODE_ENV=development` - desabilita rate limit global, habilita logs verbose
- Redis disponível via Docker
