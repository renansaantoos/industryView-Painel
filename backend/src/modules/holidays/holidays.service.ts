import { db } from '../../config/database';
import { NotFoundError } from '../../utils/errors';

// Feriados nacionais brasileiros fixos (dia/mês) e móveis calculados por ano
function getBrazilianHolidays(year: number): { date: string; name: string; type: string; recurring: boolean }[] {
  // Cálculo da Páscoa (algoritmo de Butcher)
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  const easter = new Date(year, month - 1, day);

  const addDays = (d: Date, n: number) => {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  };
  const fmt = (d: Date) => d.toISOString().substring(0, 10);

  const fixed = [
    { date: `${year}-01-01`, name: 'Confraternização Universal', type: 'national', recurring: true },
    { date: `${year}-04-21`, name: 'Tiradentes', type: 'national', recurring: true },
    { date: `${year}-05-01`, name: 'Dia do Trabalho', type: 'national', recurring: true },
    { date: `${year}-09-07`, name: 'Independência do Brasil', type: 'national', recurring: true },
    { date: `${year}-10-12`, name: 'Nossa Senhora Aparecida', type: 'national', recurring: true },
    { date: `${year}-11-02`, name: 'Finados', type: 'national', recurring: true },
    { date: `${year}-11-15`, name: 'Proclamação da República', type: 'national', recurring: true },
    { date: `${year}-11-20`, name: 'Consciência Negra', type: 'national', recurring: true },
    { date: `${year}-12-25`, name: 'Natal', type: 'national', recurring: true },
  ];

  const mobile = [
    { date: fmt(addDays(easter, -48)), name: 'Carnaval (Segunda)', type: 'national', recurring: false },
    { date: fmt(addDays(easter, -47)), name: 'Carnaval (Terça)', type: 'national', recurring: false },
    { date: fmt(addDays(easter, -2)),  name: 'Sexta-feira Santa', type: 'national', recurring: false },
    { date: fmt(easter),               name: 'Páscoa', type: 'national', recurring: false },
    { date: fmt(addDays(easter, 60)),  name: 'Corpus Christi', type: 'national', recurring: false },
  ];

  return [...fixed, ...mobile];
}

export class HolidaysService {
  static async list(companyId: number, year?: number) {
    const where: any = { company_id: BigInt(companyId), deleted_at: null };
    if (year) {
      where.date = {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      };
    }
    const items = await db.company_holidays.findMany({
      where,
      orderBy: { date: 'asc' },
    });
    return { items };
  }

  static async create(data: {
    company_id: number;
    date: string;
    name: string;
    type?: string;
    recurring?: boolean;
  }) {
    return db.company_holidays.create({
      data: {
        company_id: BigInt(data.company_id),
        date: new Date(data.date),
        name: data.name,
        type: data.type ?? 'custom',
        recurring: data.recurring ?? false,
      },
    });
  }

  static async update(id: number, data: {
    date?: string;
    name?: string;
    type?: string;
    recurring?: boolean;
  }) {
    const existing = await db.company_holidays.findFirst({ where: { id: BigInt(id), deleted_at: null } });
    if (!existing) throw new NotFoundError('Feriado não encontrado.');
    return db.company_holidays.update({
      where: { id: BigInt(id) },
      data: {
        ...(data.date ? { date: new Date(data.date) } : {}),
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.recurring !== undefined ? { recurring: data.recurring } : {}),
      },
    });
  }

  static async delete(id: number) {
    const existing = await db.company_holidays.findFirst({ where: { id: BigInt(id), deleted_at: null } });
    if (!existing) throw new NotFoundError('Feriado não encontrado.');
    return db.company_holidays.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });
  }

  static async seed(companyId: number, year: number) {
    const holidays = getBrazilianHolidays(year);
    for (const h of holidays) {
      await db.company_holidays.upsert({
        where: { uq_company_holidays_company_date: { company_id: BigInt(companyId), date: new Date(h.date) } },
        create: {
          company_id: BigInt(companyId),
          date: new Date(h.date),
          name: h.name,
          type: h.type,
          recurring: h.recurring,
        },
        update: { name: h.name, type: h.type, deleted_at: null },
      });
    }
  }

  static async getWorkCalendar(companyId: number) {
    const cal = await db.company_work_calendar.findUnique({ where: { company_id: BigInt(companyId) } });
    if (!cal) {
      // Retorna padrão seg-sex
      return {
        company_id: companyId,
        seg_ativo: true, ter_ativo: true, qua_ativo: true,
        qui_ativo: true, sex_ativo: true, sab_ativo: false, dom_ativo: false,
      };
    }
    return cal;
  }

  static async upsertWorkCalendar(data: {
    company_id: number;
    seg_ativo: boolean; ter_ativo: boolean; qua_ativo: boolean;
    qui_ativo: boolean; sex_ativo: boolean; sab_ativo: boolean; dom_ativo: boolean;
  }) {
    return db.company_work_calendar.upsert({
      where: { company_id: BigInt(data.company_id) },
      create: {
        company_id: BigInt(data.company_id),
        seg_ativo: data.seg_ativo, ter_ativo: data.ter_ativo, qua_ativo: data.qua_ativo,
        qui_ativo: data.qui_ativo, sex_ativo: data.sex_ativo, sab_ativo: data.sab_ativo, dom_ativo: data.dom_ativo,
      },
      update: {
        seg_ativo: data.seg_ativo, ter_ativo: data.ter_ativo, qua_ativo: data.qua_ativo,
        qui_ativo: data.qui_ativo, sex_ativo: data.sex_ativo, sab_ativo: data.sab_ativo, dom_ativo: data.dom_ativo,
      },
    });
  }
}
