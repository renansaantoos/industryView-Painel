// =============================================================================
// INDUSTRYVIEW BACKEND - Health Module Controller
// Controller do modulo de saude ocupacional
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { serializeBigInt } from '../../utils/bigint';
import { HealthService } from './health.service';
import { AuthenticatedRequest } from '../../types';
import {
  listHealthRecordsSchema,
  getExpiringExamsSchema,
  getHealthRecordByIdSchema,
  createHealthRecordSchema,
  updateHealthRecordSchema,
  checkWorkerFitnessSchema,
} from './health.schema';

/**
 * HealthController - Controller do modulo de saude ocupacional
 */
export class HealthController {
  static async listRecords(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listHealthRecordsSchema.parse(req.query) as any;
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await HealthService.listRecords(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async getExpiringExams(req: Request, res: Response, next: NextFunction) {
    try {
      const input = getExpiringExamsSchema.parse(req.query);
      const result = await HealthService.getExpiringExams(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async getRecordById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getHealthRecordByIdSchema.parse(req.params);
      const result = await HealthService.getRecordById(id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async createRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createHealthRecordSchema.parse(req.body);
      const result = await HealthService.createRecord(input);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async updateRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getHealthRecordByIdSchema.parse(req.params);
      const input = updateHealthRecordSchema.parse(req.body);
      const result = await HealthService.updateRecord(id, input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async deleteRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getHealthRecordByIdSchema.parse(req.params);
      const result = await HealthService.deleteRecord(id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async checkWorkerFitness(req: Request, res: Response, next: NextFunction) {
    try {
      const { user_id } = checkWorkerFitnessSchema.parse(req.params);
      const result = await HealthService.checkWorkerFitness(user_id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }
}

export default HealthController;
