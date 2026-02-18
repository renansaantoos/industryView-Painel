# QA Test Specialist - Memória do Agente

## IndustryView Backend - Node.js/Express Migration

### Informações do Sistema
- **Stack**: Node.js v24, TypeScript 5.9.3, Express, Prisma 5.22.0, PostgreSQL
- **Arquitetura**: MVC modular com services separados
- **Diretório Base**: `/Users/myrko/Desktop/IndustryView/backend`

### Estado do Código (2026-02-05)
- ✅ Compilação TypeScript: **SEM ERROS**
- ✅ Prisma Schema: Válido (933 linhas, 46+ tabelas)
- ⚠️ Migrations: Não existem (apenas schema.prisma)
- ⚠️ .env: Não configurado (apenas .env.example)

### Estrutura de Módulos
Total de 12 módulos implementados:
- agents/ - AI agents com OpenAI (interpreting + response-generator)
- auth/ - Autenticação JWT + signup/login
- inventory/ - Gestão de estoque
- manufacturers/ - Fabricantes de equipamentos
- projects/ - Projetos (CRUD + backlogs + subtasks)
- reports/ - Relatórios
- sprints/ - Sprints e tarefas
- stripe/ - Integração pagamentos
- tasks/ - Tarefas e templates
- teams/ - Times e membros
- trackers/ - Rastreadores solares
- users/ - Usuários e permissões

### Padrões de Código Identificados

#### Segurança (APROVADO)
- ✅ Bcrypt para hash de senhas (10 rounds)
- ✅ JWT com secret de 32+ caracteres
- ✅ Middleware de autenticação robusto
- ✅ Rate limiting implementado (5 níveis diferentes)
- ✅ Validação com Zod em todas as rotas
- ✅ Prisma ORM previne SQL injection
- ✅ Helmet para security headers
- ✅ CORS configurável

#### Rate Limiting Configurado
1. Default: 100 req/15min
2. Auth: 5 tentativas/15min (brute force protection)
3. Email: 3 envios/hora
4. AI: 10 req/minuto
5. Upload: 50 uploads/hora

#### Jobs Cron (4 agendados)
1. `end_sprint` - 23:59 diária (encerra sprints expiradas)
2. `start_sprint` - 00:00 diária (inicia sprints pendentes)
3. `att_first_login` - 07:00 diária (reseta flag first_login)
4. `update_tasks_end_day` - 01:00 diária (gestão de tarefas)

### Integrações Externas

#### OpenAI (Agents)
- Configuração: ✅ Implementada
- Uso: InterpretingAgent + ResponseGenerator
- Model: gpt-4o-mini (configurável)
- Max tokens: 2000
- Temperature: 0.7
- **Requer**: OPENAI_API_KEY no .env

#### SendGrid (Email)
- Configuração: ✅ Implementada
- Templates: password_reset, welcome
- **Requer**: SENDGRID_API_KEY no .env

#### Stripe (Pagamentos)
- Configuração: ✅ Implementada
- Endpoints: create-checkout, webhook, get-subscription
- **Requer**: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET no .env

### Problemas Conhecidos

#### CRÍTICO
1. **Ausência de .env**: DATABASE_URL e secrets não configurados
2. **Sem migrations**: Schema existe mas migrations não foram criadas

#### MÉDIO
- Alguns jobs podem ter lógica de status inconsistente (status 4 vs 3 para "concluída")

#### BAIXO
- Frontend Flutter não validado (falta api_calls.dart)

### Checklist para Deploy

- [ ] Criar arquivo .env baseado em .env.example
- [ ] Configurar DATABASE_URL
- [ ] Configurar JWT_SECRET (min 32 chars)
- [ ] Executar `npx prisma migrate dev` para criar migrations
- [ ] Executar `npx prisma generate` para gerar client
- [ ] Configurar OPENAI_API_KEY (se usar agents)
- [ ] Configurar SENDGRID_API_KEY (se usar emails)
- [ ] Configurar STRIPE_SECRET_KEY (se usar pagamentos)
- [ ] Testar conexão com banco de dados
- [ ] Executar `npm run build` para build de produção
- [ ] Configurar variáveis de ambiente em produção

### Boas Práticas Observadas
- Uso consistente de soft deletes (deleted_at)
- Normalização de texto para buscas (name_normalized)
- Logging estruturado com Pino
- Error handling centralizado
- Conversão BigInt→Number para JSON serialization
- Transações Prisma para operações críticas
- Documentação Swagger inline

### Recomendações Futuras
1. Adicionar testes unitários (jest configurado mas sem testes)
2. Adicionar testes de integração
3. Validar compatibilidade de response com Flutter frontend
4. Adicionar monitoramento (APM)
5. Configurar CI/CD pipeline
