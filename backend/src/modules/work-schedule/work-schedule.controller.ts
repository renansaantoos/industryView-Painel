import { Request, Response, NextFunction } from 'express';
import { serializeBigInt } from '../../utils/bigint';
import { WorkScheduleService } from './work-schedule.service';
import { getWorkScheduleSchema, upsertWorkScheduleSchema } from './work-schedule.schema';

export class WorkScheduleController {
  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { users_id } = getWorkScheduleSchema.parse(req.params);
      const result = await WorkScheduleService.getByUser(users_id);
      if (!result) return res.status(404).json({ error: true, message: 'Regra de ponto não encontrada.' });
      return res.json(serializeBigInt(result));
    } catch (error) {
      return next(error);
    }
  }

  static async upsert(req: Request, res: Response, next: NextFunction) {
    try {
      const { users_id } = getWorkScheduleSchema.parse(req.params);
      const input = upsertWorkScheduleSchema.parse(req.body);
      const result = await WorkScheduleService.upsert(users_id, input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }
}

export default WorkScheduleController;
