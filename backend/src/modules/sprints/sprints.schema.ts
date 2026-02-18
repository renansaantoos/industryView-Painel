// =============================================================================
// INDUSTRYVIEW BACKEND - Sprints Schemas
// Schemas de validacao para endpoints de sprints
// Equivalente aos input definitions do api_group Sprints do Xano
// =============================================================================

import { z } from 'zod';

/**
 * Schema para listagem de sprints
 * Equivalente a: query sprints verb=GET do Xano (endpoint 512)
 */
export const listSprintsQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default('1'),
  per_page: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional().default('20'),
  projects_id: z.string().transform(Number).pipe(z.number().int().positive()),
  dt_start: z.string().datetime({ local: true, offset: true }).optional().nullable(),
  dt_end: z.string().datetime({ local: true, offset: true }).optional().nullable(),
});

export type ListSprintsQuery = z.infer<typeof listSprintsQuerySchema>;

/**
 * Schema para criacao de sprint
 * Equivalente a: query sprints verb=POST do Xano (endpoint 513)
 */
export const createSprintSchema = z.object({
  title: z.string().min(1, 'Titulo e obrigatorio').trim(),
  objective: z.string().trim().optional().nullable(),
  start_date: z.string().datetime({ local: true, offset: true }),
  end_date: z.string().datetime({ local: true, offset: true }),
  progress_percentage: z.number().min(0).max(100).optional().default(0),
  projects_id: z.number().int(),
  sprints_statuses_id: z.number().int().optional().default(4), // 4 = Futura
});

export type CreateSprintInput = z.infer<typeof createSprintSchema>;

/**
 * Schema para params de sprint
 */
export const sprintParamsSchema = z.object({
  sprints_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type SprintParams = z.infer<typeof sprintParamsSchema>;

/**
 * Schema para atualizacao de sprint
 * Equivalente a: query sprints/{sprints_id} verb=PATCH do Xano (endpoint 514)
 */
export const updateSprintSchema = z.object({
  title: z.string().trim().optional(),
  objective: z.string().trim().optional().nullable(),
  start_date: z.union([z.string(), z.number()]).optional().nullable(),
  end_date: z.union([z.string(), z.number()]).optional().nullable(),
  progress_percentage: z.number().min(0).max(100).optional().nullable(),
  projects_id: z.number().int().optional().nullable(),
  sprints_statuses_id: z.number().int().optional(),
});

export type UpdateSprintInput = z.infer<typeof updateSprintSchema>;

/**
 * Schema para atualizacao de status de sprint
 * Equivalente a: query update_sprint_status verb=PUT do Xano (endpoint 590)
 */
export const updateSprintStatusSchema = z.object({
  sprints_id: z.number().int(),
  sprints_statuses_id: z.number().int(),
});

export type UpdateSprintStatusInput = z.infer<typeof updateSprintStatusSchema>;

/**
 * Schema para listagem de status de sprints
 * Equivalente a: query sprints_statuses verb=GET do Xano (endpoint 517)
 */
export const listSprintStatusesQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default('1'),
  per_page: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional().default('20'),
});

export type ListSprintStatusesQuery = z.infer<typeof listSprintStatusesQuerySchema>;

/**
 * Schema para criacao de status de sprint
 * Equivalente a: query sprints_statuses verb=POST do Xano (endpoint 518)
 */
export const createSprintStatusSchema = z.object({
  status: z.string().min(1, 'Status e obrigatorio').trim(),
});

export type CreateSprintStatusInput = z.infer<typeof createSprintStatusSchema>;

/**
 * Schema para params de status de sprint
 */
