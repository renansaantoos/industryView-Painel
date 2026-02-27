import { Request, Response, NextFunction } from 'express';
import { HolidaysService } from './holidays.service';
import { serializeBigInt } from '../../utils/bigint';

export class HolidaysController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = parseInt(req.query.company_id as string, 10);
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const result = await HolidaysService.list(companyId, year);
      res.json(serializeBigInt(result));
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await HolidaysService.create(req.body);
      res.status(201).json(serializeBigInt(result));
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await HolidaysService.update(id, req.body);
      res.json(serializeBigInt(result));
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      await HolidaysService.delete(id);
      res.status(204).send();
    } catch (error) { next(error); }
  }

  static async seed(req: Request, res: Response, next: NextFunction) {
    try {
      const { company_id, year } = req.body;
      await HolidaysService.seed(Number(company_id), Number(year));
      res.json({ ok: true });
    } catch (error) { next(error); }
  }

  static async getWorkCalendar(req: Request, res: Response, next: NextFunction) {
    try {
      const companyId = parseInt(req.query.company_id as string, 10);
      const result = await HolidaysService.getWorkCalendar(companyId);
      res.json(serializeBigInt(result));
    } catch (error) { next(error); }
  }

  static async upsertWorkCalendar(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await HolidaysService.upsertWorkCalendar(req.body);
      res.json(serializeBigInt(result));
    } catch (error) { next(error); }
  }
}
