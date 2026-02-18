// =============================================================================
// INDUSTRYVIEW BACKEND - Audit Module Controller
// Controller do modulo de auditoria / logs de acoes
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { AuditService } from './audit.service';
import { listLogsSchema, getLogsByRecordSchema } from './audit.schema';
import { AuthenticatedRequest } from '../../types';

/**
 * AuditController - Controller do modulo de auditoria
 */
export class AuditController {
  /**
   * Lista logs de auditoria com filtros
   * Route: GET /api/v1/audit/logs
   */
  static async listLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listLogsSchema.parse(req.query) as any;
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await AuditService.listLogs(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca logs de um registro especifico
   * Route: GET /api/v1/audit/logs/:table_name/:record_id
   */
  static async getLogsByRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const input = getLogsByRecordSchema.parse(req.params);
      const result = await AuditService.getLogsByRecord(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default AuditController;
