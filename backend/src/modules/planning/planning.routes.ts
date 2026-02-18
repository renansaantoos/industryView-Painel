// =============================================================================
// INDUSTRYVIEW BACKEND - Planning Routes
// Rotas do modulo de planning
// Cobre: company_modules, schedule_baselines, task_dependencies, gantt, backlog_planning
// =============================================================================

import { Router } from 'express';
import { PlanningController } from './planning.controller';
import { authenticate } from '../../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../../middleware/validation';
import {
  listCompanyModulesQuerySchema,
  upsertCompanyModuleSchema,
  checkCompanyModuleQuerySchema,
  listBaselinesQuerySchema,
  baselineParamsSchema,
  createBaselineSchema,
  curveSQuerySchema,
  listDependenciesQuerySchema,
  createDependencySchema,
  dependencyParamsSchema,
  backlogDependenciesParamsSchema,
  ganttQuerySchema,
  updateBacklogPlanningSchema,
  backlogPlanningParamsSchema,
  bulkUpdateBacklogPlanningSchema,
  criticalPathQuerySchema,
  scheduleHealthQuerySchema,
  rollupBacklogParamsSchema,
  rollupProjectParamsSchema,
} from './planning.schema';

const router = Router();

// =============================================================================
// COMPANY MODULES
// =============================================================================

/**
 * @swagger
 * /api/planning/company-modules/check:
 *   get:
 *     summary: Verifica se um modulo esta ativo para uma empresa
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: company_id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *       - name: module_name
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 */
router.get(
  '/company-modules/check',
  authenticate,
  validateQuery(checkCompanyModuleQuerySchema),
  PlanningController.checkCompanyModule
);

/**
 * @swagger
 * /api/planning/company-modules:
 *   get:
 *     summary: Lista todos os modulos configurados para uma empresa
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: company_id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 */
router.get(
  '/company-modules',
  authenticate,
  validateQuery(listCompanyModulesQuerySchema),
  PlanningController.listCompanyModules
);

/**
 * @swagger
 * /api/planning/company-modules:
 *   put:
 *     summary: Ativa ou desativa um modulo para uma empresa
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/company-modules',
  authenticate,
  validateBody(upsertCompanyModuleSchema),
  PlanningController.updateCompanyModule
);

// =============================================================================
// SCHEDULE BASELINES
// =============================================================================

/**
 * @swagger
 * /api/planning/baselines:
 *   get:
 *     summary: Lista baselines do projeto ordenados pelo numero descrescente
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projects_id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 */
router.get(
  '/baselines',
  authenticate,
  validateQuery(listBaselinesQuerySchema),
  PlanningController.listBaselines
);

/**
 * @swagger
 * /api/planning/baselines:
 *   post:
 *     summary: Cria novo baseline com snapshot de todos os backlogs
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/baselines',
  authenticate,
  validateBody(createBaselineSchema),
  PlanningController.createBaseline
);

/**
 * @swagger
 * /api/planning/baselines/{id}/curve-s:
 *   get:
 *     summary: Retorna dados da Curva S comparando baseline vs progresso real
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: projects_id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 */
router.get(
  '/baselines/:id/curve-s',
  authenticate,
  validateParams(baselineParamsSchema),
  validateQuery(curveSQuerySchema),
  PlanningController.getCurveSData
);

/**
 * @swagger
 * /api/planning/baselines/{id}:
 *   get:
 *     summary: Busca baseline por ID
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 */
router.get(
  '/baselines/:id',
  authenticate,
  validateParams(baselineParamsSchema),
  PlanningController.getBaselineById
);

// =============================================================================
// TASK DEPENDENCIES
// =============================================================================

/**
 * @swagger
 * /api/planning/dependencies/backlog/{backlog_id}:
 *   get:
 *     summary: Retorna predecessores e sucessores de um backlog
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: backlog_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 */
router.get(
  '/dependencies/backlog/:backlog_id',
  authenticate,
  validateParams(backlogDependenciesParamsSchema),
  PlanningController.getDependenciesForBacklog
);

