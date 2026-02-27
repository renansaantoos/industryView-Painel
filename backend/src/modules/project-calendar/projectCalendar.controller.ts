import { Request, Response, NextFunction } from 'express';
import { ProjectCalendarService } from './projectCalendar.service';
import { serializeBigInt } from '../../utils/bigint';

export class ProjectCalendarController {
  // ── Holidays ──

  static async listHolidays(req: Request, res: Response, next: NextFunction) {
    try {
      const projectsId = parseInt(req.query.projects_id as string, 10);
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const result = await ProjectCalendarService.listHolidays(projectsId, year);
      res.json(serializeBigInt(result));
    } catch (error) { next(error); }
  }

  static async createHoliday(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProjectCalendarService.createHoliday(req.body);
      res.status(201).json(serializeBigInt(result));
    } catch (error) { next(error); }
  }

  static async updateHoliday(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await ProjectCalendarService.updateHoliday(id, req.body);
      res.json(serializeBigInt(result));
    } catch (error) { next(error); }
  }

  static async deleteHoliday(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      await ProjectCalendarService.deleteHoliday(id);
      res.status(204).send();
    } catch (error) { next(error); }
  }

  static async seedHolidays(req: Request, res: Response, next: NextFunction) {
    try {
      const { projects_id, year } = req.body;
      const result = await ProjectCalendarService.seedHolidays(Number(projects_id), Number(year));
      res.json(serializeBigInt(result));
    } catch (error) { next(error); }
  }

  // ── Work Calendar ──

  static async getWorkCalendar(req: Request, res: Response, next: NextFunction) {
    try {
      const projectsId = parseInt(req.query.projects_id as string, 10);
      const result = await ProjectCalendarService.getWorkCalendar(projectsId);
      res.json(serializeBigInt(result));
    } catch (error) { next(error); }
  }

  static async upsertWorkCalendar(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProjectCalendarService.upsertWorkCalendar(req.body);
      res.json(serializeBigInt(result));
    } catch (error) { next(error); }
  }

  static async listCalendarOverrides(req: Request, res: Response, next: NextFunction) {
    try {
      const projectsId = parseInt(req.query.projects_id as string, 10);
      const result = await ProjectCalendarService.listCalendarOverrides(projectsId);
      res.json(serializeBigInt(result));
    } catch (error) { next(error); }
  }

  static async upsertCalendarOverride(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProjectCalendarService.upsertCalendarOverride(req.body);
      res.json(serializeBigInt(result));
    } catch (error) { next(error); }
  }

  static async deleteCalendarOverride(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      await ProjectCalendarService.deleteCalendarOverride(id);
      res.status(204).send();
    } catch (error) { next(error); }
  }

  static async getCountries(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = ProjectCalendarService.getAvailableCountries();
      res.json(result);
    } catch (error) { next(error); }
  }
}
