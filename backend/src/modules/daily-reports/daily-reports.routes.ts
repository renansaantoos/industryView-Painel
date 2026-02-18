// =============================================================================
// INDUSTRYVIEW BACKEND - Daily Reports Module Routes
// Rotas do modulo de RDO completo (Relatorio Diario de Obra)
//
// Prefixo: /api/v1/daily-reports
//
// Fluxo de aprovacao:
//   POST /              -> cria com status 'rascunho'
//   POST /:id/finalize  -> rascunho -> finalizado
//   POST /:id/approve   -> finalizado -> aprovado (imutavel)
//   POST /:id/reject    -> finalizado -> rejeitado (volta rascunho para correcao)
// =============================================================================

import { Router } from 'express';
import { DailyReportsController } from './daily-reports.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// ===========================================================================
// Rotas do RDO principal
// ===========================================================================

/**
 * @swagger
 * /api/v1/daily-reports:
 *   get:
 *     summary: Lista RDOs com filtros e paginacao
 *     tags: [Daily Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projects_id
 *         schema:
 *           type: integer
 *         description: Filtrar por projeto
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: initial_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial do filtro (YYYY-MM-DD)
 *       - in: query
 *         name: final_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final do filtro (YYYY-MM-DD)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [rascunho, finalizado, aprovado, rejeitado]
 *         description: Filtrar por status do RDO
 *     responses:
 *       200:
 *         description: Lista paginada de RDOs com contagens de itens filhos e RDOs pendentes
 */
router.get('/', authenticate, DailyReportsController.listDailyReports);

/**
 * @swagger
 * /api/v1/daily-reports/dates:
 *   get:
 *     summary: Busca datas com RDOs cadastrados
 *     tags: [Daily Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projects_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de datas com seus respectivos status de RDO
 */
router.get('/dates', authenticate, DailyReportsController.getDailyReportDates);

/**
 * @swagger
 * /api/v1/daily-reports/{id}:
 *   get:
 *     summary: Busca RDO por ID com todos os dados filhos
 *     tags: [Daily Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: RDO completo com workforce, atividades, ocorrencias e equipamentos
 *       404:
 *         description: RDO nao encontrado
 */
router.get('/:id', authenticate, DailyReportsController.getDailyReportById);

/**
 * @swagger
 * /api/v1/daily-reports:
 *   post:
 *     summary: Cria novo RDO com status rascunho
 *     tags: [Daily Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projects_id
 *               - rdo_date
 *             properties:
 *               projects_id:
 *                 type: integer
 *               rdo_date:
 *                 type: string
 *                 format: date
 *               shift:
 *                 type: string
 *                 enum: [manha, tarde, noite, integral]
 *               weather_morning:
 *                 type: string
 *                 maxLength: 30
 *               weather_afternoon:
 *                 type: string
 *                 maxLength: 30
 *               weather_night:
 *                 type: string
 *                 maxLength: 30
 *               temperature_min:
 *                 type: number
 *               temperature_max:
 *                 type: number
 *               safety_topic:
 *                 type: string
 *               general_observations:
 *                 type: string
 *               schedule_id:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs dos schedules a vincular
 *     responses:
 *       201:
 *         description: RDO criado com sucesso (status rascunho, rdo_number gerado automaticamente)
 */
router.post('/', authenticate, DailyReportsController.createDailyReport);

/**
 * @swagger
 * /api/v1/daily-reports/{id}:
 *   patch:
 *     summary: Atualiza RDO (somente se status = rascunho)
 *     tags: [Daily Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rdo_date:
 *                 type: string
 *                 format: date
 *               shift:
 *                 type: string
 *                 enum: [manha, tarde, noite, integral]
 *               weather_morning:
 *                 type: string
 *               weather_afternoon:
 *                 type: string
 *               weather_night:
 *                 type: string
 *               temperature_min:
 *                 type: number
 *               temperature_max:
 *                 type: number
 *               safety_topic:
 *                 type: string
 *               general_observations:
 *                 type: string
 *     responses:
 *       200:
 *         description: RDO atualizado com sucesso
 *       400:
 *         description: RDO nao esta em status rascunho
 *       404:
 *         description: RDO nao encontrado
 */