/**
 * @swagger
 * /api/planning/dependencies:
 *   get:
 *     summary: Lista todas as dependencias de um projeto
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projects_id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 */
router.get(
  '/dependencies',
  authenticate,
  validateQuery(listDependenciesQuerySchema),
  PlanningController.listDependencies
);

/**
 * @swagger
 * /api/planning/dependencies:
 *   post:
 *     summary: Cria uma nova dependencia entre dois backlogs
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/dependencies',
  authenticate,
  validateBody(createDependencySchema),
  PlanningController.createDependency
);

/**
 * @swagger
 * /api/planning/dependencies/{id}:
 *   delete:
 *     summary: Remove uma dependencia
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete(
  '/dependencies/:id',
  authenticate,
  validateParams(dependencyParamsSchema),
  PlanningController.deleteDependency
);

// =============================================================================
// GANTT
// =============================================================================

/**
 * @swagger
 * /api/planning/gantt:
 *   get:
 *     summary: Retorna dados estruturados para o Gantt do projeto
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projects_id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *       - name: sprints_id
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 */
router.get(
  '/gantt',
  authenticate,
  validateQuery(ganttQuerySchema),
  PlanningController.getGanttData
);

// =============================================================================
// BACKLOG PLANNING
// Rotas de atualizacao de campos de planejamento dos backlogs
// =============================================================================

/**
 * @swagger
 * /api/planning/backlog-planning/bulk:
 *   put:
 *     summary: Atualiza campos de planejamento de multiplos backlogs
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/backlog-planning/bulk',
  authenticate,
  validateBody(bulkUpdateBacklogPlanningSchema),
  PlanningController.bulkUpdateBacklogPlanning
);

/**
 * @swagger
 * /api/planning/backlog-planning/{id}:
 *   patch:
 *     summary: Atualiza campos de planejamento de um backlog
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 */
router.patch(
  '/backlog-planning/:id',
  authenticate,
  validateParams(backlogPlanningParamsSchema),
  validateBody(updateBacklogPlanningSchema),
  PlanningController.updateBacklogPlanning
);

// =============================================================================
// CAMINHO CRITICO
// =============================================================================

/**
 * @swagger
 * /api/planning/critical-path:
 *   get:
 *     summary: Calcula o caminho critico do projeto (CPM)
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projects_id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 */
router.get(
  '/critical-path',
  authenticate,
  validateQuery(criticalPathQuerySchema),
  PlanningController.getCriticalPath
);

// =============================================================================
// SAUDE DO CRONOGRAMA
// =============================================================================

/**
 * @swagger
 * /api/planning/schedule-health:
 *   get:
 *     summary: Retorna indicadores de saude do cronograma (SPI, atrasos, progresso)
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projects_id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 */
router.get(
  '/schedule-health',
  authenticate,
  validateQuery(scheduleHealthQuerySchema),
  PlanningController.getScheduleHealth
);

// =============================================================================
// ROLLUP DE PROGRESSO
// =============================================================================

/**
 * @swagger
 * /api/planning/rollup/{backlog_id}:
 *   post:
 *     summary: Recalcula progresso de um backlog e propaga para ancestrais
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: backlog_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 */
router.post(
  '/rollup/:backlog_id',
  authenticate,
  validateParams(rollupBacklogParamsSchema),
  PlanningController.rollupBacklog
);

/**
 * @swagger
 * /api/planning/rollup-project/{projects_id}:
 *   post:
 *     summary: Recalcula progresso de todos os backlogs de um projeto (bottom-up)
 *     tags: [Planning]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projects_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 */
router.post(
  '/rollup-project/:projects_id',
  authenticate,
  validateParams(rollupProjectParamsSchema),
  PlanningController.rollupProject
);

export default router;
