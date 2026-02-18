// =============================================================================
// INDUSTRYVIEW BACKEND - Daily Reports Module Service
// Service do modulo de RDO completo com fluxo de aprovacao
//
// NOTA TECNICA: Este service usa $queryRaw/$executeRaw para todas as operacoes
// porque o Prisma client instalado foi gerado com um schema anterior que nao
// incluia os campos expandidos de daily_report (status, shift, weather_*, etc.)
// nem as tabelas filhas (workforce, activities, occurrences, equipment).
// O schema.prisma foi atualizado, mas o client nao pode ser regenerado enquanto
// houver erros de validacao pre-existentes no schema (modelos de outros modulos
// ainda nao definidos). Esta abordagem e segura e totalmente funcional.
//
// Fluxo de status do RDO:
//   rascunho -> finalizado -> aprovado (imutavel)
//                          -> rejeitado -> rascunho (correcao)
//
// Regras de imutabilidade:
//   - status 'aprovado': NENHUMA alteracao permitida em nenhum campo
//   - status 'finalizado': sem edicao direta (somente aprovar ou rejeitar)
//   - status 'rejeitado': volta para rascunho automaticamente
//   - status 'rascunho': edicao livre de todos os campos e tabelas filhas
// =============================================================================

import { db } from '../../config/database';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { buildPaginationResponse } from '../../utils/helpers';
import {
  CreateDailyReportInput,
  UpdateDailyReportInput,
  ListDailyReportsInput,
  CreateWorkforceEntryInput,
  UpdateWorkforceEntryInput,
  CreateActivityEntryInput,
  UpdateActivityEntryInput,
  CreateOccurrenceEntryInput,
  UpdateOccurrenceEntryInput,
  CreateEquipmentEntryInput,
  UpdateEquipmentEntryInput,
  RDO_STATUS,
} from './daily-reports.schema';

// =============================================================================
// Tipos raw para retorno de queries
// =============================================================================

interface DailyReportRow {
  id: bigint;
  projects_id: bigint | null;
  rdo_date: Date | null;
  rdo_number: number | null;
  shift: string | null;
  weather_morning: string | null;
  weather_afternoon: string | null;
  weather_night: string | null;
  temperature_min: string | null;
  temperature_max: string | null;
  safety_topic: string | null;
  general_observations: string | null;
  status: string | null;
  created_by_user_id: bigint | null;
  approved_by_user_id: bigint | null;
  approved_at: Date | null;
  rejection_reason: string | null;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}

interface WorkforceRow {
  id: bigint;
  daily_report_id: bigint;
  role_category: string;
  quantity_planned: number;
  quantity_present: number;
  quantity_absent: number | null;
  absence_reason: string | null;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}

interface ActivityRow {
  id: bigint;
  daily_report_id: bigint;
  projects_backlogs_id: bigint | null;
  description: string;
  quantity_done: string | null;
  unity_id: bigint | null;
  teams_id: bigint | null;
  location_description: string | null;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
  backlog_description?: string | null;
  unity_label?: string | null;
  team_name?: string | null;
}

interface OccurrenceRow {
  id: bigint;
  daily_report_id: bigint;
  occurrence_type: string;
  description: string;
  start_time: string | null;
  end_time: string | null;
  duration_hours: string | null;
  impact_description: string | null;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}

interface EquipmentRow {
  id: bigint;
  daily_report_id: bigint;
  equipaments_types_id: bigint | null;
  description: string | null;
  quantity: number;
  operation_hours: string | null;
  idle_hours: string | null;
  idle_reason: string | null;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
  equipment_type_label?: string | null;
}

// =============================================================================
// Helpers de serialização
// =============================================================================

/**
 * Serializa um registro que pode conter BigInt para formato JSON-safe
 */
