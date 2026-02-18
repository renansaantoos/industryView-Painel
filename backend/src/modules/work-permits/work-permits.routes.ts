// =============================================================================
// INDUSTRYVIEW BACKEND - Work Permits Module Routes
// Rotas do modulo de permissoes de trabalho (PTW)
// =============================================================================

import { Router } from 'express';
import { WorkPermitsController } from './work-permits.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// GET /active deve vir ANTES de /:id para nao ser capturado como parametro
router.get('/active', authenticate, WorkPermitsController.getActivePermits);

router.get('/', authenticate, WorkPermitsController.listPermits);
router.get('/:id', authenticate, WorkPermitsController.getPermitById);
router.post('/', authenticate, WorkPermitsController.createPermit);
router.patch('/:id', authenticate, WorkPermitsController.updatePermit);
router.post('/:id/approve', authenticate, WorkPermitsController.approvePermit);
router.post('/:id/close', authenticate, WorkPermitsController.closePermit);
router.post('/:id/cancel', authenticate, WorkPermitsController.cancelPermit);
router.post('/:id/signatures', authenticate, WorkPermitsController.addSignature);

export { router as workPermitsRoutes };
export default router;
