// =============================================================================
// INDUSTRYVIEW BACKEND - Commissioning Module Routes
// Rotas do modulo de comissionamento
// =============================================================================

import { Router } from 'express';
import { CommissioningController } from './commissioning.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Systems
router.get('/systems', authenticate, CommissioningController.listSystems);
router.post('/systems', authenticate, CommissioningController.createSystem);
router.get('/systems/:id', authenticate, CommissioningController.getSystemById);
router.patch('/systems/:id', authenticate, CommissioningController.updateSystem);
router.delete('/systems/:id', authenticate, CommissioningController.deleteSystem);

// Punch List (aninhado em sistema)
router.get('/systems/:id/punch-list', authenticate, CommissioningController.getPunchList);
router.post('/systems/:id/punch-list', authenticate, CommissioningController.createPunchListItem);
router.patch('/punch-list/:id', authenticate, CommissioningController.updatePunchListItem);

// Certificates (aninhado em sistema)
router.get('/systems/:id/certificates', authenticate, CommissioningController.getCertificates);
router.post('/systems/:id/certificates', authenticate, CommissioningController.createCertificate);
router.patch('/certificates/:id', authenticate, CommissioningController.updateCertificate);

export { router as commissioningRoutes };
export default router;
