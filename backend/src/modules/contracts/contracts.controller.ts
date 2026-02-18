// =============================================================================
// INDUSTRYVIEW BACKEND - Contracts Module Controller
// Controller do modulo de contratos (Medicoes e Reivindicacoes)
// =============================================================================

import { Response, NextFunction } from 'express';
import { ContractsService } from './contracts.service';
import {
  listMeasurementsSchema,
  getMeasurementByIdSchema,
  createMeasurementSchema,
  updateMeasurementSchema,
  measurementIdParamSchema,
  listClaimsSchema,
  getClaimByIdSchema,
  createClaimSchema,
  updateClaimSchema,
  closeClaimSchema,
  addClaimEvidenceSchema,
} from './contracts.schema';
import { AuthenticatedRequest } from '../../types';

/**
 * ContractsController - Controller do modulo de contratos
 */
export class ContractsController {
  // Measurements
  static async listMeasurements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listMeasurementsSchema.parse(req.query) as any;
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await ContractsService.listMeasurements(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getMeasurementById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getMeasurementByIdSchema.parse(req.params);
      const result = await ContractsService.getMeasurementById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async createMeasurement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = createMeasurementSchema.parse(req.body);
      const user_id = Number(req.auth!.id);
      const result = await ContractsService.createMeasurement(input, user_id);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateMeasurement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getMeasurementByIdSchema.parse(req.params);
      const input = updateMeasurementSchema.parse(req.body);
      const result = await ContractsService.updateMeasurement(id, input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async submitMeasurement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = measurementIdParamSchema.parse(req.params);
      const result = await ContractsService.submitMeasurement(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async approveMeasurement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = measurementIdParamSchema.parse(req.params);
      const result = await ContractsService.approveMeasurement(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async rejectMeasurement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = measurementIdParamSchema.parse(req.params);
      const result = await ContractsService.rejectMeasurement(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Claims
  static async listClaims(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listClaimsSchema.parse(req.query) as any;
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await ContractsService.listClaims(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getClaimById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getClaimByIdSchema.parse(req.params);
      const result = await ContractsService.getClaimById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async createClaim(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = createClaimSchema.parse(req.body);
      const user_id = Number(req.auth!.id);
      const result = await ContractsService.createClaim(input, user_id);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateClaim(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getClaimByIdSchema.parse(req.params);
      const input = updateClaimSchema.parse(req.body);
      const result = await ContractsService.updateClaim(id, input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async closeClaim(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getClaimByIdSchema.parse(req.params);
      const input = closeClaimSchema.parse({ ...req.body, id });
      const user_id = Number(req.auth!.id);
      const result = await ContractsService.closeClaim(id, input, user_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async addClaimEvidence(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id: claim_id } = getClaimByIdSchema.parse(req.params);
      const input = addClaimEvidenceSchema.parse({ ...req.body, claim_id });
      const result = await ContractsService.addClaimEvidence(claim_id, input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default ContractsController;
