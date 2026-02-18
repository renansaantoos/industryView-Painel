// =============================================================================
// INDUSTRYVIEW BACKEND - Planning Schemas
// Schemas de validacao para endpoints de planning
// Cobre: schedule_baselines, task_dependencies, company_modules, backlog_planning
// =============================================================================

import { z } from 'zod';

// =============================================================================
// COMPANY MODULES
// =============================================================================

/**
 * Schema para listagem de modulos da empresa
 */
export const listCompanyModulesQuerySchema = z.object({
  company_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type ListCompanyModulesQuery = z.infer<typeof listCompanyModulesQuerySchema>;

/**
 * Schema para criacao/atualizacao de modulo da empresa
 */
export const upsertCompanyModuleSchema = z.object({
  company_id: z.number().int().positive('company_id e obrigatorio'),
  module_name: z.string().min(1, 'module_name e obrigatorio').trim(),
  is_active: z.boolean(),
});

export type UpsertCompanyModuleInput = z.infer<typeof upsertCompanyModuleSchema>;

/**
 * Schema para verificacao se modulo esta ativo
 */
export const checkCompanyModuleQuerySchema = z.object({
  company_id: z.string().transform(Number).pipe(z.number().int().positive()),
  module_name: z.string().min(1, 'module_name e obrigatorio'),
});

export type CheckCompanyModuleQuery = z.infer<typeof checkCompanyModuleQuerySchema>;

// =============================================================================
// SCHEDULE BASELINES
// =============================================================================

/**
 * Schema para listagem de baselines
 */
export const listBaselinesQuerySchema = z.object({
  projects_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type ListBaselinesQuery = z.infer<typeof listBaselinesQuerySchema>;

/**
 * Schema para params de baseline
 */
export const baselineParamsSchema = z.object({
  id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type BaselineParams = z.infer<typeof baselineParamsSchema>;

/**
 * Schema para criacao de baseline
 */
export const createBaselineSchema = z.object({
  projects_id: z.number().int().positive('projects_id e obrigatorio'),
  sprints_id: z.number().int().optional().nullable(),
  description: z.string().trim().optional().nullable(),
});

export type CreateBaselineInput = z.infer<typeof createBaselineSchema>;

/**
 * Schema para Curve S (comparativo baseline vs real)
 * baseline_id vem do path param (:id), validado por baselineParamsSchema
 */
export const curveSQuerySchema = z.object({
  projects_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type CurveSQuery = z.infer<typeof curveSQuerySchema>;

// =============================================================================
// TASK DEPENDENCIES
// =============================================================================

/**
 * Schema para listagem de dependencias
 */
export const listDependenciesQuerySchema = z.object({
  projects_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type ListDependenciesQuery = z.infer<typeof listDependenciesQuerySchema>;

/**
 * Schema para criacao de dependencia
 */
export const createDependencySchema = z.object({
  projects_id: z.number().int().positive('projects_id e obrigatorio'),
  predecessor_backlog_id: z.number().int().positive('predecessor_backlog_id e obrigatorio'),
  successor_backlog_id: z.number().int().positive('successor_backlog_id e obrigatorio'),
  dependency_type: z.enum(['FS', 'SS', 'FF', 'SF']).default('FS'),
  lag_days: z.number().int().min(-365).max(365).default(0),
});

export type CreateDependencyInput = z.infer<typeof createDependencySchema>;

/**
 * Schema para params de dependencia
 */
export const dependencyParamsSchema = z.object({
  id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type DependencyParams = z.infer<typeof dependencyParamsSchema>;

/**
 * Schema para dependencias de um backlog especifico
 */
export const backlogDependenciesParamsSchema = z.object({
  backlog_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type BacklogDependenciesParams = z.infer<typeof backlogDependenciesParamsSchema>;

// =============================================================================
// GANTT DATA
// =============================================================================

/**
 * Schema para dados do Gantt
 */
export const ganttQuerySchema = z.object({
  projects_id: z.string().transform(Number).pipe(z.number().int().positive()),
  sprints_id: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
});

export type GanttQuery = z.infer<typeof ganttQuerySchema>;

// =============================================================================
// BACKLOG PLANNING
// =============================================================================

/**
 * Schema para atualizacao de campos de planejamento de um backlog
 */
export const updateBacklogPlanningSchema = z.object({
  planned_start_date: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null;
      return val;
    },
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional().nullable()
  ),
  planned_end_date: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null;
      return val;
    },
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional().nullable()
  ),
  actual_start_date: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null;
      return val;
    },
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional().nullable()
  ),
  actual_end_date: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null;
      return val;
    },
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional().nullable()
  ),
  planned_duration_days: z.number().int().min(0).optional().nullable(),
  planned_cost: z.number().min(0).optional().nullable(),
  actual_cost: z.number().min(0).optional().nullable(),
  percent_complete: z.number().min(0).max(100).optional().nullable(),
  wbs_code: z.string().max(50).trim().optional().nullable(),
  sort_order: z.number().int().min(0).optional().nullable(),
  level: z.number().int().min(0).optional().nullable(),
});

export type UpdateBacklogPlanningInput = z.infer<typeof updateBacklogPlanningSchema>;

/**
 * Schema para params de backlog planning
 */
export const backlogPlanningParamsSchema = z.object({
  id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type BacklogPlanningParams = z.infer<typeof backlogPlanningParamsSchema>;

/**
 * Item de atualizacao em lote de backlog planning
 */
export const bulkBacklogPlanningItemSchema = z.object({
  id: z.number().int().positive('id do backlog e obrigatorio'),
  planned_start_date: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null;
      return val;
    },
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional().nullable()
  ),
  planned_end_date: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null;
      return val;
    },
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional().nullable()
  ),
  actual_start_date: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null;
      return val;
    },
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional().nullable()
  ),
  actual_end_date: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null;
      return val;
    },
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional().nullable()
  ),
  planned_duration_days: z.number().int().min(0).optional().nullable(),
  planned_cost: z.number().min(0).optional().nullable(),
  actual_cost: z.number().min(0).optional().nullable(),
  percent_complete: z.number().min(0).max(100).optional().nullable(),
  wbs_code: z.string().max(50).trim().optional().nullable(),
  sort_order: z.number().int().min(0).optional().nullable(),
  level: z.number().int().min(0).optional().nullable(),
});

