// =============================================================================
// INDUSTRYVIEW BACKEND - Manufacturers Routes
// Rotas do modulo de fabricantes
// Equivalente aos endpoints do api_group Manufacturers do Xano
// =============================================================================

import { Router } from 'express';
import { ManufacturersController } from './manufacturers.controller';
import { authenticate } from '../../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../../middleware/validation';
import {
  listManufacturersQuerySchema,
  manufacturerParamsSchema,
  createManufacturerSchema,
  updateManufacturerSchema,
} from './manufacturers.schema';

const router = Router();

/**
 * @swagger
 * /api/v1/manufacturers:
 *   get:
 *     summary: Lista fabricantes com paginacao e filtros
 *     tags: [Manufacturers]
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
 *         name: equipaments_types_id
 *         schema:
 *           type: integer
 *         description: Filtrar por tipo de equipamento
 *     responses:
 *       200:
 *         description: Lista paginada de fabricantes
 */
router.get(
  '/',
  authenticate,
  validateQuery(listManufacturersQuerySchema),
  ManufacturersController.list
);

/**
 * @swagger
 * /api/v1/manufacturers:
 *   post:
 *     summary: Cria um novo fabricante
 *     tags: [Manufacturers]
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
 *               equipaments_types_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Fabricante criado com sucesso
 */
router.post(
  '/',
  authenticate,
  validateBody(createManufacturerSchema),
  ManufacturersController.create
);

/**
 * @swagger
 * /api/v1/manufacturers/{manufacturers_id}:
 *   get:
 *     summary: Busca fabricante por ID
 *     tags: [Manufacturers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: manufacturers_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Fabricante encontrado
 *       404:
 *         description: Fabricante nao encontrado
 */
router.get(
  '/:manufacturers_id',
  authenticate,
  validateParams(manufacturerParamsSchema),
  ManufacturersController.getById
);

/**
 * @swagger
 * /api/v1/manufacturers/{manufacturers_id}:
 *   patch:
 *     summary: Atualiza fabricante
 *     tags: [Manufacturers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: manufacturers_id
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
 *               name:
 *                 type: string
 *               equipaments_types_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Fabricante atualizado com sucesso
 */
router.patch(
  '/:manufacturers_id',
  authenticate,
  validateParams(manufacturerParamsSchema),
  validateBody(updateManufacturerSchema),
  ManufacturersController.update
);

/**
 * @swagger
 * /api/v1/manufacturers/{manufacturers_id}:
 *   delete:
 *     summary: Remove fabricante (soft delete)
 *     tags: [Manufacturers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: manufacturers_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Fabricante removido com sucesso
 */
router.delete(
  '/:manufacturers_id',
  authenticate,
  validateParams(manufacturerParamsSchema),
  ManufacturersController.delete
);

export default router;
