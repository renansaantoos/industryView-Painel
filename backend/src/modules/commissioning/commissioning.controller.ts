// =============================================================================
// INDUSTRYVIEW BACKEND - Commissioning Module Controller
// Controller do modulo de comissionamento
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { CommissioningService } from './commissioning.service';
import {
  listSystemsSchema,
  getSystemByIdSchema,
  createSystemSchema,
  updateSystemSchema,
  getPunchListSchema,
  createPunchListItemSchema,
  updatePunchListItemSchema,
  getCertificatesSchema,
  createCertificateSchema,
  updateCertificateSchema,
} from './commissioning.schema';
import { AuthenticatedRequest } from '../../types';

/**
 * CommissioningController - Controller do modulo de comissionamento
 */
export class CommissioningController {
  // Systems
  static async listSystems(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listSystemsSchema.parse(req.query) as any;
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await CommissioningService.listSystems(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getSystemById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getSystemByIdSchema.parse(req.params);
      const result = await CommissioningService.getSystemById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async createSystem(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createSystemSchema.parse(req.body);
      const result = await CommissioningService.createSystem(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateSystem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getSystemByIdSchema.parse(req.params);
      const input = updateSystemSchema.parse(req.body);
      const result = await CommissioningService.updateSystem(id, input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteSystem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getSystemByIdSchema.parse(req.params);
      await CommissioningService.deleteSystem(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // Punch List
  static async getPunchList(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getPunchListSchema.parse(req.params);
      const result = await CommissioningService.getPunchList(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async createPunchListItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: system_id } = getPunchListSchema.parse(req.params);
      const input = createPunchListItemSchema.parse({ ...req.body, system_id });
      const result = await CommissioningService.createPunchListItem(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updatePunchListItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = updatePunchListItemSchema.parse(req.params);
      const input = updatePunchListItemSchema.parse({ ...req.body, id });
      const result = await CommissioningService.updatePunchListItem(id, input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Certificates
  static async getCertificates(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getCertificatesSchema.parse(req.params);
      const result = await CommissioningService.getCertificates(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async createCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: system_id } = getCertificatesSchema.parse(req.params);
      const input = createCertificateSchema.parse({ ...req.body, system_id });
      const result = await CommissioningService.createCertificate(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = updateCertificateSchema.parse(req.params);
      const input = updateCertificateSchema.parse({ ...req.body, id });
      const result = await CommissioningService.updateCertificate(id, input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default CommissioningController;
