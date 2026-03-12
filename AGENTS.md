# IndustryView - Sistema de Agentes IA

Sistema multi-agente especializado para gestao de projetos solares, powered by Anthropic Claude.

## Arquitetura Geral

```
Mensagem do Usuario
    |
    v
POST /api/v1/agents/chat
    |
    v
[1] Agent Router (Claude Haiku - temp 0.1)
    Classifica dominio: executive | safety | planning | workforce | quality | general
    |
    v
[2] Agente Especializado (Claude Sonnet - temp 0.6)
    a) Interpreta mensagem -> JSON estruturado (intent + filtros)
    b) Busca dados no banco (Prisma/PostgreSQL)
    c) Gera resposta humanizada em Markdown (temp 0.7-0.9)
    |
    v
[3] Resposta
    { response, domain, confidence, metadata: { agent, processing_time_ms } }
```

## Modelos Claude Utilizados

| Modelo | Uso | Temperatura | Max Tokens |
|--------|-----|-------------|------------|
| claude-sonnet-4-20250514 | Agentes principais (interpretacao, resposta) | 0.3-0.9 | 2000 |
| claude-haiku-4-5-20251001 | Router (classificacao rapida) | 0.1 | 200 |

Configuracao em variaveis de ambiente:
- `ANTHROPIC_API_KEY` - chave da API
- `CLAUDE_MODEL` - modelo principal (Sonnet 4)
- `CLAUDE_ROUTER_MODEL` - modelo do router (Haiku 4.5)
- `CLAUDE_MAX_TOKENS` - limite de tokens (default 2000)

## Claude Client (`backend/src/services/claude-client.ts`)

Dois metodos principais:

- **`claudeJsonCompletion<T>()`** - Respostas JSON estruturadas. Usa prefill trick (envia `{` como mensagem do assistente). Temp 0.6.
- **`claudeTextCompletion()`** - Respostas texto/Markdown livre. Temp 0.7.

## Agentes Especializados

### Agent Router (`agent-router.service.ts`)
Classificador de intencao usando Claude Haiku (rapido e barato).

**Dominios:**
1. `executive` - Status de projetos, KPIs, progresso, contagem de trackers
2. `safety` - Incidentes, treinamentos, DDS, permissoes de trabalho, EPIs, saude
3. `planning` - Progresso de sprints, tarefas atrasadas, backlog, previsoes, caminho critico
4. `workforce` - Equipes, headcount, alocacao, carga de trabalho
5. `quality` - Nao-conformidades, checklists, regras de ouro, compliance
6. `general` - Saudacoes, perguntas genericas (fallback)

**Output:** `{ domain, confidence (0-1), reasoning }`

### Executive Agent (`executive-agent.service.ts`)
Visao executiva de projetos.

**Intents:** `project_status`, `delayed_projects`, `project_progress`, `tracker_count`, `project_summary`, `team_overview`

**Tabelas:** projects, fields, sections, rows, rows_trackers, sprints, sprints_tasks

**Capacidades:**
- Contar trackers instalados por projeto
- Identificar projetos atrasados (conclusao < 100%)
- Resumo de projetos com responsavel, datas, localizacao

### Safety Agent (`safety-agent.service.ts`)
Seguranca do trabalho e SSMA.

**Intents:** `incidents`, `trainings`, `dds`, `work_permits`, `ppe`, `health`, `environmental`, `safety_summary`

**Tabelas:** safety_incidents, worker_trainings, dds_records, work_permits, ppe_deliveries, worker_health_records, environmental_licenses

**Capacidades:**
- Listar incidentes por severidade, data, status
- Rastrear vencimento de treinamentos
- Monitorar DDS (dialogos diarios de seguranca)
- Gerenciar permissoes de trabalho
- Rastrear entregas de EPI
- Monitorar saude ocupacional
- Rastrear licencas ambientais

### Planning Agent (`planning-agent.service.ts`)
Planejamento e cronograma de projetos.

**Intents:** `sprint_progress`, `delayed_tasks`, `backlog_status`, `schedule_forecast`, `critical_path`, `planning_summary`

**Tabelas:** sprints, sprints_tasks, projects_backlogs, schedule_baselines, sprints_tasks_statuses

**Capacidades:**
- Progresso percentual de sprints
- Listar tarefas atrasadas por sprint/equipe
- Status de distribuicao do backlog
- Previsao de datas de conclusao
- Identificar tarefas no caminho critico

### Workforce Agent (`workforce-agent.service.ts`)
Gestao de equipes e forca de trabalho.

**Intents:** `team_overview`, `team_workload`, `employee_allocation`, `daily_headcount`, `workforce_summary`

**Tabelas:** teams, teams_members, workforce_daily_log, users, sprints_tasks

