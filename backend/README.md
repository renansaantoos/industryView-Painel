# IndustryView Backend

Backend Node.js/Express migrado do Xano para gerenciamento de projetos de instalacao solar.

## Stack Tecnologica

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Linguagem**: TypeScript
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Autenticacao**: JWT
- **Validacao**: Zod
- **Email**: SendGrid
- **Pagamentos**: Stripe
- **IA**: OpenAI
- **Jobs**: node-cron
- **Documentacao**: Swagger/OpenAPI

## Pre-requisitos

- Node.js 20+
- PostgreSQL 14+
- Redis (opcional, para jobs)
- Docker e Docker Compose (opcional)

## Instalacao

### 1. Clone o repositorio

```bash
cd backend
```

### 2. Instale as dependencias

```bash
npm install
```

### 3. Configure as variaveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configuracoes:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/industryview?schema=public"

# JWT
JWT_SECRET=sua-chave-secreta-muito-longa-aqui
JWT_REFRESH_SECRET=outra-chave-secreta-muito-longa-aqui

# SendGrid (opcional para desenvolvimento)
SENDGRID_API_KEY=sua-api-key-do-sendgrid

# OpenAI (opcional para desenvolvimento)
OPENAI_API_KEY=sua-api-key-do-openai
```

### 4. Configure o banco de dados

#### Usando Docker:

```bash
npm run docker:up
```

#### Ou configure manualmente:

Crie o banco de dados PostgreSQL e execute as migrations:

```bash
# Gera o Prisma Client
npm run prisma:generate

# Executa migrations
npm run prisma:migrate

# (Opcional) Seed de dados iniciais
npm run prisma:seed
```

### 5. Inicie o servidor

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Producao
npm run build
npm start
```

O servidor estara disponivel em:
- API: http://localhost:3000/api/v1
- Documentacao: http://localhost:3000/api-docs
- Health Check: http://localhost:3000/health

## Estrutura do Projeto

```
backend/
├── prisma/
│   ├── schema.prisma      # Schema do banco de dados
│   └── seed.ts            # Dados iniciais
├── src/
│   ├── config/            # Configuracoes
│   │   ├── env.ts         # Variaveis de ambiente
│   │   ├── database.ts    # Conexao PostgreSQL
│   │   └── swagger.ts     # Documentacao OpenAPI
│   ├── middleware/        # Middlewares Express
│   │   ├── auth.ts        # Autenticacao JWT
│   │   ├── errorHandler.ts # Tratamento de erros
│   │   ├── validation.ts  # Validacao de inputs
│   │   └── rateLimit.ts   # Rate limiting
│   ├── modules/           # Modulos de dominio
│   │   ├── auth/          # Autenticacao
│   │   ├── users/         # Usuarios
│   │   ├── projects/      # Projetos
│   │   ├── sprints/       # Sprints
│   │   ├── tasks/         # Tarefas
│   │   ├── teams/         # Equipes
│   │   ├── trackers/      # Trackers
│   │   ├── inventory/     # Inventario
│   │   └── agents/        # Agentes IA
│   ├── services/          # Servicos reutilizaveis
│   │   ├── email.service.ts  # SendGrid
│   │   ├── auth.service.ts   # JWT/Senha
│   │   └── agent.service.ts  # OpenAI
│   ├── utils/             # Utilitarios
│   │   ├── errors.ts      # Classes de erro
│   │   ├── helpers.ts     # Funcoes auxiliares
│   │   └── logger.ts      # Logging
│   ├── jobs/              # Tarefas agendadas
│   ├── types/             # Tipos TypeScript
│   └── index.ts           # Entry point
├── tests/                 # Testes
├── docker-compose.yml     # Docker para desenvolvimento
├── package.json
├── tsconfig.json
└── .env.example
```

## Mapeamento Xano -> Node.js

### API Groups -> Modulos

| Xano API Group | Node.js Module |
|----------------|----------------|
| Authentication | `modules/auth` |
| User | `modules/users` |
| Projects | `modules/projects` |
| Sprints | `modules/sprints` |
| Tasks | `modules/tasks` |
| Teams | `modules/teams` |
| Trackers | `modules/trackers` |
| Inventory | `modules/inventory` |
| Reports | `modules/reports` |
| Agente IA | `modules/agents` |

