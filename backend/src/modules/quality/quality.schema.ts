// =============================================================================
// INDUSTRYVIEW BACKEND - Quality Module Schema
// Schemas de validacao do modulo de qualidade
// Abrange: non_conformances, documents (GED), checklists, golden_rules
// =============================================================================

import { z } from 'zod';

// =============================================================================
// Non Conformances Schemas
// =============================================================================

// nc_status real: aberta, em_analise, em_tratamento, verificacao, encerrada
// nc_severity real: menor, maior, critica

export const listNonConformancesSchema = z.object({
  projects_id: z.coerce.number().int().optional(),
  company_id: z.coerce.number().int().optional(),
  status: z.enum(['aberta', 'em_analise', 'em_tratamento', 'verificacao', 'encerrada']).optional(),
  severity: z.enum(['menor', 'maior', 'critica']).optional(),
  responsible_user_id: z.coerce.number().int().optional(),
  involved_user_id: z.coerce.number().int().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const getNcByIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});

// projects_id, opened_by_user_id, origin, severity, category sao obrigatorios
export const createNonConformanceSchema = z.object({
  projects_id: z.coerce.number().int().min(1, 'projects_id e obrigatorio'),
  title: z.string().trim().min(1, 'Titulo e obrigatorio'),
  description: z.string().trim().min(1, 'Descricao e obrigatoria'),
  origin: z.string().trim().min(1, 'Origem e obrigatoria').max(30),
  severity: z.enum(['menor', 'maior', 'critica']).default('menor'),
  category: z.string().trim().min(1, 'Categoria e obrigatoria').max(30),
  location_description: z.string().trim().optional(),
  immediate_action: z.string().trim().optional(),
  deadline: z.string().optional(),
  opened_by_user_id: z.coerce.number().int().min(1, 'opened_by_user_id e obrigatorio'),
  responsible_user_id: z.coerce.number().int().optional(),
});

export const updateNonConformanceSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  origin: z.string().trim().max(30).optional(),
  category: z.string().trim().max(30).optional(),
  severity: z.enum(['menor', 'maior', 'critica']).optional(),
  status: z.enum(['aberta', 'em_analise', 'em_tratamento', 'verificacao', 'encerrada']).optional(),
  location_description: z.string().trim().optional(),
  responsible_user_id: z.coerce.number().int().optional(),
  deadline: z.string().optional(),
  immediate_action: z.string().trim().optional(),
  root_cause_analysis: z.string().trim().optional(),
  corrective_action_plan: z.string().trim().optional(),
  preventive_action: z.string().trim().optional(),
});

// Encerrar nao conformidade requer root_cause_analysis e corrective_action_plan
export const closeNonConformanceSchema = z.object({
  root_cause_analysis: z.string().trim().min(1, 'Analise de causa raiz e obrigatoria para encerramento'),
  corrective_action_plan: z.string().trim().min(1, 'Plano de acao corretiva e obrigatorio para encerramento'),
  preventive_action: z.string().trim().optional(),
  closed_by_user_id: z.coerce.number().int().optional(),
});

export const getNcStatisticsSchema = z.object({
  projects_id: z.coerce.number().int().optional(),
  company_id: z.coerce.number().int().optional(),
  initial_date: z.string().optional(),
  final_date: z.string().optional(),
});

// non_conformance_attachments: file_url(req), description, uploaded_by_user_id(req)
// Sem: file_name, file_type, file_size
export const createNcAttachmentSchema = z.object({
  non_conformances_id: z.coerce.number().int().min(1, 'non_conformances_id e obrigatorio'),
  file_url: z.string().trim().min(1, 'URL do arquivo e obrigatoria'),
  description: z.string().trim().optional(),
  uploaded_by_user_id: z.coerce.number().int().min(1, 'uploaded_by_user_id e obrigatorio'),
});

// =============================================================================
// Documents (GED) Schemas
// =============================================================================

// document_type real enum: procedimento, instrucao_trabalho, projeto, certificado,
//   licenca, laudo, contrato, ata, relatorio
// document_status real: em_elaboracao, em_revisao, aprovado, obsoleto

export const listDocumentsSchema = z.object({
  company_id: z.coerce.number().int().optional(),
  document_type: z.string().trim().optional(),
  status: z.enum(['em_elaboracao', 'em_revisao', 'aprovado', 'obsoleto']).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const getDocumentByIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});

