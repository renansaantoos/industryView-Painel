// =============================================================================
// INDUSTRYVIEW BACKEND - Material Requisitions Module Routes
// Rotas do modulo de requisicoes de materiais
// =============================================================================

import { Router } from 'express';
import { MaterialRequisitionsController } from './material-requisitions.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, MaterialRequisitionsController.listRequisitions);
router.post('/', authenticate, MaterialRequisitionsController.createRequisition);
router.get('/:id', authenticate, MaterialRequisitionsController.getRequisitionById);
router.patch('/:id', authenticate, MaterialRequisitionsController.updateRequisition);
router.post('/:id/submit', authenticate, MaterialRequisitionsController.submitRequisition);
router.post('/:id/approve', authenticate, MaterialRequisitionsController.approveRequisition);
router.post('/:id/reject', authenticate, MaterialRequisitionsController.rejectRequisition);

export { router as materialRequisitionsRoutes };
export default router;
