// =============================================================================
// INDUSTRYVIEW BACKEND - Projects Routes
// Rotas do modulo de projetos
// Equivalente aos endpoints do api_group Projects do Xano
// =============================================================================

import { Router } from 'express';
import multer from 'multer';
import { ProjectsController } from './projects.controller';
import { SprintsController } from '../sprints/sprints.controller';
import { TeamsController } from '../teams/teams.controller';
import { authenticate } from '../../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../../middleware/validation';
import {
  createProjectSchema,
  getProjectParamsSchema,
  updateProjectSchema,
  createProjectStatusSchema,
  projectStatusParamsSchema,
  createWorksSituationSchema,
  worksSituationParamsSchema,
  listProjectUsersQuerySchema,
  createProjectUserSchema,
  projectUserParamsSchema,
  projectIdParamsSchema,
  listProjectBacklogsSchema,
  createProjectBacklogSchema,
  projectBacklogParamsSchema,
  updateProjectBacklogSchema,
  createBulkBacklogsSchema,
  createManualBacklogSchema,
  filtersProjectBacklogSchema,
  listSubtasksQuerySchema,
  createSubtaskSchema,
  subtaskParamsSchema,
  updateSubtaskSchema,
} from './projects.schema';
import { sprintTasksPanelSchema } from '../sprints/sprints.schema';
import { listAllTeamsQuerySchema, listTeamLeadersQuerySchema } from '../teams/teams.schema';

const router = Router();
const upload = multer();

router.use((req, _res, next) => {
  console.log(`[ProjectsRoute DEBUG] Path: ${req.path}, Method: ${req.method}`);
  next();
});

// Alias para coincidir com o frontend - MOVIDOS PARA O TOPO PARA EVITAR CONFLITOS
router.post(
  '/filters_project_backlog',
  authenticate,
  validateBody(filtersProjectBacklogSchema),
  (req, _res, next) => {
    console.log('[ProjectsRoute DEBUG] Executando getBacklogFilters');
    ProjectsController.getBacklogFilters(req, _res, next);
  }
);

// Alias para coincidir com o frontend - Criacao manual de backlogs
router.post(
  '/projects_backlogs_manual',
  authenticate,
  validateBody(createManualBacklogSchema),
  (req, _res, next) => {
    console.log('[ProjectsRoute DEBUG] Executando createManualBacklog');
    ProjectsController.createManualBacklog(req, _res, next);
  }
);

router.post(
  '/sprints_tasks_painel',
  authenticate,
  validateBody(sprintTasksPanelSchema),
  (req, res, next) => {
    console.log('[ProjectsRoute DEBUG] Executando getTasksPanel');
    SprintsController.getTasksPanel(req, res, next);
  }
);

router.post(
  '/teams_list/all/:projects_id',
  authenticate,
  validateParams(projectIdParamsSchema),
  // validateBody(listTeamMembersSchema), // TODO: Criar schema se necessario, ou usar any por enquanto
  (req, res, next) => {
    console.log(`[ProjectsRoute DEBUG] Executando listTeamMembers para projeto ${req.params.projects_id}`);
    ProjectsController.listTeamMembers(req, res, next);
  }
);

router.post(
  '/projects_backlogs_list/:projects_id',
  authenticate,
  validateParams(projectIdParamsSchema),
  validateBody(listProjectBacklogsSchema),
  (req, res, next) => {
    console.log(`[ProjectsRoute DEBUG] Executando listBacklogs para projeto ${req.params.projects_id}`);
    ProjectsController.listBacklogs(req, res, next);
  }
);

// =============================================================================
// PROJECT STATUSES - Rotas devem vir antes das rotas com :projects_id
// =============================================================================

