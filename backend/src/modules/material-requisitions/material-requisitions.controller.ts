// =============================================================================
// INDUSTRYVIEW BACKEND - Material Requisitions Module Controller
// Controller do modulo de requisicoes de materiais
// =============================================================================

import { Response, NextFunction } from 'express';
import { MaterialRequisitionsService } from './material-requisitions.service';
import {
  listRequisitionsSchema,
  getRequisitionByIdSchema,
  createRequisitionSchema,
  updateRequisitionSchema,
  submitRequisitionSchema,
  approveRequisitionSchema,
  rejectRequisitionSchema,
} from './material-requisitions.schema';
import { AuthenticatedRequest } from '../../types';

/**
 * MaterialRequisitionsController - Controller do modulo de requisicoes de materiais
 */
export class MaterialRequisitionsController {
  static async listRequisitions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listRequisitionsSchema.parse(req.query) as any;
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await MaterialRequisitionsService.listRequisitions(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getRequisitionById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getRequisitionByIdSchema.parse(req.params);
      const result = await MaterialRequisitionsService.getRequisitionById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async createRequisition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = createRequisitionSchema.parse(req.body);
      const user_id = Number(req.auth!.id);
      const result = await MaterialRequisitionsService.createRequisition(input, user_id);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateRequisition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getRequisitionByIdSchema.parse(req.params);
      const input = updateRequisitionSchema.parse(req.body);
      const result = await MaterialRequisitionsService.updateRequisition(id, input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async submitRequisition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = submitRequisitionSchema.parse(req.params);
      const result = await MaterialRequisitionsService.submitRequisition(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async approveRequisition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getRequisitionByIdSchema.parse(req.params);
      const input = approveRequisitionSchema.parse({ ...req.body, id });
      const user_id = Number(req.auth!.id);
      const result = await MaterialRequisitionsService.approveRequisition(id, input, user_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async rejectRequisition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getRequisitionByIdSchema.parse(req.params);
      const input = rejectRequisitionSchema.parse({ ...req.body, id });
      const result = await MaterialRequisitionsService.rejectRequisition(id, input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default MaterialRequisitionsController;
