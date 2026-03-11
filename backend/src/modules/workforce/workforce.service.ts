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

// =============================================================================
// Helpers de calculo de horas
// =============================================================================

/**
 * Calcula horas normais, HE normal (50%) e HE 100% baseado nos pontos batidos.
 * Regra CLT: jornada padrao de 8h, primeiras 2h extras = HE normal, alem disso = HE 100%.
 * O intervalo de almoco e descontado automaticamente.
 */
function calcHours(
  checkIn: Date | null,
  checkOut: Date | null,
  saidaIntervalo: Date | null,
  entradaIntervalo: Date | null,
): { hoursNormal: number; hoursOvertime: number; hoursHe100: number; status: string } {
  if (!checkIn) {
    return { hoursNormal: 0, hoursOvertime: 0, hoursHe100: 0, status: 'ausente' };
  }
  if (!checkOut) {
    return { hoursNormal: 0, hoursOvertime: 0, hoursHe100: 0, status: 'presente' };
  }

  const totalBrutoMin = (checkOut.getTime() - checkIn.getTime()) / 60000;
  if (totalBrutoMin <= 0) {
    return { hoursNormal: 0, hoursOvertime: 0, hoursHe100: 0, status: 'presente' };
  }

  let intervaloMin = 0;
  if (saidaIntervalo && entradaIntervalo) {
    const diff = (entradaIntervalo.getTime() - saidaIntervalo.getTime()) / 60000;
    if (diff > 0) intervaloMin = diff;
  }

  const totalLiquidoHoras = (totalBrutoMin - intervaloMin) / 60;
  const jornadaPadrao = 8;

  const hoursNormal   = Math.min(totalLiquidoHoras, jornadaPadrao);
  const heTotal       = Math.max(0, totalLiquidoHoras - jornadaPadrao);
  const hoursOvertime = Math.min(heTotal, 2);      // primeiras 2h = HE 50%
  const hoursHe100    = Math.max(0, heTotal - 2);  // alem de 2h   = HE 100%

  let status = 'presente';
  if (totalLiquidoHoras < jornadaPadrao * 0.3) status = 'ausente';
  else if (totalLiquidoHoras < jornadaPadrao * 0.7) status = 'meio_periodo';

  return {
    hoursNormal:   Math.round(hoursNormal   * 100) / 100,
    hoursOvertime: Math.round(hoursOvertime * 100) / 100,
    hoursHe100:    Math.round(hoursHe100    * 100) / 100,
    status,
  };
}

