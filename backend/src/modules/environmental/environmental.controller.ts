// =============================================================================
// INDUSTRYVIEW BACKEND - Environmental Module Controller
// Controller do modulo de licenciamento ambiental
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { EnvironmentalService } from './environmental.service';
import { AuthenticatedRequest } from '../../types';
import {
  listLicensesSchema,
  getExpiringLicensesSchema,
  getLicenseByIdSchema,
  createLicenseSchema,
  updateLicenseSchema,
  getConditionsSchema,
  createConditionSchema,
  updateConditionSchema,
} from './environmental.schema';

/**
 * EnvironmentalController - Controller do modulo de licenciamento ambiental
 */
export class EnvironmentalController {
  // Licenses
  static async listLicenses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listLicensesSchema.parse(req.query) as any;
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await EnvironmentalService.listLicenses(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getExpiringLicenses(req: Request, res: Response, next: NextFunction) {
    try {
      const input = getExpiringLicensesSchema.parse(req.query);
      const result = await EnvironmentalService.getExpiringLicenses(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getLicenseById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getLicenseByIdSchema.parse(req.params);
      const result = await EnvironmentalService.getLicenseById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async createLicense(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createLicenseSchema.parse(req.body);
      const result = await EnvironmentalService.createLicense(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateLicense(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getLicenseByIdSchema.parse(req.params);
      const input = updateLicenseSchema.parse(req.body);
      const result = await EnvironmentalService.updateLicense(id, input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteLicense(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getLicenseByIdSchema.parse(req.params);
      await EnvironmentalService.deleteLicense(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // Conditions
  static async getConditions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getConditionsSchema.parse(req.params);
      const result = await EnvironmentalService.getConditions(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async createCondition(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: license_id } = getConditionsSchema.parse(req.params);
      const input = createConditionSchema.parse({ ...req.body, license_id });
      const result = await EnvironmentalService.createCondition(license_id, input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateCondition(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = updateConditionSchema.parse(req.params);
      const input = updateConditionSchema.parse({ ...req.body, id });
      const result = await EnvironmentalService.updateCondition(id, input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default EnvironmentalController;
