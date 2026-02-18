// =============================================================================
// INDUSTRYVIEW BACKEND - Reports Module Controller
// Controller do modulo de relatorios
// Equivalente aos endpoints do Xano em apis/reports/
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { ReportsService } from './reports.service';
import { AuthenticatedRequest } from '../../types';
import {
  getDashboardSchema,
  listDailyReportsSchema,
  getDailyReportByIdSchema,
  createDailyReportSchema,
  updateDailyReportSchema,
  deleteDailyReportSchema,
  getDailyReportDatesSchema,
  getDailyReportPdfSchema,
  getSchedulePerDaySchema,
  getBurndownSchema,
  listSprintTaskStatusLogSchema,
  getSprintTaskStatusLogByIdSchema,
  createSprintTaskStatusLogSchema,
  updateSprintTaskStatusLogSchema,
  deleteSprintTaskStatusLogSchema,
  listInformeDiarioSchema,
  getInformeDiarioFilteredSchema,
  qrcodeReaderSchema,
} from './reports.schema';

/**
 * ReportsController - Controller do modulo de relatorios
 */
export class ReportsController {
  // ===========================================================================
  // Dashboard
  // ===========================================================================

  /**
   * Busca dados do dashboard
   * Equivalente a: query dashboard verb=GET do Xano
   * Route: GET /api/v1/reports/dashboard
   */
  static async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = getDashboardSchema.parse(req.query);
      const companyId = req.user?.companyId ?? undefined;
      const result = await ReportsService.getDashboard(input, companyId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Daily Reports
  // ===========================================================================

  /**
   * Lista relatorios diarios
   * Equivalente a: query daily_report verb=GET do Xano
   * Route: GET /api/v1/reports/daily
   */
  static async listDailyReports(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listDailyReportsSchema.parse(req.query);
      const result = await ReportsService.listDailyReports(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca relatorio diario por ID
   * Route: GET /api/v1/reports/daily/:daily_report_id
   */
  static async getDailyReportById(req: Request, res: Response, next: NextFunction) {
    try {
      const input = getDailyReportByIdSchema.parse(req.params);
      const result = await ReportsService.getDailyReportById(input.daily_report_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria relatorio diario
   * Equivalente a: query daily_report verb=POST do Xano
   * Route: POST /api/v1/reports/daily
   */
  static async createDailyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createDailyReportSchema.parse(req.body);
      const result = await ReportsService.createDailyReport(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza relatorio diario
   * Route: PATCH /api/v1/reports/daily/:daily_report_id
   */
  static async updateDailyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const params = getDailyReportByIdSchema.parse(req.params);
      const input = updateDailyReportSchema.parse(req.body);
      const result = await ReportsService.updateDailyReport(params.daily_report_id, input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deleta relatorio diario (soft delete)
   * Route: DELETE /api/v1/reports/daily/:daily_report_id
   */
  static async deleteDailyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const input = deleteDailyReportSchema.parse(req.params);
      const result = await ReportsService.deleteDailyReport(input.daily_report_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca datas dos relatorios
   * Equivalente a: query daily_report_dates verb=GET do Xano
   * Route: GET /api/v1/reports/daily/dates
   */
  static async getDailyReportDates(req: Request, res: Response, next: NextFunction) {
    try {
      const input = getDailyReportDatesSchema.parse(req.query);
      const result = await ReportsService.getDailyReportDates(input.projects_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gera PDF do relatorio
   * Equivalente a: query "daily_report/{daily_report_id}/pdf" verb=GET do Xano
   * Route: GET /api/v1/reports/daily/:daily_report_id/pdf
   */
  static async getDailyReportPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const input = getDailyReportPdfSchema.parse(req.params);
      // TODO: Implementar geracao de PDF
      // Por enquanto, retorna dados que seriam usados para gerar o PDF
      const result = await ReportsService.getDailyReportById(input.daily_report_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Schedule
  // ===========================================================================

  /**
   * Busca programacao por dia
   * Equivalente a: query schedule_per_day verb=GET do Xano
   * Route: GET /api/v1/reports/schedule/day
   */
  static async getSchedulePerDay(req: Request, res: Response, next: NextFunction) {
    try {
      const input = getSchedulePerDaySchema.parse(req.query);
      const result = await ReportsService.getSchedulePerDay(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Burndown
  // ===========================================================================

  /**
   * Busca dados para grafico de burndown
   * Equivalente a: query burndown verb=GET do Xano
   * Route: GET /api/v1/reports/burndown
   */
  static async getBurndown(req: Request, res: Response, next: NextFunction) {
    try {
      const input = getBurndownSchema.parse(req.query);
      const result = await ReportsService.getBurndown(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Sprint Task Status Log
  // ===========================================================================

  /**
   * Lista logs de status de tarefas
   * Equivalente a: query sprint_task_status_log verb=GET do Xano
   * Route: GET /api/v1/reports/sprint-task-status-log
   */
  static async listSprintTaskStatusLog(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listSprintTaskStatusLogSchema.parse(req.query);
      const result = await ReportsService.listSprintTaskStatusLog(input.sprints_tasks_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca log por ID
   * Route: GET /api/v1/reports/sprint-task-status-log/:sprint_task_status_log_id
   */
  static async getSprintTaskStatusLogById(req: Request, res: Response, next: NextFunction) {
    try {
      const input = getSprintTaskStatusLogByIdSchema.parse(req.params);
      const result = await ReportsService.getSprintTaskStatusLogById(input.sprint_task_status_log_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria log de status
   * Equivalente a: query sprint_task_status_log verb=POST do Xano
   * Route: POST /api/v1/reports/sprint-task-status-log
   */
  static async createSprintTaskStatusLog(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createSprintTaskStatusLogSchema.parse(req.body);
      const result = await ReportsService.createSprintTaskStatusLog(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza log
   * Route: PATCH /api/v1/reports/sprint-task-status-log/:sprint_task_status_log_id
   */
  static async updateSprintTaskStatusLog(req: Request, res: Response, next: NextFunction) {
    try {
      const params = getSprintTaskStatusLogByIdSchema.parse(req.params);
      const input = updateSprintTaskStatusLogSchema.parse(req.body);
      const result = await ReportsService.updateSprintTaskStatusLog(
        params.sprint_task_status_log_id,
        input
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deleta log
   * Route: DELETE /api/v1/reports/sprint-task-status-log/:sprint_task_status_log_id
   */
  static async deleteSprintTaskStatusLog(req: Request, res: Response, next: NextFunction) {
    try {
      const input = deleteSprintTaskStatusLogSchema.parse(req.params);
      const result = await ReportsService.deleteSprintTaskStatusLog(input.sprint_task_status_log_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Informe Diario
  // ===========================================================================

  /**
   * Lista informes diarios
   * Equivalente a: query informe_diario verb=GET do Xano
   * Route: GET /api/v1/reports/informe-diario
   */
  static async listInformeDiario(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listInformeDiarioSchema.parse(req.query);
      const result = await ReportsService.listInformeDiario(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca informe diario filtrado
   * Equivalente a: query informe_diario_0 verb=GET do Xano
   * Route: GET /api/v1/reports/informe-diario/filtered
   */
  static async getInformeDiarioFiltered(req: Request, res: Response, next: NextFunction) {
    try {
      const input = getInformeDiarioFilteredSchema.parse(req.query);
      const result = await ReportsService.getInformeDiarioFiltered(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // QR Code Reader
  // ===========================================================================

  /**
   * Le QR code e retorna informacoes
   * Equivalente a: query qrcode_reader verb=GET do Xano
   * Route: GET /api/v1/reports/qrcode-reader
   */
  static async qrcodeReader(req: Request, res: Response, next: NextFunction) {
    try {
      const input = qrcodeReaderSchema.parse(req.query);
      const result = await ReportsService.qrcodeReader(input.qrcode);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default ReportsController;
