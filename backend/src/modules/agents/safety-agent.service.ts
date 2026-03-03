// =============================================================================
// INDUSTRYVIEW BACKEND - Safety Agent Service (SSMA)
// Agente especializado em seguranca do trabalho
// Tabelas: safety_incidents, worker_trainings, dds_records, work_permits,
//          ppe_deliveries, worker_health_records, environmental_licenses
// =============================================================================

import { claudeJsonCompletion, claudeTextCompletion } from '../../services/claude-client';
import { db } from '../../config/database';
import { logger } from '../../utils/logger';

interface SafetyQuery {
  intent: string;
  filters: {
    date_range?: { start?: string; end?: string };
    severity?: string;
    project_name?: string;
    employee_name?: string;
  };
}

const SAFETY_INTERPRET_PROMPT = `
Voce e um agente que interpreta perguntas sobre seguranca do trabalho (SSMA) em projetos industriais.
Extraia a intencao e filtros da pergunta.

Intencoes possiveis:
- incidents: incidentes de seguranca (acidentes, quase-acidentes)
- trainings: treinamentos de seguranca (vencidos, a vencer, realizados)
- dds: dialogos diarios de seguranca
- work_permits: permissoes de trabalho (PT)
- ppe: equipamentos de protecao individual (EPIs)
- health: registros de saude ocupacional (ASOs, exames)
- environmental: licencas ambientais
- safety_summary: resumo geral de seguranca

Retorne JSON com:
- intent: string (uma das intencoes acima)
- filters: objeto com filtros opcionais (date_range, severity, project_name, employee_name)
`;

const SAFETY_RESPONSE_PROMPT = `
Voce e um especialista em seguranca do trabalho (SSMA) para projetos industriais.
Gere respostas claras e profissionais em Markdown.
Destaque itens criticos ou urgentes com alertas.
Use tabelas Markdown quando houver multiplos registros.
Formate datas no padrao brasileiro (DD/MM/YYYY).
Priorize informacoes que requerem acao imediata.
`;

/**
 * SafetyAgentService - Agente de seguranca do trabalho
 */
export class SafetyAgentService {
  static async process(message: string, companyId?: number): Promise<string> {
    try {
      const query = await claudeJsonCompletion<SafetyQuery>({
        system: SAFETY_INTERPRET_PROMPT,
        userMessage: message,
        temperature: 0.3,
      });

      const data = await this.fetchData(query, companyId);

      const response = await claudeTextCompletion({
        system: SAFETY_RESPONSE_PROMPT,
        userMessage: `Pergunta: ${message}\n\nDados:\n${JSON.stringify(data, null, 2)}`,
        temperature: 0.7,
      });

      return response;
    } catch (error) {
      logger.error({ error }, 'Erro no SafetyAgent');
      return 'Desculpe, nao consegui processar sua pergunta sobre seguranca. Tente novamente.';
    }
  }

  /** Build project filter: filter through projects.company_id */
  private static projectCompanyFilter(companyId?: number) {
    return companyId
      ? { projects: { company_id: BigInt(companyId), deleted_at: null } }
      : {};
  }

  private static async fetchData(query: SafetyQuery, companyId?: number) {
    const pFilter = this.projectCompanyFilter(companyId);

    switch (query.intent) {
      case 'incidents': {
        const incidents = await db.safety_incidents.findMany({
          where: { ...pFilter },
          include: { projects: { select: { name: true } } },
          orderBy: { incident_date: 'desc' },
          take: 50,
        });
        return { type: 'incidents', count: incidents.length, data: incidents.map((i) => ({ id: Number(i.id), incident_date: i.incident_date, severity: i.severity, classification: i.classification, category: i.category, description: i.description, status: i.status, project: i.projects?.name })) };
      }

      case 'trainings': {
        const trainings = await db.worker_trainings.findMany({
          where: {},
          include: { user: { select: { name: true } }, training_type: { select: { name: true } } },
          orderBy: { expiry_date: 'asc' },
          take: 50,
        });
        return { type: 'trainings', count: trainings.length, data: trainings.map((t) => ({ id: Number(t.id), training_date: t.training_date, expiry_date: t.expiry_date, status: t.status, employee: t.user?.name, training: t.training_type?.name, hours: t.workload_hours })) };
      }

      case 'dds': {
        const dds = await db.dds_records.findMany({
          where: { ...pFilter },
          include: { projects: { select: { name: true } }, conducted_by: { select: { name: true } } },
          orderBy: { dds_date: 'desc' },
          take: 50,
        });
        return { type: 'dds', count: dds.length, data: dds.map((d) => ({ id: Number(d.id), date: d.dds_date, topic: d.topic, conductor: d.conducted_by?.name, participants: d.participant_count, project: d.projects?.name })) };
      }

      case 'work_permits': {
        const permits = await db.work_permits.findMany({
          where: { ...pFilter },
          include: { projects: { select: { name: true } } },
          orderBy: { created_at: 'desc' },
          take: 50,
        });
        return { type: 'work_permits', count: permits.length, data: permits.map((p) => ({ id: Number(p.id), permit_number: p.permit_number, permit_type: p.permit_type, status: p.status, valid_from: p.valid_from, valid_until: p.valid_until, project: p.projects?.name })) };
      }

      case 'ppe': {
        const ppe = await db.ppe_deliveries.findMany({
          where: {},
          include: { user: { select: { name: true } }, ppe_type: { select: { name: true } } },
          orderBy: { delivery_date: 'desc' },
          take: 50,
        });
        return { type: 'ppe', count: ppe.length, data: ppe.map((p) => ({ id: Number(p.id), delivery_date: p.delivery_date, quantity: p.quantity, employee: p.user?.name, ppe_type: p.ppe_type?.name })) };
      }

      case 'health': {
        const health = await db.worker_health_records.findMany({
          where: {},
          include: { user: { select: { name: true } } },
          orderBy: { exam_date: 'desc' },
          take: 50,
        });
        return { type: 'health', count: health.length, data: health.map((h) => ({ id: Number(h.id), exam_type: h.exam_type, exam_date: h.exam_date, expiry_date: h.expiry_date, result: h.result, employee: h.user?.name })) };
      }

      case 'environmental': {
        const envFilter = companyId ? { company_id: BigInt(companyId), deleted_at: null } : { deleted_at: null };
        const licenses = await db.environmental_licenses.findMany({
          where: envFilter,
          include: { projects: { select: { name: true } } },
          orderBy: { expiry_date: 'asc' },
          take: 50,
        });
        return { type: 'environmental', count: licenses.length, data: licenses.map((l) => ({ id: Number(l.id), license_type: l.license_type, license_number: l.license_number, status: l.status, expiry_date: l.expiry_date, project: l.projects?.name })) };
      }

      default: {
        // Safety summary
        const [incidents, trainings, dds, permits] = await Promise.all([
          db.safety_incidents.count({ where: { ...pFilter } }),
          db.worker_trainings.count(),
          db.dds_records.count({ where: { ...pFilter } }),
          db.work_permits.count({ where: { ...pFilter } }),
        ]);
        return {
          type: 'safety_summary',
          totals: { incidents, trainings, dds, work_permits: permits },
        };
      }
    }
  }
}

export default SafetyAgentService;
