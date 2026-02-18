// =============================================================================
// INDUSTRYVIEW BACKEND - Tasks Routes
// Rotas do modulo de tasks (tasks_template, priorities, unity, discipline, comments)
// Equivalente aos endpoints do api_group Tasks do Xano
// =============================================================================

import { Router } from 'express';
import { TasksController } from './tasks.controller';
import { authenticate } from '../../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../../middleware/validation';
import {
  listTasksSchema,
  taskParamsSchema,
  createTaskSchema,
  updateTaskSchema,
  taskPriorityParamsSchema,
  createTaskPrioritySchema,
  updateTaskPrioritySchema,
  unityParamsSchema,
  listUnityQuerySchema,
  createUnitySchema,
  updateUnitySchema,
  disciplineParamsSchema,
  listDisciplineQuerySchema,
  createDisciplineSchema,
  updateDisciplineSchema,
  listCommentSubtasksQuerySchema,
  listCommentBacklogsQuerySchema,
  taskCommentParamsSchema,
  createTaskCommentSchema,
  updateTaskCommentSchema,
} from './tasks.schema';

const router = Router();

router.use((req, res, next) => {
  console.log(`[TasksRoute DEBUG] Path: ${req.path}, Method: ${req.method}`);
  next();
});

// Alias da rota que o frontend chama (clone do tasks_list)
router.post(
  '/tasks_list_clone0',
  authenticate,
  validateBody(listTasksSchema),
  (req, res, next) => {
    console.log('[TasksRoute DEBUG] Executando list (tasks_list_clone0)');
    TasksController.list(req, res, next);
  }
);

// Rota para listar templates de tasks (usada no select de tasks)
router.get(
  '/all_tasks_template',
  authenticate,
  (req, res, next) => {
    console.log('[TasksRoute DEBUG] Executando listTemplates');
    TasksController.listTemplates(req, res, next);
  }
);

// =============================================================================
// PRIORITIES - Rotas devem vir antes das rotas com :tasks_id
// =============================================================================

/**
 * @swagger
 * /api/v1/tasks/priorities:
 *   get:
 *     summary: Lista todas as prioridades de tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de prioridades
 */
router.get('/priorities', authenticate, TasksController.listPriorities);

/**
 * @swagger
 * /api/v1/tasks/priorities:
 *   post:
 *     summary: Cria uma nova prioridade
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/priorities',
  authenticate,
  validateBody(createTaskPrioritySchema),
  TasksController.createPriority
);

/**
 * @swagger
 * /api/v1/tasks/priorities/{tasks_priorities_id}:
 *   get:
 *     summary: Busca prioridade por ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/priorities/:tasks_priorities_id',
  authenticate,
  validateParams(taskPriorityParamsSchema),
  TasksController.getPriorityById
);

/**
 * @swagger
 * /api/v1/tasks/priorities/{tasks_priorities_id}:
 *   patch:
 *     summary: Atualiza prioridade
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/priorities/:tasks_priorities_id',
  authenticate,
  validateParams(taskPriorityParamsSchema),
  validateBody(updateTaskPrioritySchema),
  TasksController.updatePriority
);

/**
 * @swagger
 * /api/v1/tasks/priorities/{tasks_priorities_id}:
 *   delete:
 *     summary: Remove prioridade (soft delete)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/priorities/:tasks_priorities_id',
  authenticate,
  validateParams(taskPriorityParamsSchema),
  TasksController.deletePriority
);

// =============================================================================
// UNITY
// =============================================================================

/**
 * @swagger
 * /api/v1/tasks/unity:
 *   get:
 *     summary: Lista todas as unidades
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: company_id
 *         schema:
 *           type: integer
 *         description: Filtrar por empresa
 *     responses:
 *       200:
 *         description: Lista de unidades
 */
router.get(
  '/unity',
  validateQuery(listUnityQuerySchema),
  TasksController.listUnity
);

/**
 * @swagger
 * /api/v1/tasks/unity:
 *   post:
 *     summary: Cria uma nova unidade
 *     tags: [Tasks]
 */
router.post(
  '/unity',
  validateBody(createUnitySchema),
  TasksController.createUnity
);

/**
 * @swagger
 * /api/v1/tasks/unity/{unity_id}:
 *   get:
 *     summary: Busca unidade por ID
 *     tags: [Tasks]
 */
router.get(
  '/unity/:unity_id',
  validateParams(unityParamsSchema),
  TasksController.getUnityById
);

/**
 * @swagger
 * /api/v1/tasks/unity/{unity_id}:
 *   patch:
 *     summary: Atualiza unidade
 *     tags: [Tasks]
 */
router.patch(
  '/unity/:unity_id',
  validateParams(unityParamsSchema),
  validateBody(updateUnitySchema),
  TasksController.updateUnity
);

/**
 * @swagger
 * /api/v1/tasks/unity/{unity_id}:
 *   delete:
 *     summary: Remove unidade (soft delete)
 *     tags: [Tasks]
 */
router.delete(
  '/unity/:unity_id',
  validateParams(unityParamsSchema),
  TasksController.deleteUnity
);

// =============================================================================
// DISCIPLINE
// =============================================================================

/**
 * @swagger
 * /api/v1/tasks/discipline:
 *   get:
 *     summary: Lista todas as disciplinas
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: company_id
 *         schema:
 *           type: integer
 *         description: Filtrar por empresa
 *     responses:
 *       200:
 *         description: Lista de disciplinas
 */
router.get(
  '/discipline',
  authenticate,
  validateQuery(listDisciplineQuerySchema),
  TasksController.listDiscipline
);

