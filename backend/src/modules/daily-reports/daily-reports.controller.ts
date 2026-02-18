// =============================================================================
// INDUSTRYVIEW BACKEND - Daily Reports Module Controller
// Controller do modulo de RDO completo
// Responsavel por parsear inputs, chamar o service e retornar responses HTTP
// =============================================================================

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { DailyReportsService } from './daily-reports.service';
import {
  createDailyReportSchema,
  updateDailyReportSchema,
  listDailyReportsSchema,
  getDailyReportDatesSchema,
  approveDailyReportSchema,
  rejectDailyReportSchema,
  createWorkforceEntrySchema,
  updateWorkforceEntrySchema,
  createActivityEntrySchema,
  updateActivityEntrySchema,
  createOccurrenceEntrySchema,
  updateOccurrenceEntrySchema,
  createEquipmentEntrySchema,
  updateEquipmentEntrySchema,
} from './daily-reports.schema';
import { z } from 'zod';
import { BadRequestError } from '../../utils/errors';

// Schema reutilizavel para IDs em path params
const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const entryIdParamSchema = z.object({
  entry_id: z.coerce.number().int().positive(),
});

/**
 * DailyReportsController - Controller do modulo de RDO completo
 */
export class DailyReportsController {
  // ===========================================================================
  // RDO Principal
  // ===========================================================================

