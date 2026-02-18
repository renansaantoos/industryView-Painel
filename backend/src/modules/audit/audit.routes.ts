// =============================================================================
// INDUSTRYVIEW BACKEND - Audit Module Routes
// Rotas do modulo de auditoria / logs de acoes
// =============================================================================

import { Router } from 'express';
import { AuditController } from './audit.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/logs', authenticate, AuditController.listLogs);
router.get('/logs/:table_name/:record_id', authenticate, AuditController.getLogsByRecord);

export { router as auditRoutes };
export default router;
