// =============================================================================
// INDUSTRYVIEW BACKEND - Trackers Module Routes
// Rotas do modulo de trackers (rastreadores solares)
// Equivalente aos endpoints do Xano em apis/trackers/ e apis/trackers_map/
// =============================================================================

import { Router } from 'express';
import { TrackersController } from './trackers.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// ===========================================================================
// Trackers Routes
// Equivalente a api_group Trackers do Xano
// ===========================================================================

/**
 * @swagger
 * /api/v1/trackers:
 *   get:
 *     summary: Lista trackers com paginacao
 *     tags: [Trackers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numero da pagina
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *         description: Itens por pagina
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca
 *       - in: query
 *         name: company_id
 *         schema:
 *           type: integer
 *         description: ID da empresa
 *     responses:
 *       200:
 *         description: Lista de trackers paginada
 */
router.get('/', authenticate, TrackersController.listTrackers);

/**
 * @swagger
 * /api/v1/trackers/all:
 *   get:
 *     summary: Lista todos os trackers sem paginacao (para dropdowns)
 *     tags: [Trackers]
 *     parameters:
 *       - in: query
 *         name: company_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista completa de trackers
 */
router.get('/all', TrackersController.listAllTrackers);

/**
 * @swagger
 * /api/v1/trackers/types:
 *   get:
 *     summary: Lista tipos de trackers
 *     tags: [Trackers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de tipos de trackers
 */
router.get('/types', authenticate, TrackersController.listTrackerTypes);

/**
 * @swagger
 * /api/v1/trackers/types:
 *   post:
 *     summary: Cria tipo de tracker
 *     tags: [Trackers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tipo criado com sucesso
 */
router.post('/types', authenticate, TrackersController.createTrackerType);

/**
 * @swagger
 * /api/v1/trackers/types/{trackers_types_id}:
 *   get:
 *     summary: Busca tipo de tracker por ID
 *     tags: [Trackers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trackers_types_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipo de tracker encontrado
 */
router.get('/types/:trackers_types_id', authenticate, TrackersController.getTrackerTypeById);

/**
 * @swagger
 * /api/v1/trackers/types/{trackers_types_id}:
 *   patch:
 *     summary: Atualiza tipo de tracker
 *     tags: [Trackers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trackers_types_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tipo atualizado com sucesso
 */
router.patch('/types/:trackers_types_id', authenticate, TrackersController.updateTrackerType);

/**
 * @swagger
 * /api/v1/trackers/types/{trackers_types_id}:
 *   delete:
 *     summary: Deleta tipo de tracker (soft delete)
 *     tags: [Trackers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trackers_types_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipo deletado com sucesso
 */
router.delete('/types/:trackers_types_id', authenticate, TrackersController.deleteTrackerType);

// ===========================================================================
// Fields Routes
// Equivalente aos endpoints fields do Xano
// ===========================================================================

/**
 * @swagger
 * /api/v1/trackers/fields:
 *   get:
 *     summary: Lista campos (fields)
 *     tags: [Trackers Map]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projects_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: company_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de campos
 */
router.get('/fields', authenticate, TrackersController.listFields);

/**
 * @swagger
 * /api/v1/trackers/fields:
 *   post:
 *     summary: Cria campo
 *     tags: [Trackers Map]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               projects_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Campo criado com sucesso
 */
router.post('/fields', authenticate, TrackersController.createField);

router.get('/fields/:fields_id', authenticate, TrackersController.getFieldById);
router.patch('/fields/:fields_id', authenticate, TrackersController.updateField);
router.delete('/fields/:fields_id', authenticate, TrackersController.deleteField);

/**
 * @swagger
 * /api/v1/trackers/field-name:
 *   put:
 *     summary: Atualiza nome do campo
 *     tags: [Trackers Map]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fields_id
 *               - name
 *             properties:
 *               fields_id:
 *                 type: integer
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Nome atualizado com sucesso
 */
router.put('/field-name', authenticate, TrackersController.updateFieldName);

// ===========================================================================
// Sections Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/trackers/sections:
 *   get:
 *     summary: Lista secoes
 *     tags: [Trackers Map]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fields_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de secoes
 */
router.get('/sections', authenticate, TrackersController.listSections);

/**
 * @swagger
 * /api/v1/trackers/sections:
 *   post:
 *     summary: Cria secao
 *     tags: [Trackers Map]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fields_id
 *             properties:
 *               fields_id:
 *                 type: integer
 *               rows_quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Secao criada com sucesso
 */
router.post('/sections', authenticate, TrackersController.createSection);

/**
 * @swagger
 * /api/v1/trackers/sections/duplicate:
 *   post:
 *     summary: Duplica secao
 *     tags: [Trackers Map]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sections_id
 *             properties:
 *               sections_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Secao duplicada com sucesso
 */
router.post('/sections/duplicate', authenticate, TrackersController.duplicateSection);

router.get('/sections/:sections_id', authenticate, TrackersController.getSectionById);
router.patch('/sections/:sections_id', authenticate, TrackersController.updateSection);
router.delete('/sections/:sections_id', authenticate, TrackersController.deleteSection);

// ===========================================================================
// Rows Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/trackers/rows/list:
 *   post:
 *     summary: Lista rows com filtros complexos
 *     tags: [Trackers Map]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sections_id:
 *                 type: integer
 *               stakes_statuses_id:
 *                 type: array
 *                 items:
 *                   type: integer
 *               rows_trackers_statuses_id:
 *                 type: array
 *                 items:
 *                   type: integer
 *               trackers_types_id:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Lista de rows com trackers e stakes
 */