// company_id, created_by_user_id, document_number, category sao obrigatorios
export const createDocumentSchema = z.object({
  company_id: z.coerce.number().int().min(1, 'company_id e obrigatorio'),
  projects_id: z.coerce.number().int().optional(),
  title: z.string().trim().min(1, 'Titulo e obrigatorio'),
  document_number: z.string().trim().min(1, 'Numero do documento e obrigatorio').max(50),
  document_type: z.enum([
    'procedimento', 'instrucao_trabalho', 'projeto', 'certificado',
    'licenca', 'laudo', 'contrato', 'ata', 'relatorio'
  ]),
  category: z.string().trim().min(1, 'Categoria e obrigatoria').max(30),
  description: z.string().trim().optional(),
  revision: z.string().trim().optional().default('Rev 00'),
  file_url: z.string().trim().optional(),
  requires_acknowledgment: z.boolean().optional().default(false),
  valid_until: z.string().optional(),
  created_by_user_id: z.coerce.number().int().min(1, 'created_by_user_id e obrigatorio'),
});

export const updateDocumentSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  document_type: z.enum([
    'procedimento', 'instrucao_trabalho', 'projeto', 'certificado',
    'licenca', 'laudo', 'contrato', 'ata', 'relatorio'
  ]).optional(),
  category: z.string().trim().max(30).optional(),
  file_url: z.string().trim().optional(),
  requires_acknowledgment: z.boolean().optional(),
  valid_until: z.string().optional(),
  status: z.enum(['em_elaboracao', 'em_revisao', 'aprovado', 'obsoleto']).optional(),
});

// approved_by_user_id e obrigatorio para aprovacao
export const approveDocumentSchema = z.object({
  approved_by_user_id: z.coerce.number().int().min(1, 'ID do aprovador e obrigatorio'),
});

export const acknowledgeDocumentSchema = z.object({
  id: z.coerce.number().int().min(1),
});

// =============================================================================
// Task Documents Schemas
// =============================================================================

