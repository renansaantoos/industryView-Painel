// =============================================================================
// INDUSTRYVIEW BACKEND - Executive Agent Service
// Agente especializado em visao executiva de projetos
// Tabelas: projects, sprints, sprints_tasks, fields, sections, rows, rows_trackers
// =============================================================================

import { claudeJsonCompletion, claudeTextCompletion } from '../../services/claude-client';
import { db } from '../../config/database';
import { logger } from '../../utils/logger';
import { Prisma } from '@prisma/client';

interface ExecutiveQuery {
  intent: string;
  filters: {
    project_name?: string;
    status?: string;
    responsible?: string;
    date_range?: { start?: string; end?: string };
  };
}

const EXECUTIVE_INTERPRET_PROMPT = `
Voce e um agente que interpreta perguntas executivas sobre projetos industriais.
Extraia a intencao e filtros da pergunta.

Intencoes possiveis:
- project_status: status geral de projetos
- delayed_projects: projetos atrasados
- project_progress: progresso/percentual de conclusao
- tracker_count: contagem de trackers instalados
- project_summary: resumo geral de um ou mais projetos
- team_overview: visao geral de equipes nos projetos

Retorne JSON com:
- intent: string (uma das intencoes acima)
- filters: objeto com filtros opcionais (project_name, status, responsible, date_range)
`;

const EXECUTIVE_RESPONSE_PROMPT = `
Voce e um assistente executivo para gestao de projetos industriais.
Gere respostas claras e profissionais em Markdown, com dados objetivos.
Use tabelas Markdown quando houver multiplos itens para comparar.
Formate datas no padrao brasileiro (DD/MM/YYYY).
Destaque numeros e percentuais importantes em **negrito**.
`;

/**
 * ExecutiveAgentService - Agente de visao executiva
 */
export class ExecutiveAgentService {
  static async process(message: string, companyId?: number): Promise<string> {
    try {
      // 1. Interpreta a pergunta
      const query = await claudeJsonCompletion<ExecutiveQuery>({
        system: EXECUTIVE_INTERPRET_PROMPT,
        userMessage: message,
        temperature: 0.3,
      });

      // 2. Busca dados relevantes
      const data = await this.fetchData(query, companyId);

      // 3. Gera resposta humanizada
      const response = await claudeTextCompletion({
        system: EXECUTIVE_RESPONSE_PROMPT,
        userMessage: `Pergunta: ${message}\n\nDados:\n${JSON.stringify(data, null, 2)}`,
        temperature: 0.7,
      });

      return response;
    } catch (error) {
      logger.error({ error }, 'Erro no ExecutiveAgent');
      return 'Desculpe, nao consegui processar sua pergunta sobre projetos. Tente novamente.';
    }
  }

  private static async fetchData(query: ExecutiveQuery, companyId?: number) {
    const baseWhere: Prisma.projectsWhereInput = {
      deleted_at: null,
      ...(companyId ? { company_id: BigInt(companyId) } : {}),
    };

    if (query.filters.project_name) {
      baseWhere.name = { contains: query.filters.project_name, mode: 'insensitive' };
    }
    if (query.filters.responsible) {
      baseWhere.responsible = { contains: query.filters.responsible, mode: 'insensitive' };
    }

    switch (query.intent) {
      case 'tracker_count': {
        const projects = await db.projects.findMany({
          where: baseWhere,
          select: {
            id: true,
            name: true,
            fields: {
              where: { deleted_at: null },
              select: {
                sections: {
                  where: { deleted_at: null },
                  select: {
                    rows: {
                      where: { deleted_at: null },
                      select: {
                        rows_trackers: {
                          where: { deleted_at: null },
                          select: { id: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          take: 20,
        });

        return projects.map((p) => ({
          project: p.name,
          trackers_count: p.fields.reduce(
            (acc, f) => acc + f.sections.reduce(
              (acc2, s) => acc2 + s.rows.reduce(
                (acc3, r) => acc3 + r.rows_trackers.length, 0
              ), 0
            ), 0
          ),
        }));
      }

      case 'delayed_projects': {
        const projects = await db.projects.findMany({
          where: { ...baseWhere, completion_percentage: { lt: 100 } },
          select: {
            id: true,
            name: true,
            responsible: true,
            completion_percentage: true,
            start_date: true,
            city: true,
            state: true,
          },
          orderBy: { completion_percentage: 'asc' },
          take: 20,
        });
        return projects.map((p) => ({
          ...p,
          id: Number(p.id),
          completion_percentage: p.completion_percentage ? Number(p.completion_percentage) : 0,
        }));
      }

      default: {
        const projects = await db.projects.findMany({
          where: baseWhere,
          select: {
            id: true,
            name: true,
            responsible: true,
            completion_percentage: true,
            start_date: true,
            city: true,
            state: true,
            project_creation_date: true,
          },
          take: 50,
        });
        return projects.map((p) => ({
          ...p,
          id: Number(p.id),
          completion_percentage: p.completion_percentage ? Number(p.completion_percentage) : 0,
        }));
      }
    }
  }
}

export default ExecutiveAgentService;