router.patch('/:id', authenticate, DailyReportsController.updateDailyReport);

/**
 * @swagger
 * /api/v1/daily-reports/{id}/finalize:
 *   post:
 *     summary: Finaliza RDO (rascunho -> finalizado)
 *     tags: [Daily Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: RDO finalizado com sucesso
 *       400:
 *         description: RDO nao esta em status rascunho
 */
router.post('/:id/finalize', authenticate, DailyReportsController.finalizeDailyReport);

/**
 * @swagger
 * /api/v1/daily-reports/{id}/approve:
 *   post:
 *     summary: Aprova RDO (finalizado -> aprovado). Torna o registro imutavel.
 *     tags: [Daily Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approved_by_user_id:
 *                 type: integer
 *                 description: Se nao informado, usa o usuario autenticado
 *     responses:
 *       200:
 *         description: RDO aprovado com sucesso (agora imutavel)
 *       400:
 *         description: RDO nao esta em status finalizado
 */
router.post('/:id/approve', authenticate, DailyReportsController.approveDailyReport);

/**
 * @swagger
 * /api/v1/daily-reports/{id}/reject:
 *   post:
 *     summary: Rejeita RDO (finalizado -> rejeitado, volta para rascunho para correcao)
 *     tags: [Daily Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rejection_reason
 *             properties:
 *               rejection_reason:
 *                 type: string
 *                 minLength: 1
 *     responses:
 *       200:
 *         description: RDO rejeitado com sucesso (status volta para rascunho para correcao)
 *       400:
 *         description: RDO nao esta em status finalizado
 */
router.post('/:id/reject', authenticate, DailyReportsController.rejectDailyReport);

// ===========================================================================
// Rotas de Mao de Obra (Workforce)
// ===========================================================================

/**
 * @swagger
 * /api/v1/daily-reports/{id}/workforce:
 *   post:
 *     summary: Adiciona entrada de mao de obra ao RDO
 *     tags: [Daily Reports - Workforce]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do RDO
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role_category
 *               - quantity_planned
 *               - quantity_present
 *             properties:
 *               role_category:
 *                 type: string
 *                 maxLength: 100
 *               quantity_planned:
 *                 type: integer
 *                 minimum: 0
 *               quantity_present:
 *                 type: integer
 *                 minimum: 0
 *               quantity_absent:
 *                 type: integer
 *                 minimum: 0
 *               absence_reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Entrada de mao de obra adicionada
 *       400:
 *         description: RDO nao esta em status rascunho
 */
router.post('/:id/workforce', authenticate, DailyReportsController.addWorkforceEntry);

/**
 * @swagger
 * /api/v1/daily-reports/workforce/{entry_id}:
 *   patch:
 *     summary: Atualiza entrada de mao de obra
 *     tags: [Daily Reports - Workforce]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entry_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Entrada atualizada com sucesso
 *       400:
 *         description: RDO pai nao esta em status rascunho
 *       404:
 *         description: Entrada nao encontrada
 */
router.patch('/workforce/:entry_id', authenticate, DailyReportsController.updateWorkforceEntry);

/**
 * @swagger
 * /api/v1/daily-reports/workforce/{entry_id}:
 *   delete:
 *     summary: Remove entrada de mao de obra (soft delete)
 *     tags: [Daily Reports - Workforce]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entry_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Entrada removida com sucesso
 *       400:
 *         description: RDO pai nao esta em status rascunho
 *       404:
 *         description: Entrada nao encontrada
 */
router.delete('/workforce/:entry_id', authenticate, DailyReportsController.deleteWorkforceEntry);

// ===========================================================================
// Rotas de Atividades (Activities)
// ===========================================================================

/**
 * @swagger
 * /api/v1/daily-reports/{id}/activities:
 *   post:
 *     summary: Adiciona atividade executada ao RDO
 *     tags: [Daily Reports - Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *             properties:
 *               projects_backlogs_id:
 *                 type: integer
 *                 description: Vincula a um item do backlog do projeto
 *               description:
 *                 type: string
 *               quantity_done:
 *                 type: number
 *               unity_id:
 *                 type: integer
 *               teams_id:
 *                 type: integer
 *               location_description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Atividade adicionada com sucesso
 *       400:
 *         description: RDO nao esta em status rascunho
 */
