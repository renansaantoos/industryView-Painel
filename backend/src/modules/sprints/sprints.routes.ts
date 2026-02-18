// =============================================================================
// INDUSTRYVIEW BACKEND - Sprints Routes
// Rotas do modulo de sprints
// Equivalente aos endpoints do api_group Sprints do Xano
// =============================================================================

import { Router } from 'express';
import { SprintsController } from './sprints.controller';
import { authenticate } from '../../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../../middleware/validation';
import {
  listSprintsQuerySchema,
  createSprintSchema,
  sprintParamsSchema,
  updateSprintSchema,
  updateSprintStatusSchema,
  createSprintStatusSchema,
  sprintStatusParamsSchema,
  sprintTasksPanelSchema,
  createSprintTaskSchema,
  sprintTaskParamsSchema,
  updateSprintTaskSchema,
  updateSprintTaskStatusSchema,
  updateListSprintTaskStatusSchema,
  createSprintTaskStatusSchema,
  sprintTaskStatusParamsSchema,
  createQualityStatusSchema,
  qualityStatusParamsSchema,
  updateInspectionSchema,
  endSubtaskSchema,
  countsSubtasksQuerySchema,
  sprintChartFilterSchema,
} from './sprints.schema';

const router = Router();

router.use((req, res, next) => {
  console.log(`[SprintsRoute DEBUG] Path: ${req.path}, Method: ${req.method}`);
  next();
});

// Alias para coincidir com o frontend
router.post(
  '/sprints_tasks_painel',
  authenticate,
  validateBody(sprintTasksPanelSchema),
  (req, res, next) => {
    console.log('[SprintsRoute DEBUG] Executando getTasksPanel');
    SprintsController.getTasksPanel(req, res, next);
  }
);

// =============================================================================
// SPRINT STATUSES - Rotas devem vir antes das rotas com :sprints_id
// =============================================================================

