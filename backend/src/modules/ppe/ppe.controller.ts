// =============================================================================
// INDUSTRYVIEW BACKEND - PPE Module Controller
// Controller do modulo de EPIs (Equipamentos de Protecao Individual)
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { serializeBigInt } from '../../utils/bigint';
import { PpeService } from './ppe.service';
import { AuthenticatedRequest } from '../../types';
import {
  listPpeTypesSchema,
  getPpeTypeByIdSchema,
  createPpeTypeSchema,
  updatePpeTypeSchema,
  listDeliveriesSchema,
  getDeliveryByIdSchema,
  createDeliverySchema,
  registerReturnSchema,
  listTaskRequiredPpeSchema,
  createTaskRequiredPpeSchema,
  deleteTaskRequiredPpeSchema,
  getUserPpeStatusSchema,
} from './ppe.schema';

/**
 * PpeController - Controller do modulo de EPIs
 */
export class PpeController {
  // PPE Types
  static async listPpeTypes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listPpeTypesSchema.parse(req.query) as any;
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await PpeService.listPpeTypes(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async createPpeType(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const body = { ...req.body };
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        body.company_id = req.user.companyId;
      }
      const input = createPpeTypeSchema.parse(body);
      const result = await PpeService.createPpeType(input);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async updatePpeType(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getPpeTypeByIdSchema.parse(req.params);
      const input = updatePpeTypeSchema.parse(req.body);
      const result = await PpeService.updatePpeType(id, input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async deletePpeType(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getPpeTypeByIdSchema.parse(req.params);
      await PpeService.deletePpeType(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // Deliveries
  static async listDeliveries(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listDeliveriesSchema.parse(req.query);
      const result = await PpeService.listDeliveries(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async createDelivery(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createDeliverySchema.parse(req.body);
      const result = await PpeService.createDelivery(input);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async registerReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getDeliveryByIdSchema.parse(req.params);
      const input = registerReturnSchema.parse({ ...req.body, id });
      const result = await PpeService.registerReturn(id, input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // Task Required PPE
  static async listTaskRequiredPpe(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listTaskRequiredPpeSchema.parse(req.query);
      const result = await PpeService.listTaskRequiredPpe(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async createTaskRequiredPpe(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createTaskRequiredPpeSchema.parse(req.body);
      const result = await PpeService.createTaskRequiredPpe(input);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async deleteTaskRequiredPpe(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = deleteTaskRequiredPpeSchema.parse(req.params);
      await PpeService.deleteTaskRequiredPpe(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // User PPE Status
  static async getUserPpeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { user_id } = getUserPpeStatusSchema.parse(req.params);
      const result = await PpeService.getUserPpeStatus(user_id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }
}

export default PpeController;
