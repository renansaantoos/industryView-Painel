# IndustryView - Guia de Desenvolvimento

Plataforma industrial de gestao de projetos solares com compliance, seguranca, qualidade e agentes de IA.

## Estrutura do Monorepo

```
industryView-Painel/
├── backend/              # API Node.js/Express + TypeScript
├── industryview-react/   # Frontend React + Vite + TypeScript
├── industryView-app-novo/ # App mobile Flutter/Dart
├── deploy/               # Scripts de deploy, Nginx, Docker prod
└── .github/workflows/    # CI/CD (GitHub Actions)
```

## Backend (Node.js + Express + TypeScript)

### Stack Principal
- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Linguagem:** TypeScript 5.9.3 (strict mode, decorators)
- **ORM:** Prisma 5.10.0 (schema em `backend/prisma/schema.prisma`)
- **Banco:** PostgreSQL 16
- **Cache/Filas:** Redis 7 + Bull.js
- **Validacao:** Zod 3.22.4
- **Auth:** JWT (24h expiry) + bcryptjs + refresh tokens
- **Email:** SendGrid 8.1.0
- **Pagamentos:** Stripe 14.14.0
- **IA:** Anthropic Claude SDK (@anthropic-ai/sdk 0.78.0) - Claude Sonnet 4 + Haiku 4.5
- **Docs:** Swagger/OpenAPI em `/api-docs`
- **Logs:** Pino 8.18.0
- **Testes:** Jest 29.7.0 + Supertest

### Path Aliases (tsconfig.json)
- `@/*` -> `src/*`
- `@config/*` -> `src/config/*`
- `@middleware/*` -> `src/middleware/*`
- `@modules/*` -> `src/modules/*`
- `@services/*` -> `src/services/*`
- `@utils/*` -> `src/utils/*`
- `@types/*` -> `src/types/*`

### Modulos (`backend/src/modules/`)
Cada modulo segue o padrao: `controller.ts`, `service.ts`, `routes.ts`, `schema.ts` (Zod).

Modulos principais: `auth`, `users`, `agents`, `projects`, `sprints`, `tasks`, `teams`, `trackers`, `inventory`, `reports`, `safety`, `quality`, `planning`, `daily-reports`, `work-permits`, `workforce`, `employees`, `notifications`, `ppe`, `contracts`, `commissioning`, `environmental`, `health`, `material-requisitions`, `audit`, `work-schedule`, `schedule-import`, `schedule`, `clients`, `holidays`, `project-calendar`, `tools`, `manufacturers`, `company`, `stripe`.

### Agentes de IA (`backend/src/modules/agents/`)
- Executive Agent (decisoes estrategicas)
- Planning Agent (planejamento de projetos)
- Quality Agent (garantia de qualidade)
- Safety Agent (seguranca e compliance)
- Workforce Agent (gestao de equipes)
- Interpreting Agent (analise de dados)
- Response Generator (respostas ao usuario)
- Agent Router (roteamento entre agentes)

Servico Claude: `backend/src/services/claude-client.ts`
- `claudeJsonCompletion<T>()` - respostas JSON estruturadas (temp 0.6)
- `claudeTextCompletion()` - respostas markdown/texto (temp 0.7)

### API
- **Base URL:** `/api/v1`
- **Formato de erro:** `{ error: true, code: "ERROR_CODE", message: "...", payload?: {} }`
- **Seguranca:** Helmet, CORS, rate limiting, compressao

### Comandos Backend
```bash
npm run dev              # Dev com hot reload
npm run build            # Compilar TypeScript
npm run start            # Rodar compilado
npm test                 # Rodar testes Jest
npm run lint             # ESLint
npm run prisma:generate  # Gerar Prisma Client
npm run prisma:migrate   # Rodar migrations
npm run prisma:seed      # Seed do banco
npm run prisma:studio    # Browser visual do banco
npm run docker:up        # Subir Docker (dev)
npm run docker:down      # Parar Docker
```

## Frontend React (`industryview-react/`)

