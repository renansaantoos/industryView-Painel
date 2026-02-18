// =============================================================================
// INDUSTRYVIEW BACKEND - Environmental Module Routes
// Rotas do modulo de licenciamento ambiental
// =============================================================================

import { Router } from 'express';
import { EnvironmentalController } from './environmental.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Rota /expiring deve vir ANTES de /:id para nao ser capturada como parametro
router.get('/licenses/expiring', authenticate, EnvironmentalController.getExpiringLicenses);

router.get('/licenses', authenticate, EnvironmentalController.listLicenses);
router.post('/licenses', authenticate, EnvironmentalController.createLicense);
router.get('/licenses/:id', authenticate, EnvironmentalController.getLicenseById);
router.patch('/licenses/:id', authenticate, EnvironmentalController.updateLicense);
router.delete('/licenses/:id', authenticate, EnvironmentalController.deleteLicense);

// Conditions (aninhadas em licenca)
router.get('/licenses/:id/conditions', authenticate, EnvironmentalController.getConditions);
router.post('/licenses/:id/conditions', authenticate, EnvironmentalController.createCondition);
router.patch('/conditions/:id', authenticate, EnvironmentalController.updateCondition);

export { router as environmentalRoutes };
export default router;
