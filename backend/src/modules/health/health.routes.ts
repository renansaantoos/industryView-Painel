// =============================================================================
// INDUSTRYVIEW BACKEND - Health Module Routes
// Rotas do modulo de saude ocupacional
// =============================================================================

import { Router } from 'express';
import { HealthController } from './health.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Rotas estaticas antes de /:id
router.get('/records/expiring', authenticate, HealthController.getExpiringExams);
router.get('/check-fitness/:user_id', authenticate, HealthController.checkWorkerFitness);

router.get('/records', authenticate, HealthController.listRecords);
router.post('/records', authenticate, HealthController.createRecord);
router.get('/records/:id', authenticate, HealthController.getRecordById);
router.patch('/records/:id', authenticate, HealthController.updateRecord);

export { router as healthRoutes };
export default router;