### Stack Principal
- **Framework:** React 19.2.0
- **Build:** Vite 7.3.1
- **Linguagem:** TypeScript 5.9.3
- **Roteamento:** React Router DOM 7.13.0
- **HTTP:** Axios 1.13.5 (client customizado com interceptors)
- **Forms:** React Hook Form 7.71.1
- **UI:** Lucide React (icones), Framer Motion (animacoes)
- **Graficos:** Recharts 3.7.0
- **Datas:** date-fns 4.1.0
- **i18n:** i18next - en, es, pt (`src/i18n/`)
- **PDF:** jsPDF 4.1.0
- **CSV:** PapaParse 5.5.3
- **Markdown:** react-markdown 10.1.0
- **QR Code:** qrcode 1.5.4
- **Deploy:** Vercel (`vercel.json`)

### Estrutura
```
industryview-react/src/
├── pages/          # Paginas (auth, dashboard, projects, sprints, employees, planning,
│                   #   quality, operations, chat, reports, inventory, clients, company,
│                   #   audit, import, notifications, pricing, expired)
├── components/     # Componentes (common, navigation, clients, company, tasks)
├── services/api/   # 30+ modulos de integracao com a API
├── contexts/       # AuthContext, AppStateContext
├── hooks/          # Custom hooks
├── utils/          # Funcoes utilitarias
└── i18n/           # Traducoes (en.json, es.json, pt.json)
```

### Comandos Frontend
```bash
npm run dev        # Dev server (Vite)
npm run build      # Build de producao
npm run lint       # ESLint
npm run preview    # Preview do build
```

## App Mobile Flutter (`industryView-app-novo/`)

### Stack Principal
- **Framework:** Flutter SDK (Dart 3.0.0 - 4.0.0)
- **State:** Provider 6.1.5
- **Navegacao:** GoRouter 12.1.3
- **HTTP:** http 1.4.0
- **DB Local:** sqflite 2.4.0
- **Plataformas:** Android, iOS, macOS, Web

### Funcionalidades Nativas
Camera, galeria, audio, video, file picker, QR code scanner, armazenamento local.

### Estrutura
```
lib/
├── main.dart       # Entry point
├── auth/           # Autenticacao
├── pages/          # Telas
├── components/     # Componentes UI
├── services/       # Logica de negocio e API
├── database/       # SQLite local (DAOs, models)
├── core/           # Utilitarios core
├── widgets/        # Widgets customizados
├── backend/        # Comunicacao com backend
├── app_state.dart  # Estado global
└── app_constants.dart
```

### Comandos Flutter
```bash
flutter pub get       # Instalar dependencias
flutter run           # Rodar no device/emulador
flutter build apk     # Build Android
flutter build ipa     # Build iOS
flutter build web     # Build web
```

## Banco de Dados (PostgreSQL + Prisma)

Schema extenso com 50+ tabelas. Entidades principais: Companies, Projects, Sprints, Tasks, Subtasks, Teams, Users, Employees, DailyReports, Safety, Quality, WorkPermits, WorkSchedules, Inventory, Clients, Contractors, Contracts, Commissioning, Environmental, Health, AuditLogs, Notifications, PaymentStatus.

Padroes: soft deletes (`deleted_at`), timestamps (`created_at`, `updated_at`), cascading deletes, BigInt serialization.

## Deploy e Infraestrutura

### Docker
- `docker-compose.yml` - dev (PostgreSQL 16, Redis 7, app)
- `docker-compose.prod.yml` - producao
- `Dockerfile` - multi-stage production
- `Dockerfile.dev` - dev com hot reload

### Nginx (`deploy/nginx.conf`)
- Reverse proxy para API (porta 3000)
- Frontend SPA em `/var/www/industryview`
- Gzip, cache de assets (1 ano), security headers, CORS
- Limite de upload: 50MB

### CI/CD (GitHub Actions)
- **CI** (`ci.yml`): PR -> main: lint + testes backend, lint + build frontend (Node 20)
- **CD** (`cd.yml`): Push -> main: deploy via SSH, migrations, health check

### Script de Deploy (`deploy/deploy.sh`)
Pull -> build frontend -> migrations -> Docker services -> health check

## Convencoes de Codigo

- Validacao de entrada com Zod em todo endpoint
- Modulos seguem padrao: controller -> service -> routes -> schema
- Frontend usa API client centralizado (`apiClient.ts`) com interceptors Axios
- Autenticacao via JWT no header `Authorization: Bearer <token>`
- Respostas de erro padronizadas em toda a API
- i18n obrigatorio para textos visiveis ao usuario (3 idiomas)
- TypeScript strict em todo o projeto