export type BulkBacklogPlanningItem = z.infer<typeof bulkBacklogPlanningItemSchema>;

/**
 * Schema para atualizacao em lote de backlog planning
 */
export const bulkUpdateBacklogPlanningSchema = z.object({
  items: z.array(bulkBacklogPlanningItemSchema).min(1, 'Pelo menos um item e obrigatorio'),
});

export type BulkUpdateBacklogPlanningInput = z.infer<typeof bulkUpdateBacklogPlanningSchema>;

// =============================================================================
// CAMINHO CRITICO
// =============================================================================

/**
 * Schema para query do caminho critico
 */
export const criticalPathQuerySchema = z.object({
  projects_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type CriticalPathQuery = z.infer<typeof criticalPathQuerySchema>;

// =============================================================================
// SAUDE DO CRONOGRAMA
// =============================================================================

/**
 * Schema para query da saude do cronograma
 */
export const scheduleHealthQuerySchema = z.object({
  projects_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type ScheduleHealthQuery = z.infer<typeof scheduleHealthQuerySchema>;

// =============================================================================
// ROLLUP DE PROGRESSO
// =============================================================================

/**
 * Schema para params de rollup de um backlog especifico
 */
export const rollupBacklogParamsSchema = z.object({
  backlog_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type RollupBacklogParams = z.infer<typeof rollupBacklogParamsSchema>;

/**
 * Schema para params de rollup de projeto completo
 */
export const rollupProjectParamsSchema = z.object({
  projects_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type RollupProjectParams = z.infer<typeof rollupProjectParamsSchema>;