router.post('/:id/activities', authenticate, DailyReportsController.addActivityEntry);

/**
 * @swagger
 * /api/v1/daily-reports/activities/{entry_id}:
 *   patch:
 *     summary: Atualiza atividade do RDO
 *     tags: [Daily Reports - Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entry_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Atividade atualizada com sucesso
 */
router.patch('/activities/:entry_id', authenticate, DailyReportsController.updateActivityEntry);

/**
 * @swagger
 * /api/v1/daily-reports/activities/{entry_id}:
 *   delete:
 *     summary: Remove atividade do RDO (soft delete)
 *     tags: [Daily Reports - Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entry_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Atividade removida com sucesso
 */
router.delete('/activities/:entry_id', authenticate, DailyReportsController.deleteActivityEntry);

// ===========================================================================
// Rotas de Ocorrencias (Occurrences)
// ===========================================================================

/**
 * @swagger
 * /api/v1/daily-reports/{id}/occurrences:
 *   post:
 *     summary: Adiciona ocorrencia ao RDO
 *     tags: [Daily Reports - Occurrences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - occurrence_type
 *               - description
 *             properties:
 *               occurrence_type:
 *                 type: string
 *                 maxLength: 50
 *                 description: "Exemplos: chuva, paralisacao, acidente, incidente, falta_material"
 *               description:
 *                 type: string
 *               start_time:
 *                 type: string
 *                 description: Horario de inicio (HH:MM)
 *               end_time:
 *                 type: string
 *                 description: Horario de fim (HH:MM)
 *               duration_hours:
 *                 type: number
 *               impact_description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ocorrencia adicionada com sucesso
 *       400:
 *         description: RDO nao esta em status rascunho
 */
router.post('/:id/occurrences', authenticate, DailyReportsController.addOccurrenceEntry);

/**
 * @swagger
 * /api/v1/daily-reports/occurrences/{entry_id}:
 *   patch:
 *     summary: Atualiza ocorrencia do RDO
 *     tags: [Daily Reports - Occurrences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entry_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ocorrencia atualizada com sucesso
 */
router.patch('/occurrences/:entry_id', authenticate, DailyReportsController.updateOccurrenceEntry);

/**
 * @swagger
 * /api/v1/daily-reports/occurrences/{entry_id}:
 *   delete:
 *     summary: Remove ocorrencia do RDO (soft delete)
 *     tags: [Daily Reports - Occurrences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entry_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ocorrencia removida com sucesso
 */
router.delete('/occurrences/:entry_id', authenticate, DailyReportsController.deleteOccurrenceEntry);

// ===========================================================================
// Rotas de Equipamentos (Equipment)
// ===========================================================================

/**
 * @swagger
 * /api/v1/daily-reports/{id}/equipment:
 *   post:
 *     summary: Adiciona equipamento utilizado ao RDO
 *     tags: [Daily Reports - Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               equipaments_types_id:
 *                 type: integer
 *                 description: Tipo de equipamento (FK equipaments_types)
 *               description:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *               operation_hours:
 *                 type: number
 *               idle_hours:
 *                 type: number
 *               idle_reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Equipamento adicionado com sucesso
 *       400:
 *         description: RDO nao esta em status rascunho
 */
router.post('/:id/equipment', authenticate, DailyReportsController.addEquipmentEntry);

/**
 * @swagger
 * /api/v1/daily-reports/equipment/{entry_id}:
 *   patch:
 *     summary: Atualiza equipamento do RDO
 *     tags: [Daily Reports - Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entry_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Equipamento atualizado com sucesso
 */
router.patch('/equipment/:entry_id', authenticate, DailyReportsController.updateEquipmentEntry);

/**
 * @swagger
 * /api/v1/daily-reports/equipment/{entry_id}:
 *   delete:
 *     summary: Remove equipamento do RDO (soft delete)
 *     tags: [Daily Reports - Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entry_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Equipamento removido com sucesso
 */
router.delete('/equipment/:entry_id', authenticate, DailyReportsController.deleteEquipmentEntry);

export { router as dailyReportsRoutes };
export default router;