function serializeRow<T extends Record<string, unknown>>(row: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (typeof value === 'bigint') {
      result[key] = Number(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * DailyReportsService - Service do modulo de RDO completo
 */
export class DailyReportsService {
  // ===========================================================================
  // Helpers privados
  // ===========================================================================

  /**
   * Busca o RDO pelo ID e valida que existe e nao foi deletado
   */
  private static async getReportOrThrow(daily_report_id: number): Promise<DailyReportRow> {
    const rows = await db.$queryRaw<DailyReportRow[]>`
      SELECT * FROM daily_report
      WHERE id = ${BigInt(daily_report_id)}
        AND deleted_at IS NULL
      LIMIT 1
    `;

    if (!rows.length) {
      throw new NotFoundError('RDO nao encontrado.');
    }

    return rows[0];
  }

  /**
   * Valida que o RDO esta em status 'rascunho'
   * Usado antes de qualquer operacao de edicao no RDO pai ou tabelas filhas
   */
  private static async validateReportEditable(daily_report_id: number): Promise<void> {
    const report = await DailyReportsService.getReportOrThrow(daily_report_id);

    if (report.status !== RDO_STATUS.RASCUNHO) {
      const statusLabel =
        report.status === RDO_STATUS.APROVADO
          ? 'aprovado (imutavel)'
          : report.status === RDO_STATUS.FINALIZADO
            ? 'finalizado'
            : report.status === RDO_STATUS.REJEITADO
              ? 'rejeitado'
              : report.status ?? 'desconhecido';

      throw new BadRequestError(
        `RDO ja ${statusLabel} nao pode ser editado. Apenas RDOs em rascunho podem ser alterados.`
      );
    }
  }

  /**
   * Calcula o proximo numero sequencial de RDO por projeto
   * Cada projeto tem sua propria sequencia de numeracao
   */
  private static async getNextRdoNumber(projects_id: number): Promise<number> {
    const result = await db.$queryRaw<{ max_num: number | null }[]>`
      SELECT MAX(rdo_number)::int as max_num
      FROM daily_report
      WHERE projects_id = ${BigInt(projects_id)}
        AND deleted_at IS NULL
    `;

    const maxNum = result[0]?.max_num ?? 0;
    return (maxNum || 0) + 1;
  }

  // ===========================================================================
  // CRUD do RDO principal
  // ===========================================================================

  /**
   * Lista RDOs com paginacao e filtros
   * Retorna contagem de itens filhos e RDOs pendentes
   */
  static async listDailyReports(input: ListDailyReportsInput) {
    const { projects_id, page, per_page, initial_date, final_date, status } = input;
    const company_id = (input as any).company_id;
    const skip = (page - 1) * per_page;

    // Constroi clausulas de filtro dinamicamente
    const conditions: string[] = ['dr.deleted_at IS NULL'];
    const params: unknown[] = [];
    let paramIdx = 1;

    if (projects_id) {
      conditions.push(`dr.projects_id = $${paramIdx++}`);
      params.push(BigInt(projects_id));
    }

    // Isolamento multi-tenant via projects.company_id
    if (company_id && !projects_id) {
      conditions.push(`p.company_id = $${paramIdx++}`);
      params.push(BigInt(company_id));
    }
    if (status) {
      conditions.push(`dr.status = $${paramIdx++}`);
      params.push(status);
    }
    if (initial_date) {
      conditions.push(`dr.rdo_date >= $${paramIdx++}::date`);
      params.push(initial_date);
    }
    if (final_date) {
      conditions.push(`dr.rdo_date <= $${paramIdx++}::date`);
      params.push(final_date);
    }

    const whereStr = conditions.join(' AND ');

    // Conta total (JOIN com projects necessario para filtro de company_id)
    const countResult = await db.$queryRawUnsafe<{ total: bigint }[]>(
      `SELECT COUNT(*)::bigint AS total FROM daily_report dr LEFT JOIN projects p ON p.id = dr.projects_id WHERE ${whereStr}`,
      ...params
    );
    const total = Number(countResult[0]?.total ?? 0);

    // Busca itens paginados com joins para informacoes de projeto e usuarios
    params.push(per_page, skip);
    const items = await db.$queryRawUnsafe<(DailyReportRow & {
      project_name: string | null;
      project_registration: string | null;
      created_by_name: string | null;
      approved_by_name: string | null;
      workforce_count: bigint;
      activities_count: bigint;
      occurrences_count: bigint;
      equipment_count: bigint;
    })[]>(
      `SELECT
        dr.*,
        p.name AS project_name,
        p.registration_number AS project_registration,
        u1.name AS created_by_name,
        u2.name AS approved_by_name,
        COUNT(DISTINCT w.id) FILTER (WHERE w.deleted_at IS NULL) AS workforce_count,
        COUNT(DISTINCT a.id) FILTER (WHERE a.deleted_at IS NULL) AS activities_count,
        COUNT(DISTINCT o.id) FILTER (WHERE o.deleted_at IS NULL) AS occurrences_count,
        COUNT(DISTINCT e.id) FILTER (WHERE e.deleted_at IS NULL) AS equipment_count
      FROM daily_report dr
      LEFT JOIN projects p ON p.id = dr.projects_id
      LEFT JOIN users u1 ON u1.id = dr.created_by_user_id
      LEFT JOIN users u2 ON u2.id = dr.approved_by_user_id
      LEFT JOIN daily_report_workforce w ON w.daily_report_id = dr.id
      LEFT JOIN daily_report_activities a ON a.daily_report_id = dr.id
      LEFT JOIN daily_report_occurrences o ON o.daily_report_id = dr.id
      LEFT JOIN daily_report_equipment e ON e.daily_report_id = dr.id
      WHERE ${whereStr}
      GROUP BY dr.id, p.name, p.registration_number, u1.name, u2.name
      ORDER BY dr.rdo_date DESC, dr.created_at DESC
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      ...params
    );

    // Serializa BigInts
    const serializedItems = items.map(item => ({
      ...serializeRow(item as unknown as Record<string, unknown>),
      workforce_count: Number(item.workforce_count),
      activities_count: Number(item.activities_count),
      occurrences_count: Number(item.occurrences_count),
      equipment_count: Number(item.equipment_count),
    }));

    // Conta RDOs pendentes (dias passados sem RDO para o projeto)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingSchedules = await db.schedule.findMany({
      where: {
        deleted_at: null,
        daily_report_id: null,
        schedule_date: { lt: today },
        projects_id: projects_id ? BigInt(projects_id) : undefined,
      },
      select: { schedule_date: true },
    });

    const uniqueDates = new Set(
      pendingSchedules.map(s => s.schedule_date?.toISOString().split('T')[0])
    );
    const rdosPending = uniqueDates.size;

    return {
      result1: buildPaginationResponse(serializedItems, total, page, per_page),
      daily_report_pending: rdosPending,
    };
  }

  /**
   * Busca um RDO por ID com todos os dados filhos
   */
  static async getDailyReportById(daily_report_id: number) {
    // Busca o RDO principal com dados relacionados
    const reports = await db.$queryRaw<(DailyReportRow & {
      project_name: string | null;
      project_registration_number: string | null;
      created_by_name: string | null;
      created_by_email: string | null;
      approved_by_name: string | null;
      approved_by_email: string | null;
    })[]>`
      SELECT
        dr.*,
        p.name AS project_name,
        p.registration_number AS project_registration_number,
        u1.name AS created_by_name,
        u1.email AS created_by_email,
        u2.name AS approved_by_name,
        u2.email AS approved_by_email
      FROM daily_report dr
      LEFT JOIN projects p ON p.id = dr.projects_id
      LEFT JOIN users u1 ON u1.id = dr.created_by_user_id
      LEFT JOIN users u2 ON u2.id = dr.approved_by_user_id
      WHERE dr.id = ${BigInt(daily_report_id)}
        AND dr.deleted_at IS NULL
      LIMIT 1
    `;

    if (!reports.length) {
      throw new NotFoundError('RDO nao encontrado.');
    }

    const report = reports[0];

    // Busca schedules vinculados
    const schedules = await db.schedule.findMany({
      where: {
        daily_report_id: BigInt(daily_report_id),
        deleted_at: null,
      },
      include: {
        teams: { select: { id: true, name: true } },
        sprints: { select: { id: true, title: true } },
      },
    });

    // Busca tabelas filhas via raw query
    const [workforce, activities, occurrences, equipment] = await Promise.all([
      db.$queryRaw<WorkforceRow[]>`
        SELECT * FROM daily_report_workforce
        WHERE daily_report_id = ${BigInt(daily_report_id)}
          AND deleted_at IS NULL
        ORDER BY created_at ASC
      `,
      db.$queryRaw<ActivityRow[]>`
        SELECT
          a.*,
          pb.description AS backlog_description,
          u.unity AS unity_label,
          t.name AS team_name
        FROM daily_report_activities a
        LEFT JOIN projects_backlogs pb ON pb.id = a.projects_backlogs_id
        LEFT JOIN unity u ON u.id = a.unity_id
        LEFT JOIN teams t ON t.id = a.teams_id
        WHERE a.daily_report_id = ${BigInt(daily_report_id)}
          AND a.deleted_at IS NULL
        ORDER BY a.created_at ASC
      `,
      db.$queryRaw<OccurrenceRow[]>`
        SELECT * FROM daily_report_occurrences
        WHERE daily_report_id = ${BigInt(daily_report_id)}
          AND deleted_at IS NULL
        ORDER BY created_at ASC
      `,
      db.$queryRaw<EquipmentRow[]>`
        SELECT
          e.*,
          et.type AS equipment_type_label
        FROM daily_report_equipment e
        LEFT JOIN equipaments_types et ON et.id = e.equipaments_types_id
        WHERE e.daily_report_id = ${BigInt(daily_report_id)}
          AND e.deleted_at IS NULL
        ORDER BY e.created_at ASC
      `,
    ]);

    return {
      ...serializeRow(report as unknown as Record<string, unknown>),
      projects: report.projects_id
        ? {
            id: Number(report.projects_id),
            name: report.project_name,
            registration_number: report.project_registration_number,
          }
        : null,
      created_by_user: report.created_by_user_id
        ? {
            id: Number(report.created_by_user_id),
            name: report.created_by_name,
            email: report.created_by_email,
          }
        : null,
      approved_by_user: report.approved_by_user_id
        ? {
            id: Number(report.approved_by_user_id),
            name: report.approved_by_name,
            email: report.approved_by_email,
          }
        : null,
      schedule: schedules.map(s => serializeRow(s as unknown as Record<string, unknown>)),
      workforce: workforce.map(w => serializeRow(w as unknown as Record<string, unknown>)),
      activities: activities.map(a => serializeRow(a as unknown as Record<string, unknown>)),
      occurrences: occurrences.map(o => serializeRow(o as unknown as Record<string, unknown>)),
      equipment: equipment.map(e => serializeRow(e as unknown as Record<string, unknown>)),
    };
  }

  /**
   * Cria um novo RDO
   * - Status inicial: 'rascunho'
   * - rdo_number gerado automaticamente e sequencial por projeto
   * - Vincula schedules se fornecidos
   */
  static async createDailyReport(input: CreateDailyReportInput, created_by_user_id: number) {
    const { projects_id, rdo_date, schedule_id, ...fields } = input;

    // Gera o proximo numero sequencial para este projeto
    const rdoNumber = await DailyReportsService.getNextRdoNumber(projects_id);

    // Cria o RDO com status rascunho via raw SQL
    const result = await db.$queryRaw<DailyReportRow[]>`
      INSERT INTO daily_report (
        projects_id, rdo_date, rdo_number, status,
        shift, weather_morning, weather_afternoon, weather_night,
        temperature_min, temperature_max,
        safety_topic, general_observations,
        created_by_user_id,
        created_at, updated_at
      ) VALUES (
        ${BigInt(projects_id)},
        ${new Date(rdo_date)},
        ${rdoNumber},
        ${RDO_STATUS.RASCUNHO},
        ${fields.shift ?? null},
        ${fields.weather_morning ?? null},
        ${fields.weather_afternoon ?? null},
        ${fields.weather_night ?? null},
        ${fields.temperature_min ?? null},
        ${fields.temperature_max ?? null},
        ${fields.safety_topic ?? null},
        ${fields.general_observations ?? null},
        ${BigInt(created_by_user_id)},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    const dailyReport = result[0];

    // Vincula schedules ao relatorio se fornecidos
    if (schedule_id && schedule_id.length > 0) {
      for (const schedId of schedule_id) {
        await db.schedule.update({
          where: { id: BigInt(schedId) },
          data: {
            daily_report_id: dailyReport.id,
            updated_at: new Date(),
          },
        });
      }
    }

    return serializeRow(dailyReport as unknown as Record<string, unknown>);
  }

  /**
   * Atualiza um RDO existente
   * Somente permitido quando status = 'rascunho'
   */
  static async updateDailyReport(daily_report_id: number, input: UpdateDailyReportInput) {
    await DailyReportsService.validateReportEditable(daily_report_id);

    const updates: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.rdo_date !== undefined) {
      updates.push(`rdo_date = $${paramIndex++}::date`);
      values.push(input.rdo_date);
    }
    if (input.shift !== undefined) {
      updates.push(`shift = $${paramIndex++}`);
      values.push(input.shift);
    }
    if (input.weather_morning !== undefined) {
      updates.push(`weather_morning = $${paramIndex++}`);
      values.push(input.weather_morning);
    }
    if (input.weather_afternoon !== undefined) {
      updates.push(`weather_afternoon = $${paramIndex++}`);
      values.push(input.weather_afternoon);
    }
    if (input.weather_night !== undefined) {
      updates.push(`weather_night = $${paramIndex++}`);
      values.push(input.weather_night);
    }
    if (input.temperature_min !== undefined) {
      updates.push(`temperature_min = $${paramIndex++}`);
      values.push(input.temperature_min);
    }
    if (input.temperature_max !== undefined) {
      updates.push(`temperature_max = $${paramIndex++}`);
      values.push(input.temperature_max);
    }
    if (input.safety_topic !== undefined) {
      updates.push(`safety_topic = $${paramIndex++}`);
      values.push(input.safety_topic);
    }
    if (input.general_observations !== undefined) {
      updates.push(`general_observations = $${paramIndex++}`);
      values.push(input.general_observations);
    }

    values.push(BigInt(daily_report_id));

    const result = await db.$queryRawUnsafe<DailyReportRow[]>(
      `UPDATE daily_report SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      ...values
    );

    return serializeRow(result[0] as unknown as Record<string, unknown>);
  }

  /**
   * Finaliza um RDO
   * Transicao: rascunho -> finalizado
   * Apos finalizar, o RDO nao pode mais ser editado diretamente
   */
  static async finalizeDailyReport(daily_report_id: number) {
    await DailyReportsService.validateReportEditable(daily_report_id);

    const result = await db.$queryRaw<DailyReportRow[]>`
      UPDATE daily_report
      SET status = ${RDO_STATUS.FINALIZADO}, updated_at = NOW()
      WHERE id = ${BigInt(daily_report_id)}
      RETURNING *
    `;

    return serializeRow(result[0] as unknown as Record<string, unknown>);
  }

  /**
   * Aprova um RDO finalizado
   * Transicao: finalizado -> aprovado
   * ATENCAO: apos aprovacao o registro se torna COMPLETAMENTE IMUTAVEL
   * Nenhuma operacao de escrita sera aceita em status 'aprovado'
   */
  static async approveDailyReport(daily_report_id: number, approved_by_user_id: number) {
    const report = await DailyReportsService.getReportOrThrow(daily_report_id);

    if (report.status !== RDO_STATUS.FINALIZADO) {
      throw new BadRequestError(
        `Apenas RDOs com status 'finalizado' podem ser aprovados. Status atual: '${report.status}'.`
      );
    }

    const result = await db.$queryRaw<DailyReportRow[]>`
      UPDATE daily_report
      SET
        status = ${RDO_STATUS.APROVADO},
        approved_by_user_id = ${BigInt(approved_by_user_id)},
        approved_at = NOW(),
        updated_at = NOW()
      WHERE id = ${BigInt(daily_report_id)}
      RETURNING *
    `;

    return serializeRow(result[0] as unknown as Record<string, unknown>);
  }

  /**
   * Rejeita um RDO finalizado com motivo
   * Transicao: finalizado -> rejeitado (e volta status para rascunho para correcao)
   * O motivo de rejeicao fica registrado no campo rejection_reason
   */
  static async rejectDailyReport(
    daily_report_id: number,
    _rejected_by_user_id: number,
    rejection_reason: string
  ) {
    const report = await DailyReportsService.getReportOrThrow(daily_report_id);

    if (report.status !== RDO_STATUS.FINALIZADO) {
      throw new BadRequestError(
        `Apenas RDOs com status 'finalizado' podem ser rejeitados. Status atual: '${report.status}'.`
      );
    }

    // Volta para rascunho com o motivo de rejeicao registrado
    // Isso permite que o autor corrija e finalize novamente
    const result = await db.$queryRaw<DailyReportRow[]>`
      UPDATE daily_report
      SET
        status = ${RDO_STATUS.RASCUNHO},
        rejection_reason = ${rejection_reason},
        updated_at = NOW()
      WHERE id = ${BigInt(daily_report_id)}
      RETURNING *
    `;

    return serializeRow(result[0] as unknown as Record<string, unknown>);
  }

  /**
   * Retorna as datas com RDOs cadastrados para um projeto
   */
  static async getDailyReportDates(projects_id?: number) {
    if (projects_id) {
      const rows = await db.$queryRaw<{ rdo_date: Date | null; status: string | null }[]>`
        SELECT rdo_date, status
        FROM daily_report
        WHERE projects_id = ${BigInt(projects_id)}
          AND deleted_at IS NULL
        ORDER BY rdo_date DESC
      `;
      return rows.map(r => ({ date: r.rdo_date, status: r.status }));
    }

    const rows = await db.$queryRaw<{ rdo_date: Date | null; status: string | null }[]>`
      SELECT rdo_date, status
      FROM daily_report
      WHERE deleted_at IS NULL
      ORDER BY rdo_date DESC
    `;
    return rows.map(r => ({ date: r.rdo_date, status: r.status }));
  }

  // ===========================================================================
  // Mao de Obra (Workforce)
  // ===========================================================================

  /**
   * Adiciona entrada de mao de obra ao RDO
   * Requer RDO em status 'rascunho'
   */
  static async addWorkforceEntry(input: CreateWorkforceEntryInput) {
    await DailyReportsService.validateReportEditable(input.daily_report_id);

    const result = await db.$queryRaw<WorkforceRow[]>`
      INSERT INTO daily_report_workforce
        (daily_report_id, role_category, quantity_planned, quantity_present, quantity_absent, absence_reason, created_at, updated_at)
      VALUES
        (${BigInt(input.daily_report_id)},
         ${input.role_category},
         ${input.quantity_planned},
         ${input.quantity_present},
         ${input.quantity_absent ?? 0},
         ${input.absence_reason ?? null},
         NOW(), NOW())
      RETURNING *
    `;

    return serializeRow(result[0] as unknown as Record<string, unknown>);
  }

  /**
   * Atualiza entrada de mao de obra
   * Requer que o RDO pai esteja em status 'rascunho'
   */
  static async updateWorkforceEntry(entry_id: number, input: UpdateWorkforceEntryInput) {
    const entries = await db.$queryRaw<WorkforceRow[]>`
      SELECT * FROM daily_report_workforce
      WHERE id = ${BigInt(entry_id)} AND deleted_at IS NULL
    `;

    if (!entries.length) {
      throw new NotFoundError('Entrada de mao de obra nao encontrada.');
    }

    await DailyReportsService.validateReportEditable(Number(entries[0].daily_report_id));

    const updates: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.role_category !== undefined) {
      updates.push(`role_category = $${paramIndex++}`);
      values.push(input.role_category);
    }
    if (input.quantity_planned !== undefined) {
      updates.push(`quantity_planned = $${paramIndex++}`);
      values.push(input.quantity_planned);
    }
    if (input.quantity_present !== undefined) {
      updates.push(`quantity_present = $${paramIndex++}`);
      values.push(input.quantity_present);
    }
    if (input.quantity_absent !== undefined) {
      updates.push(`quantity_absent = $${paramIndex++}`);
      values.push(input.quantity_absent);
    }
    if (input.absence_reason !== undefined) {
      updates.push(`absence_reason = $${paramIndex++}`);
      values.push(input.absence_reason);
    }

    values.push(BigInt(entry_id));

    const result = await db.$queryRawUnsafe<WorkforceRow[]>(
      `UPDATE daily_report_workforce SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      ...values
    );

    return serializeRow(result[0] as unknown as Record<string, unknown>);
  }

  /**
   * Remove entrada de mao de obra (soft delete)
   * Requer que o RDO pai esteja em status 'rascunho'
   */
  static async deleteWorkforceEntry(entry_id: number) {
    const entries = await db.$queryRaw<WorkforceRow[]>`
      SELECT * FROM daily_report_workforce
      WHERE id = ${BigInt(entry_id)} AND deleted_at IS NULL
    `;

    if (!entries.length) {
      throw new NotFoundError('Entrada de mao de obra nao encontrada.');
    }

    await DailyReportsService.validateReportEditable(Number(entries[0].daily_report_id));

    await db.$executeRaw`
      UPDATE daily_report_workforce
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${BigInt(entry_id)}
    `;

    return { success: true, id: entry_id };
  }

  // ===========================================================================
  // Atividades (Activities)
  // ===========================================================================

  /**
   * Adiciona atividade executada ao RDO
   * Requer RDO em status 'rascunho'
   */
  static async addActivityEntry(input: CreateActivityEntryInput) {
    await DailyReportsService.validateReportEditable(input.daily_report_id);

    const result = await db.$queryRaw<ActivityRow[]>`
      INSERT INTO daily_report_activities
        (daily_report_id, projects_backlogs_id, description, quantity_done, unity_id, teams_id, location_description, created_at, updated_at)
      VALUES
        (${BigInt(input.daily_report_id)},
         ${input.projects_backlogs_id ? BigInt(input.projects_backlogs_id) : null},
         ${input.description},
         ${input.quantity_done ?? null},
         ${input.unity_id ? BigInt(input.unity_id) : null},
         ${input.teams_id ? BigInt(input.teams_id) : null},
         ${input.location_description ?? null},
         NOW(), NOW())
      RETURNING *
    `;

    return serializeRow(result[0] as unknown as Record<string, unknown>);
  }

  /**
   * Atualiza atividade do RDO
   * Requer que o RDO pai esteja em status 'rascunho'
   */
  static async updateActivityEntry(entry_id: number, input: UpdateActivityEntryInput) {
    const entries = await db.$queryRaw<ActivityRow[]>`
      SELECT * FROM daily_report_activities
      WHERE id = ${BigInt(entry_id)} AND deleted_at IS NULL
    `;

    if (!entries.length) {
      throw new NotFoundError('Atividade nao encontrada.');
    }

    await DailyReportsService.validateReportEditable(Number(entries[0].daily_report_id));

    const updates: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(input.description);
    }
    if ('projects_backlogs_id' in input) {
      updates.push(`projects_backlogs_id = $${paramIndex++}`);
      values.push(input.projects_backlogs_id ? BigInt(input.projects_backlogs_id) : null);
    }
    if ('quantity_done' in input) {
      updates.push(`quantity_done = $${paramIndex++}`);
      values.push(input.quantity_done ?? null);
    }
    if ('unity_id' in input) {
      updates.push(`unity_id = $${paramIndex++}`);
      values.push(input.unity_id ? BigInt(input.unity_id) : null);
    }
    if ('teams_id' in input) {
      updates.push(`teams_id = $${paramIndex++}`);
      values.push(input.teams_id ? BigInt(input.teams_id) : null);
    }
    if ('location_description' in input) {
      updates.push(`location_description = $${paramIndex++}`);
      values.push(input.location_description ?? null);
    }

    values.push(BigInt(entry_id));

    const result = await db.$queryRawUnsafe<ActivityRow[]>(
      `UPDATE daily_report_activities SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      ...values
    );

    return serializeRow(result[0] as unknown as Record<string, unknown>);
  }

  /**
   * Remove atividade (soft delete)
   * Requer que o RDO pai esteja em status 'rascunho'
   */
  static async deleteActivityEntry(entry_id: number) {
    const entries = await db.$queryRaw<ActivityRow[]>`
      SELECT * FROM daily_report_activities
      WHERE id = ${BigInt(entry_id)} AND deleted_at IS NULL
    `;

    if (!entries.length) {
      throw new NotFoundError('Atividade nao encontrada.');
    }

    await DailyReportsService.validateReportEditable(Number(entries[0].daily_report_id));

    await db.$executeRaw`
      UPDATE daily_report_activities
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${BigInt(entry_id)}
    `;

    return { success: true, id: entry_id };
  }

  // ===========================================================================
  // Ocorrencias (Occurrences)
  // ===========================================================================

  /**
   * Adiciona ocorrencia ao RDO
   * Requer RDO em status 'rascunho'
   */
  static async addOccurrenceEntry(input: CreateOccurrenceEntryInput) {
    await DailyReportsService.validateReportEditable(input.daily_report_id);

    const result = await db.$queryRaw<OccurrenceRow[]>`
      INSERT INTO daily_report_occurrences
        (daily_report_id, occurrence_type, description, start_time, end_time, duration_hours, impact_description, created_at, updated_at)
      VALUES
        (${BigInt(input.daily_report_id)},
         ${input.occurrence_type},
         ${input.description},
         ${input.start_time ?? null},
         ${input.end_time ?? null},
         ${input.duration_hours ?? null},
         ${input.impact_description ?? null},
         NOW(), NOW())
      RETURNING *
    `;

    return serializeRow(result[0] as unknown as Record<string, unknown>);
  }

  /**
   * Atualiza ocorrencia do RDO
   * Requer que o RDO pai esteja em status 'rascunho'
   */
  static async updateOccurrenceEntry(entry_id: number, input: UpdateOccurrenceEntryInput) {
    const entries = await db.$queryRaw<OccurrenceRow[]>`
      SELECT * FROM daily_report_occurrences
      WHERE id = ${BigInt(entry_id)} AND deleted_at IS NULL
    `;

    if (!entries.length) {
      throw new NotFoundError('Ocorrencia nao encontrada.');
    }

    await DailyReportsService.validateReportEditable(Number(entries[0].daily_report_id));

    const updates: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.occurrence_type !== undefined) {
      updates.push(`occurrence_type = $${paramIndex++}`);
      values.push(input.occurrence_type);
    }
    if (input.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(input.description);
    }
    if ('start_time' in input) {
      updates.push(`start_time = $${paramIndex++}`);
      values.push(input.start_time ?? null);
    }
    if ('end_time' in input) {
      updates.push(`end_time = $${paramIndex++}`);
      values.push(input.end_time ?? null);
    }
    if ('duration_hours' in input) {
      updates.push(`duration_hours = $${paramIndex++}`);
      values.push(input.duration_hours ?? null);
    }
    if ('impact_description' in input) {
      updates.push(`impact_description = $${paramIndex++}`);
      values.push(input.impact_description ?? null);
    }

    values.push(BigInt(entry_id));

    const result = await db.$queryRawUnsafe<OccurrenceRow[]>(
      `UPDATE daily_report_occurrences SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      ...values
    );

    return serializeRow(result[0] as unknown as Record<string, unknown>);
  }

  /**
   * Remove ocorrencia (soft delete)
   * Requer que o RDO pai esteja em status 'rascunho'
   */
  static async deleteOccurrenceEntry(entry_id: number) {
    const entries = await db.$queryRaw<OccurrenceRow[]>`
      SELECT * FROM daily_report_occurrences
      WHERE id = ${BigInt(entry_id)} AND deleted_at IS NULL
    `;

    if (!entries.length) {
      throw new NotFoundError('Ocorrencia nao encontrada.');
    }

    await DailyReportsService.validateReportEditable(Number(entries[0].daily_report_id));

    await db.$executeRaw`
      UPDATE daily_report_occurrences
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${BigInt(entry_id)}
    `;

    return { success: true, id: entry_id };
  }

  // ===========================================================================
  // Equipamentos (Equipment)
  // ===========================================================================

  /**
   * Adiciona equipamento utilizado ao RDO
   * Requer RDO em status 'rascunho'
   */
  static async addEquipmentEntry(input: CreateEquipmentEntryInput) {
    await DailyReportsService.validateReportEditable(input.daily_report_id);

    const result = await db.$queryRaw<EquipmentRow[]>`
      INSERT INTO daily_report_equipment
        (daily_report_id, equipaments_types_id, description, quantity, operation_hours, idle_hours, idle_reason, created_at, updated_at)
      VALUES
        (${BigInt(input.daily_report_id)},
         ${input.equipaments_types_id ? BigInt(input.equipaments_types_id) : null},
         ${input.description ?? null},
         ${input.quantity},
         ${input.operation_hours ?? null},
         ${input.idle_hours ?? null},
         ${input.idle_reason ?? null},
         NOW(), NOW())
      RETURNING *
    `;

    return serializeRow(result[0] as unknown as Record<string, unknown>);
  }

  /**
   * Atualiza equipamento do RDO
   * Requer que o RDO pai esteja em status 'rascunho'
   */
  static async updateEquipmentEntry(entry_id: number, input: UpdateEquipmentEntryInput) {
    const entries = await db.$queryRaw<EquipmentRow[]>`
      SELECT * FROM daily_report_equipment
      WHERE id = ${BigInt(entry_id)} AND deleted_at IS NULL
    `;

    if (!entries.length) {
      throw new NotFoundError('Equipamento nao encontrado.');
    }

    await DailyReportsService.validateReportEditable(Number(entries[0].daily_report_id));

    const updates: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let paramIndex = 1;

    if ('equipaments_types_id' in input) {
      updates.push(`equipaments_types_id = $${paramIndex++}`);
      values.push(input.equipaments_types_id ? BigInt(input.equipaments_types_id) : null);
    }
    if ('description' in input) {
      updates.push(`description = $${paramIndex++}`);
      values.push(input.description ?? null);
    }
    if (input.quantity !== undefined) {
      updates.push(`quantity = $${paramIndex++}`);
      values.push(input.quantity);
    }
    if ('operation_hours' in input) {
      updates.push(`operation_hours = $${paramIndex++}`);
      values.push(input.operation_hours ?? null);
    }
    if ('idle_hours' in input) {
      updates.push(`idle_hours = $${paramIndex++}`);
      values.push(input.idle_hours ?? null);
    }
    if ('idle_reason' in input) {
      updates.push(`idle_reason = $${paramIndex++}`);
      values.push(input.idle_reason ?? null);
    }

    values.push(BigInt(entry_id));

    const result = await db.$queryRawUnsafe<EquipmentRow[]>(
      `UPDATE daily_report_equipment SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      ...values
    );

    return serializeRow(result[0] as unknown as Record<string, unknown>);
  }

  /**
   * Remove equipamento (soft delete)
   * Requer que o RDO pai esteja em status 'rascunho'
   */
  static async deleteEquipmentEntry(entry_id: number) {
    const entries = await db.$queryRaw<EquipmentRow[]>`
      SELECT * FROM daily_report_equipment
      WHERE id = ${BigInt(entry_id)} AND deleted_at IS NULL
    `;

    if (!entries.length) {
      throw new NotFoundError('Equipamento nao encontrado.');
    }

    await DailyReportsService.validateReportEditable(Number(entries[0].daily_report_id));

    await db.$executeRaw`
      UPDATE daily_report_equipment
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${BigInt(entry_id)}
    `;

    return { success: true, id: entry_id };
  }
}

export default DailyReportsService;
