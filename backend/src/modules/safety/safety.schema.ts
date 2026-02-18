// =============================================================================
// INDUSTRYVIEW BACKEND - Safety Module Schema
// Schemas de validacao do modulo de segurança do trabalho
// Cobre: incidentes, treinamentos, DDS (Dialogo Diario de Seguranca)
// =============================================================================

import { z } from 'zod';

// =============================================================================
// Safety Incidents Schemas
// =============================================================================

/**
 * Schema para listar incidentes de seguranca
 */
export const listIncidentsSchema = z.object({
  projects_id: z.coerce.number().int().optional(),
  company_id: z.coerce.number().int().optional(),
  severity: z.enum(['leve', 'moderado', 'grave', 'fatal']).optional(),
  status: z.enum(['aberto', 'em_investigacao', 'encerrado']).optional(),
  initial_date: z.string().optional(),
  final_date: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

/**
 * Schema para buscar estatisticas de incidentes (Piramide de Bird)
 */
export const getIncidentStatisticsSchema = z.object({
  projects_id: z.coerce.number().int().optional(),
  company_id: z.coerce.number().int().optional(),
});

/**
 * Schema para buscar incidente por ID
 */
export const getIncidentByIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});

/**
 * Schema para criar incidente de seguranca
 */
export const createSafetyIncidentSchema = z.object({
  projects_id: z.coerce.number().int().optional(),
  company_id: z.coerce.number().int().optional(),
  reported_by: z.coerce.number().int({ message: 'ID do usuario que registrou e obrigatorio' }),
  incident_date: z.string({ required_error: 'Data do incidente e obrigatoria' }),
  description: z.string().trim().min(10, 'Descricao deve ter ao menos 10 caracteres'),
  location: z.string().trim().min(1, 'Local do incidente e obrigatorio'),
  severity: z.enum(['leve', 'moderado', 'grave', 'fatal'], {
    required_error: 'Severidade e obrigatoria',
  }),
  injured_user_id: z.coerce.number().int().optional(),
  injured_name: z.string().trim().optional(),
  body_part_affected: z.string().trim().optional(),
  lost_time_days: z.coerce.number().int().min(0).optional().default(0),
  immediate_cause: z.string().trim().optional(),
  property_damage: z.boolean().optional().default(false),
  property_damage_description: z.string().trim().optional(),
});

/**
 * Schema para atualizar incidente de seguranca
 */
export const updateSafetyIncidentSchema = z.object({
  description: z.string().trim().min(10).optional(),
  location: z.string().trim().min(1).optional(),
  severity: z.enum(['leve', 'moderado', 'grave', 'fatal']).optional(),
  injured_user_id: z.coerce.number().int().optional(),
  injured_name: z.string().trim().optional(),
  body_part_affected: z.string().trim().optional(),
  lost_time_days: z.coerce.number().int().min(0).optional(),
  immediate_cause: z.string().trim().optional(),
  property_damage: z.boolean().optional(),
  property_damage_description: z.string().trim().optional(),
});

/**
 * Schema para iniciar investigacao de incidente
 */
export const investigateIncidentSchema = z.object({
  investigated_by: z.coerce.number().int({ message: 'ID do investigador e obrigatorio' }),
  investigation_notes: z.string().trim().optional(),
});

/**
 * Schema para encerrar incidente
 */
export const closeIncidentSchema = z.object({
  closed_by: z.coerce.number().int({ message: 'ID de quem encerrou e obrigatorio' }),
  root_cause: z.string().trim().min(10, 'Causa raiz deve ter ao menos 10 caracteres'),
  corrective_actions: z.string().trim().min(10, 'Acoes corretivas devem ter ao menos 10 caracteres'),
  preventive_actions: z.string().trim().optional(),
});

// =============================================================================
// Incident Witnesses Schemas
// =============================================================================

/**
 * Schema para adicionar testemunha a um incidente
 */
export const createIncidentWitnessSchema = z.object({
  user_id: z.coerce.number().int().optional(),
  witness_name: z.string().trim().min(1, 'Nome da testemunha e obrigatorio'),
  witness_statement: z.string().trim().optional(),
  witness_contact: z.string().trim().optional(),
});

// =============================================================================
// Incident Attachments Schemas
// =============================================================================

