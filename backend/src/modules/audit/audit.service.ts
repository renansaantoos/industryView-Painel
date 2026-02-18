// =============================================================================
// INDUSTRYVIEW BACKEND - Audit Module Service
// Service do modulo de auditoria / logs de acoes do sistema
// Tabela: audit_log (enum audit_action: create, update, delete, status_change, approval)
// =============================================================================

import { db } from '../../config/database';
import { buildPaginationResponse } from '../../utils/helpers';
import { ListLogsInput, GetLogsByRecordInput } from './audit.schema';

/**
 * AuditService - Service do modulo de auditoria
 *
 * Este service pode ser importado e utilizado por outros services para
 * registrar acoes criticas de forma assincrona.
 */
export class AuditService {
  /**
   * Registra uma acao no log de auditoria
   * Pode ser chamado de qualquer outro service para rastreabilidade
   *
   * @example
   *   await AuditService.logAction({
   *     table_name: 'work_permits',
   *     record_id: 123,
   *     action: 'status_change',
   *     old_values: { status: 'rascunho' },
   *     new_values: { status: 'aprovada' },
   *     users_id: req.auth.id,
   *     ip_address: req.ip,
   *   });
   */
  static async logAction(params: {
    table_name: string;
    record_id: number;
    action: 'create' | 'update' | 'delete' | 'status_change' | 'approval';
    old_values?: Record<string, unknown>;
    new_values?: Record<string, unknown>;
    users_id: number;
    ip_address?: string;
  }): Promise<void> {
    try {
      await db.audit_log.create({
        data: {
          table_name: params.table_name,
          record_id: BigInt(params.record_id),
          action: params.action,
          old_values: params.old_values ? (params.old_values as any) : undefined,
          new_values: params.new_values ? (params.new_values as any) : undefined,
          users_id: BigInt(params.users_id),
          ip_address: params.ip_address ?? null,
        },
      });
    } catch (err) {
      // Nunca deixa o log de auditoria quebrar a operacao principal
      console.error('[AuditService] Falha ao registrar log de auditoria:', err);
    }
  }

  /**
   * Lista logs de auditoria com filtros e paginacao
   */
  static async listLogs(input: ListLogsInput) {
    const { table_name, record_id, users_id, action, start_date, end_date, page, per_page } = input;
    const company_id = (input as any).company_id;
    const skip = (page - 1) * per_page;

    const whereClause: any = {};

    if (table_name) {
      whereClause.table_name = table_name;
    }

    if (record_id) {
      whereClause.record_id = BigInt(record_id);
    }

    if (users_id) {
      whereClause.users_id = BigInt(users_id);
    }

    // Isolamento multi-tenant: filtra logs de usuarios da empresa
    if (company_id) {
      whereClause.user = { company_id: BigInt(company_id) };
    }

    if (action) {
      whereClause.action = action;
    }

    if (start_date) {
      whereClause.created_at = {
        ...whereClause.created_at,
        gte: new Date(start_date),
      };
    }

    if (end_date) {
      whereClause.created_at = {
        ...whereClause.created_at,
        lte: new Date(end_date),
      };
    }

    const [items, total] = await Promise.all([
      db.audit_log.findMany({
        where: whereClause,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: per_page,
      }),
      db.audit_log.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  /**
   * Busca todos os logs de um registro especifico em uma tabela
   * Util para mostrar historico de alteracoes de um recurso
   */
  static async getLogsByRecord(input: GetLogsByRecordInput) {
    const { table_name, record_id } = input;

    return db.audit_log.findMany({
      where: {
        table_name,
        record_id: BigInt(record_id),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }
}

export default AuditService;
