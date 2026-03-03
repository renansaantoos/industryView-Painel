// =============================================================================
// INDUSTRYVIEW BACKEND - Tools Module Routes
// Rotas do modulo de Ferramentas
// IMPORTANTE: rotas especificas ANTES de /:id para evitar conflito no Express
// =============================================================================

import { Router } from 'express';
import { ToolsController } from './tools.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Departments
router.get('/departments', authenticate, ToolsController.listDepartments);
router.post('/departments', authenticate, ToolsController.createDepartment);
router.patch('/departments/:id', authenticate, ToolsController.updateDepartment);
router.delete('/departments/:id', authenticate, ToolsController.deleteDepartment);

// Categories
router.get('/categories', authenticate, ToolsController.listCategories);
router.post('/categories', authenticate, ToolsController.createCategory);
router.patch('/categories/:id', authenticate, ToolsController.updateCategory);
router.delete('/categories/:id', authenticate, ToolsController.deleteCategory);

// Movements (ANTES de /:id)
router.get('/movements', authenticate, ToolsController.listMovements);
router.post('/movements/transfer', authenticate, ToolsController.transfer);
router.post('/movements/assign-employee', authenticate, ToolsController.assignEmployee);
router.post('/movements/assign-team', authenticate, ToolsController.assignTeam);
router.post('/movements/assign-project', authenticate, ToolsController.assignProject);
router.post('/movements/return', authenticate, ToolsController.returnTool);
router.post('/movements/assign-kit', authenticate, ToolsController.assignKit);

// Acceptance Terms (ANTES de /:id)
router.get('/acceptance-terms', authenticate, ToolsController.listAcceptanceTerms);
router.get('/acceptance-terms/:id', authenticate, ToolsController.getAcceptanceTermById);
router.post('/acceptance-terms', authenticate, ToolsController.createAcceptanceTerm);

// Kits (ANTES de /:id)
router.get('/kits', authenticate, ToolsController.listKits);
router.get('/kits/by-cargo/:cargo', authenticate, ToolsController.getKitByCargo);
router.get('/kits/:id', authenticate, ToolsController.getKitById);
router.post('/kits', authenticate, ToolsController.createKit);
router.patch('/kits/:id', authenticate, ToolsController.updateKit);
router.delete('/kits/:id', authenticate, ToolsController.deleteKit);
router.post('/kits/:id/items', authenticate, ToolsController.addKitItem);
router.delete('/kits/:id/items/:itemId', authenticate, ToolsController.deleteKitItem);

// User Tools & Summary (ANTES de /:id)
router.get('/user-tools/:user_id', authenticate, ToolsController.getUserTools);
router.get('/summary', authenticate, ToolsController.getSummary);

// Tools CRUD (/:id por ultimo)
router.get('/', authenticate, ToolsController.listTools);
router.get('/:id', authenticate, ToolsController.getToolById);
router.post('/', authenticate, ToolsController.createTool);
router.patch('/:id', authenticate, ToolsController.updateTool);
router.delete('/:id', authenticate, ToolsController.deleteTool);
router.get('/:id/movements', authenticate, ToolsController.getToolMovements);

export { router as toolsRoutes };
export default router;