// task_documents usa tasks_template_id (nao tasks_id)
export const listTaskDocumentsSchema = z.object({
  tasks_id: z.coerce.number().int().optional(),
  documents_id: z.coerce.number().int().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const createTaskDocumentSchema = z.object({
  tasks_id: z.coerce.number().int().min(1, 'tasks_id (tasks_template_id) e obrigatorio'),
  documents_id: z.coerce.number().int().min(1, 'documents_id e obrigatorio'),
});

export const deleteTaskDocumentSchema = z.object({
  id: z.coerce.number().int().min(1),
});

// =============================================================================
// Checklist Templates Schemas
// =============================================================================

// checklist_template_items reais: item_order, description, response_type(enum), is_critical
// response_type enum: sim_nao, conforme_nao_conforme, nota_1_5, texto
// Sem: options, category, required, order_index, item_type

export const checklistTemplateItemSchema = z.object({
  description: z.string().trim().min(1, 'Descricao do item e obrigatoria'),
  response_type: z.enum(['sim_nao', 'conforme_nao_conforme', 'nota_1_5', 'texto']).optional().default('sim_nao'),
  is_critical: z.boolean().optional().default(false),
  item_order: z.coerce.number().int().optional().default(0),
});

// checklist_templates: company_id(req), name, description, checklist_type
// Sem: is_safety, created_by_id, projects_id
export const listChecklistTemplatesSchema = z.object({
  company_id: z.coerce.number().int().optional(),
  checklist_type: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const getChecklistTemplateByIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const createChecklistTemplateSchema = z.object({
  company_id: z.coerce.number().int().min(1, 'company_id e obrigatorio'),
  name: z.string().trim().min(1, 'Nome do template e obrigatorio'),
  description: z.string().trim().optional(),
  checklist_type: z.string().trim().optional().default('geral'),
  items: z.array(checklistTemplateItemSchema).optional().default([]),
});

export const updateChecklistTemplateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  checklist_type: z.string().trim().optional(),
  items: z.array(
    checklistTemplateItemSchema.extend({
      id: z.coerce.number().int().optional(),
      _action: z.enum(['create', 'update', 'delete']).optional().default('update'),
    })
  ).optional(),
});

// =============================================================================
// Checklist Responses Schemas
// =============================================================================

// checklist_response_items: response_value, observations, evidence_image
// Sem: value, checked, notes

export const checklistResponseItemSchema = z.object({
  checklist_template_items_id: z.coerce.number().int().min(1, 'ID do item e obrigatorio'),
  response_value: z.string().trim().optional(),
  observations: z.string().trim().optional(),
  evidence_image: z.string().trim().optional(),
});

// checklist_responses: checklist_templates_id, responded_by_user_id(req), response_date(req)
// Sem: tasks_id, location, notes
export const listChecklistResponsesSchema = z.object({
  checklist_templates_id: z.coerce.number().int().optional(),
  projects_id: z.coerce.number().int().optional(),
  initial_date: z.string().optional(),
  final_date: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const getChecklistResponseByIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const createChecklistResponseSchema = z.object({
  checklist_templates_id: z.coerce.number().int().min(1, 'Template e obrigatorio'),
  responded_by_user_id: z.coerce.number().int().min(1, 'responded_by_user_id e obrigatorio'),
  response_date: z.string().min(1, 'response_date e obrigatoria'),
  items: z.array(checklistResponseItemSchema).min(1, 'Ao menos um item de resposta e obrigatorio'),
});

// =============================================================================
// Golden Rules Schemas
// =============================================================================

// golden_rules: title, description, icon_url, sort_order, company_id(req)
// Sem: active, category, created_by_id

export const listGoldenRulesSchema = z.object({
  company_id: z.coerce.number().int().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const getGoldenRuleByIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const createGoldenRuleSchema = z.object({
  company_id: z.coerce.number().int().min(1, 'company_id e obrigatorio'),
  title: z.string().trim().min(1, 'Titulo e obrigatorio'),
  description: z.string().trim().optional(),
  icon_url: z.string().trim().optional(),
  sort_order: z.coerce.number().int().optional().default(0),
  severity: z.string().trim().optional().default('media'),
  is_active: z.boolean().optional().default(true),
});

export const updateGoldenRuleSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  icon_url: z.string().trim().optional(),
  sort_order: z.coerce.number().int().optional(),
  severity: z.string().trim().optional(),
  is_active: z.boolean().optional(),
});

// =============================================================================
// Task Golden Rules Schemas
// =============================================================================

// task_golden_rules usa tasks_template_id (nao tasks_id)
export const listTaskGoldenRulesSchema = z.object({
  tasks_id: z.coerce.number().int().optional(),
  golden_rules_id: z.coerce.number().int().optional(),
});

export const createTaskGoldenRuleSchema = z.object({
  tasks_id: z.coerce.number().int().min(1, 'tasks_id (tasks_template_id) e obrigatorio'),
  golden_rules_id: z.coerce.number().int().min(1, 'golden_rules_id e obrigatorio'),
});

export const deleteTaskGoldenRuleSchema = z.object({
  id: z.coerce.number().int().min(1),
});

// =============================================================================
// Task Checklist Templates (pivot)
// =============================================================================

export const listTaskChecklistsSchema = z.object({
  tasks_id: z.coerce.number().int().optional(),
  checklist_templates_id: z.coerce.number().int().optional(),
});

export const createTaskChecklistSchema = z.object({
  tasks_template_id: z.coerce.number().int().min(1, 'tasks_template_id e obrigatorio'),
  checklist_templates_id: z.coerce.number().int().min(1, 'checklist_templates_id e obrigatorio'),
});

export const deleteTaskChecklistSchema = z.object({
  id: z.coerce.number().int().min(1),
});

// =============================================================================
// Type Exports
// =============================================================================

export type ListNonConformancesInput = z.infer<typeof listNonConformancesSchema>;
export type CreateNonConformanceInput = z.infer<typeof createNonConformanceSchema>;
export type UpdateNonConformanceInput = z.infer<typeof updateNonConformanceSchema>;
export type CloseNonConformanceInput = z.infer<typeof closeNonConformanceSchema>;
export type GetNcStatisticsInput = z.infer<typeof getNcStatisticsSchema>;
export type CreateNcAttachmentInput = z.infer<typeof createNcAttachmentSchema>;

export type ListDocumentsInput = z.infer<typeof listDocumentsSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type ApproveDocumentInput = z.infer<typeof approveDocumentSchema>;

export type ListTaskDocumentsInput = z.infer<typeof listTaskDocumentsSchema>;
export type CreateTaskDocumentInput = z.infer<typeof createTaskDocumentSchema>;

export type ChecklistTemplateItemInput = z.infer<typeof checklistTemplateItemSchema>;
export type ListChecklistTemplatesInput = z.infer<typeof listChecklistTemplatesSchema>;
export type CreateChecklistTemplateInput = z.infer<typeof createChecklistTemplateSchema>;
export type UpdateChecklistTemplateInput = z.infer<typeof updateChecklistTemplateSchema>;
export type ChecklistResponseItemInput = z.infer<typeof checklistResponseItemSchema>;
export type ListChecklistResponsesInput = z.infer<typeof listChecklistResponsesSchema>;
export type CreateChecklistResponseInput = z.infer<typeof createChecklistResponseSchema>;

export type ListGoldenRulesInput = z.infer<typeof listGoldenRulesSchema>;
export type CreateGoldenRuleInput = z.infer<typeof createGoldenRuleSchema>;
export type UpdateGoldenRuleInput = z.infer<typeof updateGoldenRuleSchema>;

export type ListTaskGoldenRulesInput = z.infer<typeof listTaskGoldenRulesSchema>;
export type CreateTaskGoldenRuleInput = z.infer<typeof createTaskGoldenRuleSchema>;

export type ListTaskChecklistsInput = z.infer<typeof listTaskChecklistsSchema>;
export type CreateTaskChecklistInput = z.infer<typeof createTaskChecklistSchema>;
