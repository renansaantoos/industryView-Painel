// =============================================================================
// INDUSTRYVIEW BACKEND - PPE Module Routes
// Rotas do modulo de EPIs (Equipamentos de Protecao Individual)
// =============================================================================

import { Router } from 'express';
import { PpeController } from './ppe.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// PPE Types
router.get('/types', authenticate, PpeController.listPpeTypes);
router.post('/types', authenticate, PpeController.createPpeType);
router.patch('/types/:id', authenticate, PpeController.updatePpeType);
router.delete('/types/:id', authenticate, PpeController.deletePpeType);

// Deliveries
router.get('/deliveries', authenticate, PpeController.listDeliveries);
router.post('/deliveries', authenticate, PpeController.createDelivery);
router.post('/deliveries/:id/return', authenticate, PpeController.registerReturn);

// Task Required PPE
router.get('/task-required', authenticate, PpeController.listTaskRequiredPpe);
router.post('/task-required', authenticate, PpeController.createTaskRequiredPpe);
router.delete('/task-required/:id', authenticate, PpeController.deleteTaskRequiredPpe);

// User PPE Status
router.get('/user-status/:user_id', authenticate, PpeController.getUserPpeStatus);

export { router as ppeRoutes };
export default router;