/**
 * @swagger
 * /api/v1/tasks/discipline:
 *   post:
 *     summary: Cria uma nova disciplina
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/discipline',
  authenticate,
  validateBody(createDisciplineSchema),
  TasksController.createDiscipline
);

/**
 * @swagger
 * /api/v1/tasks/discipline/{discipline_id}:
 *   get:
 *     summary: Busca disciplina por ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/discipline/:discipline_id',
  authenticate,
  validateParams(disciplineParamsSchema),
  TasksController.getDisciplineById
);

/**
 * @swagger
 * /api/v1/tasks/discipline/{discipline_id}:
 *   put:
 *     summary: Atualiza disciplina
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/discipline/:discipline_id',
  authenticate,
  validateParams(disciplineParamsSchema),
  validateBody(updateDisciplineSchema),
  TasksController.updateDiscipline
);

/**
 * @swagger
 * /api/v1/tasks/discipline/{discipline_id}:
 *   delete:
 *     summary: Remove disciplina (soft delete)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/discipline/:discipline_id',
  authenticate,
  validateParams(disciplineParamsSchema),
  TasksController.deleteDiscipline
);

// =============================================================================
// COMMENTS
// =============================================================================

/**
 * @swagger
 * /api/v1/tasks/comments/subtasks:
 *   get:
 *     summary: Lista comentarios de subtasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: subtasks_id
 *         schema:
 *           type: integer
 *         description: Filtrar por subtask
 *     responses:
 *       200:
 *         description: Lista de comentarios
 */
router.get(
  '/comments/subtasks',
  authenticate,
  validateQuery(listCommentSubtasksQuerySchema),
  TasksController.listCommentSubtasks
);

/**
 * @swagger
 * /api/v1/tasks/comments/backlogs:
 *   get:
 *     summary: Lista comentarios de backlogs
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projects_backlogs_id
 *         schema:
 *           type: integer
 *         description: Filtrar por backlog
 *     responses:
 *       200:
 *         description: Lista de comentarios
 */
router.get(
  '/comments/backlogs',
  authenticate,
  validateQuery(listCommentBacklogsQuerySchema),
  TasksController.listCommentBacklogs
);

/**
 * @swagger
 * /api/v1/tasks/comments:
 *   post:
 *     summary: Cria um novo comentario
 *     tags: [Tasks]
 */
router.post(
  '/comments',
  validateBody(createTaskCommentSchema),
  TasksController.createComment
);

/**
 * @swagger
 * /api/v1/tasks/comments/{task_comments_id}:
 *   get:
 *     summary: Busca comentario por ID
 *     tags: [Tasks]
 */
router.get(
  '/comments/:task_comments_id',
  validateParams(taskCommentParamsSchema),
  TasksController.getCommentById
);

/**
 * @swagger
 * /api/v1/tasks/comments/{task_comments_id}:
 *   patch:
 *     summary: Atualiza comentario
 *     tags: [Tasks]
 */
router.patch(
  '/comments/:task_comments_id',
  validateParams(taskCommentParamsSchema),
  validateBody(updateTaskCommentSchema),
  TasksController.updateComment
);

/**
 * @swagger
 * /api/v1/tasks/comments/{task_comments_id}:
 *   delete:
 *     summary: Remove comentario (soft delete)
 *     tags: [Tasks]
 */
router.delete(
  '/comments/:task_comments_id',
  validateParams(taskCommentParamsSchema),
  TasksController.deleteComment
);

// =============================================================================
// TASKS - Rotas principais
// =============================================================================

/**
 * @swagger
 * /api/v1/tasks/list:
 *   post:
 *     summary: Lista tasks com paginacao e filtros
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *               per_page:
 *                 type: integer
 *               search:
 *                 type: string
 *               equipaments_types_id:
 *                 type: array
 *                 items:
 *                   type: integer
 *               company_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Lista paginada de tasks
 */
router.post(
  '/list',
  authenticate,
  validateBody(listTasksSchema),
  TasksController.list
);

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Cria uma nova task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *             properties:
 *               description:
 *                 type: string
 *               weight:
 *                 type: number
 *               amount:
 *                 type: number
 *               unity_id:
 *                 type: integer
 *               company_id:
 *                 type: integer
 *               discipline_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Task criada com sucesso
 */
router.post(
  '/',
  authenticate,
  validateBody(createTaskSchema),
  TasksController.create
);

/**
 * @swagger
 * /api/v1/tasks/{tasks_id}:
 *   get:
 *     summary: Busca task por ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tasks_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task encontrada
 *       404:
 *         description: Task nao encontrada
 */
router.get(
  '/:tasks_id',
  authenticate,
  validateParams(taskParamsSchema),
  TasksController.getById
);

/**
 * @swagger
 * /api/v1/tasks/{tasks_id}:
 *   patch:
 *     summary: Atualiza task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tasks_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               equipaments_types_id:
 *                 type: integer
 *               weight:
 *                 type: number
 *               fixed:
 *                 type: boolean
 *               unity_id:
 *                 type: integer
 *               company_id:
 *                 type: integer
 *               discipline_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Task atualizada com sucesso
 */
router.patch(
  '/:tasks_id',
  authenticate,
  validateParams(taskParamsSchema),
  validateBody(updateTaskSchema),
  TasksController.update
);

/**
 * @swagger
 * /api/v1/tasks/{tasks_id}:
 *   delete:
 *     summary: Remove task (soft delete)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tasks_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task removida com sucesso
 */
router.delete(
  '/:tasks_id',
  authenticate,
  validateParams(taskParamsSchema),
  TasksController.delete
);

export default router;
