// =============================================================================
// INDUSTRYVIEW BACKEND - Projects Schemas
// Schemas de validacao para endpoints de projetos
// Equivalente aos input definitions do api_group Projects do Xano
// =============================================================================

import { z } from 'zod';

/**
 * Schema para listagem de projetos
 * Equivalente a: query projects verb=GET do Xano (endpoint 492)
 */
export const listProjectsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  per_page: z.number().int().positive().max(100).optional().default(20),
  search: z.string().trim().optional(),
  company_id: z.number().int().optional(),
  sort_field: z.string().optional(),
  sort_direction: z.enum(['asc', 'desc']).optional(),
});

export type ListProjectsInput = z.infer<typeof listProjectsSchema>;

/**
 * Schema para criacao de projeto
 * Equivalente a: query projects verb=POST do Xano (endpoint 493)
 */
export const createProjectSchema = z.object({
  registration_number: z.string().trim().optional().nullable(),
  name: z.string().min(1, 'Nome do projeto e obrigatorio').trim(),
  project_creation_date: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number().optional().nullable()
  ),
  origin_registration: z.string().trim().optional().nullable(),
  art: z.string().trim().optional().nullable(),
  rrt: z.string().trim().optional().nullable(),
  cib: z.string().trim().optional().nullable(),
  real_state_registration: z.string().trim().optional().nullable(),
  start_date: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null;
      if (typeof val === 'string' && isNaN(Number(val))) return new Date(val).getTime();
      return Number(val);
    },
    z.number().optional().nullable()
  ),
  permit_number: z.string().trim().optional().nullable(),
  cnae: z.string().trim().optional().nullable(),
  situation_date: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null;
      if (typeof val === 'string' && isNaN(Number(val))) return new Date(val).getTime();
      return Number(val);
    },
    z.number().optional().nullable()
  ),
  responsible: z.string().trim().optional().nullable(),
  cep: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  number: z.string().trim().optional().nullable(),
  state: z.string().trim().optional().nullable(),
  country: z.string().trim().optional().nullable(),
  street: z.string().trim().optional().nullable(),
  neighbourhood: z.string().trim().optional().nullable(),
  complement: z.string().trim().optional().nullable(),
  cnpj: z.string().trim().optional().nullable(),
  projects_statuses_id: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().int().optional()
  ),
  projects_works_situations_id: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number().int().optional().nullable()
  ),
  category: z.string().trim().optional().nullable(),
  destination: z.string().trim().optional().nullable(),
  project_work_type: z.string().trim().optional().nullable(),
  resulting_work_area: z.string().trim().optional().nullable(),
  company_id: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().int().optional()
  ),
  completion_percentage: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

/**
 * Schema para busca de projeto por ID
 * Equivalente a: query projects/{projects_id} verb=GET do Xano (endpoint 491)
 */
export const getProjectParamsSchema = z.object({
  projects_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type GetProjectParams = z.infer<typeof getProjectParamsSchema>;

/**
 * Schema para atualizacao de projeto
 * Equivalente a: query projects/{projects_id} verb=PATCH do Xano (endpoint 494)
 */
export const updateProjectSchema = z.object({
  registration_number: z.string().trim().optional().nullable(),
  name: z.string().trim().optional(),
  project_creation_date: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null;
      return val;
    },
    z.string().optional().nullable()
  ),
  origin_registration: z.string().trim().optional().nullable(),
  art: z.string().trim().optional().nullable(),
  rrt: z.string().trim().optional().nullable(),
  cib: z.string().trim().optional().nullable(),
  real_state_registration: z.string().trim().optional().nullable(),
  start_date: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null;
      return val;
    },
    z.string().optional().nullable()
  ),
  permit_number: z.string().trim().optional().nullable(),
  cnae: z.string().trim().optional().nullable(),
  situation_date: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null;
      return val;
    },
    z.string().optional().nullable()
  ),
  responsible: z.string().trim().optional().nullable(),
  cep: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  number: z.string().trim().optional().nullable(),
  state: z.string().trim().optional().nullable(),
  country: z.string().trim().optional().nullable(),
  street: z.string().trim().optional().nullable(),
  neighbourhood: z.string().trim().optional().nullable(),
  complement: z.string().trim().optional().nullable(),
  cnpj: z.string().trim().optional().nullable(),
  completion_percentage: z.number().min(0).max(100).optional(),
  projects_statuses_id: z.number().int().optional(),
  projects_works_situations_id: z.number().int().optional().nullable(),
  category: z.string().trim().optional().nullable(),
  destination: z.string().trim().optional().nullable(),
  project_work_type: z.string().trim().optional().nullable(),
  resulting_work_area: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null;
      return typeof val === 'string' ? Number(val) : val;
    },
    z.number().optional().nullable()
  ),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

/**
 * Schema para listagem de status de projetos
 * Equivalente a: query projects_statuses verb=GET do Xano (endpoint 487)
 */
export const listProjectStatusesQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default('1'),
  per_page: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional().default('20'),
});

