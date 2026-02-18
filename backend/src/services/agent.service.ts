// =============================================================================
// INDUSTRYVIEW BACKEND - AI Agent Service
// Servico para agentes de IA (OpenAI)
// Equivalente aos agents e tools do Xano
// =============================================================================

import OpenAI from 'openai';
import { config } from '../config/env';
import { db } from '../config/database';
import { ExternalServiceError } from '../utils/errors';
import { agentLogger } from '../utils/logger';
import { InterpretingAgentResult } from '../types';

// Inicializa o cliente OpenAI
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!config.openai.apiKey) {
    throw new ExternalServiceError(
      'OpenAI',
      'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.'
    );
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  return openaiClient;
}

/**
 * AgentService - Servico para agentes de IA
 * Equivalente aos agents do Xano (InterpretingAgent, GeneratorResponseAgent, etc)
 */
export class AgentService {
  /**
   * Interpreta a pergunta do usuario e gera parametros de consulta
   * Equivalente ao: InterpretingAgent do Xano
   */
  static async interpretQuestion(question: string): Promise<InterpretingAgentResult> {
    const client = getOpenAIClient();

    const systemPrompt = `
# Prompt de Interpretacao de Perguntas

Voce e um agente que interpreta perguntas em linguagem natural e converte em objetos estruturados JSON.

## Estrutura do Banco de Dados

### Tabela projects (Projetos)
- name: nome do projeto
- responsible: responsavel pelo projeto
- start_date: data de inicio
- completion_percentage: percentual de conclusao
- project_creation_date: data de criacao do projeto
- situation_date: data de atualizacao da situacao
- city, state, country: localizacao

### Estrutura de Tarefas e Sprints
- tasks: informacoes da tarefa (id, description, weight, created_at, equipaments_types_id)
- equipaments_types: tipo de equipamento (id, type)
- sprints: informacoes da sprint (id, title, objective, start_date, end_date, progress_percentage)
- sprints_tasks: vincula tarefas as sprints e equipes
- sprints_tasks_statuses: status da tarefa na sprint
- teams: informacoes dos times (id, name)
- teams_members e users: membros dos times

## Objetivo

1. Verificar se a pergunta e sobre projetos.
2. Verificar se a pergunta e sobre tarefas atrasadas.
3. Verificar se a pergunta e sobre estrutura hierarquica do projeto.
4. Identificar a intencao da pergunta.
5. Gerar um objeto JSON com a estrutura adequada.

## Formato de Resposta

Retorne exclusivamente um objeto JSON.
Nunca inclua explicacoes, somente o JSON.

### Pergunta sobre projetos
{
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

### Pergunta sobre tarefas atrasadas
{
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

### Pergunta sobre estrutura hierarquica
{
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

### Quando nao puder interpretar
{
  "is_about_projects": false,
  "is_about_delayed_tasks": false,
  "is_about_structure": false,
  "requested_info": null,
  "query": null,
  "error": "Nao consigo responder a essa pergunta no momento."
}

## Regras

- Use ILIKE com '%valor%' para comparacoes de texto.
- Para numeros ou datas, use =, >, <.
- Nunca retorne mais de um is_about_*: true.
`;

    try {
      agentLogger.info({ question }, 'Interpreting question');

      const response = await client.chat.completions.create({
        model: config.openai.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        temperature: 0.6,
        max_tokens: config.openai.maxTokens,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new ExternalServiceError('OpenAI', 'Empty response from AI');
      }

      const result = JSON.parse(content) as InterpretingAgentResult;

      agentLogger.info({ question, result }, 'Question interpreted successfully');

      return result;
    } catch (error: unknown) {
      agentLogger.error({ error, question }, 'Failed to interpret question');

      if (error instanceof SyntaxError) {
        throw new ExternalServiceError('OpenAI', 'Failed to parse AI response');
      }

      throw error;
    }
  }

  /**
   * Gera resposta humanizada baseada nos dados
   * Equivalente ao: GeneratorResponseAgent do Xano
   */
  static async generateResponse(
    question: string,
    data: unknown
  ): Promise<string> {
    const client = getOpenAIClient();

    const systemPrompt = `
Voce e um assistente que transforma dados tecnicos sobre projetos em respostas amigaveis em formato Markdown.

Voce recebera:
- A pergunta original do usuario
- Uma lista de dados em formato JSON

Com base nisso, gere uma resposta clara, util e bem formatada.
Caso haja multiplos itens, organize-os como uma lista em Markdown.

Exemplo de resposta:
Os projetos sob responsabilidade do Myrko sao:

- **Cadastro Nacional**
  - Status: Em andamento
  - Prazo: 01/08/2025

- **Integracao Xano**
  - Status: Concluido
  - Prazo: 15/06/2025
`;

    try {
      agentLogger.info({ question }, 'Generating humanized response');

      const response = await client.chat.completions.create({
        model: config.openai.model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Pergunta: ${question}\n\nDados: ${JSON.stringify(data)}`,
          },
        ],
        temperature: 0.9,
        max_tokens: config.openai.maxTokens,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new ExternalServiceError('OpenAI', 'Empty response from AI');
      }

      agentLogger.info({ question }, 'Response generated successfully');

      return content;
    } catch (error: unknown) {
      agentLogger.error({ error, question }, 'Failed to generate response');
      throw error;
    }
  }

  /**
   * Retorna mensagem de erro padrao
   * Equivalente a: retornarErroAgent function do Xano
   */
  static handleError(_question: string): { result1: string } {
    return {
      result1: 'Desculpe, nao consegui uma resposta para a sua pergunta no momento!',
    };
  }

  /**
   * Registra log de interacao com o agente
   * Equivalente a: register_agent_dashboard_log function do Xano
   */
  static async logDashboard(data: {
    userId: number;
    question: string;
    response: string;
    intentData?: string;
    objectAnswer?: Record<string, unknown>;
  }): Promise<boolean> {
    try {
      await db.agent_log_dashboard.create({
        data: {
          user_id: BigInt(data.userId),
          question: data.question,
          response: data.response,
          intent_data: data.intentData,
          object_answer: data.objectAnswer ? JSON.stringify(data.objectAnswer) : undefined,
          created_at: new Date(),
        },
      });

      agentLogger.info({ userId: data.userId }, 'Agent log registered successfully');
      return true;
    } catch (error) {
      agentLogger.error({ error, userId: data.userId }, 'Failed to register agent log');
      return false;
    }
  }

  /**
   * Pipeline completo: interpreta pergunta, busca dados e gera resposta
   */
  static async processQuestion(
    userId: number,
    question: string
  ): Promise<{
    response: string;
    intentData: InterpretingAgentResult;
    rawData: unknown;
  }> {
    try {
      // 1. Interpreta a pergunta
      const intentData = await this.interpretQuestion(question);

      // 2. Se nao conseguiu interpretar, retorna erro
      if (intentData.error) {
        const errorResponse = this.handleError(question);
        await this.logDashboard({
          userId,
          question,
          response: errorResponse.result1,
          intentData: JSON.stringify(intentData),
        });

        return {
          response: errorResponse.result1,
          intentData,
          rawData: null,
        };
      }

      // 3. Busca dados baseado na interpretacao
      let rawData: unknown = null;

      if (intentData.isAboutProjects && intentData.query) {
        rawData = await this.fetchProjectsData(intentData.query);
      } else if (intentData.isAboutDelayedTasks) {
        rawData = await this.fetchDelayedTasksData();
      } else if (intentData.isAboutStructure && intentData.query) {
        rawData = await this.fetchProjectStructureData(intentData.query);
      }

      // 4. Gera resposta humanizada
      const response = await this.generateResponse(question, rawData);

      // 5. Registra log
      await this.logDashboard({
        userId,
        question,
        response,
        intentData: JSON.stringify(intentData),
        objectAnswer: rawData as Record<string, unknown>,
      });

      return {
        response,
        intentData,
        rawData,
      };
    } catch (error) {
      agentLogger.error({ error, question, userId }, 'Failed to process question');

      const errorResponse = this.handleError(question);
      return {
        response: errorResponse.result1,
        intentData: {
          isAboutProjects: false,
          isAboutDelayedTasks: false,
          isAboutStructure: false,
          requestedInfo: null,
          query: null,
          error: 'Erro interno ao processar pergunta',
        },
        rawData: null,
      };
    }
  }

  /**
   * Busca dados de projetos
   * Equivalente a: Buscar_Projetos function do Xano
   */
  private static async fetchProjectsData(_query: InterpretingAgentResult['query']) {
    // Implementacao simplificada - em producao usar queries mais robustas
    const projects = await db.projects.findMany({
      where: {
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        responsible: true,
        project_creation_date: true,
        start_date: true,
        completion_percentage: true,
        city: true,
        state: true,
      },
      take: 100,
    });

    return projects;
  }

  /**
   * Busca tarefas atrasadas
   * Equivalente a: Buscar_tasks_atrasadas function do Xano
   */
  private static async fetchDelayedTasksData() {
    const today = new Date();

    const delayedTasks = await db.sprints_tasks.findMany({
      where: {
        deleted_at: null,
        sprints: {
          end_date: {
            lt: today,
          },
        },
        sprints_tasks_statuses: {
          status: {
            not: 'Concluida',
          },
        },
      },
      include: {
        projects_backlogs: true,
        sprints: true,
        teams: true,
        sprints_tasks_statuses: true,
      },
      take: 100,
    });

    return delayedTasks;
  }

  /**
   * Busca estrutura hierarquica do projeto
   * Equivalente a: Buscar_evolucao_projeto function do Xano
   */
  private static async fetchProjectStructureData(_query: InterpretingAgentResult['query']) {
    const projects = await db.projects.findMany({
      where: {
        deleted_at: null,
      },
      include: {
        fields: {
          include: {
            sections: {
              include: {
                rows: {
                  include: {
                    rows_trackers: {
                      include: {
                        rows_stakes: {
                          include: {
                            stakes_statuses: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      take: 10,
    });

    return projects;
  }
}

export default AgentService;
