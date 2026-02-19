// =============================================================================
// INDUSTRYVIEW BACKEND - Work Permits Module Controller
// Controller do modulo de permissoes de trabalho (PTW)
// =============================================================================

import { Response, NextFunction } from 'express';
import { WorkPermitsService } from './work-permits.service';
import {
  listPermitsSchema,
  getPermitByIdSchema,
  getActivePermitsSchema,
  createPermitSchema,
  updatePermitSchema,
  addSignatureSchema,
} from './work-permits.schema';
import { AuthenticatedRequest } from '../../types';
import { serializeBigInt } from '../../utils/bigint';

/**
 * WorkPermitsController - Controller do modulo de permissoes de trabalho
 */
export class WorkPermitsController {
  /**
   * Lista permissoes de trabalho com paginacao
   * Route: GET /api/v1/work-permits
   */
  static async listPermits(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listPermitsSchema.parse(req.query) as any;
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await WorkPermitsService.listPermits(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca permissao por ID
   * Route: GET /api/v1/work-permits/:id
   */
  static async getPermitById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getPermitByIdSchema.parse(req.params);
      const result = await WorkPermitsService.getPermitById(id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista permissoes ativas de um projeto
   * Route: GET /api/v1/work-permits/active
   */
  static async getActivePermits(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { projects_id } = getActivePermitsSchema.parse(req.query);
      const result = await WorkPermitsService.getActivePermits(projects_id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria nova permissao de trabalho
   * Route: POST /api/v1/work-permits
   */
  static async createPermit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = createPermitSchema.parse(req.body);
      const user_id = Number(req.auth!.id);
      const result = await WorkPermitsService.createPermit(input, user_id);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza permissao de trabalho
   * Route: PATCH /api/v1/work-permits/:id
   */
  static async updatePermit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getPermitByIdSchema.parse(req.params);
      const input = updatePermitSchema.parse(req.body);
      const result = await WorkPermitsService.updatePermit(id, input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Aprova permissao de trabalho
   * Route: POST /api/v1/work-permits/:id/approve
   */
  static async approvePermit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getPermitByIdSchema.parse(req.params);
      const user_id = Number(req.auth!.id);
      const result = await WorkPermitsService.approvePermit(id, user_id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Encerra permissao de trabalho
   * Route: POST /api/v1/work-permits/:id/close
   */
  static async closePermit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getPermitByIdSchema.parse(req.params);
      const user_id = Number(req.auth!.id);
      const result = await WorkPermitsService.closePermit(id, user_id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancela permissao de trabalho
   * Route: POST /api/v1/work-permits/:id/cancel
   */
  static async cancelPermit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getPermitByIdSchema.parse(req.params);
      const result = await WorkPermitsService.cancelPermit(id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Adiciona assinatura a uma permissao
   * Route: POST /api/v1/work-permits/:id/signatures
   */
  static async addSignature(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id: permit_id } = getPermitByIdSchema.parse(req.params);
      const input = addSignatureSchema.parse({ ...req.body, permit_id });
      const result = await WorkPermitsService.addSignature(input);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }
}

export default WorkPermitsController;