/**
 * Schema para adicionar anexo a um incidente
 */
export const createIncidentAttachmentSchema = z.object({
  file_url: z.string().url('URL do arquivo invalida'),
  file_name: z.string().trim().min(1, 'Nome do arquivo e obrigatorio'),
  file_type: z.string().trim().optional(),
  uploaded_by: z.coerce.number().int({ message: 'ID do usuario que enviou e obrigatorio' }),
});

// =============================================================================
// Training Types Schemas
// =============================================================================

/**
 * Schema para listar tipos de treinamento
 */
export const listTrainingTypesSchema = z.object({
  company_id: z.coerce.number().int().optional(),
  active_only: z.coerce.boolean().optional().default(true),
});

/**
 * Schema para criar tipo de treinamento
 */
export const createTrainingTypeSchema = z.object({
  company_id: z.coerce.number().int().optional(),
  name: z.string().trim().min(1, 'Nome do treinamento e obrigatorio'),
  description: z.string().trim().optional(),
  validity_months: z.coerce.number().int().min(1, 'Validade deve ser de ao menos 1 mes'),
  is_mandatory: z.boolean().optional().default(false),
  regulatory_norm: z.string().trim().optional(),
  is_active: z.boolean().optional().default(true),
});

/**
 * Schema para atualizar tipo de treinamento
 */
export const updateTrainingTypeSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  validity_months: z.coerce.number().int().min(1).optional(),
  is_mandatory: z.boolean().optional(),
  regulatory_norm: z.string().trim().optional(),
  is_active: z.boolean().optional(),
});

// =============================================================================
// Worker Trainings Schemas
// =============================================================================

/**
 * Schema para listar treinamentos de trabalhadores
 */
