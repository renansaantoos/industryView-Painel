// =============================================================================
// INDUSTRYVIEW BACKEND - Interpreting Agent Service
// Service do agente de interpretacao de perguntas
// Equivalente ao agent InterpretingAgent do Xano
// Usa OpenAI GPT-4 mini para interpretar queries
// =============================================================================

import OpenAI from 'openai';
import { config } from '../../config/env';
import { InterpretingAgentResponse } from './agents.schema';
import { logger } from '../../utils/logger';

// System prompt do InterpretingAgent
// Equivalente ao system_prompt do agent no Xano
const INTERPRETING_AGENT_SYSTEM_PROMPT = `
# Prompt de Interpretacao de Perguntas

Voce e um agente que interpreta perguntas em linguagem natural e converte em objetos estruturados JSON.

## Estrutura do Banco de Dados

### Tabela \`projects\` (Projetos)
- \`name\`: nome do projeto
- \`responsible\`: responsavel pelo projeto
- \`start_date\`: data de inicio
- \`completion_percentage\`: percentual de conclusao
- \`project_creation_date\`: data de criacao do projeto
- \`situation_date\`: data de atualizacao da situacao
- \`city\`, \`state\`, \`country\`: localizacao

### Estrutura de Tarefas e Sprints
- **\`tasks\`**: informacoes da tarefa
  - \`id\`, \`description\`, \`weight\`, \`created_at\`, \`equipaments_types_id\`

- **\`equipaments_types\`**: tipo de equipamento
  - \`id\`, \`type\`

- **\`sprints\`**: informacoes da sprint
  - \`id\`, \`title\`, \`objective\`, \`start_date\`, \`end_date\`, \`progress_percentage\`

- **\`sprints_tasks\`**: vincula tarefas as sprints e equipes
  - \`tasks_id\`, \`sprints_id\`, \`teams_id\`, \`sprints_tasks_statuses_id\`

- **\`sprints_tasks_statuses\`**: status da tarefa na sprint
  - \`id\`, \`status\` (ex: 'A Fazer', 'Em Progresso', 'Concluida', 'Atrasada')

- **\`teams\`**: informacoes dos times
  - \`id\`, \`name\`

- **\`teams_members\`** e **\`users\`**: membros dos times
  - \`users.name\`: nome do membro

---

## Objetivo

1. Verificar se a pergunta e sobre **projetos**.
2. Verificar se a pergunta e sobre **tarefas atrasadas**.
3. Verificar se a pergunta e sobre **estrutura hierarquica do projeto**.
4. Identificar a **intencao da pergunta** (ex: buscar por responsavel, cidade, sprint, tipo de equipamento).
5. Gerar um objeto JSON com a estrutura adequada.

---

## Formato de Resposta Esperado

Retorne **exclusivamente** um objeto JSON dentro de uma chave chamada \`result\`.
Nunca retorne dentro de \`"text"\`.
Nunca inclua explicacoes, somente o JSON.

---

### Pergunta sobre **projetos**
\`\`\`json
{
  "result": {
    "is_about_projects": true,
    "is_about_delayed_tasks": false,
    "is_about_structure": false,
    "requested_info": "completion_percentage" | "responsible" | "name" | "...",
    "query": {
      "field": "responsible" | "city" | "state" | "...",
      "operator": "ILIKE" | "=" | ">" | "<",
      "value": "'%valor%'" ou valor direto
    },
    "error": null
  }
}
\`\`\`

---

### Pergunta sobre **tarefas atrasadas**
\`\`\`json
{
  "result": {
    "is_about_projects": false,
    "is_about_delayed_tasks": true,
    "is_about_structure": false,
    "requested_info": "description",
    "query": {
      "field": "team",
      "operator": "ILIKE",
      "value": "'%Equipe A%'"
    },
    "error": null
  }
}
\`\`\`

---

### Pergunta sobre **estrutura hierarquica de projeto**
\`\`\`json
{
  "result": {
    "is_about_structure": true,
    "is_about_projects": false,
    "is_about_delayed_tasks": false,
    "requested_info": "estrutura_completa",
    "query": {
      "project_id": 123,
      "project_name": "'%Projeto XPTO%'",
      "project_number": "'%ABC-001%'"
    },
    "error": null
  }
}
\`\`\`

---

### Quando a pergunta **nao puder ser interpretada**
\`\`\`json
{
  "is_about_projects": false,
  "is_about_delayed_tasks": false,
  "is_about_structure": false,
  "requested_info": null,
  "query": null,
  "error": "Nao consigo responder a essa pergunta no momento. Ela nao se refere nem a projetos, tarefas atrasadas ou estrutura hierarquica."
}
\`\`\`

---

## Regras Importantes

- Sempre use \`ILIKE\` com \`'%valor%'\` (com aspas simples) para comparacoes de texto (\`responsible\`, \`city\`, \`team\`, \`status\` etc).
- Para numeros ou datas, use operadores como \`=\`, \`>\`, \`<\` e valores sem \`%\`.
- Quando a pergunta for sobre **estrutura (hierarquia de projetos)**, preencha \`"is_about_structure": true\`.
- Permita que os campos \`project_id\`, \`project_name\` e \`project_number\` sejam **opcionais**, e preenchidos **somente se mencionados** pelo usuario.
- Se a pergunta for sobre estrutura e nao mencionar filtros (ex: "mostre a evolucao dos projetos"), retorne query: {} (vazio) em vez de omitir o campo.
- Prioridade de is_about_*:

Se a pergunta mencionar "evolucao", "hierarquia", "estrutura" -> is_about_structure: true (unicos campos permitidos em query: project_id, project_name, project_number).

Se mencionar "tarefas atrasadas", "atraso" -> is_about_delayed_tasks: true.

Qualquer outra pergunta sobre projetos -> is_about_projects: true.

Nunca retorne mais de um is_about_*: true.
`;

