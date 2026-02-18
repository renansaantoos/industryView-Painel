// =============================================================================
// INDUSTRYVIEW BACKEND - Inventory Module Routes
// Rotas do modulo de inventario
// Equivalente aos endpoints do Xano em apis/inventory/
// =============================================================================

import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// ===========================================================================
// Product Inventory Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/inventory/products:
 *   get:
 *     summary: Lista produtos do inventario com paginacao e filtros
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: projects_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de produtos com contadores de status
 */
router.get('/products', authenticate, InventoryController.listProductInventory);

/**
 * @swagger
 * /api/v1/inventory/products:
 *   post:
 *     summary: Cria produto no inventario
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product
 *             properties:
 *               product:
 *                 type: string
 *               specifications:
 *                 type: string
 *               inventory_quantity:
 *                 type: integer
 *               min_quantity:
 *                 type: integer
 *               unity_id:
 *                 type: integer
 *               status_inventory_id:
 *                 type: integer
 *               equipaments_types_id:
 *                 type: integer
 *               manufacturers_id:
 *                 type: integer
 *               projects_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 */
router.post('/products', authenticate, InventoryController.createProductInventory);

/**
 * @swagger
 * /api/v1/inventory/products/{product_inventory_id}:
 *   get:
 *     summary: Busca produto por ID
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_inventory_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto encontrado
 */
router.get('/products/:product_inventory_id', authenticate, InventoryController.getProductInventoryById);

/**
 * @swagger
 * /api/v1/inventory/products/{product_inventory_id}:
 *   patch:
 *     summary: Atualiza produto parcialmente
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_inventory_id
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
 *         description: Produto atualizado com sucesso
 */
router.patch('/products/:product_inventory_id', authenticate, InventoryController.updateProductInventory);

/**
 * @swagger
 * /api/v1/inventory/products/{product_inventory_id}:
 *   put:
 *     summary: Atualiza produto completamente
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_inventory_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 */
router.put('/products/:product_inventory_id', authenticate, InventoryController.replaceProductInventory);

/**
 * @swagger
 * /api/v1/inventory/products/{product_inventory_id}:
 *   delete:
 *     summary: Deleta produto (soft delete)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_inventory_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto deletado com sucesso
 */
router.delete('/products/:product_inventory_id', authenticate, InventoryController.deleteProductInventory);

// ===========================================================================
// Inventory Quantity Operations Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/inventory/add-quantity:
 *   post:
 *     summary: Adiciona quantidade ao inventario (entrada)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_inventory_id
 *               - quantity
 *             properties:
 *               product_inventory_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Quantidade adicionada com sucesso
 */
router.post('/add-quantity', authenticate, InventoryController.addQuantityInventory);

/**
 * @swagger
 * /api/v1/inventory/remove-quantity:
 *   post:
 *     summary: Remove quantidade do inventario (saida)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_inventory_id
 *               - quantity
 *             properties:
 *               product_inventory_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               received_user:
 *                 type: integer
 *                 description: Usuario que recebeu o material
 *     responses:
 *       200:
 *         description: Quantidade removida com sucesso
 */
router.post('/remove-quantity', authenticate, InventoryController.removeQuantityInventory);

// ===========================================================================
// Status Inventory Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/inventory/status:
 *   get:
 *     summary: Lista status do inventario
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de status
 */
router.get('/status', authenticate, InventoryController.listStatusInventory);

/**
 * @swagger
 * /api/v1/inventory/status:
 *   post:
 *     summary: Cria status de inventario
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Status criado com sucesso
 */
router.post('/status', authenticate, InventoryController.createStatusInventory);

router.get('/status/:status_inventory_id', authenticate, InventoryController.getStatusInventoryById);
router.patch('/status/:status_inventory_id', authenticate, InventoryController.updateStatusInventory);
router.put('/status/:status_inventory_id', authenticate, InventoryController.replaceStatusInventory);
router.delete('/status/:status_inventory_id', authenticate, InventoryController.deleteStatusInventory);

// ===========================================================================
// Inventory Logs Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/inventory/logs:
 *   get:
 *     summary: Lista logs de inventario com paginacao
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: projects_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de logs de movimentacao
 */
router.get('/logs', authenticate, InventoryController.listInventoryLogs);

/**
 * @swagger
 * /api/v1/inventory/logs/filtered:
 *   get:
 *     summary: Lista logs filtrados por produto
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: product_inventory_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: projects_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de logs filtrados
 */
router.get('/logs/filtered', authenticate, InventoryController.listInventoryLogsFiltered);

/**
 * @swagger
 * /api/v1/inventory/logs:
 *   post:
 *     summary: Cria log de inventario manualmente
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_inventory_id
 *               - quantity
 *               - type
 *             properties:
 *               product_inventory_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               type:
 *                 type: boolean
 *                 description: true = entrada, false = saida
 *               observations:
 *                 type: string
 *     responses:
 *       201:
 *         description: Log criado com sucesso
 */
router.post('/logs', authenticate, InventoryController.createInventoryLog);

router.get('/logs/:inventory_logs_id', authenticate, InventoryController.getInventoryLogById);
router.patch('/logs/:inventory_logs_id', authenticate, InventoryController.updateInventoryLog);
router.delete('/logs/:inventory_logs_id', authenticate, InventoryController.deleteInventoryLog);

// ===========================================================================
// Import/Export Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/inventory/import:
 *   post:
 *     summary: Importa produtos em lote
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - products
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *               projects_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Produtos importados com sucesso
 */
router.post('/import', authenticate, InventoryController.importInventory);

/**
 * @swagger
 * /api/v1/inventory/export:
 *   get:
 *     summary: Exporta inventario
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projects_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados do inventario para exportacao
 */
router.get('/export', authenticate, InventoryController.exportInventory);

export { router as inventoryRoutes };
export default router;
