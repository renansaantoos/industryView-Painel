import { db } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { getBrazilianHolidays } from '../holidays/holidays.service';
import { resolveCountryCode, getAvailableCountries as getCountries } from './countryMapping';
import { fetchPublicHolidays } from './nagerDateClient';

const DEFAULT_CALENDAR = {
  seg_ativo: true, seg_entrada: '08:00', seg_intervalo_ini: '12:00', seg_intervalo_fim: '13:00', seg_saida: '17:00',
  ter_ativo: true, ter_entrada: '08:00', ter_intervalo_ini: '12:00', ter_intervalo_fim: '13:00', ter_saida: '17:00',
  qua_ativo: true, qua_entrada: '08:00', qua_intervalo_ini: '12:00', qua_intervalo_fim: '13:00', qua_saida: '17:00',
  qui_ativo: true, qui_entrada: '08:00', qui_intervalo_ini: '12:00', qui_intervalo_fim: '13:00', qui_saida: '17:00',
  sex_ativo: true, sex_entrada: '08:00', sex_intervalo_ini: '12:00', sex_intervalo_fim: '13:00', sex_saida: '17:00',
  sab_ativo: false, sab_entrada: '08:00', sab_intervalo_ini: '12:00', sab_intervalo_fim: '13:00', sab_saida: '17:00',
  dom_ativo: false, dom_entrada: '08:00', dom_intervalo_ini: '12:00', dom_intervalo_fim: '13:00', dom_saida: '17:00',
};

export class ProjectCalendarService {
  // ── Holidays ──

  static async listHolidays(projectsId: number, year?: number) {
    const where: any = { projects_id: BigInt(projectsId), deleted_at: null };
    if (year) {
      where.date = {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      };
    }
    const items = await db.project_holidays.findMany({
      where,
      orderBy: { date: 'asc' },
    });
    return { items };
  }

  static async createHoliday(data: {
    projects_id: number;
    date: string;
    name: string;
    type?: string;
    recurring?: boolean;
  }) {
    return db.project_holidays.create({
      data: {
        projects_id: BigInt(data.projects_id),
        date: new Date(data.date),
        name: data.name,
        type: data.type ?? 'custom',
        recurring: data.recurring ?? false,
      },
    });
  }

  static async updateHoliday(id: number, data: {
    date?: string;
    name?: string;
    type?: string;
    recurring?: boolean;
  }) {
    const existing = await db.project_holidays.findFirst({ where: { id: BigInt(id), deleted_at: null } });
    if (!existing) throw new NotFoundError('Feriado não encontrado.');
    return db.project_holidays.update({
      where: { id: BigInt(id) },
      data: {
        ...(data.date ? { date: new Date(data.date) } : {}),
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.recurring !== undefined ? { recurring: data.recurring } : {}),
      },
    });
  }

  static async deleteHoliday(id: number) {
    const existing = await db.project_holidays.findFirst({ where: { id: BigInt(id), deleted_at: null } });
    if (!existing) throw new NotFoundError('Feriado não encontrado.');
    return db.project_holidays.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });
  }

  static async seedHolidays(projectsId: number, year: number) {
    const project = await db.projects.findUnique({
      where: { id: BigInt(projectsId) },
      select: { country: true },
    });
    const country = project?.country || 'Brasil';
    const code = resolveCountryCode(country);

    let holidays: { date: string; name: string; type: string; recurring: boolean }[];

    if (code === 'BR') {
      holidays = getBrazilianHolidays(year);
    } else if (code) {
      holidays = await fetchPublicHolidays(year, code);
      if (holidays.length === 0) {
        return { ok: false, message: 'seed_api_error', country };
      }
    } else {
      return { ok: false, message: 'unsupported_country', country };
    }

    for (const h of holidays) {
      await db.project_holidays.upsert({
        where: {
          projects_id_date: {
            projects_id: BigInt(projectsId),
            date: new Date(h.date),
          },
        },
        create: {
          projects_id: BigInt(projectsId),
          date: new Date(h.date),
          name: h.name,
          type: h.type,
          recurring: h.recurring,
        },
        update: { name: h.name, type: h.type, deleted_at: null },
      });
    }

    return { ok: true, count: holidays.length };
  }

  // ── Work Calendar ──

  static async getWorkCalendar(projectsId: number) {
    const cal = await db.project_work_calendar.findUnique({
      where: { projects_id: BigInt(projectsId) },
      include: { overrides: true },
    });
    if (!cal) {
      return { projects_id: projectsId, ...DEFAULT_CALENDAR, overrides: [] };
    }
    return cal;
  }

  static async upsertWorkCalendar(data: any) {
    const projectsId = BigInt(data.projects_id);
    const { projects_id: _pid, ...fields } = data;
    return db.project_work_calendar.upsert({
      where: { projects_id: projectsId },
      create: { projects_id: projectsId, ...fields },
      update: fields,
    });
  }

  static async listCalendarOverrides(projectsId: number) {
    const cal = await db.project_work_calendar.findUnique({
      where: { projects_id: BigInt(projectsId) },
      include: { overrides: true },
    });
    return cal?.overrides ?? [];
  }

  static async upsertCalendarOverride(data: any) {
    const calendarId = BigInt(data.project_work_calendar_id);
    const month = data.month;
    const year = data.year ?? null;
    const { project_work_calendar_id: _cid, month: _m, year: _y, ...fields } = data;

    return db.project_work_calendar_override.upsert({
      where: {
        project_work_calendar_id_month_year: {
          project_work_calendar_id: calendarId,
          month,
          year,
        },
      },
      create: {
        project_work_calendar_id: calendarId,
        month,
        year,
        ...fields,
      },
      update: fields,
    });
  }

  static async deleteCalendarOverride(id: number) {
    return db.project_work_calendar_override.delete({
      where: { id: BigInt(id) },
    });
  }

  static getAvailableCountries() {
    return getCountries();
  }
}