export const sprintStatusParamsSchema = z.object({
  sprints_statuses_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type SprintStatusParams = z.infer<typeof sprintStatusParamsSchema>;

/**
 * Schema para painel de tarefas da sprint
 * Equivalente a: query sprints_tasks_painel verb=POST do Xano (endpoint 522)
 */
export const sprintTasksPanelSchema = z.object({
  projects_id: z.number().int(),
  sprints_id: z.number().int(),
  equipaments_types_id: z.array(z.number().int()).optional(),
  teams_id: z.array(z.number().int()).optional(),
  fields_id: z.number().int().optional().nullable(),
  rows_id: z.number().int().optional().nullable(),
  search: z.number().int().optional().nullable(),
  sections_id: z.number().int().optional().nullable(),
  scheduled_for: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null;
      // Converte data pura (YYYY-MM-DD) para datetime
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return `${val}T00:00:00.000`;
      return val;
    },
    z.string().datetime({ local: true, offset: true }).optional().nullable()
  ),
  // Paginacao por status - Preprocess para converter null em undefined (ativando default) e garantir number
  pagePen: z.preprocess(
    (val) => (val === null || val === '' ? undefined : Number(val)),
    z.number().int().positive().optional().default(1)
  ),
  per_pagePen: z.preprocess(
    (val) => (val === null || val === '' ? undefined : Number(val)),
    z.number().int().positive().max(100).optional().default(20)
  ),
  pageAnd: z.preprocess(
    (val) => (val === null || val === '' ? undefined : Number(val)),
    z.number().int().positive().optional().default(1)
  ),
  per_pageAnd: z.preprocess(
    (val) => (val === null || val === '' ? undefined : Number(val)),
    z.number().int().positive().max(100).optional().default(20)
  ),
  pageIns: z.preprocess(
    (val) => (val === null || val === '' ? undefined : Number(val)),
    z.number().int().positive().optional().default(1)
  ),
  per_pageIns: z.preprocess(
    (val) => (val === null || val === '' ? undefined : Number(val)),
    z.number().int().positive().max(100).optional().default(20)
  ),
  pageSem: z.preprocess(
    (val) => (val === null || val === '' ? undefined : Number(val)),
    z.number().int().positive().optional().default(1)
  ),
  per_pageSem: z.preprocess(
    (val) => (val === null || val === '' ? undefined : Number(val)),
    z.number().int().positive().max(100).optional().default(20)
  ),
  pageConc: z.preprocess(
    (val) => (val === null || val === '' ? undefined : Number(val)),
    z.number().int().positive().optional().default(1)
  ),
  per_pageConc: z.preprocess(
    (val) => (val === null || val === '' ? undefined : Number(val)),
    z.number().int().positive().max(100).optional().default(20)
  ),
});

export type SprintTasksPanelInput = z.infer<typeof sprintTasksPanelSchema>;

/**
 * Schema para criacao de tarefa de sprint
 * Equivalente a: query sprints_tasks verb=POST do Xano (endpoint 523)
 */
export const createSprintTaskSchema = z.object({
  sprints_id: z.number().int(),
  projects_backlogs_id: z.number().int(),
  teams_id: z.number().int().optional().nullable(),
  subtasks_id: z.number().int().optional().nullable(),
  sprints_tasks_statuses_id: z.number().int().optional().default(1),
  scheduled_for: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null;
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return `${val}T00:00:00.000`;
      return val;
    },
    z.string().datetime({ local: true, offset: true }).optional().nullable()
  ),
  quantity_done: z.number().optional().default(0),
});

export type CreateSprintTaskInput = z.infer<typeof createSprintTaskSchema>;

/**
 * Schema para params de tarefa de sprint
 */
export const sprintTaskParamsSchema = z.object({
  sprints_tasks_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type SprintTaskParams = z.infer<typeof sprintTaskParamsSchema>;

/**
 * Schema para atualizacao de tarefa de sprint
 * Equivalente a: query sprints_tasks/{sprints_tasks_id} verb=PATCH do Xano (endpoint 524)
 */
export const updateSprintTaskSchema = z.object({
  teams_id: z.number().int().optional().nullable(),
  sprints_tasks_statuses_id: z.number().int().optional(),
  scheduled_for: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null;
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return `${val}T00:00:00.000`;
      return val;
    },
    z.string().datetime({ local: true, offset: true }).optional().nullable()
  ),
  quantity_done: z.number().optional(),
  end_date: z.string().datetime({ local: true, offset: true }).optional().nullable(),
});

export type UpdateSprintTaskInput = z.infer<typeof updateSprintTaskSchema>;

/**
 * Schema para atualizacao de status de tarefa
 * Equivalente a: query update_sprint_task_status verb=PUT do Xano (endpoint 591)
 */
export const updateSprintTaskStatusSchema = z.object({
  sprints_tasks_id: z.number().int(),
  sprints_tasks_statuses_id: z.number().int(),
  quantity_done: z.number().optional(),
});

export type UpdateSprintTaskStatusInput = z.infer<typeof updateSprintTaskStatusSchema>;

/**
 * Schema para atualizacao de status de tarefa (app)
 * Equivalente a: query update_sprint_task_status_app verb=PUT do Xano (endpoint 634)
 */
export const updateSprintTaskStatusAppSchema = z.object({
  sprints_tasks_id: z.number().int(),
  sprints_tasks_statuses_id: z.number().int(),
  quantity_done: z.number().optional(),
  photo: z.string().optional().nullable(),
  observation: z.string().trim().optional().nullable(),
});