  /**
   * Lista RDOs com filtros e paginacao
   * Route: GET /api/v1/daily-reports
   */
  static async listDailyReports(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const input = listDailyReportsSchema.parse(req.query) as any;
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await DailyReportsService.listDailyReports(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca datas com RDOs cadastrados
   * Route: GET /api/v1/daily-reports/dates
   */
  static async getDailyReportDates(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const input = getDailyReportDatesSchema.parse(req.query);
      const result = await DailyReportsService.getDailyReportDates(input.projects_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca RDO por ID com todos os dados filhos
   * Route: GET /api/v1/daily-reports/:id
   */
  static async getDailyReportById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const result = await DailyReportsService.getDailyReportById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria novo RDO com status 'rascunho'
   * Route: POST /api/v1/daily-reports
   */
  static async createDailyReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.auth?.id) {
        throw new BadRequestError('Usuario nao autenticado.');
      }

      const input = createDailyReportSchema.parse(req.body);
      const result = await DailyReportsService.createDailyReport(input, req.auth.id);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza RDO (somente se status = rascunho)
   * Route: PATCH /api/v1/daily-reports/:id
   */
  static async updateDailyReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const input = updateDailyReportSchema.parse(req.body);
      const result = await DailyReportsService.updateDailyReport(id, input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Finaliza RDO: rascunho -> finalizado
   * Route: POST /api/v1/daily-reports/:id/finalize
   */
  static async finalizeDailyReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const result = await DailyReportsService.finalizeDailyReport(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Aprova RDO: finalizado -> aprovado (imutavel)
   * Route: POST /api/v1/daily-reports/:id/approve
   */
  static async approveDailyReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);

      if (!req.auth?.id) {
        throw new BadRequestError('Usuario nao autenticado.');
      }

      // Permite override do approved_by_user_id via body, senao usa o usuario autenticado
      const bodyParsed = approveDailyReportSchema.partial().parse(req.body);
      const approvedByUserId = bodyParsed.approved_by_user_id ?? req.auth.id;

      const result = await DailyReportsService.approveDailyReport(id, approvedByUserId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Rejeita RDO: finalizado -> rejeitado (volta para rascunho para correcao)
   * Route: POST /api/v1/daily-reports/:id/reject
   */
  static async rejectDailyReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);

      if (!req.auth?.id) {
        throw new BadRequestError('Usuario nao autenticado.');
      }

      const bodyParsed = rejectDailyReportSchema.parse({ ...req.body, daily_report_id: id });
      const result = await DailyReportsService.rejectDailyReport(
        id,
        req.auth.id,
        bodyParsed.rejection_reason
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Mao de Obra (Workforce)
  // ===========================================================================

  /**
   * Adiciona entrada de mao de obra ao RDO
   * Route: POST /api/v1/daily-reports/:id/workforce
   */
  static async addWorkforceEntry(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const input = createWorkforceEntrySchema.parse({ ...req.body, daily_report_id: id });
      const result = await DailyReportsService.addWorkforceEntry(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza entrada de mao de obra
   * Route: PATCH /api/v1/daily-reports/workforce/:entry_id
   */
  static async updateWorkforceEntry(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { entry_id } = entryIdParamSchema.parse(req.params);
      const input = updateWorkforceEntrySchema.parse(req.body);
      const result = await DailyReportsService.updateWorkforceEntry(entry_id, input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove entrada de mao de obra (soft delete)
   * Route: DELETE /api/v1/daily-reports/workforce/:entry_id
   */
  static async deleteWorkforceEntry(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { entry_id } = entryIdParamSchema.parse(req.params);
      const result = await DailyReportsService.deleteWorkforceEntry(entry_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Atividades (Activities)
  // ===========================================================================

  /**
   * Adiciona atividade ao RDO
   * Route: POST /api/v1/daily-reports/:id/activities
   */
  static async addActivityEntry(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const input = createActivityEntrySchema.parse({ ...req.body, daily_report_id: id });
      const result = await DailyReportsService.addActivityEntry(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza atividade do RDO
   * Route: PATCH /api/v1/daily-reports/activities/:entry_id
   */
  static async updateActivityEntry(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { entry_id } = entryIdParamSchema.parse(req.params);
      const input = updateActivityEntrySchema.parse(req.body);
      const result = await DailyReportsService.updateActivityEntry(entry_id, input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove atividade (soft delete)
   * Route: DELETE /api/v1/daily-reports/activities/:entry_id
   */
  static async deleteActivityEntry(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { entry_id } = entryIdParamSchema.parse(req.params);
      const result = await DailyReportsService.deleteActivityEntry(entry_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Ocorrencias (Occurrences)
  // ===========================================================================

  /**
   * Adiciona ocorrencia ao RDO
   * Route: POST /api/v1/daily-reports/:id/occurrences
   */
  static async addOccurrenceEntry(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const input = createOccurrenceEntrySchema.parse({ ...req.body, daily_report_id: id });
      const result = await DailyReportsService.addOccurrenceEntry(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza ocorrencia do RDO
   * Route: PATCH /api/v1/daily-reports/occurrences/:entry_id
   */
  static async updateOccurrenceEntry(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { entry_id } = entryIdParamSchema.parse(req.params);
      const input = updateOccurrenceEntrySchema.parse(req.body);
      const result = await DailyReportsService.updateOccurrenceEntry(entry_id, input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove ocorrencia (soft delete)
   * Route: DELETE /api/v1/daily-reports/occurrences/:entry_id
   */
  static async deleteOccurrenceEntry(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { entry_id } = entryIdParamSchema.parse(req.params);
      const result = await DailyReportsService.deleteOccurrenceEntry(entry_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Equipamentos (Equipment)
  // ===========================================================================

  /**
   * Adiciona equipamento ao RDO
   * Route: POST /api/v1/daily-reports/:id/equipment
   */
  static async addEquipmentEntry(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = idParamSchema.parse(req.params);
      const input = createEquipmentEntrySchema.parse({ ...req.body, daily_report_id: id });
      const result = await DailyReportsService.addEquipmentEntry(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza equipamento do RDO
   * Route: PATCH /api/v1/daily-reports/equipment/:entry_id
   */
  static async updateEquipmentEntry(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { entry_id } = entryIdParamSchema.parse(req.params);
      const input = updateEquipmentEntrySchema.parse(req.body);
      const result = await DailyReportsService.updateEquipmentEntry(entry_id, input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove equipamento (soft delete)
   * Route: DELETE /api/v1/daily-reports/equipment/:entry_id
   */
  static async deleteEquipmentEntry(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { entry_id } = entryIdParamSchema.parse(req.params);
      const result = await DailyReportsService.deleteEquipmentEntry(entry_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default DailyReportsController;