export type ListProjectStatusesQuery = z.infer<typeof listProjectStatusesQuerySchema>;

/**
 * Schema para criacao de status de projeto
 * Equivalente a: query projects_statuses verb=POST do Xano (endpoint 488)
 */
export const createProjectStatusSchema = z.object({
  status: z.string().min(1, 'Status e obrigatorio').trim(),
});

export type CreateProjectStatusInput = z.infer<typeof createProjectStatusSchema>;

/**
 * Schema para params de status de projeto
 */
export const projectStatusParamsSchema = z.object({
  projects_statuses_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type ProjectStatusParams = z.infer<typeof projectStatusParamsSchema>;

/**
 * Schema para listagem de situacoes de obra
 * Equivalente a: query projects_works_situations verb=GET do Xano (endpoint 567)
 */
export const listWorksSituationsQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default('1'),
  per_page: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional().default('20'),
});

export type ListWorksSituationsQuery = z.infer<typeof listWorksSituationsQuerySchema>;

/**
 * Schema para criacao de situacao de obra
 * Equivalente a: query projects_works_situations verb=POST do Xano (endpoint 568)
 */
export const createWorksSituationSchema = z.object({
  situation: z.string().min(1, 'Situacao e obrigatoria').trim(),
});

export type CreateWorksSituationInput = z.infer<typeof createWorksSituationSchema>;

/**
 * Schema para params de situacao de obra
 */
export const worksSituationParamsSchema = z.object({
  projects_works_situations_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type WorksSituationParams = z.infer<typeof worksSituationParamsSchema>;

/**
 * Schema para listagem de usuarios do projeto
 * Equivalente a: query projects_users verb=GET do Xano (endpoint 437)
 */
export const listProjectUsersQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default('1'),
  per_page: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional().default('20'),
  projects_id: z.string().transform(Number).pipe(z.number().int()).optional(),
});

export type ListProjectUsersQuery = z.infer<typeof listProjectUsersQuerySchema>;

/**
 * Schema para associar usuario ao projeto
 * Equivalente a: query projects_users verb=POST do Xano (endpoint 438)
 */
export const createProjectUserSchema = z.object({
  users_id: z.number().int(),
  projects_id: z.number().int(),
});

export type CreateProjectUserInput = z.infer<typeof createProjectUserSchema>;

/**
 * Schema para params de usuario do projeto
 */
export const projectUserParamsSchema = z.object({
  projects_users_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type ProjectUserParams = z.infer<typeof projectUserParamsSchema>;

/**
 * Schema para listagem de backlogs do projeto
 * Equivalente a: query projects_backlogs_list/{projects_id} verb=POST do Xano (endpoint 572)
 */
export const listProjectBacklogsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  per_page: z.number().int().positive().max(100).optional().default(20),
  search: z.string().trim().optional(),
  sprint_added: z.boolean().optional().nullable(),
  fields_id: z.array(z.number().int()).optional().nullable(),
  sections_id: z.array(z.number().int()).optional().nullable(),
  rows_id: z.array(z.number().int()).optional().nullable(),
  trackers_id: z.array(z.number().int()).optional().nullable(),
  projects_backlogs_statuses_id: z.array(z.number().int()).optional(),
  tasks_types_id: z.array(z.number().int()).optional(),
  discipline_id: z.array(z.number().int()).optional(),
  sort_field: z.string().optional(),
  sort_direction: z.enum(['asc', 'desc']).optional(),
});

export type ListProjectBacklogsInput = z.infer<typeof listProjectBacklogsSchema>;

/**
 * Schema para criacao de backlog
 * Equivalente a: query projects_backlogs verb=POST do Xano (endpoint 574)
 */
export const createProjectBacklogSchema = z.object({
  name: z.string().min(1, 'Nome do backlog e obrigatorio').trim(),
  description: z.string().trim().optional().nullable(),
  hours: z.number().optional().nullable(),
  trackers_id: z.number().int().optional().nullable(),
  tasks_types_id: z.number().int().optional().nullable(),
  projects_backlogs_statuses_id: z.number().int().optional(),
  projects_id: z.number().int(),
  discipline_id: z.number().int().optional().nullable(),
  quantity: z.number().optional().nullable(),
  unity_id: z.number().int().optional().nullable(),
});

export type CreateProjectBacklogInput = z.infer<typeof createProjectBacklogSchema>;

/**
 * Schema para params de backlog
 */