function parseDate(val?: string | null): Date | null {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

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
    const { projects_id, teams_id, users_id, date, page, per_page } = input;
    const company_id = (input as any).company_id;
    const skip = (page - 1) * per_page;

    const whereClause: any = {};

    if (projects_id) whereClause.projects_id = BigInt(projects_id);
    if (teams_id)    whereClause.teams_id    = BigInt(teams_id);
    if (users_id)    whereClause.users_id    = BigInt(users_id);

    if (company_id && !projects_id) {
      whereClause.worker = { company_id: BigInt(company_id) };
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
          teams:    { select: { id: true, name: true } },
          worker:   { select: { id: true, name: true } },
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
   */
  static async createDailyLog(input: CreateDailyLogInput, registered_by_user_id?: number) {
    if (!registered_by_user_id) {
      throw new BadRequestError('registered_by_user_id e obrigatorio para criar um log.');
    }

    const checkInDate         = parseDate(input.check_in);
    const checkOutDate        = parseDate(input.check_out);
    const saidaIntervaloDate  = parseDate(input.saida_intervalo);
    const entradaIntervaloDate = parseDate(input.entrada_intervalo);

    const { hoursNormal, hoursOvertime, hoursHe100, status } = calcHours(
      checkInDate, checkOutDate, saidaIntervaloDate, entradaIntervaloDate,
    );

    return db.workforce_daily_log.create({
      data: {
        projects_id:           input.projects_id ? BigInt(input.projects_id) : null,
        users_id:              BigInt(input.users_id),
        teams_id:              input.teams_id ? BigInt(input.teams_id) : null,
        log_date:              new Date(input.log_date),
        check_in:              checkInDate,
        check_out:             checkOutDate,
        saida_intervalo:       saidaIntervaloDate,
        entrada_intervalo:     entradaIntervaloDate,
        status:                status,
        hours_normal:          hoursNormal,
        hours_overtime:        hoursOvertime,
        hours_he_100:          hoursHe100,
        observation:           input.observation ?? null,
        registered_by_user_id: BigInt(registered_by_user_id),
      },
      include: {
        projects: { select: { id: true, name: true } },
        teams:    { select: { id: true, name: true } },
        worker:   { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Atualiza log diario de mao de obra
   */
  static async updateDailyLog(id: number, input: UpdateDailyLogInput) {
    const log = await db.workforce_daily_log.findFirst({ where: { id: BigInt(id) } });
    if (!log) throw new NotFoundError('Log diario nao encontrado.');

    const parseOpt = (val?: string): Date | null | undefined => {
      if (val === undefined) return undefined;
      return parseDate(val);
    };

    const checkInDate          = parseOpt(input.check_in);
    const checkOutDate         = parseOpt(input.check_out);
    const saidaIntervaloDate   = parseOpt(input.saida_intervalo);
    const entradaIntervaloDate = parseOpt(input.entrada_intervalo);

    // Usa valor novo ou, se nao informado, mantém o do banco
    const effectiveIn      = checkInDate          !== undefined ? checkInDate          : log.check_in;
    const effectiveOut     = checkOutDate         !== undefined ? checkOutDate         : log.check_out;
    const effectiveSaida   = saidaIntervaloDate   !== undefined ? saidaIntervaloDate   : (log as any).saida_intervalo;
    const effectiveEntrada = entradaIntervaloDate !== undefined ? entradaIntervaloDate : (log as any).entrada_intervalo;

    const { hoursNormal, hoursOvertime, hoursHe100, status } = calcHours(
      effectiveIn   as Date | null,
      effectiveOut  as Date | null,
      effectiveSaida   as Date | null,
      effectiveEntrada as Date | null,
    );

    return db.workforce_daily_log.update({
      where: { id: BigInt(id) },
      data: {
        teams_id:      input.teams_id ? BigInt(input.teams_id) : undefined,
        log_date:      input.log_date ? new Date(input.log_date) : undefined,
        status:        input.status ?? status,
        hours_normal:  hoursNormal,
        hours_overtime: hoursOvertime,
        hours_he_100:  hoursHe100,
        observation:   input.observation,
        ...(checkInDate          !== undefined && { check_in:          checkInDate }),
        ...(checkOutDate         !== undefined && { check_out:         checkOutDate }),
        ...(saidaIntervaloDate   !== undefined && { saida_intervalo:   saidaIntervaloDate }),
        ...(entradaIntervaloDate !== undefined && { entrada_intervalo: entradaIntervaloDate }),
        updated_at: new Date(),
      },
    });
  }

  /**
   * Remove log diario (hard delete - tabela nao tem deleted_at)
   */
  static async deleteDailyLog(id: number) {
    const log = await db.workforce_daily_log.findFirst({ where: { id: BigInt(id) } });
    if (!log) throw new NotFoundError('Log diario nao encontrado.');
    return db.workforce_daily_log.delete({ where: { id: BigInt(id) } });
  }

  // ===========================================================================
  // Histogram
  // ===========================================================================

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
        log_date: { gte: startDateObj, lte: endDateObj },
      },
      select: {
        log_date:       true,
        status:         true,
        hours_normal:   true,
        hours_overtime: true,
        teams_id:       true,
      },
      orderBy: { log_date: 'asc' },
    });

    const histogramMap = new Map<string, { total_planned: number; total_present: number; total_absent: number; total_hours: number }>();

    for (const log of logs) {
      if (!log.log_date) continue;
      const dateStr = log.log_date.toISOString().split('T')[0];
      if (!histogramMap.has(dateStr)) histogramMap.set(dateStr, { total_planned: 0, total_present: 0, total_absent: 0, total_hours: 0 });
      const entry = histogramMap.get(dateStr)!;
      entry.total_planned += 1;
      if (log.status === 'presente') {
        entry.total_present += 1;
        entry.total_hours += Number(log.hours_normal ?? 0) + Number(log.hours_overtime ?? 0);
      } else {
        entry.total_absent += 1;
      }
    }

    return Array.from(histogramMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // ===========================================================================
  // Check-in / Check-out
  // ===========================================================================

  static async checkIn(input: CheckInInput, registered_by_user_id?: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingLogWhere: any = {
      users_id: BigInt(input.users_id),
      log_date: { gte: today, lt: tomorrow },
      check_in: { not: null },
      check_out: null,
    };
    if (input.projects_id) existingLogWhere.projects_id = BigInt(input.projects_id);

    const existingLog = await db.workforce_daily_log.findFirst({ where: existingLogWhere });
    if (existingLog) {
      throw new BadRequestError('Trabalhador ja possui check-in aberto hoje. Realize o check-out primeiro.');
    }

    return db.workforce_daily_log.create({
      data: {
        projects_id:           input.projects_id ? BigInt(input.projects_id) : null,
        users_id:              BigInt(input.users_id),
        teams_id:              input.teams_id ? BigInt(input.teams_id) : null,
        log_date:              today,
        check_in:              new Date(),
        status:                'presente',
        hours_normal:          0,
        hours_overtime:        0,
        registered_by_user_id: BigInt(registered_by_user_id ?? input.users_id),
      },
      include: {
        worker: { select: { id: true, name: true } },
        teams:  { select: { id: true, name: true } },
      },
    });
  }

  static async checkOut(id: number) {
    const log = await db.workforce_daily_log.findFirst({ where: { id: BigInt(id) } });
    if (!log)           throw new NotFoundError('Registro de presenca nao encontrado.');
    if (log.check_out)  throw new BadRequestError('Check-out ja foi registrado para este registro.');
    if (!log.check_in)  throw new BadRequestError('Este registro nao possui check-in registrado.');

    const checkOutTime = new Date();
    const { hoursNormal, hoursOvertime, hoursHe100 } = calcHours(
      log.check_in, checkOutTime, (log as any).saida_intervalo, (log as any).entrada_intervalo,
    );

    return db.workforce_daily_log.update({
      where: { id: BigInt(id) },
      data: {
        check_out:      checkOutTime,
        hours_normal:   hoursNormal,
        hours_overtime: hoursOvertime,
        hours_he_100:   hoursHe100,
        updated_at:     new Date(),
      },
      include: {
        worker: { select: { id: true, name: true } },
        teams:  { select: { id: true, name: true } },
      },
    });
  }

  static async importFromExcel(
    rows: { log_date: string; check_in?: string; check_out?: string; status?: string; observation?: string }[],
    users_id: number,
    projects_id: number | null,
    registered_by_user_id: number,
  ) {
    const results: { imported: number; errors: { row: number; message: string }[] } = {
      imported: 0,
      errors: [],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      try {
        if (!row.log_date) {
          results.errors.push({ row: rowNum, message: 'Data e obrigatoria' });
          continue;
        }

        const logDate = new Date(row.log_date);
        if (isNaN(logDate.getTime())) {
          results.errors.push({ row: rowNum, message: `Data invalida: ${row.log_date}` });
          continue;
        }

        let checkInDate: Date | undefined;
        let checkOutDate: Date | undefined;

        if (row.check_in) {
          const [h, m] = row.check_in.split(':').map(Number);
          if (!isNaN(h) && !isNaN(m)) {
            checkInDate = new Date(logDate);
            checkInDate.setHours(h, m, 0, 0);
          }
        }
        if (row.check_out) {
          const [h, m] = row.check_out.split(':').map(Number);
          if (!isNaN(h) && !isNaN(m)) {
            checkOutDate = new Date(logDate);
            checkOutDate.setHours(h, m, 0, 0);
          }
        }

        const { hoursNormal, hoursOvertime, hoursHe100, status: autoStatus } = calcHours(
          checkInDate ?? null, checkOutDate ?? null, null, null,
        );

        const status = row.status?.trim().toLowerCase() || autoStatus;
        const validStatuses = ['presente', 'ausente', 'meio_periodo'];
        if (!validStatuses.includes(status)) {
          results.errors.push({ row: rowNum, message: `Status invalido: ${row.status}. Use: presente, ausente, meio_periodo` });
          continue;
        }

        await db.workforce_daily_log.create({
          data: {
            projects_id:           projects_id ? BigInt(projects_id) : null,
            users_id:              BigInt(users_id),
            log_date:              logDate,
            check_in:              checkInDate  ?? null,
            check_out:             checkOutDate ?? null,
            hours_normal:          hoursNormal,
            hours_overtime:        hoursOvertime,
            hours_he_100:          hoursHe100,
            observation:           row.observation ?? null,
            status,
            registered_by_user_id: BigInt(registered_by_user_id),
          },
        });

        results.imported++;
      } catch (err: any) {
        results.errors.push({ row: rowNum, message: err.message || 'Erro desconhecido' });
      }
    }

    return results;
  }
}

export default WorkforceService;
