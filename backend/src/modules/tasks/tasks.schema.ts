// =============================================================================
// INDUSTRYVIEW BACKEND - Tasks Schemas
// Schemas de validacao para endpoints de tasks (tasks_template)
// Equivalente aos input definitions do api_group Tasks do Xano
// =============================================================================

import { z } from 'zod';

// =============================================================================
// TASKS (tasks_template)
// =============================================================================

/**
 * Schema para listagem de tasks com paginacao e filtros
 * Equivalente a: query tasks_list verb=POST do Xano (endpoint 427)
 */
export const listTasksSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  per_page: z.number().int().positive().max(100).optional().default(20),
  search: z.string().trim().optional(),
  equipaments_types_id: z.array(z.number().int()).optional(),
  company_id: z.number().int().optional(),
  sort_field: z.string().optional(),
  sort_direction: z.enum(['asc', 'desc']).optional(),
});

export type ListTasksInput = z.infer<typeof listTasksSchema>;

/**
 * Schema para params de task
 */
export const taskParamsSchema = z.object({
  tasks_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type TaskParams = z.infer<typeof taskParamsSchema>;

/**
 * Schema para busca de task por ID
 * Equivalente a: query tasks/{tasks_id} verb=GET do Xano (endpoint 426)
 */
export const getTaskSchema = z.object({
  tasks_id: z.number().int().positive(),
});

export type GetTaskInput = z.infer<typeof getTaskSchema>;

/**
 * Schema para criacao de task
 * Equivalente a: query tasks verb=POST do Xano (endpoint 428)
 */
export const createTaskSchema = z.object({
  description: z.string().trim().min(1, 'Descricao e obrigatoria'),
  weight: z.number().min(0, 'Peso nao pode ser negativo').optional().default(1),
  amount: z.number().optional(),
  unity_id: z.number().int().optional().nullable(),
  company_id: z.number().int().optional().nullable(),
  discipline_id: z.number().int().optional().nullable(),
  equipaments_types_id: z.number().int().optional().nullable(),
  fixed: z.boolean().optional().default(false),
  is_inspection: z.boolean().optional().default(false),
  installation_method: z.string().trim().optional().nullable(),
  checklist_templates_id: z.number().int().optional().nullable(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

/**
 * Schema para atualizacao de task
 * Equivalente a: query tasks/{tasks_id} verb=PATCH do Xano (endpoint 429)
 */
export const updateTaskSchema = z.object({
  description: z.string().trim().optional(),
  equipaments_types_id: z.number().int().optional().nullable(),
  weight: z.number().min(0, 'Peso nao pode ser negativo').optional(),
  fixed: z.boolean().optional(),
  is_inspection: z.boolean().optional(),
  installation_method: z.string().trim().optional().nullable(),
  checklist_templates_id: z.number().int().optional().nullable(),
  unity_id: z.number().int().optional().nullable(),
  company_id: z.number().int().optional().nullable(),
  discipline_id: z.number().int().optional().nullable(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

// =============================================================================
// TASKS PRIORITIES
// =============================================================================

/**
 * Schema para listagem de prioridades
 * Equivalente a: query tasks_priorities verb=GET do Xano (endpoint 432)
 */
export const listTaskPrioritiesSchema = z.object({});

export type ListTaskPrioritiesInput = z.infer<typeof listTaskPrioritiesSchema>;

/**
 * Schema para params de prioridade
 */
export const taskPriorityParamsSchema = z.object({
  tasks_priorities_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type TaskPriorityParams = z.infer<typeof taskPriorityParamsSchema>;

/**
 * Schema para criacao de prioridade
 * Equivalente a: query tasks_priorities verb=POST do Xano (endpoint 433)
 */
export const createTaskPrioritySchema = z.object({
  priority: z.string().trim().optional(),
});

export type CreateTaskPriorityInput = z.infer<typeof createTaskPrioritySchema>;

/**
 * Schema para atualizacao de prioridade
 * Equivalente a: query tasks_priorities/{tasks_priorities_id} verb=PATCH do Xano (endpoint 434)
 */
export const updateTaskPrioritySchema = z.object({
  priority: z.string().trim().optional(),
});

export type UpdateTaskPriorityInput = z.infer<typeof updateTaskPrioritySchema>;

// =============================================================================
// UNITY
// =============================================================================

/**
 * Schema para listagem de unidades
 * Equivalente a: query unity verb=GET do Xano (endpoint 659)
 */
export const listUnitySchema = z.object({
  company_id: z.number().int().optional(),
});

export type ListUnityInput = z.infer<typeof listUnitySchema>;

/**
 * Schema para query string de listagem de unidades
 */
export const listUnityQuerySchema = z.object({
  company_id: z.preprocess(
    (val) => (val == null || val === 'null' || val === 'undefined' || val === '' ? undefined : Number(val)),
    z.number().int().optional()
  ),
});

export type ListUnityQuery = z.infer<typeof listUnityQuerySchema>;

/**
 * Schema para params de unidade
 */
export const unityParamsSchema = z.object({
  unity_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type UnityParams = z.infer<typeof unityParamsSchema>;

/**
 * Schema para criacao de unidade
 * Equivalente a: query unity verb=POST do Xano (endpoint 660)
 */
export const createUnitySchema = z.object({
  unity: z.string().trim().optional(),
  company_id: z.number().int().optional().nullable(),
});

export type CreateUnityInput = z.infer<typeof createUnitySchema>;

/**
 * Schema para atualizacao de unidade
 * Equivalente a: query unity/{unity_id} verb=PATCH do Xano (endpoint 661)
 */
export const updateUnitySchema = z.object({
  unity: z.string().trim().optional(),
  company_id: z.number().int().optional().nullable(),
});

export type UpdateUnityInput = z.infer<typeof updateUnitySchema>;

// =============================================================================
// DISCIPLINE
// =============================================================================

/**
 * Schema para listagem de disciplinas
 * Equivalente a: query discipline verb=GET do Xano (endpoint 714)
 */
export const listDisciplineSchema = z.object({
  company_id: z.number().int().optional(),
});

export type ListDisciplineInput = z.infer<typeof listDisciplineSchema>;

/**
 * Schema para query string de listagem de disciplinas
 */
export const listDisciplineQuerySchema = z.object({
  company_id: z.preprocess(
    (val) => (val == null || val === 'null' || val === 'undefined' || val === '' ? undefined : Number(val)),
    z.number().int().optional()
  ),
});

export type ListDisciplineQuery = z.infer<typeof listDisciplineQuerySchema>;

/**
 * Schema para params de disciplina
 */
export const disciplineParamsSchema = z.object({
  discipline_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type DisciplineParams = z.infer<typeof disciplineParamsSchema>;

/**
 * Schema para criacao de disciplina
 * Equivalente a: query creat_discipline verb=POST do Xano (endpoint 729)
 */
export const createDisciplineSchema = z.object({
  discipline: z.string().trim().optional(),
  company_id: z.number().int().optional().nullable(),
});

export type CreateDisciplineInput = z.infer<typeof createDisciplineSchema>;

/**
 * Schema para atualizacao de disciplina
 * Equivalente a: query edit_discipline verb=PUT do Xano (endpoint 730)
 */
export const updateDisciplineSchema = z.object({
  discipline_id: z.number().int().optional(),
  discipline: z.string().trim().optional(),
});

export type UpdateDisciplineInput = z.infer<typeof updateDisciplineSchema>;

/**
 * Schema para delete de disciplina
 * Equivalente a: query deleted_discipline verb=DELETE do Xano (endpoint 731)
 */
export const deleteDisciplineSchema = z.object({
  discipline_id: z.number().int().optional(),
});

export type DeleteDisciplineInput = z.infer<typeof deleteDisciplineSchema>;

// =============================================================================
// TASK COMMENTS
// =============================================================================

/**
 * Schema para listagem de comentarios de subtasks
 * Equivalente a: query comment_subtasks verb=GET do Xano (endpoint 702)
 */
export const listCommentSubtasksSchema = z.object({
  subtasks_id: z.number().int().optional(),
});

export type ListCommentSubtasksInput = z.infer<typeof listCommentSubtasksSchema>;

/**
 * Schema para query string de comentarios de subtasks
 */
export const listCommentSubtasksQuerySchema = z.object({
  subtasks_id: z.string().transform(Number).pipe(z.number().int()).optional(),
});

export type ListCommentSubtasksQuery = z.infer<typeof listCommentSubtasksQuerySchema>;

/**
 * Schema para listagem de comentarios de backlogs
 * Equivalente a: query comment_backlogs verb=GET do Xano (endpoint 705)
 */
export const listCommentBacklogsSchema = z.object({
  projects_backlogs_id: z.number().int().optional(),
});

export type ListCommentBacklogsInput = z.infer<typeof listCommentBacklogsSchema>;

/**
 * Schema para query string de comentarios de backlogs
 */
export const listCommentBacklogsQuerySchema = z.object({
  projects_backlogs_id: z.string().transform(Number).pipe(z.number().int()).optional(),
});

export type ListCommentBacklogsQuery = z.infer<typeof listCommentBacklogsQuerySchema>;

/**
 * Schema para criacao de comentario
 * Equivalente a: query task_comments verb=POST do Xano (endpoint 703)
 */
export const createTaskCommentSchema = z.object({
  comment: z.string().trim().optional(),
  projects_backlogs_id: z.number().int().optional().nullable(),
  subtasks_id: z.number().int().optional().nullable(),
  created_user_id: z.number().int().optional().nullable(),
});

export type CreateTaskCommentInput = z.infer<typeof createTaskCommentSchema>;

/**
 * Schema para params de comentario
 */
export const taskCommentParamsSchema = z.object({
  task_comments_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type TaskCommentParams = z.infer<typeof taskCommentParamsSchema>;

/**
 * Schema para atualizacao de comentario
 * Equivalente a: query task_comments/{task_comments_id} verb=PATCH do Xano (endpoint 704)
 */
export const updateTaskCommentSchema = z.object({
  comment: z.string().trim().optional(),
});

export type UpdateTaskCommentInput = z.infer<typeof updateTaskCommentSchema>;