export const projectBacklogParamsSchema = z.object({
  projects_backlogs_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type ProjectBacklogParams = z.infer<typeof projectBacklogParamsSchema>;

/**
 * Schema para params de projeto (path)
 */
export const projectIdParamsSchema = z.object({
  projects_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type ProjectIdParams = z.infer<typeof projectIdParamsSchema>;

/**
 * Schema para atualizacao de backlog
 * Equivalente a: query projects_backlogs/{projects_backlogs_id} verb=PUT do Xano (endpoint 571)
 */
export const updateProjectBacklogSchema = z.object({
  name: z.string().trim().optional(),
  description: z.string().trim().optional().nullable(),
  hours: z.number().optional().nullable(),
  trackers_id: z.number().int().optional().nullable(),
  tasks_types_id: z.number().int().optional().nullable(),
  projects_backlogs_statuses_id: z.number().int().optional(),
  discipline_id: z.number().int().optional().nullable(),
  quantity: z.number().optional().nullable(),
  unity_id: z.number().int().optional().nullable(),
  checked: z.boolean().optional(),
  weight: z.number().optional().nullable(),
  planned_start_date: z.string().optional().nullable(),
  planned_end_date: z.string().optional().nullable(),
  actual_start_date: z.string().optional().nullable(),
  actual_end_date: z.string().optional().nullable(),
  planned_duration_days: z.number().int().optional().nullable(),
  planned_cost: z.number().optional().nullable(),
  actual_cost: z.number().optional().nullable(),
  percent_complete: z.number().optional().nullable(),
  wbs_code: z.string().trim().optional().nullable(),
  sort_order: z.number().int().optional().nullable(),
  level: z.number().int().optional().nullable(),
});

export type UpdateProjectBacklogInput = z.infer<typeof updateProjectBacklogSchema>;

/**
 * Schema para criacao em massa de backlogs
 * Equivalente a: query projects_backlogs_bulk verb=POST do Xano (endpoint 581)
 */
export const createBulkBacklogsSchema = z.object({
  projects_id: z.number().int(),
  backlogs: z.array(z.object({
    name: z.string().min(1).trim(),
    description: z.string().trim().optional().nullable(),
    hours: z.number().optional().nullable(),
    tasks_types_id: z.number().int().optional().nullable(),
    discipline_id: z.number().int().optional().nullable(),
    quantity: z.number().optional().nullable(),
    unity_id: z.number().int().optional().nullable(),
  })),
});

export type CreateBulkBacklogsInput = z.infer<typeof createBulkBacklogsSchema>;

/**
 * Schema para criacao manual de backlogs
 * Equivalente a: query projects_backlogs_manual verb=POST do Xano (endpoint 641)
 */
export const createManualBacklogSchema = z.object({
  projects_id: z.number().int(),
  description: z.string().trim().optional().nullable(),
  weight: z.number().optional().nullable(),
  unity_id: z.number().int().optional().nullable(),
  quantity: z.number().optional().nullable(),
  task_quantity: z.number().int().min(1).default(1),
  discipline_id: z.number().int().optional().nullable(),
});

export type CreateManualBacklogInput = z.infer<typeof createManualBacklogSchema>;

/**
 * Schema para filtros de backlog
 * Equivalente a: query filters_project_backlog verb=POST do Xano (endpoint 599)
 */
export const filtersProjectBacklogSchema = z.object({
  projects_id: z.number().int().optional().nullable(),
  fields_id: z.array(z.number().int()).optional().nullable(),
  sections_id: z.array(z.number().int()).optional().nullable(),
  rows_id: z.array(z.number().int()).optional().nullable(),
  trackers_id: z.array(z.number().int()).optional().nullable(),
});

export type FiltersProjectBacklogInput = z.infer<typeof filtersProjectBacklogSchema>;

/**
 * Schema para listagem de subtasks
 * Equivalente a: query subtasks verb=GET do Xano (endpoint 667)
 */
export const listSubtasksQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default('1'),
  per_page: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional().default('20'),
  projects_backlogs_id: z.string().transform(Number).pipe(z.number().int()).optional(),
});

export type ListSubtasksQuery = z.infer<typeof listSubtasksQuerySchema>;

/**
 * Schema para criacao de subtask
 * Equivalente a: query subtasks verb=POST do Xano (endpoint 663)
 */
export const createSubtaskSchema = z.object({
  description: z.string().trim().optional().nullable(),
  projects_backlogs_id: z.number().int(),
  weight: z.number().optional().nullable(),
  fixed: z.boolean().optional().nullable(),
  projects_id: z.number().int().optional().nullable(),
  quantity: z.number().optional().nullable(),
  task_quantity: z.number().int().min(1).default(1),
  quality_status_id: z.number().int().optional().nullable(),
});

export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>;

/**
 * Schema para params de subtask
 */
export const subtaskParamsSchema = z.object({
  subtasks_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type SubtaskParams = z.infer<typeof subtaskParamsSchema>;

/**
 * Schema para atualizacao de subtask
 * Equivalente a: query subtasks/{subtasks_id} verb=PUT do Xano (endpoint 666)
 */
export const updateSubtaskSchema = z.object({
  description: z.string().trim().optional().nullable(),
  weight: z.number().optional().nullable(),
  fixed: z.boolean().optional().nullable(),
  quantity: z.number().optional().nullable(),
  unity_id: z.number().int().optional().nullable(),
});

export type UpdateSubtaskInput = z.infer<typeof updateSubtaskSchema>;
