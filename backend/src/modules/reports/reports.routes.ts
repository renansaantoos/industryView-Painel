// =============================================================================
// INDUSTRYVIEW BACKEND - Reports Module Routes
// Rotas do modulo de relatorios
// Equivalente aos endpoints do Xano em apis/reports/
// =============================================================================

import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// ===========================================================================
// Dashboard Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/reports/dashboard:
 *   get:
 *     summary: Busca dados do dashboard
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projects_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: initial_date
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: final_date
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Dados do dashboard com contadores de trackers e modulos
 */
router.get('/dashboard', authenticate, ReportsController.getDashboard);

// ===========================================================================
// Daily Reports Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/reports/daily:
 *   get:
 *     summary: Lista relatorios diarios (RDOs)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projects_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: initial_date
 *         schema:
 *           type: string
 *       - in: query
 *         name: final_date
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de relatorios diarios com contagem de pendentes
 */
router.get('/daily', authenticate, ReportsController.listDailyReports);

/**
 * @swagger
 * /api/v1/reports/daily/dates:
 *   get:
 *     summary: Busca datas com relatorios
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projects_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de datas
 */
router.get('/daily/dates', authenticate, ReportsController.getDailyReportDates);

/**
 * @swagger
 * /api/v1/reports/daily:
 *   post:
 *     summary: Cria relatorio diario (RDO)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - schedule_id
 *             properties:
 *               projects_id:
 *                 type: integer
 *               schedule_id:
 *                 type: array
 *                 items:
 *                   type: integer
 *               date:
 *                 type: string
 *     responses:
 *       201:
 *         description: Relatorio criado com sucesso
 */
router.post('/daily', authenticate, ReportsController.createDailyReport);

/**
 * @swagger
 * /api/v1/reports/daily/{daily_report_id}:
 *   get:
 *     summary: Busca relatorio diario por ID
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: daily_report_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Relatorio diario encontrado
 */
router.get('/daily/:daily_report_id', authenticate, ReportsController.getDailyReportById);

/**
 * @swagger
 * /api/v1/reports/daily/{daily_report_id}/pdf:
 *   get:
 *     summary: Gera PDF do relatorio diario
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: daily_report_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados do PDF gerado
 */
router.get('/daily/:daily_report_id/pdf', authenticate, ReportsController.getDailyReportPdf);

router.patch('/daily/:daily_report_id', authenticate, ReportsController.updateDailyReport);
router.delete('/daily/:daily_report_id', authenticate, ReportsController.deleteDailyReport);

// ===========================================================================
// Schedule Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/reports/schedule/day:
 *   get:
 *     summary: Busca programacao por dia
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projects_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de schedules do dia com lideres e equipes
 */
router.get('/schedule/day', authenticate, ReportsController.getSchedulePerDay);

// ===========================================================================
// Burndown Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/reports/burndown:
 *   get:
 *     summary: Busca dados para grafico de burndown
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sprints_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: projects_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados do burndown chart
 */
router.get('/burndown', authenticate, ReportsController.getBurndown);

// ===========================================================================
// Sprint Task Status Log Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/reports/sprint-task-status-log:
 *   get:
 *     summary: Lista logs de status de tarefas de sprint
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sprints_tasks_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de logs de mudanca de status
 */
router.get('/sprint-task-status-log', authenticate, ReportsController.listSprintTaskStatusLog);

/**
 * @swagger
 * /api/v1/reports/sprint-task-status-log:
 *   post:
 *     summary: Cria log de status
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sprints_tasks_id
 *             properties:
 *               sprints_tasks_id:
 *                 type: integer
 *               users_id:
 *                 type: integer
 *               changed_field:
 *                 type: string
 *               old_value:
 *                 type: string
 *               new_value:
 *                 type: string
 *               date:
 *                 type: string
 *     responses:
 *       201:
 *         description: Log criado com sucesso
 */
router.post('/sprint-task-status-log', authenticate, ReportsController.createSprintTaskStatusLog);

router.get('/sprint-task-status-log/:sprint_task_status_log_id', authenticate, ReportsController.getSprintTaskStatusLogById);
router.patch('/sprint-task-status-log/:sprint_task_status_log_id', authenticate, ReportsController.updateSprintTaskStatusLog);
router.delete('/sprint-task-status-log/:sprint_task_status_log_id', authenticate, ReportsController.deleteSprintTaskStatusLog);

// ===========================================================================
// Informe Diario Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/reports/informe-diario:
 *   get:
 *     summary: Lista informes diarios
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projects_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de schedules com detalhes completos
 */
router.get('/informe-diario', authenticate, ReportsController.listInformeDiario);

/**
 * @swagger
 * /api/v1/reports/informe-diario/filtered:
 *   get:
 *     summary: Busca informe diario filtrado
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projects_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: teams_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Informe diario filtrado
 */
router.get('/informe-diario/filtered', authenticate, ReportsController.getInformeDiarioFiltered);

// ===========================================================================
// QR Code Reader Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/reports/qrcode-reader:
 *   get:
 *     summary: Le QR code e retorna informacoes do usuario
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: qrcode
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Informacoes do usuario associado ao QR code
 */
router.get('/qrcode-reader', authenticate, ReportsController.qrcodeReader);

export { router as reportsRoutes };
export default router;
