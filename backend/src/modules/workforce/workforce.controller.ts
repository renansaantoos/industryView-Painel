// =============================================================================
// INDUSTRYVIEW BACKEND - Workforce Module Controller
// Controller do modulo de mao de obra / presenca diaria
// =============================================================================

import { Response, NextFunction } from 'express';
import XLSX from 'xlsx';
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
  /**
   * Importa registros de ponto via Excel
   * Route: POST /api/v1/workforce/import
   */
  static async importExcel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const file = (req as any).file;
      if (!file) {
        res.status(400).json({ error: true, message: 'Nenhum arquivo enviado.' });
        return;
      }

      const users_id = Number(req.body.users_id);
      const projects_id = req.body.projects_id ? Number(req.body.projects_id) : null;

      if (!users_id || isNaN(users_id)) {
        res.status(400).json({ error: true, message: 'users_id e obrigatorio.' });
        return;
      }

      const workbook = XLSX.read(file.buffer, { type: 'buffer', cellDates: true });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        res.status(400).json({ error: true, message: 'Planilha vazia.' });
        return;
      }

      const rawRows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

      // Map column names (support both PT-BR and English)
      const rows = rawRows.map(raw => {
        // Try to find date - support multiple column names
        const data = raw['Data'] ?? raw['data'] ?? raw['DATE'] ?? raw['log_date'] ?? '';
        const entrada = raw['Hora Entrada'] ?? raw['hora_entrada'] ?? raw['Entrada'] ?? raw['check_in'] ?? raw['CHECK_IN'] ?? '';
        const saida = raw['Hora Saida'] ?? raw['Hora Saída'] ?? raw['hora_saida'] ?? raw['Saida'] ?? raw['Saída'] ?? raw['check_out'] ?? raw['CHECK_OUT'] ?? '';
        const status = raw['Status'] ?? raw['status'] ?? raw['STATUS'] ?? '';
        const obs = raw['Observacao'] ?? raw['Observação'] ?? raw['observacao'] ?? raw['observation'] ?? raw['OBS'] ?? '';

        // Handle date that might be a Date object or a string
        let dateStr = '';
        if (data instanceof Date) {
          dateStr = data.toISOString().substring(0, 10);
        } else if (typeof data === 'string' && data.trim()) {
          // Try DD/MM/YYYY format
          const ddmmyyyy = data.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
          if (ddmmyyyy) {
            dateStr = `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`;
          } else {
            dateStr = data.trim();
          }
        } else if (typeof data === 'number') {
          // Excel serial date number
          const excelDate = XLSX.SSF.parse_date_code(data);
          dateStr = `${excelDate.y}-${String(excelDate.m).padStart(2, '0')}-${String(excelDate.d).padStart(2, '0')}`;
        }

        // Handle time that might be a Date object, decimal, or string
        function parseTime(val: any): string {
          if (!val && val !== 0) return '';
          if (val instanceof Date) {
            return `${String(val.getHours()).padStart(2, '0')}:${String(val.getMinutes()).padStart(2, '0')}`;
          }
          if (typeof val === 'number') {
            // Excel time as fraction of day (e.g. 0.75 = 18:00)
            const totalMinutes = Math.round(val * 24 * 60);
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
          }
          return String(val).trim();
        }

        return {
          log_date: dateStr,
          check_in: parseTime(entrada),
          check_out: parseTime(saida),
          status: String(status).trim() || undefined,
          observation: String(obs).trim() || undefined,
        };
      });

      // Filter out empty rows
      const validRows = rows.filter(r => r.log_date);

      const registered_by = Number(req.auth!.id);
      const result = await WorkforceService.importFromExcel(validRows, users_id, projects_id, registered_by);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default WorkforceController;