export type UpdateSprintTaskStatusAppInput = z.infer<typeof updateSprintTaskStatusAppSchema>;

/**
 * Schema para listagem de status de tarefas de sprint
 * Equivalente a: query sprints_tasks_statuses verb=GET do Xano (endpoint 532)
 */
export const listSprintTaskStatusesQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default('1'),
  per_page: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional().default('20'),
});

export type ListSprintTaskStatusesQuery = z.infer<typeof listSprintTaskStatusesQuerySchema>;

/**
 * Schema para criacao de status de tarefa de sprint
 * Equivalente a: query sprints_tasks_statuses verb=POST do Xano (endpoint 533)
 */
export const createSprintTaskStatusSchema = z.object({
  status: z.string().min(1, 'Status e obrigatorio').trim(),
});

export type CreateSprintTaskStatusInput = z.infer<typeof createSprintTaskStatusSchema>;

/**
 * Schema para params de status de tarefa de sprint
 */
export const sprintTaskStatusParamsSchema = z.object({
  sprints_tasks_statuses_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type SprintTaskStatusParams = z.infer<typeof sprintTaskStatusParamsSchema>;

/**
 * Schema para listagem de quality status
 * Equivalente a: query quality_status verb=GET do Xano (endpoint 654)
 */
export const listQualityStatusQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default('1'),
  per_page: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional().default('20'),
});

export type ListQualityStatusQuery = z.infer<typeof listQualityStatusQuerySchema>;

/**
 * Schema para criacao de quality status
 * Equivalente a: query quality_status verb=POST do Xano (endpoint 655)
 */
export const createQualityStatusSchema = z.object({
  status: z.string().min(1, 'Status e obrigatorio').trim(),
});

export type CreateQualityStatusInput = z.infer<typeof createQualityStatusSchema>;

/**
 * Schema para params de quality status
 */
export const qualityStatusParamsSchema = z.object({
  quality_status_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type QualityStatusParams = z.infer<typeof qualityStatusParamsSchema>;

/**
 * Schema para atualizacao de inspecao
 * Equivalente a: query update_inspection verb=POST do Xano (endpoint 669)
 */
export const updateInspectionSchema = z.object({
  sprints_tasks_id: z.number().int(),
  quality_status_id: z.number().int(),
  observation: z.string().trim().optional().nullable(),
});

export type UpdateInspectionInput = z.infer<typeof updateInspectionSchema>;

/**
 * Schema para grafico de sprint
 * Equivalente a: query sprints_grafico_filter verb=GET do Xano (endpoint 629)
 */
export const sprintChartFilterSchema = z.object({
  sprints_id: z.string().transform(Number).pipe(z.number().int().positive()),
  teams_id: z.string().transform(Number).pipe(z.number().int()).optional().nullable(),
});

export type SprintChartFilterQuery = z.infer<typeof sprintChartFilterSchema>;

/**
 * Schema para tarefas do app
 * Equivalente a: query sprints_tasks_app verb=GET do Xano (endpoint 600)
 */
export const sprintTasksAppQuerySchema = z.object({
  projects_id: z.string().transform(Number).pipe(z.number().int().positive()),
  sprints_id: z.string().transform(Number).pipe(z.number().int().positive()),
  users_id: z.string().transform(Number).pipe(z.number().int().positive()),
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default('1'),
  per_page: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional().default('20'),
});

export type SprintTasksAppQuery = z.infer<typeof sprintTasksAppQuerySchema>;

/**
 * Schema para finalizacao de subtask
 * Equivalente a: query end_subtask verb=PUT do Xano (endpoint 668)
 */
export const endSubtaskSchema = z.object({
  sprints_tasks_id: z.number().int(),
  quantity_done: z.number(),
});

export type EndSubtaskInput = z.infer<typeof endSubtaskSchema>;

/**
 * Schema para atualizacao em lista de tarefas
 * Equivalente a: query update_lista_sprint_task_status verb=PUT do Xano (endpoint 631)
 */
export const updateListSprintTaskStatusSchema = z.object({
  tasks: z.array(z.object({
    sprints_tasks_id: z.number().int(),
    sprints_tasks_statuses_id: z.number().int(),
  })),
});

export type UpdateListSprintTaskStatusInput = z.infer<typeof updateListSprintTaskStatusSchema>;

/**
 * Schema para contagem de subtasks
 * Equivalente a: query counts_subtasks verb=GET do Xano (endpoint 712)
 */
export const countsSubtasksQuerySchema = z.object({
  projects_backlogs_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type CountsSubtasksQuery = z.infer<typeof countsSubtasksQuerySchema>;
