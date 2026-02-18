// =============================================================================
// INDUSTRYVIEW BACKEND - Workforce Module Controller
// Controller do modulo de mao de obra / presenca diaria
// =============================================================================

import { Response, NextFunction } from 'express';
import { WorkforceService } from './workforce.service';
import {
  listDailyLogsSchema,
  getDailyLogByIdSchema,
  createDailyLogSchema,
  updateDailyLogSchema,
  getHistogramSchema,
  checkInSchema,
  checkOutSchema,
} from './workforce.schema';
import { AuthenticatedRequest } from '../../types';

/**
 * WorkforceController - Controller do modulo de mao de obra
 */
export class WorkforceController {
  /**
   * Lista logs diarios de mao de obra
   * Route: GET /api/v1/workforce
   */
  static async listDailyLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listDailyLogsSchema.parse(req.query) as any;
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await WorkforceService.listDailyLogs(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria log diario de mao de obra
   * Route: POST /api/v1/workforce
   */
  static async createDailyLog(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = createDailyLogSchema.parse(req.body);
      const user_id = Number(req.auth!.id);
      const result = await WorkforceService.createDailyLog(input, user_id);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza log diario de mao de obra
   * Route: PATCH /api/v1/workforce/:id
   */
  static async updateDailyLog(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getDailyLogByIdSchema.parse(req.params);
      const input = updateDailyLogSchema.parse(req.body);
      const result = await WorkforceService.updateDailyLog(id, input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove log diario
   * Route: DELETE /api/v1/workforce/:id
   */
  static async deleteDailyLog(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getDailyLogByIdSchema.parse(req.params);
      await WorkforceService.deleteDailyLog(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retorna histograma de mao de obra por dia
   * Route: GET /api/v1/workforce/histogram
   */
  static async getHistogram(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = getHistogramSchema.parse(req.query);
      const result = await WorkforceService.getHistogram(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Registra check-in de trabalhador
   * Route: POST /api/v1/workforce/check-in
   */
  static async checkIn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = checkInSchema.parse(req.body);
      const user_id = Number(req.auth!.id);
      const result = await WorkforceService.checkIn(input, user_id);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Registra check-out de trabalhador
   * Route: POST /api/v1/workforce/:id/check-out
   */
  static async checkOut(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = checkOutSchema.parse(req.params);
      const result = await WorkforceService.checkOut(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default WorkforceController;
