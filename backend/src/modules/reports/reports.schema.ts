// =============================================================================
// INDUSTRYVIEW BACKEND - Reports Module Schema
// Schemas de validacao do modulo de relatorios
// Equivalente aos inputs dos endpoints do Xano em apis/reports/
// =============================================================================

import { z } from 'zod';

// =============================================================================
// Dashboard Schemas
// =============================================================================

/**
 * Schema para buscar dashboard
 * Equivalente a: query dashboard verb=GET do Xano
 */
export const getDashboardSchema = z.object({
  initial_date: z.string().datetime({ local: true, offset: true }).optional(),
  final_date: z.string().datetime({ local: true, offset: true }).optional(),
  projects_id: z.coerce.number().int().optional(),
});

// =============================================================================
// Daily Report Schemas
// =============================================================================

/**
 * Schema para listar relatorios diarios
 * Equivalente a: query daily_report verb=GET do Xano
 */
export const listDailyReportsSchema = z.object({
  projects_id: z.coerce.number().int().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
  initial_date: z.string().optional(),
  final_date: z.string().optional(),
  sort_field: z.string().optional(),
  sort_direction: z.enum(['asc', 'desc']).optional(),
});

/**
 * Schema para buscar relatorio diario por ID
 */
export const getDailyReportByIdSchema = z.object({
  daily_report_id: z.coerce.number().int().min(1),
});

/**
 * Schema para criar relatorio diario
 * Equivalente a: query daily_report verb=POST do Xano
 */
export const createDailyReportSchema = z.object({
  projects_id: z.coerce.number().int().optional(),
  schedule_id: z.array(z.coerce.number().int()).min(1, 'Voce nao pode criar um RDO sem nenhum lider.'),
  date: z.string().optional(),
});

/**
 * Schema para atualizar relatorio diario
 */
export const updateDailyReportSchema = z.object({
  daily_report_id: z.coerce.number().int().min(1),
  rdo_date: z.string().optional(),
});

/**
 * Schema para deletar relatorio diario
 */
export const deleteDailyReportSchema = z.object({
  daily_report_id: z.coerce.number().int().min(1),
});

/**
 * Schema para buscar datas de relatorios
 * Equivalente a: query daily_report_dates verb=GET do Xano
 */
export const getDailyReportDatesSchema = z.object({
  projects_id: z.coerce.number().int().optional(),
});

/**
 * Schema para gerar PDF do relatorio
 * Equivalente a: query "daily_report/{daily_report_id}/pdf" verb=GET do Xano
 */
export const getDailyReportPdfSchema = z.object({
  daily_report_id: z.coerce.number().int().min(1),
});

// =============================================================================
// Schedule Schemas
// =============================================================================

/**
 * Schema para buscar programacao por dia
 * Equivalente a: query schedule_per_day verb=GET do Xano
 */
export const getSchedulePerDaySchema = z.object({
  projects_id: z.coerce.number().int().optional(),
  date: z.string().optional(),
});

// =============================================================================
// Burndown Schemas
// =============================================================================

/**
 * Schema para buscar dados do burndown
 * Equivalente a: query burndown verb=GET do Xano
 */
export const getBurndownSchema = z.object({
  sprints_id: z.coerce.number().int().optional(),
  projects_id: z.coerce.number().int().optional(),
});

// =============================================================================
// Sprint Task Status Log Schemas
// =============================================================================

/**
 * Schema para listar logs de status de tarefas de sprint
 * Equivalente a: query sprint_task_status_log verb=GET do Xano
 */
export const listSprintTaskStatusLogSchema = z.object({
  sprints_tasks_id: z.coerce.number().int().optional(),
});

/**
 * Schema para buscar log por ID
 */
export const getSprintTaskStatusLogByIdSchema = z.object({
  sprint_task_status_log_id: z.coerce.number().int().min(1),
});

/**
 * Schema para criar log de status
 */
export const createSprintTaskStatusLogSchema = z.object({
  sprints_tasks_id: z.coerce.number().int(),
  users_id: z.coerce.number().int().optional(),
  changed_field: z.string().trim().optional(),
  old_value: z.string().trim().optional(),
  new_value: z.string().trim().optional(),
  date: z.string().optional(),
});

/**
 * Schema para atualizar log
 */
export const updateSprintTaskStatusLogSchema = z.object({
  sprint_task_status_log_id: z.coerce.number().int().min(1),
  changed_field: z.string().trim().optional(),
  old_value: z.string().trim().optional(),
  new_value: z.string().trim().optional(),
});

/**
 * Schema para deletar log
 */
export const deleteSprintTaskStatusLogSchema = z.object({
  sprint_task_status_log_id: z.coerce.number().int().min(1),
});

// =============================================================================
// Informe Diario Schemas
// =============================================================================

/**
 * Schema para listar informes diarios
 * Equivalente a: query informe_diario verb=GET do Xano
 */
export const listInformeDiarioSchema = z.object({
  projects_id: z.coerce.number().int().optional(),
  date: z.string().optional(),
});

/**
 * Schema para informe diario filtrado
 * Equivalente a: query informe_diario_0 verb=GET do Xano
 */
export const getInformeDiarioFilteredSchema = z.object({
  projects_id: z.coerce.number().int().optional(),
  teams_id: z.coerce.number().int().optional(),
  date: z.string().optional(),
});

// =============================================================================
// QR Code Reader Schema
// =============================================================================

/**
 * Schema para leitura de QR code
 * Equivalente a: query qrcode_reader verb=GET do Xano
 */
export const qrcodeReaderSchema = z.object({
  qrcode: z.string().trim().optional(),
});

// =============================================================================
// Type Exports
// =============================================================================

export type GetDashboardInput = z.infer<typeof getDashboardSchema>;

export type ListDailyReportsInput = z.infer<typeof listDailyReportsSchema>;
export type GetDailyReportByIdInput = z.infer<typeof getDailyReportByIdSchema>;
export type CreateDailyReportInput = z.infer<typeof createDailyReportSchema>;
export type UpdateDailyReportInput = z.infer<typeof updateDailyReportSchema>;
export type DeleteDailyReportInput = z.infer<typeof deleteDailyReportSchema>;
export type GetDailyReportDatesInput = z.infer<typeof getDailyReportDatesSchema>;
export type GetDailyReportPdfInput = z.infer<typeof getDailyReportPdfSchema>;

export type GetSchedulePerDayInput = z.infer<typeof getSchedulePerDaySchema>;

export type GetBurndownInput = z.infer<typeof getBurndownSchema>;

export type ListSprintTaskStatusLogInput = z.infer<typeof listSprintTaskStatusLogSchema>;
export type GetSprintTaskStatusLogByIdInput = z.infer<typeof getSprintTaskStatusLogByIdSchema>;
export type CreateSprintTaskStatusLogInput = z.infer<typeof createSprintTaskStatusLogSchema>;
export type UpdateSprintTaskStatusLogInput = z.infer<typeof updateSprintTaskStatusLogSchema>;
export type DeleteSprintTaskStatusLogInput = z.infer<typeof deleteSprintTaskStatusLogSchema>;

export type ListInformeDiarioInput = z.infer<typeof listInformeDiarioSchema>;
export type GetInformeDiarioFilteredInput = z.infer<typeof getInformeDiarioFilteredSchema>;

export type QrcodeReaderInput = z.infer<typeof qrcodeReaderSchema>;