export const listWorkerTrainingsSchema = z.object({
  user_id: z.coerce.number().int().optional(),
  training_types_id: z.coerce.number().int().optional(),
  company_id: z.coerce.number().int().optional(),
  status: z.enum(['valido', 'expirado', 'expirando']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

/**
 * Schema para buscar treinamentos proximos do vencimento
 */
export const getExpiringTrainingsSchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional().default(30),
  company_id: z.coerce.number().int().optional(),
});

/**
 * Schema para buscar treinamentos vencidos
 */
export const getExpiredTrainingsSchema = z.object({
  company_id: z.coerce.number().int().optional(),
});

/**
 * Schema para criar registro de treinamento do trabalhador
 */
export const createWorkerTrainingSchema = z.object({
  user_id: z.coerce.number().int({ message: 'ID do trabalhador e obrigatorio' }),
  training_types_id: z.coerce.number().int({ message: 'Tipo de treinamento e obrigatorio' }),
  training_date: z.string({ required_error: 'Data do treinamento e obrigatoria' }),
  instructor_name: z.string().trim().optional(),
  training_provider: z.string().trim().optional(),
  certificate_url: z.string().url().optional(),
  notes: z.string().trim().optional(),
});

/**
 * Schema para verificar elegibilidade de treinamento de um trabalhador para uma tarefa
 */
export const checkTrainingEligibilitySchema = z.object({
  user_id: z.coerce.number().int({ message: 'ID do usuario e obrigatorio' }),
  tasks_template_id: z.coerce.number().int({ message: 'ID do template de tarefa e obrigatorio' }),
});

// =============================================================================
// Task Required Trainings Schemas
// =============================================================================

/**
 * Schema para listar treinamentos requeridos para um template de tarefa
 */
export const listTaskRequiredTrainingsSchema = z.object({
  tasks_template_id: z.coerce.number().int().optional(),
  training_types_id: z.coerce.number().int().optional(),
});

/**
 * Schema para associar treinamento obrigatorio a um template de tarefa
 */
export const createTaskRequiredTrainingSchema = z.object({
  tasks_template_id: z.coerce.number().int({ message: 'ID do template de tarefa e obrigatorio' }),
  training_types_id: z.coerce.number().int({ message: 'ID do tipo de treinamento e obrigatorio' }),
});

/**
 * Schema para remover treinamento obrigatorio de um template de tarefa
 */
export const deleteTaskRequiredTrainingSchema = z.object({
  id: z.coerce.number().int().min(1),
});

// =============================================================================
// DDS Records Schemas
// =============================================================================

/**
 * Schema para listar registros de DDS
 */
export const listDdsRecordsSchema = z.object({
  projects_id: z.coerce.number().int().optional(),
  company_id: z.coerce.number().int().optional(),
  initial_date: z.string().optional(),
  final_date: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

/**
 * Schema para buscar estatisticas de DDS
 */
export const getDdsStatisticsSchema = z.object({
  projects_id: z.coerce.number().int().optional(),
  company_id: z.coerce.number().int().optional(),
});

/**
 * Schema para buscar DDS por ID
 */
export const getDdsByIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});

/**
 * Schema para criar registro de DDS
 */
export const createDdsRecordSchema = z.object({
  projects_id: z.coerce.number().int().optional(),
  company_id: z.coerce.number().int().optional(),
  conducted_by: z.coerce.number().int({ message: 'ID do responsavel pelo DDS e obrigatorio' }),
  dds_date: z.string({ required_error: 'Data do DDS e obrigatoria' }),
  topic: z.string().trim().min(1, 'Tema do DDS e obrigatorio'),
  duration_minutes: z.coerce.number().int().min(1).optional().default(15),
  content: z.string().trim().optional(),
  location: z.string().trim().optional(),
  participants: z.array(z.coerce.number().int()).optional().default([]),
});

/**
 * Schema para adicionar participante a um DDS
 */
export const createDdsParticipantSchema = z.object({
  user_id: z.coerce.number().int({ message: 'ID do participante e obrigatorio' }),
});

/**
 * Schema para assinar participacao em DDS
 */
export const signDdsParticipationSchema = z.object({
  user_id: z.coerce.number().int({ message: 'ID do participante e obrigatorio' }),
});

// =============================================================================
// Type Exports
// =============================================================================

export type ListIncidentsInput = z.infer<typeof listIncidentsSchema>;
export type GetIncidentStatisticsInput = z.infer<typeof getIncidentStatisticsSchema>;
export type GetIncidentByIdInput = z.infer<typeof getIncidentByIdSchema>;
export type CreateSafetyIncidentInput = z.infer<typeof createSafetyIncidentSchema>;
export type UpdateSafetyIncidentInput = z.infer<typeof updateSafetyIncidentSchema>;
export type InvestigateIncidentInput = z.infer<typeof investigateIncidentSchema>;
export type CloseIncidentInput = z.infer<typeof closeIncidentSchema>;

export type CreateIncidentWitnessInput = z.infer<typeof createIncidentWitnessSchema>;
export type CreateIncidentAttachmentInput = z.infer<typeof createIncidentAttachmentSchema>;

export type ListTrainingTypesInput = z.infer<typeof listTrainingTypesSchema>;
export type CreateTrainingTypeInput = z.infer<typeof createTrainingTypeSchema>;
export type UpdateTrainingTypeInput = z.infer<typeof updateTrainingTypeSchema>;

export type ListWorkerTrainingsInput = z.infer<typeof listWorkerTrainingsSchema>;
export type GetExpiringTrainingsInput = z.infer<typeof getExpiringTrainingsSchema>;
export type GetExpiredTrainingsInput = z.infer<typeof getExpiredTrainingsSchema>;
export type CreateWorkerTrainingInput = z.infer<typeof createWorkerTrainingSchema>;
export type CheckTrainingEligibilityInput = z.infer<typeof checkTrainingEligibilitySchema>;

export type ListTaskRequiredTrainingsInput = z.infer<typeof listTaskRequiredTrainingsSchema>;
export type CreateTaskRequiredTrainingInput = z.infer<typeof createTaskRequiredTrainingSchema>;
export type DeleteTaskRequiredTrainingInput = z.infer<typeof deleteTaskRequiredTrainingSchema>;

export type ListDdsRecordsInput = z.infer<typeof listDdsRecordsSchema>;
export type GetDdsStatisticsInput = z.infer<typeof getDdsStatisticsSchema>;
export type GetDdsByIdInput = z.infer<typeof getDdsByIdSchema>;
export type CreateDdsRecordInput = z.infer<typeof createDdsRecordSchema>;
export type CreateDdsParticipantInput = z.infer<typeof createDdsParticipantSchema>;
export type SignDdsParticipationInput = z.infer<typeof signDdsParticipationSchema>;
