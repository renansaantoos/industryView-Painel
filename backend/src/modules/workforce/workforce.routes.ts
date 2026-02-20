// =============================================================================
// INDUSTRYVIEW BACKEND - Workforce Module Routes
// Rotas do modulo de mao de obra / presenca diaria
// =============================================================================

import { Router } from 'express';
import multer from 'multer';
import { WorkforceController } from './workforce.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

const importUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Rotas estaticas antes das dinamicas com :id
router.get('/histogram', authenticate, WorkforceController.getHistogram);
router.post('/check-in', authenticate, WorkforceController.checkIn);
router.post('/import', authenticate, importUpload.single('file'), WorkforceController.importExcel);

router.get('/', authenticate, WorkforceController.listDailyLogs);
router.post('/', authenticate, WorkforceController.createDailyLog);
router.patch('/:id', authenticate, WorkforceController.updateDailyLog);
router.delete('/:id', authenticate, WorkforceController.deleteDailyLog);
router.post('/:id/check-out', authenticate, WorkforceController.checkOut);

export { router as workforceRoutes };
export default router;
