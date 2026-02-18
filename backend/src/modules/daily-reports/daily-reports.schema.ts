// =============================================================================
// INDUSTRYVIEW BACKEND - Daily Reports Module Schema
// Schemas de validacao do modulo de RDO completo (Relatorio Diario de Obra)
// Modulo separado do reports/ para suportar o RDO expandido com aprovacao
// =============================================================================

import { z } from 'zod';

// =============================================================================
// Constantes de status do RDO
// =============================================================================

export const RDO_STATUS = {
  RASCUNHO: 'rascunho',
  FINALIZADO: 'finalizado',
  APROVADO: 'aprovado',
  REJEITADO: 'rejeitado',
} as const;

export type RdoStatus = (typeof RDO_STATUS)[keyof typeof RDO_STATUS];

// =============================================================================
// Schemas do RDO principal
// =============================================================================

/**
 * Schema para criar relatorio diario (RDO)
 * O RDO e criado com status 'rascunho' automaticamente
 */
export const createDailyReportSchema = z.object({
  projects_id: z.coerce.number().int().positive('projects_id deve ser um inteiro positivo'),
  rdo_date: z.string().min(1, 'rdo_date e obrigatorio'),
  shift: z.enum(['manha', 'tarde', 'noite', 'integral']).optional(),
  weather_morning: z.string().trim().max(30).optional(),
  weather_afternoon: z.string().trim().max(30).optional(),
  weather_night: z.string().trim().max(30).optional(),
  temperature_min: z.coerce.number().optional(),
  temperature_max: z.coerce.number().optional(),
  safety_topic: z.string().trim().optional(),
  general_observations: z.string().trim().optional(),
  schedule_id: z.array(z.coerce.number().int().positive()).optional(),
});

export type CreateDailyReportInput = z.infer<typeof createDailyReportSchema>;

/**
 * Schema para atualizar relatorio diario
 * Somente permitido enquanto status = 'rascunho'
 */
export const updateDailyReportSchema = z.object({
  rdo_date: z.string().optional(),
  shift: z.enum(['manha', 'tarde', 'noite', 'integral']).optional(),
  weather_morning: z.string().trim().max(30).optional(),
  weather_afternoon: z.string().trim().max(30).optional(),
  weather_night: z.string().trim().max(30).optional(),
  temperature_min: z.coerce.number().optional(),
  temperature_max: z.coerce.number().optional(),
  safety_topic: z.string().trim().optional(),
  general_observations: z.string().trim().optional(),
});

export type UpdateDailyReportInput = z.infer<typeof updateDailyReportSchema>;

/**
 * Schema para finalizar RDO
 * Muda status de 'rascunho' para 'finalizado'
 */
export const finalizeDailyReportSchema = z.object({
  daily_report_id: z.coerce.number().int().positive(),
});

export type FinalizeDailyReportInput = z.infer<typeof finalizeDailyReportSchema>;

/**
 * Schema para aprovar RDO
 * Muda status para 'aprovado' e torna o registro imutavel
 */
export const approveDailyReportSchema = z.object({
  daily_report_id: z.coerce.number().int().positive(),
  approved_by_user_id: z.coerce.number().int().positive(),
});

export type ApproveDailyReportInput = z.infer<typeof approveDailyReportSchema>;

/**
 * Schema para rejeitar RDO
 * Muda status para 'rejeitado' e permite correcao (volta para rascunho)
 */
export const rejectDailyReportSchema = z.object({
  daily_report_id: z.coerce.number().int().positive(),
  rejection_reason: z.string().trim().min(1, 'Motivo de rejeicao e obrigatorio'),
});

export type RejectDailyReportInput = z.infer<typeof rejectDailyReportSchema>;

/**
 * Schema para listar RDOs com filtros e paginacao
 */
export const listDailyReportsSchema = z.object({
  projects_id: z.coerce.number().int().positive().optional(),
  company_id: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
  initial_date: z.string().optional(),
  final_date: z.string().optional(),
  status: z.enum(['rascunho', 'finalizado', 'aprovado', 'rejeitado']).optional(),
});

export type ListDailyReportsInput = z.infer<typeof listDailyReportsSchema>;

/**
 * Schema para buscar datas com RDOs cadastrados
 */
export const getDailyReportDatesSchema = z.object({
  projects_id: z.coerce.number().int().positive().optional(),
});

export type GetDailyReportDatesInput = z.infer<typeof getDailyReportDatesSchema>;

// =============================================================================
// Schemas das tabelas filhas - Mao de Obra (Workforce)
// =============================================================================

/**
 * Schema para adicionar entrada de mao de obra
 */
