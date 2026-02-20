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
  severity: z.enum(['quase_acidente', 'primeiros_socorros', 'sem_afastamento', 'com_afastamento', 'fatal']).optional(),
  status: z.enum(['registrado', 'em_investigacao', 'investigado', 'encerrado']).optional(),
  initial_date: z.string().optional(),
  final_date: z.string().optional(),
  involved_user_id: z.coerce.number().int().optional(),
  witness_user_id: z.coerce.number().int().optional(),
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
  projects_id: z.coerce.number().int({ message: 'Projeto e obrigatorio' }),
  reported_by: z.coerce.number().int({ message: 'ID do usuario que registrou e obrigatorio' }),
  incident_date: z.string({ required_error: 'Data do incidente e obrigatoria' }),
  description: z.string().trim().min(10, 'Descricao deve ter ao menos 10 caracteres'),
  severity: z.enum(['quase_acidente', 'primeiros_socorros', 'sem_afastamento', 'com_afastamento', 'fatal'], {
    required_error: 'Severidade e obrigatoria',
  }),
  classification: z.enum(['tipico', 'trajeto', 'doenca_ocupacional'], {
    required_error: 'Classificacao e obrigatoria',
  }),
  category: z.string().trim().min(1, 'Categoria e obrigatoria'),
  location_description: z.string().trim().optional(),
  body_part_affected: z.string().trim().optional(),
  days_lost: z.coerce.number().int().min(0).optional().default(0),
  immediate_cause: z.string().trim().optional(),
  involved_user_id: z.coerce.number().int().optional(),
});

/**
 * Schema para atualizar incidente de seguranca
 */
export const updateSafetyIncidentSchema = z.object({
  description: z.string().trim().min(10).optional(),
  location_description: z.string().trim().optional(),
  severity: z.enum(['quase_acidente', 'primeiros_socorros', 'sem_afastamento', 'com_afastamento', 'fatal']).optional(),
  classification: z.enum(['tipico', 'trajeto', 'doenca_ocupacional']).optional(),
  category: z.string().trim().min(1).optional(),
  body_part_affected: z.string().trim().optional(),
  days_lost: z.coerce.number().int().min(0).optional(),
  immediate_cause: z.string().trim().optional(),
  involved_user_id: z.coerce.number().int().nullable().optional(),
});

/**
 * Schema para iniciar investigacao de incidente
 */
export const investigateIncidentSchema = z.object({
  investigated_by: z.coerce.number().int({ message: 'ID do investigador e obrigatorio' }),
});

/**
 * Schema para encerrar incidente
 */
export const closeIncidentSchema = z.object({
  closed_by: z.coerce.number().int({ message: 'ID de quem encerrou e obrigatorio' }),
  root_cause: z.string().trim().min(10, 'Causa raiz deve ter ao menos 10 caracteres'),
  corrective_actions: z.string().trim().min(10, 'Acoes corretivas devem ter ao menos 10 caracteres'),
});

// =============================================================================
// Incident Witnesses Schemas
// =============================================================================

/**
 * Schema para adicionar testemunha a um incidente
 */
export const createIncidentWitnessSchema = z.object({
  users_id: z.coerce.number().int().optional(),
  witness_name: z.string().trim().min(1, 'Nome da testemunha e obrigatorio'),
  witness_statement: z.string().trim().optional(),
  witness_role: z.string().trim().optional(),
});

// =============================================================================
// Incident Attachments Schemas
// =============================================================================

/**
 * Schema para adicionar anexo a um incidente
 */
export const createIncidentAttachmentSchema = z.object({
  file_url: z.string().url('URL do arquivo invalida'),
  file_type: z.string().trim().optional(),
  description: z.string().trim().optional(),
  uploaded_by_user_id: z.coerce.number().int({ message: 'ID do usuario que enviou e obrigatorio' }),
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
  nr_reference: z.string().trim().optional(),
  validity_months: z.coerce.number().int().min(1, 'Validade deve ser de ao menos 1 mes').optional(),
  is_mandatory_for_admission: z.boolean().optional().default(false),
  workload_hours: z.coerce.number().min(0, 'Carga horaria deve ser positiva').optional(),
});

/**
 * Schema para atualizar tipo de treinamento
 */
export const updateTrainingTypeSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  nr_reference: z.string().trim().optional(),
  validity_months: z.coerce.number().int().min(1).optional(),
  is_mandatory_for_admission: z.boolean().optional(),
  workload_hours: z.coerce.number().min(0).optional(),
});

// =============================================================================
// Worker Trainings Schemas
// =============================================================================

/**
 * Schema para listar treinamentos de trabalhadores
 */
export const listWorkerTrainingsSchema = z.object({
  users_id: z.coerce.number().int().optional(),
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
  users_id: z.coerce.number().int({ message: 'ID do trabalhador e obrigatorio' }),
  training_types_id: z.coerce.number().int({ message: 'Tipo de treinamento e obrigatorio' }),
  training_date: z.string({ required_error: 'Data do treinamento e obrigatoria' }),
  instructor: z.string().trim().optional(),
  institution: z.string().trim().optional(),
  certificate_number: z.string().trim().optional(),
  certificate_url: z.string().trim().optional(),
  workload_hours: z.coerce.number().int().min(0).optional(),
  company_id: z.coerce.number().int().optional(),
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
  participant_user_id: z.coerce.number().int().optional(),
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
 *
 * Aceita nomes legados do frontend (conducted_by, content) e mapeia para os
 * nomes reais das colunas da tabela (conducted_by_user_id, description).
 * Os campos company_id e location nao existem na tabela e sao ignorados.
 */
export const createDdsRecordSchema = z.object({
  projects_id: z.coerce.number().int().optional(),
  // Aceita tanto o nome legado quanto o nome correto da coluna
  conducted_by: z.coerce.number().int({ message: 'ID do responsavel pelo DDS e obrigatorio' }).optional(),
  conducted_by_user_id: z.coerce.number().int({ message: 'ID do responsavel pelo DDS e obrigatorio' }).optional(),
  dds_date: z.string({ required_error: 'Data do DDS e obrigatoria' }),
  topic: z.string().trim().min(1, 'Tema do DDS e obrigatorio'),
  duration_minutes: z.coerce.number().int().min(1).optional().default(15),
  // Aceita tanto o nome legado quanto o nome correto da coluna
  content: z.string().trim().optional(),
  description: z.string().trim().optional(),
  teams_id: z.coerce.number().int().optional(),
  // Campos ignorados (nao existem na tabela): company_id, location
  company_id: z.coerce.number().int().optional(),
  location: z.string().trim().optional(),
  participants: z.array(z.coerce.number().int()).optional().default([]),
}).refine(
  (data) => data.conducted_by !== undefined || data.conducted_by_user_id !== undefined,
  { message: 'ID do responsavel pelo DDS e obrigatorio', path: ['conducted_by_user_id'] }
);

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
