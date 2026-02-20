// =============================================================================
// INDUSTRYVIEW BACKEND - Health Module Service
// Service do modulo de saude ocupacional
// Tabela worker_health_records: sem deleted_at, relacao 'user' (singular)
// Campo expiry_date (nao expires_at), exam_type e enum
// =============================================================================

import { db } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { buildPaginationResponse } from '../../utils/helpers';
import {
  ListHealthRecordsInput,
  GetExpiringExamsInput,
  CreateHealthRecordInput,
  UpdateHealthRecordInput,
} from './health.schema';

/**
 * HealthService - Service do modulo de saude ocupacional
 */
export class HealthService {
  /**
   * Lista registros de saude com paginacao e filtros
   */
  static async listRecords(input: ListHealthRecordsInput) {
    const { users_id, exam_type, page, per_page } = input;
    const company_id = (input as any).company_id;
    const skip = (page - 1) * per_page;

    const whereClause: any = {};

    if (users_id) {
      whereClause.users_id = BigInt(users_id);
    }

    if (exam_type) {
      whereClause.exam_type = exam_type;
    }

    // Isolamento multi-tenant: filtra por funcionarios da empresa
    if (company_id) {
      whereClause.user = { company_id: BigInt(company_id) };
    }

    const [items, total] = await Promise.all([
      db.worker_health_records.findMany({
        where: whereClause,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { exam_date: 'desc' },
        skip,
        take: per_page,
      }),
      db.worker_health_records.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  /**
   * Lista exames que vencem nos proximos N dias
   * Campo real: expiry_date (nao expires_at)
   */
  static async getExpiringExams(input: GetExpiringExamsInput) {
    const { days } = input;
    const now = new Date();
    const limitDate = new Date(now);
    limitDate.setDate(limitDate.getDate() + days);

    const records = await db.worker_health_records.findMany({
      where: {
        expiry_date: {
          gte: now,
          lte: limitDate,
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { expiry_date: 'asc' },
    });

    return records.map(record => ({
      ...record,
      days_until_expiry: record.expiry_date
        ? Math.ceil((record.expiry_date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null,
    }));
  }

  /**
   * Busca registro de saude por ID
   */
  static async getRecordById(id: number) {
    const record = await db.worker_health_records.findFirst({
      where: { id: BigInt(id) },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!record) {
      throw new NotFoundError('Registro de saude nao encontrado.');
    }

    return record;
  }

  /**
   * Cria registro de saude ocupacional
   * exam_type usa valores do enum: admissional, periodico, retorno_trabalho, mudanca_funcao, demissional
   */
  static async createRecord(input: CreateHealthRecordInput) {
    return db.worker_health_records.create({
      data: {
        users_id: BigInt(input.users_id),
        exam_type: input.exam_type as any,
        exam_date: new Date(input.exam_date),
        expiry_date: input.expiry_date ? new Date(input.expiry_date) : null,
        result: input.result ?? 'apto',
        restrictions: input.restrictions ?? null,
        physician_name: input.physician_name ?? null,
        physician_crm: input.physician_crm ?? null,
        file_url: input.file_url ?? null,
        observation: input.observation ?? null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Atualiza registro de saude
   */
  static async updateRecord(id: number, input: UpdateHealthRecordInput) {
    const record = await db.worker_health_records.findFirst({
      where: { id: BigInt(id) },
    });

    if (!record) {
      throw new NotFoundError('Registro de saude nao encontrado.');
    }

    return db.worker_health_records.update({
      where: { id: BigInt(id) },
      data: {
        exam_type: input.exam_type as any,
        exam_date: input.exam_date ? new Date(input.exam_date) : undefined,
        expiry_date: input.expiry_date ? new Date(input.expiry_date) : undefined,
        result: input.result,
        restrictions: input.restrictions,
        physician_name: input.physician_name,
        physician_crm: input.physician_crm,
        file_url: input.file_url,
        observation: input.observation,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Remove registro de saude (hard delete - tabela nao tem deleted_at)
   */
  static async deleteRecord(id: number) {
    const record = await db.worker_health_records.findFirst({
      where: { id: BigInt(id) },
    });

    if (!record) {
      throw new NotFoundError('Registro de saude nao encontrado.');
    }

    return db.worker_health_records.delete({
      where: { id: BigInt(id) },
    });
  }

  /**
   * Verifica aptidao de um trabalhador com base nos exames registrados
   */
  static async checkWorkerFitness(user_id: number) {
    const now = new Date();

    const records = await db.worker_health_records.findMany({
      where: {
        users_id: BigInt(user_id),
      },
      orderBy: { exam_date: 'desc' },
    });

    if (records.length === 0) {
      return {
        user_id,
        is_fit: false,
        fitness_status: 'sem_exames',
        reason: 'Nenhum exame medico encontrado no sistema.',
        records: [],
      };
    }

    // Verifica exames vencidos (expiry_date no passado)
    const expiredRecords = records.filter(
      r => r.expiry_date && r.expiry_date < now
    );

    // Exames validos
    const validRecords = records.filter(
      r => r.result === 'apto' && (!r.expiry_date || r.expiry_date >= now)
    );

    const hasRestrictions = records.some(r => r.result === 'apto_com_restricoes');
    const inaptRecords = records.filter(r => r.result === 'inapto');

    let is_fit = inaptRecords.length === 0 && expiredRecords.length === 0 && validRecords.length > 0;
    let fitness_status = 'apto';

    if (inaptRecords.length > 0) {
      fitness_status = 'inapto';
      is_fit = false;
    } else if (expiredRecords.length > 0) {
      fitness_status = 'exames_vencidos';
      is_fit = false;
    } else if (hasRestrictions) {
      fitness_status = 'apto_com_restricoes';
      is_fit = true;
    }

    return {
      user_id,
      is_fit,
      fitness_status,
      valid_exams: validRecords.length,
      expired_exams: expiredRecords.length,
      inapt_exams: inaptRecords.length,
      records: records.map(r => ({
        ...r,
        is_expired: r.expiry_date ? r.expiry_date < now : false,
        days_until_expiry: r.expiry_date
          ? Math.ceil((r.expiry_date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null,
      })),
    };
  }
}

export default HealthService;
