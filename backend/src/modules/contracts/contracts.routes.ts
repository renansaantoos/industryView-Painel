// =============================================================================
// INDUSTRYVIEW BACKEND - Contracts Module Routes
// Rotas do modulo de contratos (Medicoes e Reivindicacoes)
// =============================================================================

import { Router } from 'express';
import { ContractsController } from './contracts.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Measurements
router.get('/measurements', authenticate, ContractsController.listMeasurements);
router.post('/measurements', authenticate, ContractsController.createMeasurement);
router.get('/measurements/:id', authenticate, ContractsController.getMeasurementById);
router.patch('/measurements/:id', authenticate, ContractsController.updateMeasurement);
router.post('/measurements/:id/submit', authenticate, ContractsController.submitMeasurement);
router.post('/measurements/:id/approve', authenticate, ContractsController.approveMeasurement);
router.post('/measurements/:id/reject', authenticate, ContractsController.rejectMeasurement);

// Claims
router.get('/claims', authenticate, ContractsController.listClaims);
router.post('/claims', authenticate, ContractsController.createClaim);
router.get('/claims/:id', authenticate, ContractsController.getClaimById);
router.patch('/claims/:id', authenticate, ContractsController.updateClaim);
router.post('/claims/:id/close', authenticate, ContractsController.closeClaim);
router.post('/claims/:id/evidences', authenticate, ContractsController.addClaimEvidence);

export { router as contractsRoutes };
export default router;
