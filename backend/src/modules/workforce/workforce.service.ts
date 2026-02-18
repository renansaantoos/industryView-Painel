// =============================================================================
// INDUSTRYVIEW BACKEND - Workforce Module Service
// Service do modulo de mao de obra / presenca diaria
// Tabela workforce_daily_log: users_id, log_date, check_in, check_out, hours_normal, hours_overtime
// registered_by_user_id (obrigatorio), status (string)
// NAO ha tabela workforce_daily_logs (plural) nem workforce_attendance
// =============================================================================

import { db } from '../../config/database';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { buildPaginationResponse } from '../../utils/helpers';
import {
  ListDailyLogsInput,
  CreateDailyLogInput,
  UpdateDailyLogInput,
  GetHistogramInput,
  CheckInInput,
} from './workforce.schema';

/**
 * WorkforceService - Service do modulo de mao de obra
 */
export class WorkforceService {
  // ===========================================================================
  // Daily Logs
  // ===========================================================================

  /**
   * Lista logs diarios de mao de obra com paginacao e filtros
   */
  static async listDailyLogs(input: ListDailyLogsInput) {
    const { projects_id, teams_id, date, page, per_page } = input;
    const company_id = (input as any).company_id;
    const skip = (page - 1) * per_page;

    const whereClause: any = {};

    if (projects_id) {
      whereClause.projects_id = BigInt(projects_id);
    }

    if (teams_id) {
      whereClause.teams_id = BigInt(teams_id);
    }

    // Isolamento multi-tenant via projects.company_id
    if (company_id && !projects_id) {
      whereClause.projects = { company_id: BigInt(company_id) };
    }

    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      whereClause.log_date = { gte: targetDate, lt: nextDay };
    }

