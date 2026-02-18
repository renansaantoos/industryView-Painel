// =============================================================================
// INDUSTRYVIEW BACKEND - Schedule Import Controller
// Controller do modulo de importacao de cronograma
// =============================================================================

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { ScheduleImportService } from './schedule-import.service';
import { serializeBigInt } from '../../utils/bigint';
import { logger } from '../../utils/logger';
import { BadRequestError } from '../../utils/errors';

export class ScheduleImportController {

  /**
   * POST /schedule-import/upload
   * Faz upload e processamento de arquivo de cronograma (xlsx, xls, csv, xml)
   * Body: multipart/form-data com campos projects_id, import_mode, column_mapping
   */
  static async upload(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        throw new BadRequestError('Arquivo nao enviado. Envie um arquivo .xlsx, .xls, .csv ou .xml');
      }

      const projectsId = parseInt(String(req.body.projects_id), 10);
      if (isNaN(projectsId) || projectsId <= 0) {
        throw new BadRequestError('projects_id e obrigatorio e deve ser um numero positivo');
      }

      const importMode = req.body.import_mode as string;
      if (!['create', 'update', 'replace'].includes(importMode)) {
        throw new BadRequestError('import_mode deve ser create, update ou replace');
      }

      let columnMapping: Record<string, string> | undefined;
      if (req.body.column_mapping) {
        try {
          columnMapping = JSON.parse(req.body.column_mapping);
        } catch {
          // Ignora mapeamento invalido, sera feito auto-mapeamento
        }
      }

      const userId = req.user?.id ? parseInt(String(req.user.id), 10) : undefined;

      logger.info(
        {
          projects_id: projectsId,
          file_name: file.originalname,
          import_mode: importMode,
          user_id: userId,
        },
        'Schedule import started'
      );

      const result = await ScheduleImportService.processImport(
        projectsId,
        { buffer: file.buffer, originalname: file.originalname },
        importMode,
        columnMapping,
        userId
      );

      logger.info(
        {
          projects_id: projectsId,
          imported: result.imported_tasks,
          failed: result.failed_tasks,
          deps: result.dependencies_created,
        },
        'Schedule import completed'
      );

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /schedule-import/history?projects_id=X
   * Retorna historico de importacoes de um projeto
   */
  static async getHistory(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const projectsId = parseInt(req.query.projects_id as string, 10);
      if (isNaN(projectsId) || projectsId <= 0) {
        throw new BadRequestError('projects_id e obrigatorio e deve ser um numero positivo');
      }

      const result = await ScheduleImportService.getHistory(projectsId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /schedule-import/template?format=xlsx|csv
   * Faz download de template de importacao
   */
  static async downloadTemplate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const format = (req.query.format as string) === 'csv' ? 'csv' : 'xlsx';
      const buffer = await ScheduleImportService.generateTemplate(format);

      const filename = `template_cronograma.${format}`;
      const contentType =
        format === 'csv'
          ? 'text/csv; charset=utf-8'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', buffer.length);
      res.status(200).send(buffer);
    } catch (error) {
      next(error);
    }
  }
}

export default ScheduleImportController;