/**
 * @swagger
 * /api/sprints/statuses:
 *   get:
 *     summary: Lista status de sprints
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.get('/statuses', authenticate, SprintsController.listStatuses);

/**
 * @swagger
 * /api/sprints/statuses:
 *   post:
 *     summary: Cria status de sprint
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/statuses',
  authenticate,
  validateBody(createSprintStatusSchema),
  SprintsController.createStatus
);

/**
 * @swagger
 * /api/sprints/statuses/{sprints_statuses_id}:
 *   get:
 *     summary: Busca status por ID
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/statuses/:sprints_statuses_id',
  authenticate,
  validateParams(sprintStatusParamsSchema),
  SprintsController.getStatusById
);

/**
 * @swagger
 * /api/sprints/statuses/{sprints_statuses_id}:
 *   patch:
 *     summary: Atualiza status de sprint
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/statuses/:sprints_statuses_id',
  authenticate,
  validateParams(sprintStatusParamsSchema),
  validateBody(createSprintStatusSchema),
  SprintsController.updateStatusRecord
);

/**
 * @swagger
 * /api/sprints/statuses/{sprints_statuses_id}:
 *   delete:
 *     summary: Remove status de sprint
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/statuses/:sprints_statuses_id',
  authenticate,
  validateParams(sprintStatusParamsSchema),
  SprintsController.deleteStatus
);

// =============================================================================
// QUALITY STATUS
// =============================================================================

/**
 * @swagger
 * /api/sprints/quality-status:
 *   get:
 *     summary: Lista quality status
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.get('/quality-status', authenticate, SprintsController.listQualityStatus);

/**
 * @swagger
 * /api/sprints/quality-status:
 *   post:
 *     summary: Cria quality status
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/quality-status',
  authenticate,
  validateBody(createQualityStatusSchema),
  SprintsController.createQualityStatus
);

/**
 * @swagger
 * /api/sprints/quality-status/{quality_status_id}:
 *   get:
 *     summary: Busca quality status por ID
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/quality-status/:quality_status_id',
  authenticate,
  validateParams(qualityStatusParamsSchema),
  SprintsController.getQualityStatusById
);

/**
 * @swagger
 * /api/sprints/quality-status/{quality_status_id}:
 *   patch:
 *     summary: Atualiza quality status
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/quality-status/:quality_status_id',
  authenticate,
  validateParams(qualityStatusParamsSchema),
  validateBody(createQualityStatusSchema),
  SprintsController.updateQualityStatus
);

/**
 * @swagger
 * /api/sprints/quality-status/{quality_status_id}:
 *   delete:
 *     summary: Remove quality status
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/quality-status/:quality_status_id',
  authenticate,
  validateParams(qualityStatusParamsSchema),
  SprintsController.deleteQualityStatus
);

// =============================================================================
// SPRINT TASK STATUSES
// =============================================================================

/**
 * @swagger
 * /api/sprints/tasks/statuses:
 *   get:
 *     summary: Lista status de tarefas de sprint
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.get('/tasks/statuses', authenticate, SprintsController.listTaskStatuses);

/**
 * @swagger
 * /api/sprints/tasks/statuses:
 *   post:
 *     summary: Cria status de tarefa de sprint
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/tasks/statuses',
  authenticate,
  validateBody(createSprintTaskStatusSchema),
  SprintsController.createTaskStatus
);

/**
 * @swagger
 * /api/sprints/tasks/statuses/{sprints_tasks_statuses_id}:
 *   get:
 *     summary: Busca status de tarefa por ID
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/tasks/statuses/:sprints_tasks_statuses_id',
  authenticate,
  validateParams(sprintTaskStatusParamsSchema),
  SprintsController.getTaskStatusById
);

/**
 * @swagger
 * /api/sprints/tasks/statuses/{sprints_tasks_statuses_id}:
 *   patch:
 *     summary: Atualiza status de tarefa de sprint
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/tasks/statuses/:sprints_tasks_statuses_id',
  authenticate,
  validateParams(sprintTaskStatusParamsSchema),
  validateBody(createSprintTaskStatusSchema),
  SprintsController.updateTaskStatusRecord
);

/**
 * @swagger
 * /api/sprints/tasks/statuses/{sprints_tasks_statuses_id}:
 *   delete:
 *     summary: Remove status de tarefa de sprint
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/tasks/statuses/:sprints_tasks_statuses_id',
  authenticate,
  validateParams(sprintTaskStatusParamsSchema),
  SprintsController.deleteTaskStatus
);

// =============================================================================
// SPRINT TASKS
// =============================================================================

/**
 * @swagger
 * /api/sprints/tasks/panel:
 *   post:
 *     summary: Painel de tarefas da sprint (Kanban)
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/tasks/panel',
  authenticate,
  validateBody(sprintTasksPanelSchema),
  SprintsController.getTasksPanel
);

// Removido daqui


/**
 * @swagger
 * /api/sprints/tasks/status:
 *   put:
 *     summary: Atualiza status da tarefa
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/tasks/status',
  authenticate,
  validateBody(updateSprintTaskStatusSchema),
  SprintsController.updateTaskStatus
);

/**
 * @swagger
 * /api/sprints/tasks/status/list:
 *   put:
 *     summary: Atualiza status de multiplas tarefas
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/tasks/status/list',
  authenticate,
  validateBody(updateListSprintTaskStatusSchema),
  SprintsController.updateListTaskStatus
);

/**
 * @swagger
 * /api/sprints/tasks:
 *   post:
 *     summary: Cria tarefa de sprint
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/tasks',
  authenticate,
  validateBody(createSprintTaskSchema),
  SprintsController.createTask
);

/**
 * @swagger
 * /api/sprints/tasks/{sprints_tasks_id}:
 *   get:
 *     summary: Busca tarefa por ID
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/tasks/:sprints_tasks_id',
  authenticate,
  validateParams(sprintTaskParamsSchema),
  SprintsController.getTaskById
);

/**
 * @swagger
 * /api/sprints/tasks/{sprints_tasks_id}:
 *   patch:
 *     summary: Atualiza tarefa de sprint
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/tasks/:sprints_tasks_id',
  authenticate,
  validateParams(sprintTaskParamsSchema),
  validateBody(updateSprintTaskSchema),
  SprintsController.updateTask
);

/**
 * @swagger
 * /api/sprints/tasks/{sprints_tasks_id}:
 *   delete:
 *     summary: Remove tarefa de sprint
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/tasks/:sprints_tasks_id',
  authenticate,
  validateParams(sprintTaskParamsSchema),
  SprintsController.deleteTask
);

// =============================================================================
// INSPECTION & SUBTASKS
// =============================================================================

/**
 * @swagger
 * /api/sprints/inspection:
 *   post:
 *     summary: Atualiza inspecao
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/inspection',
  authenticate,
  validateBody(updateInspectionSchema),
  SprintsController.updateInspection
);

/**
 * @swagger
 * /api/sprints/subtask/end:
 *   put:
 *     summary: Finaliza subtask
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/subtask/end',
  authenticate,
  validateBody(endSubtaskSchema),
  SprintsController.endSubtask
);

/**
 * @swagger
 * /api/sprints/subtasks/count:
 *   get:
 *     summary: Contagem de subtasks
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/subtasks/count',
  authenticate,
  validateQuery(countsSubtasksQuerySchema),
  SprintsController.countSubtasks
);

// =============================================================================
// CHART
// =============================================================================

/**
 * @swagger
 * /api/sprints/chart:
 *   get:
 *     summary: Grafico de sprint
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/chart',
  authenticate,
  validateQuery(sprintChartFilterSchema),
  SprintsController.getChartData
);

// =============================================================================
// SPRINT STATUS UPDATE
// =============================================================================

/**
 * @swagger
 * /api/sprints/status:
 *   put:
 *     summary: Atualiza status da sprint
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/status',
  authenticate,
  validateBody(updateSprintStatusSchema),
  SprintsController.updateStatus
);

// =============================================================================
// SPRINTS - Rotas principais
// =============================================================================

/**
 * @swagger
 * /api/sprints:
 *   get:
 *     summary: Lista sprints do projeto agrupadas por status
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  authenticate,
  validateQuery(listSprintsQuerySchema),
  SprintsController.list
);

/**
 * @swagger
 * /api/sprints:
 *   post:
 *     summary: Cria sprint
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  authenticate,
  validateBody(createSprintSchema),
  SprintsController.create
);

/**
 * @swagger
 * /api/sprints/{sprints_id}:
 *   get:
 *     summary: Busca sprint por ID
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:sprints_id',
  authenticate,
  validateParams(sprintParamsSchema),
  SprintsController.getById
);

/**
 * @swagger
 * /api/sprints/{sprints_id}:
 *   patch:
 *     summary: Atualiza sprint
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:sprints_id',
  authenticate,
  validateParams(sprintParamsSchema),
  validateBody(updateSprintSchema),
  SprintsController.update
);

/**
 * @swagger
 * /api/sprints/{sprints_id}:
 *   delete:
 *     summary: Remove sprint
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:sprints_id',
  authenticate,
  validateParams(sprintParamsSchema),
  SprintsController.delete
);

export default router;