**Capacidades:**
- Visao geral de equipes e membros
- Analise de carga de trabalho (pendente vs concluido)
- Headcount diario com check-in/check-out
- Alocacao de funcionarios entre projetos

### Quality Agent (`quality-agent.service.ts`)
Qualidade e compliance.

**Intents:** `non_conformances`, `checklists`, `golden_rules`, `quality_summary`

**Tabelas:** non_conformances, checklist_responses, golden_rules, task_golden_rules

**Capacidades:**
- Rastrear nao-conformidades (numero NC, severidade, status)
- Monitorar compliance de checklists
- Rastrear regras de ouro e violacoes
- Metricas de qualidade

### Weight Calculator Agent (`weight-calculator-agent.service.ts`)
Calculo de pesos relativos para subtarefas.

**Input:** Lista de subtarefas com descricao, quantidade, unidade, disciplina
**Output:** Array de pesos (soma = 1.0) com justificativa
**Temperatura:** 0.4 (conservador/deterministico)
**Criterios:** Esforco, complexidade, quantidade, tipo de unidade, dificuldade tecnica, impacto no cronograma

## Fluxo Legado (Interpreting + Response Generator)

```
POST /api/v1/agents/projects/search
    |
    v
[1] InterpretingAgent.interpret() - Converte pergunta em query estruturada
[2] searchProjects() / searchDelayedTasks() - Busca no banco
[3] ResponseGeneratorService.generate() - Humaniza resposta em Markdown
[4] createAgentDashboardLog() - Loga interacao (opcional)
```

### Interpreting Agent (`interpreting-agent.service.ts`)
Converte linguagem natural em queries de banco. Temp 0.6.

**Tipos de query:**
1. `is_about_projects` - Queries campo/operador/valor (ILIKE, =, >, <, >=, <=)
2. `is_about_delayed_tasks` - Tarefas atrasadas de sprints concluidos
3. `is_about_structure` - Estrutura hierarquica (fields/sections/rows/trackers)

### Response Generator (`response-generator.service.ts`)
Transforma JSON tecnico em Markdown humanizado. Temp 0.9.

## Rotas da API

| Endpoint | Metodo | Descricao |
|----------|--------|-----------|
| `/agents/chat` | POST | Chat unificado com roteamento |
| `/agents/projects/search` | POST | Busca de projetos (legado) |
| `/agents/relatorios-evolucao` | GET | Relatorio de tarefas atrasadas |
| `/agents/interpret` | POST | Testar InterpretingAgent |
| `/agents/generate-response` | POST | Testar ResponseGenerator |
| `/agents/logs` | GET/POST | Listar/criar logs de interacao |
| `/agents/logs/{log_id}` | GET/DELETE | Gerenciar logs especificos |
| `/agents/calculate-weights` | POST | Calculo IA de pesos de subtarefas |
| `/agents/apply-weights` | POST | Salvar pesos e propagar rollup |

## Validacao (Zod - `agents.schema.ts`)

- `chatMessageSchema` - requer campo `message` (string)
- `projectsAgentSearchSchema` - requer campo `question` (string)
- `calculateWeightsSchema` - requer campo `projects_backlogs_id`

## Padroes Comuns

- Todas as respostas em **Portugues**
- Formato de data brasileiro: **DD/MM/YYYY**
- Markdown com tabelas e numeros em **negrito**
- Multi-tenancy: filtragem por `company_id` do usuario autenticado
- Soft deletes: queries filtram `deleted_at: null`
- BigInt handling para IDs do PostgreSQL
- Logging via `logger.error()` para debug
- Fallback para dominio `general` em caso de erro no router

## Arquivos Principais

```
backend/src/
├── services/
│   └── claude-client.ts              # SDK Anthropic wrapper
└── modules/agents/
    ├── agent-router.service.ts       # Classificador de intencao (Haiku)
    ├── chat.service.ts               # Orquestrador do chat unificado
    ├── executive-agent.service.ts    # Agente executivo
    ├── safety-agent.service.ts       # Agente de seguranca
    ├── planning-agent.service.ts     # Agente de planejamento
    ├── workforce-agent.service.ts    # Agente de forca de trabalho
    ├── quality-agent.service.ts      # Agente de qualidade
    ├── interpreting-agent.service.ts # Agente interpretador (legado)
    ├── response-generator.service.ts # Gerador de respostas (legado)
    ├── weight-calculator-agent.service.ts # Calculador de pesos
    ├── agents.service.ts             # Servico principal com metodos de banco
    ├── agents.controller.ts          # Handlers HTTP
    ├── agents.routes.ts              # Definicao de rotas + Swagger
    └── agents.schema.ts              # Schemas Zod de validacao
```