router.post('/rows/list', authenticate, TrackersController.listRows);

router.get('/rows/:rows_id', authenticate, TrackersController.getRowById);
router.post('/rows', authenticate, TrackersController.createRow);
router.patch('/rows/:rows_id', authenticate, TrackersController.updateRow);
router.delete('/rows/:rows_id', authenticate, TrackersController.deleteRow);

// ===========================================================================
// Rows Trackers Routes
// ===========================================================================

router.get('/rows-trackers', authenticate, TrackersController.listRowsTrackers);
router.get('/rows-trackers/:rows_trackers_id', authenticate, TrackersController.getRowsTrackerById);
router.post('/rows-trackers', authenticate, TrackersController.createRowsTracker);
router.patch('/rows-trackers/:rows_trackers_id', authenticate, TrackersController.updateRowsTracker);
router.delete('/rows-trackers/:rows_trackers_id', authenticate, TrackersController.deleteRowsTracker);

// ===========================================================================
// Rows Trackers Statuses Routes
// ===========================================================================

router.get('/rows-trackers-statuses', authenticate, TrackersController.listRowsTrackersStatuses);
router.get('/rows-trackers-statuses/:rows_trackers_statuses_id', authenticate, TrackersController.getRowsTrackersStatusById);
router.post('/rows-trackers-statuses', authenticate, TrackersController.createRowsTrackersStatus);
router.patch('/rows-trackers-statuses/:rows_trackers_statuses_id', authenticate, TrackersController.updateRowsTrackersStatus);
router.delete('/rows-trackers-statuses/:rows_trackers_statuses_id', authenticate, TrackersController.deleteRowsTrackersStatus);

// ===========================================================================
// Trackers Map Routes
// Equivalente a api_group "Trackers Map" do Xano
// ===========================================================================

/**
 * @swagger
 * /api/v1/trackers/map:
 *   get:
 *     summary: Busca mapa de trackers completo
 *     tags: [Trackers Map]
 *     parameters:
 *       - in: query
 *         name: projects_id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fields_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Mapa completo com campos, secoes, rows, trackers e stakes
 */
router.get('/map', TrackersController.getTrackersMap);

/**
 * @swagger
 * /api/v1/trackers/map:
 *   post:
 *     summary: Cria mapa de trackers completo
 *     description: Cria toda a estrutura do mapa incluindo field, sections, rows, trackers e stakes
 *     tags: [Trackers Map]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - json_map
 *             properties:
 *               json_map:
 *                 type: object
 *                 properties:
 *                   groups:
 *                     type: array
 *               projects_id:
 *                 type: integer
 *               map_texts:
 *                 type: object
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mapa criado com sucesso
 */
router.post('/map', TrackersController.createTrackersMap);

/**
 * @swagger
 * /api/v1/trackers/map:
 *   put:
 *     summary: Atualiza mapa de trackers completo
 *     description: Atualiza toda a estrutura do mapa incluindo soft delete de elementos removidos
 *     tags: [Trackers Map]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - json_map
 *               - fields_id
 *             properties:
 *               json_map:
 *                 type: object
 *               projects_id:
 *                 type: integer
 *               map_texts:
 *                 type: object
 *               fields_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Mapa atualizado com sucesso
 */
router.put('/map', TrackersController.updateTrackersMap);

// ===========================================================================
// Trackers Stakes Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/trackers/stakes:
 *   get:
 *     summary: Lista todos os trackers_stakes (rows_stakes)
 *     tags: [Trackers Map]
 *     responses:
 *       200:
 *         description: Lista de rows_stakes
 */
router.get('/stakes', TrackersController.listTrackersStakes);

// ===========================================================================
// Trackers CRUD (com ID no path) - deve ficar por ultimo
// ===========================================================================

/**
 * @swagger
 * /api/v1/trackers:
 *   post:
 *     summary: Cria um novo tracker
 *     tags: [Trackers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trackers_types_id:
 *                 type: integer
 *               manufacturers_id:
 *                 type: integer
 *               stake_quantity:
 *                 type: integer
 *               max_modules:
 *                 type: integer
 *               company_id:
 *                 type: integer
 *               stakes_on_traker:
 *                 type: array
 *     responses:
 *       201:
 *         description: Tracker criado com sucesso
 */
router.post('/', authenticate, TrackersController.createTracker);

/**
 * @swagger
 * /api/v1/trackers/{trackers_id}:
 *   get:
 *     summary: Busca tracker por ID
 *     tags: [Trackers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trackers_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tracker encontrado
 */
router.get('/:trackers_id', authenticate, TrackersController.getTrackerById);

/**
 * @swagger
 * /api/v1/trackers/{trackers_id}:
 *   patch:
 *     summary: Atualiza um tracker
 *     tags: [Trackers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trackers_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Tracker atualizado com sucesso
 */
router.patch('/:trackers_id', authenticate, TrackersController.updateTracker);

/**
 * @swagger
 * /api/v1/trackers/{trackers_id}:
 *   delete:
 *     summary: Deleta um tracker (soft delete)
 *     tags: [Trackers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trackers_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tracker deletado com sucesso
 */
router.delete('/:trackers_id', authenticate, TrackersController.deleteTracker);

export { router as trackersRoutes };
export default router;
