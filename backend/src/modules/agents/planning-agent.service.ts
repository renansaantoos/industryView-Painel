// =============================================================================
// INDUSTRYVIEW BACKEND - Planning Agent Service
// Agente especializado em planejamento e cronograma
// Tabelas: projects_backlogs, sprints_tasks, sprints, schedule_baselines
// =============================================================================

import { claudeJsonCompletion, claudeTextCompletion } from '../../services/claude-client';
import { db } from '../../config/database';
import { logger } from '../../utils/logger';
import { Prisma } from '@prisma/client';

interface PlanningQuery {
  intent: string;
  filters: {
    project_name?: string;
    sprint_title?: string;
    status?: string;
  };
}

const PLANNING_INTERPRET_PROMPT = `
Voce e um agente que interpreta perguntas sobre planejamento e cronograma de projetos industriais.
Extraia a intencao e filtros da pergunta.

Intencoes possiveis:
- sprint_progress: progresso da sprint atual ou especifica
- delayed_tasks: tarefas atrasadas ou em risco
- backlog_status: status do backlog (itens pendentes, em progresso, concluidos)
- schedule_forecast: previsao de conclusao
- critical_path: tarefas criticas / caminho critico
- planning_summary: resumo geral do planejamento

Retorne JSON com:
- intent: string (uma das intencoes acima)
- filters: objeto com filtros opcionais (project_name, sprint_title, status)
`;

const PLANNING_RESPONSE_PROMPT = `
Voce e um especialista em planejamento de projetos industriais.
Gere respostas claras em Markdown focadas em dados de cronograma e progresso.
Use tabelas Markdown quando houver multiplas tarefas ou sprints.
Formate datas no padrao brasileiro (DD/MM/YYYY).
Destaque atrasos e riscos em **negrito**.
Sugira acoes quando identificar problemas.
`;

/**
 * PlanningAgentService - Agente de planejamento
 */
export class PlanningAgentService {
  static async process(message: string, companyId?: number): Promise<string> {
    try {
      const query = await claudeJsonCompletion<PlanningQuery>({
        system: PLANNING_INTERPRET_PROMPT,
        userMessage: message,
        temperature: 0.3,
      });

      const data = await this.fetchData(query, companyId);

      const response = await claudeTextCompletion({
        system: PLANNING_RESPONSE_PROMPT,
        userMessage: `Pergunta: ${message}\n\nDados:\n${JSON.stringify(data, null, 2)}`,
        temperature: 0.7,
      });

      return response;
    } catch (error) {
      logger.error({ error }, 'Erro no PlanningAgent');
      return 'Desculpe, nao consegui processar sua pergunta sobre planejamento. Tente novamente.';
    }
  }

  private static async fetchData(query: PlanningQuery, companyId?: number) {
    const companyFilter = companyId ? { company_id: BigInt(companyId) } : {};

    switch (query.intent) {
      case 'sprint_progress': {
        const sprints = await db.sprints.findMany({
          where: {
            deleted_at: null,
            projects: { ...companyFilter, deleted_at: null } as Prisma.projectsWhereInput,
          },
          include: {
            projects: { select: { name: true } },
            sprints_tasks: {
              where: { deleted_at: null },
              include: {
                sprints_tasks_statuses: { select: { status: true } },
                projects_backlogs: { select: { description: true } },
              },
            },
          },
          orderBy: { start_date: 'desc' },
          take: 10,
        });

        return sprints.map((s) => ({
          id: Number(s.id),
          title: s.title,
          project: s.projects?.name,
          progress_percentage: s.progress_percentage ? Number(s.progress_percentage) : 0,
          start_date: s.start_date,
          end_date: s.end_date,
          total_tasks: s.sprints_tasks.length,
          completed: s.sprints_tasks.filter((t) => t.sprints_tasks_statuses?.status === 'Concluida').length,
          in_progress: s.sprints_tasks.filter((t) => t.sprints_tasks_statuses?.status === 'Em Progresso').length,
          delayed: s.sprints_tasks.filter((t) => t.sprints_tasks_statuses?.status === 'Atrasada').length,
        }));
      }

      case 'delayed_tasks': {
        const tasks = await db.sprints_tasks.findMany({
          where: {
            deleted_at: null,
            sprints_tasks_statuses: { status: 'Atrasada' },
            sprints: {
              deleted_at: null,
              projects: { ...companyFilter, deleted_at: null } as Prisma.projectsWhereInput,
            },
          },
          include: {
            projects_backlogs: { select: { description: true, weight: true } },
            sprints: { select: { title: true, end_date: true, projects: { select: { name: true } } } },
            teams: { select: { name: true } },
            sprints_tasks_statuses: { select: { status: true } },
          },
          take: 50,
        });

        return tasks.map((t) => ({
          id: Number(t.id),
          description: t.projects_backlogs?.description,
          sprint: t.sprints?.title,
          project: t.sprints?.projects?.name,
          team: t.teams?.name,
          status: t.sprints_tasks_statuses?.status,
          sprint_end_date: t.sprints?.end_date,
        }));
      }

      case 'backlog_status': {
        const backlogs = await db.projects_backlogs.findMany({
          where: {
            deleted_at: null,
            projects: { ...companyFilter, deleted_at: null } as Prisma.projectsWhereInput,
          },
          include: {
            projects: { select: { name: true } },
            projects_backlogs_statuses: { select: { status: true } },
          },
          take: 100,
        });

        const statusCounts: Record<string, number> = {};
        backlogs.forEach((b) => {
          const status = b.projects_backlogs_statuses?.status || 'Sem Status';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        return { total: backlogs.length, by_status: statusCounts };
      }

      default: {
        // Planning summary
        const [sprintCount, taskCount, delayedCount] = await Promise.all([
          db.sprints.count({
            where: {
              deleted_at: null,
              projects: { ...companyFilter, deleted_at: null } as Prisma.projectsWhereInput,
            },
          }),
          db.sprints_tasks.count({
            where: {
              deleted_at: null,
              sprints: {
                deleted_at: null,
                projects: { ...companyFilter, deleted_at: null } as Prisma.projectsWhereInput,
              },
            },
          }),
          db.sprints_tasks.count({
            where: {
              deleted_at: null,
              sprints_tasks_statuses: { status: 'Atrasada' },
              sprints: {
                deleted_at: null,
                projects: { ...companyFilter, deleted_at: null } as Prisma.projectsWhereInput,
              },
            },
          }),
        ]);

        return {
          type: 'planning_summary',
          totals: { sprints: sprintCount, tasks: taskCount, delayed: delayedCount },
        };
      }
    }
  }
}

export default PlanningAgentService;