### Functions -> Services

| Xano Function | Node.js Service |
|---------------|-----------------|
| check_permission | `AuthService.checkPermission()` |
| sendgrid_basic_send | `EmailService.sendBasic()` |
| sendgrid_dynamic_send | `EmailService.sendDynamic()` |
| generate_random_code | `helpers.generateRandomCode()` |
| normalize | `helpers.normalizeText()` |
| retornarErroAgent | `AgentService.handleError()` |
| register_agent_dashboard_log | `AgentService.logDashboard()` |

### Tasks -> Jobs

| Xano Task | Node.js Job | Schedule |
|-----------|-------------|----------|
| end_sprint | `endSprintJob()` | 23:59 daily |
| start_sprint | `startSprintJob()` | 00:00 daily |
| att_first_login | `attFirstLoginJob()` | 07:00 daily |
| update_tasks_end_day | `updateTasksEndDayJob()` | 01:00 daily |

### Error Types

| Xano error_type | Node.js Error Class |
|-----------------|---------------------|
| badrequest | `BadRequestError` |
| notfound | `NotFoundError` |
| unauthorized | `UnauthorizedError` |
| - | `ForbiddenError` |
| - | `ValidationError` |
| - | `ConflictError` |

## Scripts

```bash
# Desenvolvimento
npm run dev           # Inicia com hot reload

# Build
npm run build         # Compila TypeScript

# Producao
npm start             # Inicia servidor compilado

# Testes
npm test              # Executa testes
npm run test:watch    # Testes em modo watch

# Linting
npm run lint          # Verifica erros
npm run lint:fix      # Corrige erros

# Prisma
npm run prisma:generate  # Gera cliente
npm run prisma:migrate   # Executa migrations
npm run prisma:seed      # Seed de dados
npm run prisma:studio    # Interface visual do banco

# Docker
npm run docker:up     # Inicia containers
npm run docker:down   # Para containers
```

## API Endpoints

### Autenticacao

```
POST   /api/v1/auth/signup       # Cadastro de usuario
POST   /api/v1/auth/login        # Login
GET    /api/v1/auth/me           # Dados do usuario autenticado
POST   /api/v1/auth/daily-login  # Login diario (app)
GET    /api/v1/auth/me/app       # Dados para app mobile
```

### Usuarios

```
POST   /api/v1/users/list        # Lista usuarios (paginado)
POST   /api/v1/users             # Cria usuario
GET    /api/v1/users/:id         # Busca usuario
PATCH  /api/v1/users/:id         # Atualiza usuario
DELETE /api/v1/users/:id         # Remove usuario
```

### Projetos

```
POST   /api/v1/projects/list     # Lista projetos (paginado)
POST   /api/v1/projects          # Cria projeto
GET    /api/v1/projects/:id      # Busca projeto
PATCH  /api/v1/projects/:id      # Atualiza projeto
DELETE /api/v1/projects/:id      # Remove projeto
```

Para documentacao completa, acesse `/api-docs`.

## Autenticacao

A API usa JWT para autenticacao. Inclua o token no header:

```
Authorization: Bearer <seu-token>
```

Tokens expiram em 24 horas. Use o endpoint de login para obter um novo token.

## Tratamento de Erros

Todos os erros seguem o formato:

```json
{
  "error": true,
  "code": "BAD_REQUEST",
  "message": "Descricao do erro",
  "payload": {} // opcional
}
```

Codigos de status:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

## Deploy

### Docker (Recomendado)

```bash
docker build -t industryview-backend .
docker run -p 3000:3000 --env-file .env industryview-backend
```

### Railway/Render/Fly.io

1. Configure as variaveis de ambiente
2. Build command: `npm run build`
3. Start command: `npm start`

### Vercel (Serverless)

Nao recomendado devido aos jobs agendados.

## Contribuindo

1. Crie uma branch: `git checkout -b feature/minha-feature`
2. Faca commit: `git commit -m 'Add minha feature'`
3. Push: `git push origin feature/minha-feature`
4. Abra um Pull Request

## Licenca

Proprietary - IndustryView
