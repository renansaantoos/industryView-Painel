// =============================================================================
// INDUSTRYVIEW BACKEND - Quality Module Service
// Service do modulo de qualidade
// Abrange: non_conformances, documents (GED), checklists, golden_rules
// =============================================================================
// Campos reais non_conformances: projects_id(req), nc_number, title, description,
//   origin(req,varchar30), severity(enum:menor/maior/critica), category(req,varchar30),
//   location_description, deadline(Date), immediate_action, root_cause_analysis,
//   corrective_action_plan, preventive_action, opened_by_user_id(req),
//   responsible_user_id, closed_by_user_id, closed_at
// nc_status: aberta, em_analise, em_tratamento, verificacao, encerrada
// non_conformance_attachments: file_url(req), description, uploaded_by_user_id(req)
// documents: document_number(req), title, document_type(enum), category(req),
//   revision, revision_date, status(enum), file_url, valid_until, requires_acknowledgment,
//   description, created_by_user_id(req), approved_by_user_id, approved_at, company_id(req)
//   Relacoes: created_by, approved_by, acknowledgments, task_documents
// document_status: em_elaboracao, em_revisao, aprovado, obsoleto
// task_documents: documents_id, tasks_template_id, projects_backlogs_id - relacao: document
// checklist_templates: name, description, checklist_type, company_id(req) - sem is_safety
//   Relacoes: items, responses
// checklist_template_items: checklist_templates_id, item_order, description,
//   response_type(enum:sim_nao/conforme_nao_conforme/nota_1_5/texto), is_critical
//   Sem: options, category, item_type, required, order_index
// checklist_responses: checklist_templates_id, response_date(req,Date),
//   responded_by_user_id(req), status, overall_result, projects_backlogs_id, sprints_tasks_id
//   Sem: tasks_id, location, notes - Relacoes: checklist_template, items, responded_by
// checklist_response_items: response_value, observations, evidence_image
// golden_rules: title, description, icon_url, sort_order, company_id(req) - sem active/category
//   Relacao: task_golden_rules (via task_golden_rules)
// task_golden_rules: tasks_template_id(req), golden_rules_id(req) - relacao: golden_rule
// =============================================================================

import { db } from '../../config/database';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { buildPaginationResponse } from '../../utils/helpers';
import {
  ListNonConformancesInput,
  CreateNonConformanceInput,
  UpdateNonConformanceInput,
  CloseNonConformanceInput,
  GetNcStatisticsInput,
  CreateNcAttachmentInput,
  ListDocumentsInput,
  CreateDocumentInput,
  UpdateDocumentInput,
  ApproveDocumentInput,
  ListTaskDocumentsInput,
  CreateTaskDocumentInput,
  ListChecklistTemplatesInput,
  CreateChecklistTemplateInput,
  UpdateChecklistTemplateInput,
  ListChecklistResponsesInput,
  CreateChecklistResponseInput,
  ListGoldenRulesInput,
  CreateGoldenRuleInput,
  UpdateGoldenRuleInput,
  ListTaskGoldenRulesInput,
  CreateTaskGoldenRuleInput,
  ListTaskChecklistsInput,
  CreateTaskChecklistInput,
} from './quality.schema';

// Suprime avisos de tipagem de parametros de agrupamento do Prisma
type GroupByResult = { status?: string; severity?: string; _count: { id: number } };

/**
 * Gera numero de RNC no formato RNC-YYYY-NNN
 * Exemplo: RNC-2024-001
 */
async function generateNcNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `RNC-${year}-`;

  const lastNc = await db.non_conformances.findFirst({
    where: {
      nc_number: {
        startsWith: prefix,
      },
    },
    orderBy: { nc_number: 'desc' },
    select: { nc_number: true },
  });

  let sequence = 1;
  if (lastNc?.nc_number) {
    const parts = lastNc.nc_number.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      sequence = lastSeq + 1;
    }
  }

  return `${prefix}${String(sequence).padStart(3, '0')}`;
}

/**
 * QualityService - Service do modulo de qualidade
 */
export class QualityService {
  // ===========================================================================
  // Non Conformances
  // ===========================================================================