    const [items, total] = await Promise.all([
      db.workforce_daily_log.findMany({
        where: whereClause,
        include: {
          projects: { select: { id: true, name: true } },
          teams: { select: { id: true, name: true } },
          worker: { select: { id: true, name: true } },
        },
        orderBy: { log_date: 'desc' },
        skip,
        take: per_page,
      }),
      db.workforce_daily_log.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  /**
   * Cria log diario de mao de obra
   * registered_by_user_id e obrigatorio (quem registrou)
   */
  static async createDailyLog(input: CreateDailyLogInput, registered_by_user_id?: number) {
    if (!registered_by_user_id) {
      throw new BadRequestError('registered_by_user_id e obrigatorio para criar um log.');
    }

    return db.workforce_daily_log.create({
      data: {
        projects_id: BigInt(input.projects_id),
        users_id: BigInt(input.users_id),
        teams_id: input.teams_id ? BigInt(input.teams_id) : null,
        log_date: new Date(input.log_date),
        status: input.status ?? 'presente',
        hours_normal: input.hours_normal ?? 0,
        hours_overtime: input.hours_overtime ?? 0,
        registered_by_user_id: BigInt(registered_by_user_id),
      },
      include: {
        projects: { select: { id: true, name: true } },
        teams: { select: { id: true, name: true } },
        worker: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Atualiza log diario de mao de obra
   */
  static async updateDailyLog(id: number, input: UpdateDailyLogInput) {
    const log = await db.workforce_daily_log.findFirst({
      where: { id: BigInt(id) },
    });

    if (!log) {
      throw new NotFoundError('Log diario nao encontrado.');
    }

    return db.workforce_daily_log.update({
      where: { id: BigInt(id) },
      data: {
        teams_id: input.teams_id ? BigInt(input.teams_id) : undefined,
        log_date: input.log_date ? new Date(input.log_date) : undefined,
        status: input.status,
        hours_normal: input.hours_normal,
        hours_overtime: input.hours_overtime,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Remove log diario (hard delete - tabela nao tem deleted_at)
   */
  static async deleteDailyLog(id: number) {
    const log = await db.workforce_daily_log.findFirst({
      where: { id: BigInt(id) },
    });

    if (!log) {
      throw new NotFoundError('Log diario nao encontrado.');
    }

    return db.workforce_daily_log.delete({
      where: { id: BigInt(id) },
    });
  }

  // ===========================================================================
  // Histogram
  // ===========================================================================

  /**
   * Gera histograma de contagem diaria de presencas por projeto
   * Agrupa registros por data e conta total de workers por dia
   */
  static async getHistogram(input: GetHistogramInput) {
    const { projects_id, start_date, end_date } = input;

    const startDateObj = new Date(start_date);
    startDateObj.setHours(0, 0, 0, 0);

    const endDateObj = new Date(end_date);
    endDateObj.setHours(23, 59, 59, 999);

    if (startDateObj > endDateObj) {
      throw new BadRequestError('start_date deve ser anterior a end_date.');
    }

    const logs = await db.workforce_daily_log.findMany({
      where: {
        projects_id: BigInt(projects_id),
        log_date: {
          gte: startDateObj,
          lte: endDateObj,
        },
      },
      select: {
        log_date: true,
        status: true,
        hours_normal: true,
        hours_overtime: true,
        teams_id: true,
      },
      orderBy: { log_date: 'asc' },
    });

    // Agrupa por data
    const histogramMap = new Map<string, { total: number; present: number; absent: number; total_hours: number }>();

    for (const log of logs) {
      if (!log.log_date) continue;
      const dateStr = log.log_date.toISOString().split('T')[0];

      if (!histogramMap.has(dateStr)) {
        histogramMap.set(dateStr, { total: 0, present: 0, absent: 0, total_hours: 0 });
      }

      const entry = histogramMap.get(dateStr)!;
      entry.total += 1;

      if (log.status === 'presente') {
        entry.present += 1;
        entry.total_hours += Number(log.hours_normal ?? 0) + Number(log.hours_overtime ?? 0);
      } else {
        entry.absent += 1;
      }
    }

    return Array.from(histogramMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // ===========================================================================
  // Check-in / Check-out
  // ===========================================================================

  /**
   * Registra check-in de trabalhador (cria registro de presenca do dia)
   */
  static async checkIn(input: CheckInInput, registered_by_user_id?: number) {
    // Verifica se ja ha registro do dia para este usuario
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingLog = await db.workforce_daily_log.findFirst({
      where: {
        users_id: BigInt(input.users_id),
        projects_id: BigInt(input.projects_id),
        log_date: { gte: today, lt: tomorrow },
        check_in: { not: null },
        check_out: null,
      },
    });

    if (existingLog) {
      throw new BadRequestError('Trabalhador ja possui check-in aberto hoje. Realize o check-out primeiro.');
    }

    return db.workforce_daily_log.create({
      data: {
        projects_id: BigInt(input.projects_id),
        users_id: BigInt(input.users_id),
        teams_id: input.teams_id ? BigInt(input.teams_id) : null,
        log_date: today,
        check_in: new Date(),
        status: 'presente',
        hours_normal: 0,
        hours_overtime: 0,
        registered_by_user_id: BigInt(registered_by_user_id ?? input.users_id),
      },
      include: {
        worker: { select: { id: true, name: true } },
        teams: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Registra check-out e calcula horas trabalhadas
   */
  static async checkOut(id: number) {
    const log = await db.workforce_daily_log.findFirst({
      where: { id: BigInt(id) },
    });

    if (!log) {
      throw new NotFoundError('Registro de presenca nao encontrado.');
    }

    if (log.check_out) {
      throw new BadRequestError('Check-out ja foi registrado para este registro.');
    }

    if (!log.check_in) {
      throw new BadRequestError('Este registro nao possui check-in registrado.');
    }

    const checkOutTime = new Date();
    const diffMs = checkOutTime.getTime() - log.check_in.getTime();
    const hoursWorked = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

    // Assume 8h como jornada normal, o resto e overtime
    const hoursNormal = Math.min(hoursWorked, 8);
    const hoursOvertime = Math.max(0, hoursWorked - 8);

    return db.workforce_daily_log.update({
      where: { id: BigInt(id) },
      data: {
        check_out: checkOutTime,
        hours_normal: hoursNormal,
        hours_overtime: hoursOvertime,
        updated_at: new Date(),
      },
      include: {
        worker: { select: { id: true, name: true } },
        teams: { select: { id: true, name: true } },
      },
    });
  }
}

export default WorkforceService;
