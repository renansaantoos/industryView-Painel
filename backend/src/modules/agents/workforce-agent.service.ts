// =============================================================================
// INDUSTRYVIEW BACKEND - Workforce Agent Service
// Agente especializado em gestao de equipes e efetivo
// Tabelas: teams, teams_members, workforce_daily_log
// =============================================================================

import { claudeJsonCompletion, claudeTextCompletion } from '../../services/claude-client';
import { db } from '../../config/database';
import { logger } from '../../utils/logger';
import { Prisma } from '@prisma/client';

interface WorkforceQuery {
  intent: string;
  filters: {
    team_name?: string;
    project_name?: string;
    employee_name?: string;
    date?: string;
  };
}

const WORKFORCE_INTERPRET_PROMPT = `
Voce e um agente que interpreta perguntas sobre gestao de equipes e efetivo em projetos industriais.
Extraia a intencao e filtros da pergunta.

Intencoes possiveis:
- team_overview: visao geral de equipes (membros, tamanho)
- team_workload: carga de trabalho por equipe (tarefas atribuidas)
- employee_allocation: alocacao de funcionarios em projetos
- daily_headcount: efetivo diario / controle de presenca
- workforce_summary: resumo geral de efetivo

Retorne JSON com:
- intent: string (uma das intencoes acima)
- filters: objeto com filtros opcionais (team_name, project_name, employee_name, date)
`;

const WORKFORCE_RESPONSE_PROMPT = `
Voce e um especialista em gestao de equipes para projetos industriais.
Gere respostas claras em Markdown sobre efetivo e alocacao de pessoal.
Use tabelas Markdown para listar equipes ou funcionarios.
Formate datas no padrao brasileiro (DD/MM/YYYY).
Destaque equipes sobrecarregadas ou com deficit de pessoal.
`;

/**
 * WorkforceAgentService - Agente de gestao de equipes
 */
export class WorkforceAgentService {
  static async process(message: string, companyId?: number): Promise<string> {
    try {
      const query = await claudeJsonCompletion<WorkforceQuery>({
        system: WORKFORCE_INTERPRET_PROMPT,
        userMessage: message,
        temperature: 0.3,
      });

      const data = await this.fetchData(query, companyId);

      const response = await claudeTextCompletion({
        system: WORKFORCE_RESPONSE_PROMPT,
        userMessage: `Pergunta: ${message}\n\nDados:\n${JSON.stringify(data, null, 2)}`,
        temperature: 0.7,
      });

      return response;
    } catch (error) {
      logger.error({ error }, 'Erro no WorkforceAgent');
      return 'Desculpe, nao consegui processar sua pergunta sobre equipes. Tente novamente.';
    }
  }

  private static async fetchData(query: WorkforceQuery, companyId?: number) {
    const projectFilter = companyId
      ? { projects: { company_id: BigInt(companyId), deleted_at: null } as Prisma.projectsWhereInput }
      : {};

    switch (query.intent) {
      case 'team_overview':
      case 'team_workload': {
        const teams = await db.teams.findMany({
          where: {
            deleted_at: null,
            ...projectFilter,
          },
          include: {
            teams_members: {
              where: { deleted_at: null },
              include: {
                users: { select: { name: true, email: true } },
              },
            },
            projects: { select: { name: true } },
            sprints_tasks: {
              where: { deleted_at: null },
              include: {
                sprints_tasks_statuses: { select: { status: true } },
              },
            },
          },
          take: 30,
        });

        return teams.map((t) => ({
          id: Number(t.id),
          name: t.name,
          project: t.projects?.name,
          members_count: t.teams_members.length,
          members: t.teams_members.map((m) => m.users?.name).filter(Boolean),
          total_tasks: t.sprints_tasks.length,
          pending_tasks: t.sprints_tasks.filter((st) => st.sprints_tasks_statuses?.status !== 'Concluida').length,
          completed_tasks: t.sprints_tasks.filter((st) => st.sprints_tasks_statuses?.status === 'Concluida').length,
        }));
      }

      case 'daily_headcount': {
        const logs = await db.workforce_daily_log.findMany({
          where: {},
          include: {
            worker: { select: { name: true } },
            teams: { select: { name: true } },
            projects: { select: { name: true } },
          },
          orderBy: { log_date: 'desc' },
          take: 30,
        });

        return {
          type: 'daily_headcount',
          records: logs.map((l) => ({
            id: Number(l.id),
            date: l.log_date,
            worker: l.worker?.name,
            team: l.teams?.name,
            project: l.projects?.name,
            status: l.status,
            check_in: l.check_in,
            check_out: l.check_out,
          })),
        };
      }

      default: {
        // Workforce summary
        const [teamCount, memberCount] = await Promise.all([
          db.teams.count({
            where: { deleted_at: null, ...projectFilter },
          }),
          db.teams_members.count({
            where: {
              deleted_at: null,
              teams: { deleted_at: null, ...projectFilter },
            },
          }),
        ]);

        return {
          type: 'workforce_summary',
          totals: { teams: teamCount, members: memberCount },
        };
      }
    }
  }
}

export default WorkforceAgentService;