/**
 * InterpretingAgentService - Service do agente de interpretacao
 */
export class InterpretingAgentService {
  private static openai: OpenAI | null = null;

  /**
   * Inicializa o cliente OpenAI
   */
  private static getOpenAI(): OpenAI {
    if (!this.openai) {
      const apiKey = config.openai?.apiKey || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY nao configurada');
      }
      this.openai = new OpenAI({ apiKey });
    }
    return this.openai;
  }

  /**
   * Interpreta uma pergunta em linguagem natural
   * Equivalente a: ai.agent.run "InterpretingAgent" do Xano
   */
  static async interpret(question: string): Promise<InterpretingAgentResponse> {
    try {
      const openai = this.getOpenAI();

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Equivalente ao gpt-4.1-mini do Xano
        messages: [
          {
            role: 'system',
            content: INTERPRETING_AGENT_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: question,
          },
        ],
        temperature: 0.6,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        return {
          is_about_projects: false,
          is_about_delayed_tasks: false,
          is_about_structure: false,
          requested_info: undefined,
          query: undefined,
          error: 'Nao foi possivel processar a pergunta.',
        };
      }

      // Parse da resposta JSON
      const parsed = JSON.parse(content);
      const result = parsed.result || parsed;

      return {
        is_about_projects: result.is_about_projects || false,
        is_about_delayed_tasks: result.is_about_delayed_tasks || false,
        is_about_structure: result.is_about_structure || false,
        requested_info: result.requested_info,
        query: result.query,
        error: result.error,
      };
    } catch (error) {
      logger.error({ error }, 'Erro no InterpretingAgent');
      return {
        is_about_projects: false,
        is_about_delayed_tasks: false,
        is_about_structure: false,
        requested_info: undefined,
        query: undefined,
        error: 'Erro ao processar a pergunta. Tente novamente.',
      };
    }
  }
}

export default InterpretingAgentService;