export const createWorkforceEntrySchema = z.object({
  daily_report_id: z.coerce.number().int().positive(),
  role_category: z.string().trim().min(1, 'Categoria/funcao e obrigatoria').max(100),
  quantity_planned: z.coerce.number().int().min(0, 'Quantidade planejada deve ser >= 0'),
  quantity_present: z.coerce.number().int().min(0, 'Quantidade presente deve ser >= 0'),
  quantity_absent: z.coerce.number().int().min(0).optional(),
  absence_reason: z.string().trim().optional(),
});

export type CreateWorkforceEntryInput = z.infer<typeof createWorkforceEntrySchema>;

/**
 * Schema para atualizar entrada de mao de obra
 */
export const updateWorkforceEntrySchema = z.object({
  role_category: z.string().trim().min(1).max(100).optional(),
  quantity_planned: z.coerce.number().int().min(0).optional(),
  quantity_present: z.coerce.number().int().min(0).optional(),
  quantity_absent: z.coerce.number().int().min(0).optional(),
  absence_reason: z.string().trim().optional(),
});

export type UpdateWorkforceEntryInput = z.infer<typeof updateWorkforceEntrySchema>;

// =============================================================================
// Schemas das tabelas filhas - Atividades (Activities)
// =============================================================================

/**
 * Schema para adicionar atividade executada no dia
 */
export const createActivityEntrySchema = z.object({
  daily_report_id: z.coerce.number().int().positive(),
  projects_backlogs_id: z.coerce.number().int().positive().optional(),
  description: z.string().trim().min(1, 'Descricao da atividade e obrigatoria'),
  quantity_done: z.coerce.number().min(0).optional(),
  unity_id: z.coerce.number().int().positive().optional(),
  teams_id: z.coerce.number().int().positive().optional(),
  location_description: z.string().trim().optional(),
});

export type CreateActivityEntryInput = z.infer<typeof createActivityEntrySchema>;

/**
 * Schema para atualizar atividade
 */
export const updateActivityEntrySchema = z.object({
  projects_backlogs_id: z.coerce.number().int().positive().optional().nullable(),
  description: z.string().trim().min(1).optional(),
  quantity_done: z.coerce.number().min(0).optional().nullable(),
  unity_id: z.coerce.number().int().positive().optional().nullable(),
  teams_id: z.coerce.number().int().positive().optional().nullable(),
  location_description: z.string().trim().optional().nullable(),
});

export type UpdateActivityEntryInput = z.infer<typeof updateActivityEntrySchema>;

// =============================================================================
// Schemas das tabelas filhas - Ocorrencias (Occurrences)
// =============================================================================

/**
 * Schema para adicionar ocorrencia do dia
 * Tipos: chuva, paralisacao, acidente, incidente, falta_material, etc.
 */
export const createOccurrenceEntrySchema = z.object({
  daily_report_id: z.coerce.number().int().positive(),
  occurrence_type: z.string().trim().min(1, 'Tipo de ocorrencia e obrigatorio').max(50),
  description: z.string().trim().min(1, 'Descricao da ocorrencia e obrigatoria'),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  duration_hours: z.coerce.number().min(0).optional(),
  impact_description: z.string().trim().optional(),
});

export type CreateOccurrenceEntryInput = z.infer<typeof createOccurrenceEntrySchema>;

/**
 * Schema para atualizar ocorrencia
 */
export const updateOccurrenceEntrySchema = z.object({
  occurrence_type: z.string().trim().min(1).max(50).optional(),
  description: z.string().trim().min(1).optional(),
  start_time: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
  duration_hours: z.coerce.number().min(0).optional().nullable(),
  impact_description: z.string().trim().optional().nullable(),
});

export type UpdateOccurrenceEntryInput = z.infer<typeof updateOccurrenceEntrySchema>;

// =============================================================================
// Schemas das tabelas filhas - Equipamentos (Equipment)
// =============================================================================

/**
 * Schema para adicionar equipamento utilizado no dia
 */
export const createEquipmentEntrySchema = z.object({
  daily_report_id: z.coerce.number().int().positive(),
  equipaments_types_id: z.coerce.number().int().positive().optional(),
  description: z.string().trim().optional(),
  quantity: z.coerce.number().int().min(1, 'Quantidade deve ser >= 1').default(1),
  operation_hours: z.coerce.number().min(0).optional(),
  idle_hours: z.coerce.number().min(0).optional(),
  idle_reason: z.string().trim().optional(),
});

export type CreateEquipmentEntryInput = z.infer<typeof createEquipmentEntrySchema>;

/**
 * Schema para atualizar equipamento
 */
export const updateEquipmentEntrySchema = z.object({
  equipaments_types_id: z.coerce.number().int().positive().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  quantity: z.coerce.number().int().min(1).optional(),
  operation_hours: z.coerce.number().min(0).optional().nullable(),
  idle_hours: z.coerce.number().min(0).optional().nullable(),
  idle_reason: z.string().trim().optional().nullable(),
});

export type UpdateEquipmentEntryInput = z.infer<typeof updateEquipmentEntrySchema>;