/**
 * @swagger
 * /api/projects/statuses:
 *   get:
 *     summary: Lista status de projetos
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.get('/statuses', authenticate, ProjectsController.listStatuses);
router.get('/projects_statuses', authenticate, ProjectsController.listStatuses);

/**
 * @swagger
 * /api/projects/statuses:
 *   post:
 *     summary: Cria status de projeto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/statuses',
  authenticate,
  validateBody(createProjectStatusSchema),
  ProjectsController.createStatus
);

/**
 * @swagger
 * /api/projects/statuses/{projects_statuses_id}:
 *   get:
 *     summary: Busca status por ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/statuses/:projects_statuses_id',
  authenticate,
  validateParams(projectStatusParamsSchema),
  ProjectsController.getStatusById
);

/**
 * @swagger
 * /api/projects/statuses/{projects_statuses_id}:
 *   patch:
 *     summary: Atualiza status de projeto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/statuses/:projects_statuses_id',
  authenticate,
  validateParams(projectStatusParamsSchema),
  validateBody(createProjectStatusSchema),
  ProjectsController.updateStatus
);

/**
 * @swagger
 * /api/projects/statuses/{projects_statuses_id}:
 *   delete:
 *     summary: Remove status de projeto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/statuses/:projects_statuses_id',
  authenticate,
  validateParams(projectStatusParamsSchema),
  ProjectsController.deleteStatus
);

// =============================================================================
// WORKS SITUATIONS
// =============================================================================

/**
 * @swagger
 * /api/projects/works-situations:
 *   get:
 *     summary: Lista situacoes de obra
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.get('/works-situations', authenticate, ProjectsController.listWorksSituations);

/**
 * @swagger
 * /api/projects/works-situations:
 *   post:
 *     summary: Cria situacao de obra
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/works-situations',
  authenticate,
  validateBody(createWorksSituationSchema),
  ProjectsController.createWorksSituation
);

/**
 * @swagger
 * /api/projects/works-situations/{projects_works_situations_id}:
 *   get:
 *     summary: Busca situacao por ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/works-situations/:projects_works_situations_id',
  authenticate,
  validateParams(worksSituationParamsSchema),
  ProjectsController.getWorksSituationById
);

/**
 * @swagger
 * /api/projects/works-situations/{projects_works_situations_id}:
 *   patch:
 *     summary: Atualiza situacao de obra
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/works-situations/:projects_works_situations_id',
  authenticate,
  validateParams(worksSituationParamsSchema),
  validateBody(createWorksSituationSchema),
  ProjectsController.updateWorksSituation
);

/**
 * @swagger
 * /api/projects/works-situations/{projects_works_situations_id}:
 *   delete:
 *     summary: Remove situacao de obra
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/works-situations/:projects_works_situations_id',
  authenticate,
  validateParams(worksSituationParamsSchema),
  ProjectsController.deleteWorksSituation
);

// =============================================================================
// PROJECT USERS
// =============================================================================

/**
 * @swagger
 * /api/projects/users:
 *   get:
 *     summary: Lista usuarios do projeto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/users',
  authenticate,
  validateQuery(listProjectUsersQuerySchema),
  ProjectsController.listProjectUsers
);

/**
 * @swagger
 * /api/projects/users:
 *   post:
 *     summary: Associa usuario ao projeto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/users',
  authenticate,
  validateBody(createProjectUserSchema),
  ProjectsController.createProjectUser
);

/**
 * @swagger
 * /api/projects/users/{projects_users_id}:
 *   get:
 *     summary: Busca associacao por ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/users/:projects_users_id',
  authenticate,
  validateParams(projectUserParamsSchema),
  ProjectsController.getProjectUserById
);

/**
 * @swagger
 * /api/projects/users/{projects_users_id}:
 *   delete:
 *     summary: Remove associacao usuario-projeto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/users/:projects_users_id',
  authenticate,
  validateParams(projectUserParamsSchema),
  ProjectsController.deleteProjectUser
);

// =============================================================================
// BACKLOGS
// =============================================================================

/**
 * @swagger
 * /api/projects/backlogs:
 *   get:
 *     summary: Lista todos os backlogs
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.get('/backlogs', authenticate, ProjectsController.listAllBacklogs);

/**
 * @swagger
 * /api/projects/backlogs:
 *   post:
 *     summary: Cria backlog
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/backlogs',
  authenticate,
  async (req, res, next) => {
    // Frontend Xano envia { projects_id, lista_tasks: [...] } para criacao em massa
    // Cada item pode ter tasks_template_id em vez de name (nome vem do template)
    if (req.body && req.body.lista_tasks && Array.isArray(req.body.lista_tasks)) {
      try {
        const { db } = await import('../../config/database');
        const { serializeBigInt } = await import('../../utils/bigint');
        const { projects_id, lista_tasks } = req.body;

        const createdBacklogs = [];
        for (const task of lista_tasks) {
          // Busca descricao do template se tasks_template_id for fornecido
          let description = task.name || task.description || null;
          if (!description && task.tasks_template_id) {
            const template = await db.tasks_template.findUnique({
              where: { id: BigInt(task.tasks_template_id) },
              select: { description: true },
            });
            description = template?.description || `Task ${task.tasks_template_id}`;
          }

          const backlog = await db.projects_backlogs.create({
            data: {
              description: description || 'Sem descricao',
              description_normalized: description?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '',
              tasks_template_id: task.tasks_template_id ? BigInt(task.tasks_template_id) : null,
              projects_backlogs_statuses_id: null,
              projects_id: BigInt(projects_id),
              discipline_id: task.discipline_id ? BigInt(task.discipline_id) : null,
              quantity: task.quantity || null,
              unity_id: task.unity_id ? BigInt(task.unity_id) : null,
              created_at: new Date(),
              updated_at: new Date(),
              deleted_at: null,
            },
          });
          createdBacklogs.push(backlog);
        }

        return res.status(201).json(serializeBigInt(createdBacklogs));
      } catch (error) {
        return next(error);
      }
    }
    next();
  },
  validateBody(createProjectBacklogSchema),
  ProjectsController.createBacklog
);

/**
 * @swagger
 * /api/projects/backlogs/bulk:
 *   post:
 *     summary: Cria backlogs em massa
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/backlogs/bulk',
  authenticate,
  validateBody(createBulkBacklogsSchema),
  ProjectsController.createBulkBacklogs
);

/**
 * @swagger
 * /api/projects/backlogs/filters:
 *   post:
 *     summary: Retorna filtros disponiveis para backlogs
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/backlogs/filters',
  authenticate,
  validateBody(filtersProjectBacklogSchema),
  ProjectsController.getBacklogFilters
);

// Removidos daqui


/**
 * @swagger
 * /api/projects/backlogs/statuses:
 *   get:
 *     summary: Lista status de backlogs
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.get('/backlogs/statuses', authenticate, ProjectsController.listBacklogStatuses);

/**
 * @swagger
 * /api/projects/backlogs/{projects_backlogs_id}:
 *   get:
 *     summary: Busca backlog por ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/backlogs/:projects_backlogs_id',
  authenticate,
  validateParams(projectBacklogParamsSchema),
  ProjectsController.getBacklogById
);

/**
 * @swagger
 * /api/projects/backlogs/{projects_backlogs_id}:
 *   put:
 *     summary: Atualiza backlog
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/backlogs/:projects_backlogs_id',
  authenticate,
  validateParams(projectBacklogParamsSchema),
  validateBody(updateProjectBacklogSchema),
  ProjectsController.updateBacklog
);

/**
 * @swagger
 * /api/projects/backlogs/{projects_backlogs_id}:
 *   delete:
 *     summary: Remove backlog
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/backlogs/:projects_backlogs_id',
  authenticate,
  validateParams(projectBacklogParamsSchema),
  ProjectsController.deleteBacklog
);

// =============================================================================
// SUBTASKS
// =============================================================================

/**
 * @swagger
 * /api/projects/subtasks:
 *   get:
 *     summary: Lista subtasks
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/subtasks',
  authenticate,
  validateQuery(listSubtasksQuerySchema),
  ProjectsController.listSubtasks
);

/**
 * @swagger
 * /api/projects/subtasks:
 *   post:
 *     summary: Cria subtask
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/subtasks',
  authenticate,
  validateBody(createSubtaskSchema),
  ProjectsController.createSubtask
);

/**
 * @swagger
 * /api/projects/subtasks/{subtasks_id}:
 *   get:
 *     summary: Busca subtask por ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/subtasks/:subtasks_id',
  authenticate,
  validateParams(subtaskParamsSchema),
  ProjectsController.getSubtaskById
);

/**
 * @swagger
 * /api/projects/subtasks/{subtasks_id}:
 *   put:
 *     summary: Atualiza subtask
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/subtasks/:subtasks_id',
  authenticate,
  validateParams(subtaskParamsSchema),
  validateBody(updateSubtaskSchema),
  ProjectsController.updateSubtask
);

/**
 * @swagger
 * /api/projects/subtasks/{subtasks_id}:
 *   delete:
 *     summary: Remove subtask
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/subtasks/:subtasks_id',
  authenticate,
  validateParams(subtaskParamsSchema),
  ProjectsController.deleteSubtask
);

// =============================================================================
// PROJECTS - Rotas principais
// =============================================================================

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Lista projetos com paginacao e filtros
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, ProjectsController.list);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Cria um novo projeto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  authenticate,
  upload.any(),
  validateBody(createProjectSchema),
  ProjectsController.create
);

/**
 * @swagger
 * /api/projects/{projects_id}/backlogs/list:
 *   post:
 *     summary: Lista backlogs do projeto com filtros
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:projects_id/backlogs/list',
  authenticate,
  validateParams(projectIdParamsSchema),
  validateBody(listProjectBacklogsSchema),
  ProjectsController.listBacklogs
);

/**
 * @swagger
 * /api/projects/teams:
 *   get:
 *     summary: Lista equipes (alias para /api/teams)
 *     tags: [Projects, Teams]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/teams',
  authenticate,
  validateQuery(listAllTeamsQuerySchema),
  TeamsController.listAll
);

/**
 * @swagger
 * /api/projects/teams_leaders:
 *   get:
 *     summary: Lista lideres de equipe (alias para /api/teams/leaders)
 *     tags: [Projects, Teams]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/teams_leaders',
  authenticate,
  validateQuery(listTeamLeadersQuerySchema),
  TeamsController.listLeaders
);

/**
 * @swagger
 * /api/projects/{projects_id}:
 *   get:
 *     summary: Busca projeto por ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:projects_id',
  authenticate,
  validateParams(getProjectParamsSchema),
  ProjectsController.getById
);

/**
 * @swagger
 * /api/projects/{projects_id}:
 *   patch:
 *     summary: Atualiza projeto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:projects_id',
  authenticate,
  validateParams(getProjectParamsSchema),
  validateBody(updateProjectSchema),
  ProjectsController.update
);

/**
 * @swagger
 * /api/projects/{projects_id}:
 *   delete:
 *     summary: Remove projeto (soft delete)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:projects_id',
  authenticate,
  validateParams(getProjectParamsSchema),
  ProjectsController.delete
);

export default router;
