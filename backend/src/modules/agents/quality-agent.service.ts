// =============================================================================
// INDUSTRYVIEW BACKEND - Quality Agent Service
// Agente especializado em qualidade e conformidade
// Tabelas: non_conformances, checklist_responses, golden_rules, task_golden_rules
// =============================================================================

import { claudeJsonCompletion, claudeTextCompletion } from '../../services/claude-client';
import { db } from '../../config/database';
import { logger } from '../../utils/logger';

interface QualityQuery {
  intent: string;
  filters: {
    project_name?: string;
    team_name?: string;
    date_range?: { start?: string; end?: string };
    severity?: string;
  };
}

const QUALITY_INTERPRET_PROMPT = `
Voce e um agente que interpreta perguntas sobre qualidade e conformidade em projetos industriais.
Extraia a intencao e filtros da pergunta.

Intencoes possiveis:
- non_conformances: nao-conformidades (registros, padroes, tendencias)
- checklists: respostas de checklists, compliance
- golden_rules: regras de ouro e violacoes
- quality_summary: resumo geral de qualidade

Retorne JSON com:
- intent: string (uma das intencoes acima)
- filters: objeto com filtros opcionais (project_name, team_name, date_range, severity)
`;

const QUALITY_RESPONSE_PROMPT = `
Voce e um especialista em qualidade e conformidade para projetos industriais.
Gere respostas claras em Markdown sobre indicadores de qualidade.
Use tabelas Markdown quando houver multiplos registros.
Formate datas no padrao brasileiro (DD/MM/YYYY).
Destaque nao-conformidades criticas e tendencias preocupantes.
Sugira acoes corretivas quando aplicavel.
`;

/**
 * QualityAgentService - Agente de qualidade
 */
export class QualityAgentService {
  static async process(message: string, companyId?: number): Promise<string> {
    try {
      const query = await claudeJsonCompletion<QualityQuery>({
        system: QUALITY_INTERPRET_PROMPT,
        userMessage: message,
        temperature: 0.3,
      });

      const data = await this.fetchData(query, companyId);

      const response = await claudeTextCompletion({
        system: QUALITY_RESPONSE_PROMPT,
        userMessage: `Pergunta: ${message}\n\nDados:\n${JSON.stringify(data, null, 2)}`,
        temperature: 0.7,
      });

      return response;
    } catch (error) {
      logger.error({ error }, 'Erro no QualityAgent');
      return 'Desculpe, nao consegui processar sua pergunta sobre qualidade. Tente novamente.';
    }
  }

  private static projectCompanyFilter(companyId?: number) {
    return companyId
      ? { projects: { company_id: BigInt(companyId), deleted_at: null } }
      : {};
  }

  private static async fetchData(query: QualityQuery, companyId?: number) {
    const pFilter = this.projectCompanyFilter(companyId);

    switch (query.intent) {
      case 'non_conformances': {
        const ncs = await db.non_conformances.findMany({
          where: { ...pFilter },
          include: { projects: { select: { name: true } } },
          orderBy: { created_at: 'desc' },
          take: 50,
        });
        return {
          type: 'non_conformances',
          count: ncs.length,
          data: ncs.map((n) => ({
            id: Number(n.id),
            nc_number: n.nc_number,
            title: n.title,
            severity: n.severity,
            status: n.status,
            category: n.category,
            deadline: n.deadline,
            project: n.projects?.name,
          })),
        };
      }

      case 'checklists': {
        const responses = await db.checklist_responses.findMany({
          where: {},
          include: {
            checklist_template: { select: { name: true } },
            responded_by: { select: { name: true } },
          },
          orderBy: { response_date: 'desc' },
          take: 50,
        });
        return {
          type: 'checklists',
          count: responses.length,
          data: responses.map((r) => ({
            id: Number(r.id),
            template: r.checklist_template?.name,
            responded_by: r.responded_by?.name,
            response_date: r.response_date,
            status: r.status,
            overall_result: r.overall_result,
          })),
        };
      }

      case 'golden_rules': {
        const companyGrFilter = companyId
          ? { company_id: BigInt(companyId), deleted_at: null }
          : { deleted_at: null };

        const rules = await db.golden_rules.findMany({
          where: companyGrFilter,
          include: {
            _count: {
              select: { task_golden_rules: true },
            },
          },
          take: 50,
        });
        return {
          type: 'golden_rules',
          count: rules.length,
          data: rules.map((r) => ({
            id: Number(r.id),
            title: r.title,
            description: r.description,
            severity: r.severity,
            is_active: r.is_active,
            linked_tasks: r._count.task_golden_rules,
          })),
        };
      }

      default: {
        // Quality summary
        const [ncCount, checklistCount, goldenRulesCount] = await Promise.all([
          db.non_conformances.count({ where: { ...pFilter } }),
          db.checklist_responses.count(),
          db.golden_rules.count({
            where: companyId
              ? { company_id: BigInt(companyId), deleted_at: null }
              : { deleted_at: null },
          }),
        ]);

        return {
          type: 'quality_summary',
          totals: {
            non_conformances: ncCount,
            checklist_responses: checklistCount,
            golden_rules: goldenRulesCount,
          },
        };
      }
    }
  }
}

export default QualityAgentService;
