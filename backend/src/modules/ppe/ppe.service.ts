// =============================================================================
// INDUSTRYVIEW BACKEND - PPE Module Service
// Service do modulo de EPIs
// Tabela ppe_deliveries: delivery_date, delivered_by_user_id, return_date, condition_on_return
// Sem: status, expires_at, batch_number, returned_at - ppe_deliveries e documento legal
// Tabela task_required_ppe: tasks_template_id (nao tasks_id)
// Tabela ppe_types: sem is_active
// =============================================================================

import { db } from '../../config/database';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { buildPaginationResponse } from '../../utils/helpers';
import {
  ListPpeTypesInput,
  CreatePpeTypeInput,
  UpdatePpeTypeInput,
  ListDeliveriesInput,
  CreateDeliveryInput,
  RegisterReturnInput,
  ListTaskRequiredPpeInput,
  CreateTaskRequiredPpeInput,
} from './ppe.schema';

/**
 * PpeService - Service do modulo de EPIs
 */
export class PpeService {
  // ===========================================================================
  // PPE Types
  // ===========================================================================

  /**
   * Lista tipos de EPI por empresa
   * Campos reais: name, ca_number, validity_months, description, company_id
   * Sem: is_active
   */
  static async listPpeTypes(input: ListPpeTypesInput) {
    const whereClause: any = {
      deleted_at: null,
    };

    if (input.company_id) {
      whereClause.company_id = BigInt(input.company_id);
    }

    return db.ppe_types.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Cria tipo de EPI
   */
  static async createPpeType(input: CreatePpeTypeInput) {
    return db.ppe_types.create({
      data: {
        company_id: BigInt(input.company_id),
        name: input.name,
        ca_number: input.ca_number ?? null,
        validity_months: input.validity_months ?? null,
        description: input.description ?? null,
      },
    });
  }

  /**
   * Atualiza tipo de EPI
   */
  static async updatePpeType(id: number, input: UpdatePpeTypeInput) {
    const ppeType = await db.ppe_types.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!ppeType) {
      throw new NotFoundError('Tipo de EPI nao encontrado.');
    }

    return db.ppe_types.update({
      where: { id: BigInt(id) },
      data: {
        name: input.name,
        ca_number: input.ca_number,
        validity_months: input.validity_months,
        description: input.description,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Remove tipo de EPI (soft delete)
   */
  static async deletePpeType(id: number) {
    const ppeType = await db.ppe_types.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!ppeType) {
      throw new NotFoundError('Tipo de EPI nao encontrado.');
    }

    return db.ppe_types.update({
      where: { id: BigInt(id) },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  // ===========================================================================
  // PPE Deliveries
  // ===========================================================================

  /**
   * Lista entregas de EPI com filtros e paginacao
   * Campos reais: delivery_date (nao delivered_at), delivered_by_user_id (nao delivered_by_users_id)
   */
  static async listDeliveries(input: ListDeliveriesInput) {
    const { company_id, users_id, ppe_types_id, search, start_date, end_date, page, per_page } = input;
    const skip = (page - 1) * per_page;

    const whereClause: any = {};

    // Filtra por empresa via relacao ppe_type (ppe_deliveries nao tem company_id direto)
    if (company_id) {
      whereClause.ppe_type = {
        company_id: BigInt(company_id),
      };
    }

    if (users_id) {
      whereClause.users_id = BigInt(users_id);
    }

    if (ppe_types_id) {
      whereClause.ppe_types_id = BigInt(ppe_types_id);
    }

    // Busca por nome ou ID do colaborador
    if (search && search.trim()) {
      const searchTerm = search.trim();
      const isNumeric = /^\d+$/.test(searchTerm);
      if (isNumeric) {
        whereClause.users_id = BigInt(searchTerm);
      } else {
        whereClause.user = {
          name: { contains: searchTerm, mode: 'insensitive' },
        };
      }
    }

    if (start_date) {
      whereClause.delivery_date = {
        ...whereClause.delivery_date,
        gte: new Date(start_date),
      };
    }

    if (end_date) {
      whereClause.delivery_date = {
        ...whereClause.delivery_date,
        lte: new Date(end_date),
      };
    }

    const [items, total] = await Promise.all([
      db.ppe_deliveries.findMany({
        where: whereClause,
        include: {
          user: { select: { id: true, name: true, email: true } },
          ppe_type: true,
          delivered_by: { select: { id: true, name: true } },
        },
        orderBy: { delivery_date: 'desc' },
        skip,
        take: per_page,
      }),
      db.ppe_deliveries.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  /**
   * Cria entrega de EPI (documento legal - sem soft delete)
   * Campos: delivery_date, delivered_by_user_id (obrigatorio), quantity
   */
  static async createDelivery(input: CreateDeliveryInput, delivered_by_user_id?: number) {
    const ppeType = await db.ppe_types.findFirst({
      where: { id: BigInt(input.ppe_types_id), deleted_at: null },
    });

    if (!ppeType) {
      throw new NotFoundError('Tipo de EPI nao encontrado.');
    }

    return db.ppe_deliveries.create({
      data: {
        users_id: BigInt(input.users_id),
        ppe_types_id: BigInt(input.ppe_types_id),
        delivery_date: input.delivered_at ? new Date(input.delivered_at) : new Date(),
        quantity: input.quantity,
        delivered_by_user_id: BigInt(delivered_by_user_id ?? input.users_id),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        ppe_type: true,
      },
    });
  }

  /**
   * Registra devolucao de EPI
   * Campos: return_date, condition_on_return
   */
  static async registerReturn(id: number, input: RegisterReturnInput) {
    const delivery = await db.ppe_deliveries.findFirst({
      where: { id: BigInt(id) },
    });

    if (!delivery) {
      throw new NotFoundError('Entrega de EPI nao encontrada.');
    }

    if (delivery.return_date) {
      throw new BadRequestError('Este EPI ja foi devolvido.');
    }

    return db.ppe_deliveries.update({
      where: { id: BigInt(id) },
      data: {
        return_date: new Date(),
        condition_on_return: input.condition,
      },
      include: {
        user: { select: { id: true, name: true } },
        ppe_type: true,
      },
    });
  }

  // ===========================================================================
  // Task Required PPE
  // ===========================================================================

  /**
   * Lista EPIs obrigatorios
   * Tabela usa tasks_template_id (nao tasks_id)
   */
  static async listTaskRequiredPpe(input: ListTaskRequiredPpeInput) {
    const whereClause: any = {
      deleted_at: null,
    };

    if (input.tasks_id) {
      whereClause.tasks_template_id = BigInt(input.tasks_id);
    }

    if (input.ppe_types_id) {
      whereClause.ppe_types_id = BigInt(input.ppe_types_id);
    }

    return db.task_required_ppe.findMany({
      where: whereClause,
      include: {
        ppe_type: true,
      },
      orderBy: { created_at: 'asc' },
    });
  }

  /**
   * Cria requisito de EPI para template de tarefa
   */
  static async createTaskRequiredPpe(input: CreateTaskRequiredPpeInput) {
    // Verifica duplicata com constraint unique
    const existing = await db.task_required_ppe.findFirst({
      where: {
        tasks_template_id: BigInt(input.tasks_id),
        ppe_types_id: BigInt(input.ppe_types_id),
        deleted_at: null,
      },
    });

    if (existing) {
      throw new BadRequestError('Este tipo de EPI ja esta configurado como obrigatorio para esta tarefa.');
    }

    return db.task_required_ppe.create({
      data: {
        tasks_template_id: BigInt(input.tasks_id),
        ppe_types_id: BigInt(input.ppe_types_id),
      },
      include: {
        ppe_type: true,
      },
    });
  }

  /**
   * Remove requisito de EPI (soft delete)
   */
  static async deleteTaskRequiredPpe(id: number) {
    const record = await db.task_required_ppe.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!record) {
      throw new NotFoundError('Requisito de EPI nao encontrado.');
    }

    return db.task_required_ppe.update({
      where: { id: BigInt(id) },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  // ===========================================================================
  // User PPE Status
  // ===========================================================================

  /**
   * Retorna status completo de EPIs de um usuario
   * Enriquece com flag de devolvido e validade calculada
   */
  static async getUserPpeStatus(user_id: number) {
    const deliveries = await db.ppe_deliveries.findMany({
      where: {
        users_id: BigInt(user_id),
      },
      include: {
        ppe_type: true,
        delivered_by: { select: { id: true, name: true } },
      },
      orderBy: { delivery_date: 'desc' },
    });

    const now = new Date();

    const enrichedDeliveries = deliveries.map(delivery => {
      const isReturned = !!delivery.return_date;

      // Calcula validade baseado no tipo de EPI
      let expiryDate: Date | null = null;
      if (!isReturned && delivery.ppe_type?.validity_months) {
        expiryDate = new Date(delivery.delivery_date);
        expiryDate.setMonth(expiryDate.getMonth() + delivery.ppe_type.validity_months);
      }

      const isExpired = expiryDate ? expiryDate < now : false;

      return {
        ...delivery,
        is_returned: isReturned,
        is_expired: isExpired,
        expiry_date: expiryDate,
        days_until_expiry: expiryDate
          ? Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null,
        computed_status: isReturned ? 'devolvido' : isExpired ? 'vencido' : 'ativo',
      };
    });

    return {
      user_id,
      total_deliveries: deliveries.length,
      active: enrichedDeliveries.filter(d => d.computed_status === 'ativo').length,
      expired: enrichedDeliveries.filter(d => d.computed_status === 'vencido').length,
      returned: enrichedDeliveries.filter(d => d.computed_status === 'devolvido').length,
      deliveries: enrichedDeliveries,
    };
  }
}

export default PpeService;