  /**
   * Lista nao conformidades com paginacao e filtros
   * Relacoes: projects, opened_by, responsible_user, attachments
   */
  static async listNonConformances(input: ListNonConformancesInput) {
    const { projects_id, status, severity, page, per_page } = input;
    const company_id = (input as any).company_id;
    const responsible_user_id = (input as any).responsible_user_id as number | undefined;
    const involved_user_id = (input as any).involved_user_id as number | undefined;
    const skip = (page - 1) * per_page;

    const whereClause: any = {};

    if (projects_id) {
      whereClause.projects_id = BigInt(projects_id);
    }

    // Isolamento multi-tenant via projects.company_id
    if (company_id && !projects_id) {
      whereClause.projects = { company_id: BigInt(company_id) };
    }

    if (status) {
      whereClause.status = status;
    }
    if (severity) {
      whereClause.severity = severity;
    }
    if (responsible_user_id) {
      whereClause.responsible_user_id = BigInt(responsible_user_id);
    }
    // involved_user_id filtra por opened_by_user_id (usuario que abriu a NC)
    if (involved_user_id) {
      whereClause.opened_by_user_id = BigInt(involved_user_id);
    }

    const [items, total] = await Promise.all([
      db.non_conformances.findMany({
        where: whereClause,
        include: {
          projects: { select: { id: true, name: true } },
          opened_by: { select: { id: true, name: true } },
          responsible_user: { select: { id: true, name: true } },
          attachments: {
            select: { id: true, file_url: true, description: true },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: per_page,
      }),
      db.non_conformances.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  /**
   * Busca nao conformidade por ID
   */
  static async getNcById(id: number) {
    const nc = await db.non_conformances.findFirst({
      where: { id: BigInt(id) },
      include: {
        projects: { select: { id: true, name: true } },
        opened_by: { select: { id: true, name: true } },
        responsible_user: { select: { id: true, name: true } },
        closed_by: { select: { id: true, name: true } },
        attachments: true,
      },
    });

    if (!nc) {
      throw new NotFoundError('Nao conformidade nao encontrada.');
    }

    return nc;
  }

  /**
   * Cria nao conformidade com numero automatico no formato RNC-YYYY-NNN
   * projects_id, opened_by_user_id, origin, severity, category sao obrigatorios
   */
  static async createNc(input: CreateNonConformanceInput) {
    const nc_number = await generateNcNumber();

    return db.non_conformances.create({
      data: {
        nc_number,
        projects_id: BigInt(input.projects_id),
        title: input.title,
        description: input.description,
        origin: input.origin,
        severity: input.severity as any,
        category: input.category,
        location_description: input.location_description ?? null,
        immediate_action: input.immediate_action ?? null,
        deadline: input.deadline ? new Date(input.deadline) : null,
        opened_by_user_id: BigInt(input.opened_by_user_id),
        responsible_user_id: input.responsible_user_id ? BigInt(input.responsible_user_id) : null,
        status: 'aberta',
      },
    });
  }

  /**
   * Atualiza nao conformidade
   * Nao conformidades encerradas nao podem ser editadas
   */
  static async updateNc(id: number, input: Partial<UpdateNonConformanceInput>) {
    const nc = await db.non_conformances.findFirst({
      where: { id: BigInt(id) },
      select: { id: true, status: true },
    });

    if (!nc) {
      throw new NotFoundError('Nao conformidade nao encontrada.');
    }

    if (nc.status === 'encerrada') {
      throw new BadRequestError('Nao conformidades encerradas nao podem ser editadas.');
    }

    return db.non_conformances.update({
      where: { id: BigInt(id) },
      data: {
        title: input.title,
        description: input.description,
        origin: input.origin,
        category: input.category,
        severity: input.severity as any,
        status: input.status as any,
        location_description: input.location_description,
        responsible_user_id: input.responsible_user_id ? BigInt(input.responsible_user_id) : undefined,
        deadline: input.deadline ? new Date(input.deadline) : undefined,
        immediate_action: input.immediate_action,
        root_cause_analysis: input.root_cause_analysis,
        corrective_action_plan: input.corrective_action_plan,
        preventive_action: input.preventive_action,
      },
    });
  }

  /**
   * Encerra nao conformidade
   * Requer analise de causa raiz e plano de acao corretiva
   */
  static async closeNc(id: number, input: CloseNonConformanceInput) {
    const nc = await db.non_conformances.findFirst({
      where: { id: BigInt(id) },
      select: { id: true, status: true },
    });

    if (!nc) {
      throw new NotFoundError('Nao conformidade nao encontrada.');
    }

    if (nc.status === 'encerrada') {
      throw new BadRequestError('Esta nao conformidade ja esta encerrada.');
    }

    return db.non_conformances.update({
      where: { id: BigInt(id) },
      data: {
        status: 'encerrada' as any,
        root_cause_analysis: input.root_cause_analysis,
        corrective_action_plan: input.corrective_action_plan,
        preventive_action: input.preventive_action ?? null,
        closed_by_user_id: input.closed_by_user_id ? BigInt(input.closed_by_user_id) : null,
        closed_at: new Date(),
      },
    });
  }

  /**
   * Retorna estatisticas de nao conformidades
   */
  static async getNcStatistics(input: GetNcStatisticsInput) {
    const company_id = (input as any).company_id;
    const whereClause: any = {};

    if (input.projects_id) {
      whereClause.projects_id = BigInt(input.projects_id);
    }

    // Isolamento multi-tenant via projects.company_id
    if (company_id && !input.projects_id) {
      whereClause.projects = { company_id: BigInt(company_id) };
    }

    if (input.initial_date) {
      whereClause.created_at = {
        ...whereClause.created_at,
        gte: new Date(input.initial_date),
      };
    }
    if (input.final_date) {
      whereClause.created_at = {
        ...whereClause.created_at,
        lte: new Date(input.final_date),
      };
    }

    const [total, byStatus, bySeverity, allNcs] = await Promise.all([
      db.non_conformances.count({ where: whereClause }),
      db.non_conformances.groupBy({
        by: ['status'],
        where: whereClause,
        _count: { id: true },
      }),
      db.non_conformances.groupBy({
        by: ['severity'],
        where: whereClause,
        _count: { id: true },
      }),
      db.non_conformances.findMany({
        where: whereClause,
        select: { category: true, origin: true },
      }),
    ]);

    // Pareto por categoria
    const categoryMap = new Map<string, number>();
    for (const nc of allNcs) {
      const key = nc.category ?? 'Sem categoria';
      categoryMap.set(key, (categoryMap.get(key) ?? 0) + 1);
    }
    const byCategory = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Pareto por origem
    const originMap = new Map<string, number>();
    for (const nc of allNcs) {
      const key = nc.origin ?? 'Sem origem';
      originMap.set(key, (originMap.get(key) ?? 0) + 1);
    }
    const byOrigin = Array.from(originMap.entries())
      .map(([origin, count]) => ({ origin, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total,
      by_status: byStatus.map((s: GroupByResult) => ({ status: s.status, count: s._count.id })),
      by_severity: bySeverity.map((s: GroupByResult) => ({ severity: s.severity, count: s._count.id })),
      by_category: byCategory,
      by_origin: byOrigin,
    };
  }

  /**
   * Cria anexo para nao conformidade
   * Campos: file_url(req), description, uploaded_by_user_id(req)
   * Sem: file_name, file_type, file_size
   */
  static async createNcAttachment(input: CreateNcAttachmentInput) {
    const nc = await db.non_conformances.findFirst({
      where: { id: BigInt(input.non_conformances_id) },
      select: { id: true, status: true },
    });

    if (!nc) {
      throw new NotFoundError('Nao conformidade nao encontrada.');
    }

    if (nc.status === 'encerrada') {
      throw new BadRequestError('Nao e possivel adicionar anexos a uma nao conformidade encerrada.');
    }

    return db.non_conformance_attachments.create({
      data: {
        non_conformances_id: BigInt(input.non_conformances_id),
        file_url: input.file_url,
        description: input.description ?? null,
        uploaded_by_user_id: BigInt(input.uploaded_by_user_id),
      },
    });
  }

  // ===========================================================================
  // Documents (GED)
  // ===========================================================================

  /**
   * Lista documentos com paginacao e filtros
   * Relacoes: created_by, approved_by, acknowledgments
   * Sem relacao projects direta - company_id e obrigatorio
   */
  static async listDocuments(input: ListDocumentsInput) {
    const { company_id, document_type, status, search, page, per_page } = input;
    const skip = (page - 1) * per_page;

    const whereClause: any = {
      deleted_at: null,
    };

    if (company_id) {
      whereClause.company_id = BigInt(company_id);
    }
    if (document_type) {
      whereClause.document_type = document_type;
    }
    if (status) {
      whereClause.status = status;
    }
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { document_number: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      db.documents.findMany({
        where: whereClause,
        include: {
          created_by: { select: { id: true, name: true } },
          approved_by: { select: { id: true, name: true } },
          acknowledgments: {
            select: { id: true, users_id: true, acknowledged_at: true },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: per_page,
      }),
      db.documents.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  /**
   * Busca documento por ID
   */
  static async getDocumentById(id: number) {
    const doc = await db.documents.findFirst({
      where: { id: BigInt(id), deleted_at: null },
      include: {
        created_by: { select: { id: true, name: true } },
        approved_by: { select: { id: true, name: true } },
        acknowledgments: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!doc) {
      throw new NotFoundError('Documento nao encontrado.');
    }

    return doc;
  }

  /**
   * Cria documento
   * company_id e created_by_user_id sao obrigatorios
   * document_number e category sao obrigatorios
   * Status inicial: em_elaboracao
   */
  static async createDocument(input: CreateDocumentInput) {
    return db.documents.create({
      data: {
        company_id: BigInt(input.company_id),
        projects_id: input.projects_id ? BigInt(input.projects_id) : null,
        title: input.title,
        document_number: input.document_number,
        document_type: input.document_type as any,
        category: input.category,
        description: input.description ?? null,
        revision: input.revision ?? 'Rev 00',
        status: 'em_elaboracao',
        file_url: input.file_url ?? null,
        requires_acknowledgment: input.requires_acknowledgment ?? false,
        valid_until: input.valid_until ? new Date(input.valid_until) : null,
        created_by_user_id: BigInt(input.created_by_user_id),
      },
    });
  }

  /**
   * Atualiza documento
   * Documentos aprovados nao podem ser editados
   */
  static async updateDocument(id: number, input: Partial<UpdateDocumentInput>) {
    const doc = await db.documents.findFirst({
      where: { id: BigInt(id), deleted_at: null },
      select: { id: true, status: true },
    });

    if (!doc) {
      throw new NotFoundError('Documento nao encontrado.');
    }

    if (doc.status === 'aprovado') {
      throw new BadRequestError(
        'Documentos aprovados nao podem ser editados. Crie uma nova revisao para fazer alteracoes.'
      );
    }

    return db.documents.update({
      where: { id: BigInt(id) },
      data: {
        title: input.title,
        description: input.description,
        document_type: input.document_type as any,
        category: input.category,
        file_url: input.file_url,
        requires_acknowledgment: input.requires_acknowledgment,
        valid_until: input.valid_until ? new Date(input.valid_until) : undefined,
        status: input.status as any,
      },
    });
  }

  /**
   * Aprova documento e muda seu status para 'aprovado'
   */
  static async approveDocument(id: number, input: ApproveDocumentInput) {
    const doc = await db.documents.findFirst({
      where: { id: BigInt(id), deleted_at: null },
      select: { id: true, status: true },
    });

    if (!doc) {
      throw new NotFoundError('Documento nao encontrado.');
    }

    if (doc.status === 'aprovado') {
      throw new BadRequestError('Este documento ja esta aprovado.');
    }

    if (doc.status === 'obsoleto') {
      throw new BadRequestError('Documentos obsoletos nao podem ser aprovados.');
    }

    return db.documents.update({
      where: { id: BigInt(id) },
      data: {
        status: 'aprovado' as any,
        approved_by_user_id: BigInt(input.approved_by_user_id),
        approved_at: new Date(),
      },
    });
  }

  /**
   * Registra ciencia de documento por parte de um usuario
   */
  static async acknowledgeDocument(document_id: number, user_id: number) {
    const doc = await db.documents.findFirst({
      where: { id: BigInt(document_id), deleted_at: null },
      select: { id: true, status: true, requires_acknowledgment: true },
    });

    if (!doc) {
      throw new NotFoundError('Documento nao encontrado.');
    }

    if (!doc.requires_acknowledgment) {
      throw new BadRequestError('Este documento nao requer ciencia.');
    }

    const existing = await db.document_acknowledgments.findFirst({
      where: {
        documents_id: BigInt(document_id),
        users_id: BigInt(user_id),
      },
    });

    if (existing) {
      throw new BadRequestError('Voce ja registrou ciencia deste documento.');
    }

    return db.document_acknowledgments.create({
      data: {
        documents_id: BigInt(document_id),
        users_id: BigInt(user_id),
        acknowledged_at: new Date(),
      },
    });
  }

  /**
   * Retorna documentos pendentes de ciencia para um usuario
   */
  static async getPendingAcknowledgments(user_id: number) {
    const acknowledgedIds = await db.document_acknowledgments.findMany({
      where: { users_id: BigInt(user_id) },
      select: { documents_id: true },
    });

    const acknowledgedSet = new Set(acknowledgedIds.map(a => a.documents_id));

    return db.documents.findMany({
      where: {
        deleted_at: null,
        status: 'aprovado' as any,
        requires_acknowledgment: true,
        id: {
          notIn: Array.from(acknowledgedSet),
        },
      },
      include: {
        created_by: { select: { id: true, name: true } },
        approved_by: { select: { id: true, name: true } },
      },
      orderBy: { approved_at: 'desc' },
    });
  }

  /**
   * Soft delete de documento
   */
  static async deleteDocument(id: number) {
    const doc = await db.documents.findFirst({
      where: { id: BigInt(id), deleted_at: null },
      select: { id: true },
    });

    if (!doc) {
      throw new NotFoundError('Documento nao encontrado.');
    }

    return db.documents.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });
  }

  // ===========================================================================
  // Task Documents
  // ===========================================================================

  /**
   * Lista vinculos task_template-documento
   * Tabela usa tasks_template_id (nao tasks_id)
   */
  static async listTaskDocuments(input: ListTaskDocumentsInput) {
    const { tasks_id, documents_id, page, per_page } = input;
    const skip = (page - 1) * per_page;

    const whereClause: any = {
      deleted_at: null,
    };

    if (tasks_id) {
      whereClause.tasks_template_id = BigInt(tasks_id);
    }
    if (documents_id) {
      whereClause.documents_id = BigInt(documents_id);
    }

    const [items, total] = await Promise.all([
      db.task_documents.findMany({
        where: whereClause,
        include: {
          document: {
            select: {
              id: true,
              title: true,
              document_number: true,
              document_type: true,
              status: true,
              revision: true,
              file_url: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: per_page,
      }),
      db.task_documents.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  /**
   * Cria vinculo entre tasks_template e documento
   */
  static async createTaskDocument(input: CreateTaskDocumentInput) {
    const existing = await db.task_documents.findFirst({
      where: {
        tasks_template_id: BigInt(input.tasks_id),
        documents_id: BigInt(input.documents_id),
        deleted_at: null,
      },
    });

    if (existing) {
      throw new BadRequestError('Este documento ja esta vinculado a esta tarefa.');
    }

    return db.task_documents.create({
      data: {
        tasks_template_id: BigInt(input.tasks_id),
        documents_id: BigInt(input.documents_id),
      },
    });
  }

  /**
   * Remove vinculo task-documento (soft delete)
   */
  static async deleteTaskDocument(id: number) {
    const taskDoc = await db.task_documents.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!taskDoc) {
      throw new NotFoundError('Vinculo nao encontrado.');
    }

    return db.task_documents.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });
  }

  // ===========================================================================
  // Checklist Templates
  // ===========================================================================

  /**
   * Lista templates de checklist com paginacao
   * Relacoes: items (nao checklist_template_items), responses
   * Sem: is_safety, created_by, projects_id
   */
  static async listChecklistTemplates(input: ListChecklistTemplatesInput) {
    const { company_id, checklist_type, page, per_page } = input;
    const skip = (page - 1) * per_page;

    const whereClause: any = {
      deleted_at: null,
    };

    if (company_id) {
      whereClause.company_id = BigInt(company_id);
    }
    if (checklist_type) {
      whereClause.checklist_type = { contains: checklist_type, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      db.checklist_templates.findMany({
        where: whereClause,
        include: {
          items: {
            orderBy: { item_order: 'asc' },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: per_page,
      }),
      db.checklist_templates.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  /**
   * Cria template de checklist com seus itens em uma unica transacao
   * Itens: item_order, description, response_type(enum), is_critical
   * Sem: options, category, required, order_index
   */
  static async createChecklistTemplate(input: CreateChecklistTemplateInput) {
    return db.$transaction(async (tx) => {
      const template = await tx.checklist_templates.create({
        data: {
          company_id: BigInt(input.company_id),
          name: input.name,
          description: input.description ?? null,
          checklist_type: input.checklist_type ?? 'geral',
        },
      });

      if (input.items && input.items.length > 0) {
        await tx.checklist_template_items.createMany({
          data: input.items.map((item, index) => ({
            checklist_templates_id: template.id,
            description: item.description,
            response_type: (item.response_type ?? 'sim_nao') as any,
            is_critical: item.is_critical ?? false,
            item_order: item.item_order ?? index,
          })),
        });
      }

      return tx.checklist_templates.findFirst({
        where: { id: template.id },
        include: {
          items: {
            orderBy: { item_order: 'asc' },
          },
        },
      });
    });
  }

  /**
   * Atualiza template de checklist e seus itens
   * Itens com _action='create' sao criados, 'update' sao atualizados, 'delete' sao removidos
   */
  static async updateChecklistTemplate(id: number, input: UpdateChecklistTemplateInput) {
    const template = await db.checklist_templates.findFirst({
      where: { id: BigInt(id), deleted_at: null },
      select: { id: true },
    });

    if (!template) {
      throw new NotFoundError('Template de checklist nao encontrado.');
    }

    return db.$transaction(async (tx) => {
      await tx.checklist_templates.update({
        where: { id: BigInt(id) },
        data: {
          name: input.name,
          description: input.description,
          checklist_type: input.checklist_type,
        },
      });

      if (input.items && input.items.length > 0) {
        for (const item of input.items) {
          const action = item._action ?? 'update';

          if (action === 'create') {
            await tx.checklist_template_items.create({
              data: {
                checklist_templates_id: BigInt(id),
                description: item.description,
                response_type: (item.response_type ?? 'sim_nao') as any,
                is_critical: item.is_critical ?? false,
                item_order: item.item_order ?? 0,
              },
            });
          } else if (action === 'update' && item.id) {
            await tx.checklist_template_items.update({
              where: { id: BigInt(item.id) },
              data: {
                description: item.description,
                response_type: item.response_type as any,
                is_critical: item.is_critical,
                item_order: item.item_order,
              },
            });
          } else if (action === 'delete' && item.id) {
            await tx.checklist_template_items.delete({
              where: { id: BigInt(item.id) },
            });
          }
        }
      }

      return tx.checklist_templates.findFirst({
        where: { id: BigInt(id) },
        include: {
          items: {
            orderBy: { item_order: 'asc' },
          },
        },
      });
    });
  }

  /**
   * Soft delete de template de checklist
   */
  static async deleteChecklistTemplate(id: number) {
    const template = await db.checklist_templates.findFirst({
      where: { id: BigInt(id), deleted_at: null },
      select: { id: true },
    });

    if (!template) {
      throw new NotFoundError('Template de checklist nao encontrado.');
    }

    return db.checklist_templates.update({
      where: { id: BigInt(id) },
      data: {
        deleted_at: new Date(),
      },
    });
  }

  /**
   * Lista respostas de checklist com filtros
   * checklist_responses usa: checklist_templates_id, responded_by_user_id, response_date
   * Relacoes: checklist_template (singular), items, responded_by
   */
  static async listChecklistResponses(input: ListChecklistResponsesInput) {
    const { checklist_templates_id, projects_id, initial_date, final_date, page, per_page } = input;
    const skip = (page - 1) * per_page;

    const whereClause: any = {};

    if (checklist_templates_id) {
      whereClause.checklist_templates_id = BigInt(checklist_templates_id);
    }
    if (projects_id) {
      whereClause.projects_backlogs_id = BigInt(projects_id);
    }
    if (initial_date) {
      whereClause.response_date = {
        ...whereClause.response_date,
        gte: new Date(initial_date),
      };
    }
    if (final_date) {
      whereClause.response_date = {
        ...whereClause.response_date,
        lte: new Date(final_date),
      };
    }

    const [responseItems, total] = await Promise.all([
      db.checklist_responses.findMany({
        where: whereClause,
        include: {
          checklist_template: { select: { id: true, name: true, checklist_type: true } },
          responded_by: { select: { id: true, name: true } },
          items: {
            include: {
              checklist_template_item: { select: { id: true, description: true, response_type: true } },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: per_page,
      }),
      db.checklist_responses.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(responseItems, total, page, per_page);
  }

  /**
   * Busca resposta de checklist por ID
   */
  static async getChecklistResponse(id: number) {
    const response = await db.checklist_responses.findFirst({
      where: { id: BigInt(id) },
      include: {
        checklist_template: {
          include: {
            items: { orderBy: { item_order: 'asc' } },
          },
        },
        responded_by: { select: { id: true, name: true } },
        items: {
          include: {
            checklist_template_item: true,
          },
        },
      },
    });

    if (!response) {
      throw new NotFoundError('Resposta de checklist nao encontrada.');
    }

    return response;
  }

  /**
   * Cria resposta de checklist com todos os itens em transacao
   * responded_by_user_id e response_date sao obrigatorios
   * Sem: tasks_id, location, notes
   */
  static async createChecklistResponse(input: CreateChecklistResponseInput) {
    const template = await db.checklist_templates.findFirst({
      where: { id: BigInt(input.checklist_templates_id), deleted_at: null },
      include: { items: true },
    });

    if (!template) {
      throw new NotFoundError('Template de checklist nao encontrado.');
    }

    const templateItemIds = new Set(template.items.map(i => Number(i.id)));
    for (const item of input.items) {
      if (!templateItemIds.has(item.checklist_template_items_id)) {
        throw new BadRequestError(
          `Item ${item.checklist_template_items_id} nao pertence ao template selecionado.`
        );
      }
    }

    // Verifica itens criticos (is_critical = equivalente ao required)
    const criticalItems = template.items.filter(i => i.is_critical);
    const respondedIds = new Set(input.items.map(i => i.checklist_template_items_id));
    for (const critical of criticalItems) {
      if (!respondedIds.has(Number(critical.id))) {
        throw new BadRequestError(
          `O item critico "${critical.description}" nao foi respondido.`
        );
      }
    }

    return db.$transaction(async (tx) => {
      const response = await tx.checklist_responses.create({
        data: {
          checklist_templates_id: BigInt(input.checklist_templates_id),
          responded_by_user_id: BigInt(input.responded_by_user_id),
          response_date: new Date(input.response_date),
          status: 'concluido',
        },
      });

      await tx.checklist_response_items.createMany({
        data: input.items.map(item => ({
          checklist_responses_id: response.id,
          checklist_template_items_id: BigInt(item.checklist_template_items_id),
          response_value: item.response_value ?? null,
          observations: item.observations ?? null,
          evidence_image: item.evidence_image ?? null,
        })),
      });

      return tx.checklist_responses.findFirst({
        where: { id: response.id },
        include: {
          checklist_template: { select: { id: true, name: true } },
          items: {
            include: { checklist_template_item: true },
          },
        },
      });
    });
  }

  // ===========================================================================
  // Golden Rules
  // ===========================================================================

  /**
   * Lista regras de ouro com paginacao
   * Sem: active, category, created_by - campo e sort_order (nao order_index)
   */
  static async listGoldenRules(input: ListGoldenRulesInput) {
    const { company_id, page, per_page } = input;
    const skip = (page - 1) * per_page;

    const whereClause: any = {
      deleted_at: null,
    };

    if (company_id) {
      whereClause.company_id = BigInt(company_id);
    }

    const [items, total] = await Promise.all([
      db.golden_rules.findMany({
        where: whereClause,
        orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
        skip,
        take: per_page,
      }),
      db.golden_rules.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  /**
   * Cria regra de ouro
   * company_id e obrigatorio
   */
  static async createGoldenRule(input: CreateGoldenRuleInput) {
    return db.golden_rules.create({
      data: {
        company_id: BigInt(input.company_id),
        title: input.title,
        description: input.description ?? null,
        icon_url: input.icon_url ?? null,
        sort_order: input.sort_order ?? 0,
        severity: input.severity ?? 'media',
        is_active: input.is_active ?? true,
      },
    });
  }

  /**
   * Busca regra de ouro por ID
   */
  static async getGoldenRuleById(id: number) {
    const rule = await db.golden_rules.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!rule) {
      throw new NotFoundError('Regra de ouro nao encontrada.');
    }

    return rule;
  }

  /**
   * Atualiza regra de ouro
   */
  static async updateGoldenRule(id: number, input: Partial<UpdateGoldenRuleInput>) {
    const rule = await db.golden_rules.findFirst({
      where: { id: BigInt(id), deleted_at: null },
      select: { id: true },
    });

    if (!rule) {
      throw new NotFoundError('Regra de ouro nao encontrada.');
    }

    return db.golden_rules.update({
      where: { id: BigInt(id) },
      data: {
        title: input.title,
        description: input.description,
        icon_url: input.icon_url,
        sort_order: input.sort_order,
        severity: input.severity,
        is_active: input.is_active,
      },
    });
  }

  /**
   * Soft delete de regra de ouro
   */
  static async deleteGoldenRule(id: number) {
    const rule = await db.golden_rules.findFirst({
      where: { id: BigInt(id), deleted_at: null },
      select: { id: true },
    });

    if (!rule) {
      throw new NotFoundError('Regra de ouro nao encontrada.');
    }

    return db.golden_rules.update({
      where: { id: BigInt(id) },
      data: {
        deleted_at: new Date(),
      },
    });
  }

  // ===========================================================================
  // Task Golden Rules
  // ===========================================================================

  /**
   * Lista vinculos tasks_template-golden rule
   * tasks_template_id (nao tasks_id) - relacao: golden_rule (singular)
   */
  static async listTaskGoldenRules(input: ListTaskGoldenRulesInput) {
    const whereClause: any = {
      deleted_at: null,
    };

    if (input.tasks_id) {
      whereClause.tasks_template_id = BigInt(input.tasks_id);
    }
    if (input.golden_rules_id) {
      whereClause.golden_rules_id = BigInt(input.golden_rules_id);
    }

    return db.task_golden_rules.findMany({
      where: whereClause,
      include: {
        golden_rule: {
          select: { id: true, title: true, description: true, icon_url: true, sort_order: true },
        },
      },
      orderBy: { created_at: 'asc' },
    });
  }

  /**
   * Cria vinculo entre tasks_template e golden rule
   */
  static async createTaskGoldenRule(input: CreateTaskGoldenRuleInput) {
    const existing = await db.task_golden_rules.findFirst({
      where: {
        tasks_template_id: BigInt(input.tasks_id),
        golden_rules_id: BigInt(input.golden_rules_id),
        deleted_at: null,
      },
    });

    if (existing) {
      throw new BadRequestError('Esta regra de ouro ja esta vinculada a esta tarefa.');
    }

    return db.task_golden_rules.create({
      data: {
        tasks_template_id: BigInt(input.tasks_id),
        golden_rules_id: BigInt(input.golden_rules_id),
      },
      include: {
        golden_rule: { select: { id: true, title: true, description: true } },
      },
    });
  }

  /**
   * Remove vinculo task-golden rule (soft delete)
   */
  static async deleteTaskGoldenRule(id: number) {
    const taskRule = await db.task_golden_rules.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!taskRule) {
      throw new NotFoundError('Vinculo nao encontrado.');
    }

    return db.task_golden_rules.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });
  }

  // ===========================================================================
  // Task Checklist Templates (pivot)
  // ===========================================================================

  /**
   * Lista vinculos tasks_template-checklist_template
   * Filtra por tasks_id (tasks_template_id) ou checklist_templates_id
   */
  static async listTaskChecklists(input: ListTaskChecklistsInput) {
    const whereClause: any = {};
    if (input.tasks_id) whereClause.tasks_template_id = BigInt(input.tasks_id);
    if (input.checklist_templates_id) whereClause.checklist_templates_id = BigInt(input.checklist_templates_id);

    const items = await db.task_template_checklists.findMany({
      where: whereClause,
      include: {
        checklist_template: {
          include: {
            items: { orderBy: { item_order: 'asc' } },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return items;
  }

  /**
   * Cria vinculo entre tasks_template e checklist_template
   * Retorna o registro existente se o vinculo ja existir (idempotente)
   */
  static async createTaskChecklist(input: CreateTaskChecklistInput) {
    const existing = await db.task_template_checklists.findFirst({
      where: {
        tasks_template_id: BigInt(input.tasks_template_id),
        checklist_templates_id: BigInt(input.checklist_templates_id),
      },
    });
    if (existing) return existing;

    return db.task_template_checklists.create({
      data: {
        tasks_template_id: BigInt(input.tasks_template_id),
        checklist_templates_id: BigInt(input.checklist_templates_id),
      },
    });
  }

  /**
   * Remove vinculo task_template-checklist_template (hard delete via cascade)
   */
  static async deleteTaskChecklist(id: number) {
    await db.task_template_checklists.delete({
      where: { id: BigInt(id) },
    });
  }
}

export default QualityService;
