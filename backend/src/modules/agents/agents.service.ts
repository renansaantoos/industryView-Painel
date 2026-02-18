// =============================================================================
// INDUSTRYVIEW BACKEND - Agents Module Service
// Service principal do modulo de agentes de IA
// Equivalente aos endpoints do Xano em apis/agent_task_queries/
// Orquestra InterpretingAgent, busca de dados e GeneratorResponseAgent
// =============================================================================

import { db } from '../../config/database';
import { InterpretingAgentService } from './interpreting-agent.service';
import { ResponseGeneratorService } from './response-generator.service';
import {
  ProjectsAgentSearchInput,
  CreateAgentDashboardLogInput,
  ListAgentDashboardLogsInput,
  InterpretingAgentResponse,
} from './agents.schema';
import { logger } from '../../utils/logger';
import { Prisma } from '@prisma/client';

/**
 * AgentsService - Service principal do modulo de agentes
 */
export class AgentsService {
  // ===========================================================================
  // Busca Projetos (Equivalente a function Buscar_Projetos)
  // ===========================================================================

  /**
   * Busca projetos baseado no resultado do InterpretingAgent
   * Equivalente a: function Buscar_Projetos do Xano
   */
  private static async searchProjects(
    interpretedQuery: InterpretingAgentResponse,
    question: string,
    companyId?: number
  ): Promise<{ result1: unknown[]; question: string }> {
    try {
      const query = interpretedQuery.query;

      // Base where com isolamento multi-tenant
      const baseWhere: Prisma.projectsWhereInput = {
        deleted_at: null,
        ...(companyId ? { company_id: BigInt(companyId) } : {}),
      };

      // Se nao ha query, retorna lista vazia
      if (!query || !query.field || !query.operator || !query.value) {
        const projects = await db.projects.findMany({
          where: baseWhere,
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
          take: 50,
        });
        return { result1: projects, question };
      }

      // Monta query dinamica baseada no campo
      // Nota: Por seguranca, usamos Prisma queries ao inves de SQL raw
      const field = query.field.toLowerCase();
      const operator = query.operator.toUpperCase();
      const value = query.value.replace(/^'%|%'$/g, '').replace(/%/g, '');

      // Define o filtro baseado no operador com base isolada por empresa
      let whereClause: Prisma.projectsWhereInput = { ...baseWhere };

      switch (operator) {
        case 'ILIKE':
          // Busca case-insensitive com contains
          whereClause = {
            ...whereClause,
            [field]: { contains: value, mode: 'insensitive' as const },
          };
          break;
        case '=':
          whereClause = {
            ...whereClause,
            [field]: value,
          };
          break;
        case '>':
          whereClause = {
            ...whereClause,
            [field]: { gt: parseFloat(value) || value },
          };
          break;
        case '<':
          whereClause = {
            ...whereClause,
            [field]: { lt: parseFloat(value) || value },
          };
          break;
        case '>=':
          whereClause = {
            ...whereClause,
            [field]: { gte: parseFloat(value) || value },
          };
          break;
        case '<=':
          whereClause = {
            ...whereClause,
            [field]: { lte: parseFloat(value) || value },
          };
          break;
        default:
          whereClause = {
            ...whereClause,
            [field]: { contains: value, mode: 'insensitive' as const },
          };
      }

      const projects = await db.projects.findMany({
        where: whereClause,
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

      return { result1: projects, question };
    } catch (error) {
      logger.error({ error }, 'Erro ao buscar projetos para agente');
      return { result1: [], question };
    }
  }

  // ===========================================================================
  // Busca Tarefas Atrasadas (Equivalente a function Buscar_tasks_atrasadas)
  // ===========================================================================

  /**
   * Busca tarefas atrasadas
   * Equivalente a: function Buscar_tasks_atrasadas do Xano
   */
  private static async searchDelayedTasks(
    _interpretedQuery: InterpretingAgentResponse,
    question: string
  ): Promise<{ result1: unknown[]; question: string }> {
    try {
      // Busca tarefas de sprints que ja terminaram mas nao estao concluidas
      // Equivalente a query SQL do Xano
      const delayedTasks = await db.$queryRaw`
        SELECT
          t.id AS task_id,
          t.description,
          t.weight,
          t.created_at,
          et.type AS equipment_type,
          s.title AS sprint_title,
          s.objective,
          to_timestamp(s.start_date / 1000) AS start_date,
          to_timestamp(s.end_date / 1000) AS end_date,
          sts.status AS task_status,
          tm.name AS team_name,
          u.name AS member_name
        FROM tasks t
        JOIN equipaments_types et ON t.equipaments_types_id = et.id
        JOIN sprints_tasks st ON st.tasks_id = t.id
        JOIN sprints s ON s.id = st.sprints_id
        JOIN sprints_tasks_statuses sts ON sts.id = st.sprints_tasks_statuses_id
        JOIN teams tm ON tm.id = st.teams_id
        LEFT JOIN teams_members tms ON tms.teams_id = tm.id
        LEFT JOIN users u ON u.id = tms.users_id
        WHERE to_timestamp(s.end_date / 1000)::date < CURRENT_DATE
          AND sts.status != 'Concluida'
          AND t.deleted_at IS NULL
          AND s.deleted_at IS NULL
        LIMIT 100
      `;

      return { result1: delayedTasks as unknown[], question };
    } catch (error) {
      logger.error({ error }, 'Erro ao buscar tarefas atrasadas');
      return { result1: [], question };
    }
  }

  // ===========================================================================
  // Busca Evolucao do Projeto (Equivalente a function Buscar_evolucao_projeto)
  // ===========================================================================

  /**
   * Busca estrutura hierarquica/evolucao dos projetos
   * Equivalente a: function Buscar_evolucao_projeto do Xano
   */
  private static async searchProjectEvolution(
    interpretedQuery: InterpretingAgentResponse,
    question: string
  ): Promise<{ result1: unknown[]; question: string }> {
    try {
      const query = interpretedQuery.query;

      // Monta filtros opcionais
      let projectFilter = '';
      if (query?.project_id) {
        projectFilter += ` AND p.id = ${parseInt(query.project_id)}`;
      }
      if (query?.project_name) {
        const name = query.project_name.replace(/^'%|%'$/g, '').replace(/%/g, '');
        projectFilter += ` AND p.name ILIKE '%${name}%'`;
      }
      if (query?.project_number) {
        const number = query.project_number.replace(/^'%|%'$/g, '').replace(/%/g, '');
        projectFilter += ` AND p.project_number ILIKE '%${number}%'`;
      }

      // Query da estrutura hierarquica
      const evolution = await db.$queryRawUnsafe(`
        SELECT
          p.id AS project_id,
          p.name AS project_name,
          f.id AS field_id,
          f.name AS field_name,
          s.id AS section_id,
          s.section_number AS section_number,
          r.id AS row_id,
          r.row_number AS row_number,
          rt.id AS row_tracker_id,
          rs.id AS row_stake_id,
          ss.status AS stake_status
        FROM projects p
        LEFT JOIN fields f ON f.projects_id = p.id AND f.deleted_at IS NULL
        LEFT JOIN sections s ON s.fields_id = f.id AND s.deleted_at IS NULL
        LEFT JOIN rows r ON r.sections_id = s.id AND r.deleted_at IS NULL
        LEFT JOIN rows_trackers rt ON rt.rows_id = r.id AND rt.deleted_at IS NULL
        LEFT JOIN rows_stakes rs ON rs.rows_trackers_id = rt.id AND rs.deleted_at IS NULL
        LEFT JOIN stakes_statuses ss ON ss.id = rs.stakes_statuses_id
        WHERE p.deleted_at IS NULL
        ${projectFilter}
        ORDER BY
          p.id,
          f.id,
          s.id,
          r.id,
          rt.id,
          rs.id
        LIMIT 500
      `);

      return { result1: evolution as unknown[], question };
    } catch (error) {
      logger.error({ error }, 'Erro ao buscar evolucao do projeto');
      return { result1: [], question };
    }
  }

  // ===========================================================================
  // Retorna Erro (Equivalente a function retornarErroAgent)
  // ===========================================================================

  /**
   * Retorna mensagem de erro padrao
   * Equivalente a: function retornarErroAgent do Xano
   */
  private static returnError(_question: string): { result1: string } {
    return {
      result1: 'Desculpe, nao consegui uma resposta para a sua pergunta no momento!',
    };
  }

  // ===========================================================================
  // Projects Agent Search (Endpoint Principal)
  // ===========================================================================

  /**
   * Busca de projetos via agente de IA
   * Equivalente a: query "projetcs/agent/search" verb=POST do Xano
   * Fluxo: InterpretingAgent -> Busca dados -> GeneratorResponseAgent
   */
  static async projectsAgentSearch(
    input: ProjectsAgentSearchInput,
    userId?: number,
    companyId?: number
  ): Promise<{
    InterpretingAgent1: {
      response?: {
        result?: {
          response?: string;
        };
      };
    };
  }> {
    try {
      // 1. Executa InterpretingAgent para interpretar a pergunta
      const interpretedResult = await InterpretingAgentService.interpret(input.question);

      logger.info({ interpretedResult }, 'InterpretingAgent result');

      // 2. Busca dados baseado no tipo de pergunta
      let searchResult: { result1: unknown; question?: string };

      if (interpretedResult.is_about_projects) {
        // Busca projetos com isolamento por empresa
        searchResult = await this.searchProjects(interpretedResult, input.question, companyId);
      } else if (interpretedResult.is_about_delayed_tasks) {
        // Busca tarefas atrasadas
        searchResult = await this.searchDelayedTasks(interpretedResult, input.question);
      } else if (interpretedResult.is_about_structure) {
        // Busca estrutura/evolucao do projeto
        searchResult = await this.searchProjectEvolution(interpretedResult, input.question);
      } else {
        // Retorna erro
        searchResult = this.returnError(input.question);
      }

      // 3. Gera resposta humanizada com GeneratorResponseAgent
      const generatedResponse = await ResponseGeneratorService.generate(searchResult);

      // 4. Registra log da interacao (try/catch como no Xano)
      try {
        if (userId) {
          await this.createAgentDashboardLog({
            user_id: userId,
            question: input.question,
            response: generatedResponse.response || '',
            intent_data: interpretedResult.requested_info || '',
            object_answer: interpretedResult,
          });
        }
      } catch (logError) {
        logger.warn({ logError }, 'Erro ao registrar log do agente');
      }

      // 5. Retorna resposta no formato esperado pelo frontend
      return {
        InterpretingAgent1: {
          response: {
            result: {
              response: generatedResponse.response,
            },
          },
        },
      };
    } catch (error) {
      logger.error({ error }, 'Erro no projectsAgentSearch');
      return {
        InterpretingAgent1: {
          response: {
            result: {
              response: 'Erro ao processar sua pergunta. Tente novamente.',
            },
          },
        },
      };
    }
  }

  // ===========================================================================
  // Relatorios Evolucao Agent
  // ===========================================================================

  /**
   * Agente de relatorios de evolucao
   * Equivalente a: query Agente_IA_tarefas verb=GET do Xano
   * Busca tarefas atrasadas e gera relatorio
   */
  static async relatoriosEvolucaoAgent(): Promise<{ saida?: string }> {
    try {
      // Busca tarefas atrasadas (status_id = 2 = Atrasada)
      const delayedTasks = await db.sprints_tasks.findMany({
        where: {
          sprints_tasks_statuses_id: BigInt(2),
          deleted_at: null,
        },
        include: {
          projects_backlogs: {
            select: {
              id: true,
              description: true,
              weight: true,
            },
          },
          sprints: {
            select: {
              title: true,
              start_date: true,
              end_date: true,
            },
          },
          teams: {
            select: {
              name: true,
            },
          },
          sprints_tasks_statuses: {
            select: {
              status: true,
            },
          },
        },
        take: 100,
      });

      // Formata dados para o agente
      const formattedTasks = delayedTasks.map((task) => ({
        task_id: task.projects_backlogs?.id?.toString(),
        description: task.projects_backlogs?.description,
        weight: task.projects_backlogs?.weight?.toString(),
        sprint_title: task.sprints?.title,
        team_name: task.teams?.name,
        status: task.sprints_tasks_statuses?.status,
      }));

      // Gera resposta humanizada
      const response = await ResponseGeneratorService.generate({
        question: 'Tarefas que estao no dia a dia',
        tasks: formattedTasks,
      });

      return {
        saida: response.response,
      };
    } catch (error) {
      logger.error({ error }, 'Erro no relatoriosEvolucaoAgent');
      return {
        saida: 'Erro ao gerar relatorio de tarefas.',
      };
    }
  }

  // ===========================================================================
  // Agent Dashboard Log CRUD
  // ===========================================================================

  /**
   * Cria log de interacao com agente
   * Equivalente a: function Register_agent_dashboard_log do Xano
   */
  static async createAgentDashboardLog(input: CreateAgentDashboardLogInput): Promise<boolean> {
    try {
      await db.agent_log_dashboard.create({
        data: {
          user_id: BigInt(input.user_id),
          question: input.question,
          response: input.response,
          intent_data: input.intent_data || null,
          object_answer: input.object_answer || null,
          created_at: new Date(),
        },
      });
      return true;
    } catch (error) {
      logger.error({ error }, 'Erro ao criar log do agente');
      return false;
    }
  }

  /**
   * Lista logs de interacao com agente
   */
  static async listAgentDashboardLogs(input: ListAgentDashboardLogsInput) {
    const { user_id, page = 1, per_page = 10 } = input;

    const where: Prisma.agent_log_dashboardWhereInput = {};
    if (user_id) {
      where.user_id = BigInt(user_id);
    }

    const [items, total] = await Promise.all([
      db.agent_log_dashboard.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * per_page,
        take: per_page,
      }),
      db.agent_log_dashboard.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        id: item.id,
        user_id: Number(item.user_id),
      })),
      curPage: page,
      perPage: per_page,
      itemsReceived: items.length,
      itemsTotal: total,
      pageTotal: Math.ceil(total / per_page),
    };
  }

  /**
   * Busca log por ID
   */
  static async getAgentDashboardLogById(id: string) {
    const log = await db.agent_log_dashboard.findUnique({
      where: { id },
    });

    if (!log) {
      return null;
    }

    return {
      ...log,
      user_id: Number(log.user_id),
    };
  }

  /**
   * Deleta log
   */
  static async deleteAgentDashboardLog(id: string): Promise<boolean> {
    try {
      await db.agent_log_dashboard.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default AgentsService;
