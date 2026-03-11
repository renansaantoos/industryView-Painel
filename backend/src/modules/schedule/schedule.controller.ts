import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { ScheduleService } from './schedule.service';
import { createScheduleSchema, listScheduleSchema, updateScheduleSchema } from './schedule.schema';
import { serializeBigInt } from '../../utils/bigint';
import { logger } from '../../utils/logger';

export class ScheduleController {
  /**
   * POST /schedule
   * Cria uma escala diária com os colaboradores informados.
   */
  static async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const parsed = createScheduleSchema.parse(req.body);
      const result = await ScheduleService.create(parsed);

      logger.info({ scheduleId: result.id }, 'Schedule created');

      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /schedule
   * Lista schedule_users do dia atual para um projeto/time.
   */
  static async listToday(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const parsed = listScheduleSchema.parse(req.query);
      const result = await ScheduleService.listToday(parsed.projects_id, parsed.teams_id);

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /schedule/:id
   * Atualiza os colaboradores de uma escala existente.
   */
  static async update(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const scheduleId = parseInt(req.params.id, 10);
      const parsed = updateScheduleSchema.parse(req.body);
      const result = await ScheduleService.update(scheduleId, parsed.users_id);

      logger.info({ scheduleId }, 'Schedule updated');

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /schedule/:id
   * Busca schedule por ID.
   */
  static async getById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const scheduleId = parseInt(req.params.id, 10);
      const result = await ScheduleService.getById(scheduleId);

      if (!result) {
        res.status(404).json({ error: 'Schedule não encontrado' });
        return;
      }

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }
  /**
   * POST /schedule/:id/tasks
   * Vincula tarefas ao schedule (schedule_sprints_tasks).
   */
  static async linkTasks(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const scheduleId = parseInt(req.params.id, 10);
      const { sprints_tasks_ids } = req.body;
      if (!Array.isArray(sprints_tasks_ids) || sprints_tasks_ids.length === 0) {
        res.status(400).json({ error: 'sprints_tasks_ids é obrigatório e deve ser um array não vazio' });
        return;
      }
      const result = await ScheduleService.linkTasks(scheduleId, sprints_tasks_ids);
      logger.info({ scheduleId, count: result.length }, 'Tasks linked to schedule');
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /schedule/pending
   * Retorna schedules pendentes (sem RDO) de dias anteriores para o usuário autenticado.
   */
  static async getPending(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.auth!.id;
      const result = await ScheduleService.getPendingSchedules(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default ScheduleController;
