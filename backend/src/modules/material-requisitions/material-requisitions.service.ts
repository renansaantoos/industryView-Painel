// =============================================================================
// INDUSTRYVIEW BACKEND - Material Requisitions Module Service
// Fluxo: rascunho -> submetida -> aprovada -> atendida
// Campos reais: description (nao title), needed_by_date, created_by_user_id, approved_by_user_id
// Item: product_description, unity, quantity_requested, quantity_approved, quantity_delivered
// =============================================================================

import { db } from '../../config/database';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { buildPaginationResponse } from '../../utils/helpers';
import {
  ListRequisitionsInput,
  CreateRequisitionInput,
  UpdateRequisitionInput,
  ApproveRequisitionInput,
  RejectRequisitionInput,
} from './material-requisitions.schema';

/**
 * MaterialRequisitionsService - Service do modulo de requisicoes de materiais
 */
export class MaterialRequisitionsService {
  /**
   * Lista requisicoes de materiais com paginacao e filtros
   */
  static async listRequisitions(input: ListRequisitionsInput) {
    const { projects_id, status, requested_by_users_id, page, per_page } = input;
    const company_id = (input as any).company_id;
    const skip = (page - 1) * per_page;

    const whereClause: any = {
      deleted_at: null,
    };

    if (projects_id) {
      whereClause.projects_id = BigInt(projects_id);
    }

    // Isolamento multi-tenant via projects.company_id
    if (company_id && !projects_id) {
      whereClause.projects = { company_id: BigInt(company_id) };
    }

    if (status) {
      whereClause.status = status;
    }

    if (requested_by_users_id) {
      whereClause.created_by_user_id = BigInt(requested_by_users_id);
    }

    const [items, total] = await Promise.all([
      db.material_requisitions.findMany({
        where: whereClause,
        include: {
          projects: { select: { id: true, name: true } },
          created_by: { select: { id: true, name: true } },
          approved_by: { select: { id: true, name: true } },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: per_page,
      }),
      db.material_requisitions.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  /**
   * Busca requisicao por ID com itens
   */
  static async getRequisitionById(id: number) {
    const requisition = await db.material_requisitions.findFirst({
      where: { id: BigInt(id), deleted_at: null },
      include: {
        projects: { select: { id: true, name: true } },
        created_by: { select: { id: true, name: true, email: true } },
        approved_by: { select: { id: true, name: true } },
        items: {
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!requisition) {
      throw new NotFoundError('Requisicao de material nao encontrada.');
    }

    return requisition;
  }

  /**
   * Cria requisicao com itens em transacao
   * Gera requisition_number automaticamente
   */
  static async createRequisition(input: CreateRequisitionInput, created_by_user_id?: number) {
    if (!created_by_user_id) {
      throw new BadRequestError('created_by_user_id e obrigatorio para criar uma requisicao.');
    }

    // Gera proximo numero de requisicao
    const lastReq = await db.material_requisitions.findFirst({
      where: { projects_id: BigInt(input.projects_id) },
      orderBy: { requisition_number: 'desc' },
      select: { requisition_number: true },
    });

    const nextNum = parseInt((lastReq?.requisition_number ?? 'REQ-0000').split('-')[1] ?? '0', 10) + 1;
    const requisition_number = `REQ-${String(nextNum).padStart(4, '0')}`;

    return db.$transaction(async (tx) => {
      const requisition = await tx.material_requisitions.create({
        data: {
          projects_id: BigInt(input.projects_id),
          requisition_number,
          description: input.title ?? null,
          needed_by_date: input.required_by_date ? new Date(input.required_by_date) : null,
          priority: input.priority ?? 'normal',
          created_by_user_id: BigInt(created_by_user_id),
          status: 'rascunho',
        },
      });

      for (const item of input.items) {
        await tx.material_requisition_items.create({
          data: {
            material_requisitions_id: requisition.id,
            product_description: item.description,
            quantity_requested: item.quantity_requested,
            unity: item.unit ?? null,
            observations: item.notes ?? null,
          },
        });
      }

      return tx.material_requisitions.findFirst({
        where: { id: requisition.id },
        include: { items: true },
      });
    });
  }

  /**
   * Atualiza requisicao (apenas se status = rascunho)
   */
  static async updateRequisition(id: number, input: UpdateRequisitionInput) {
    const requisition = await db.material_requisitions.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!requisition) {
      throw new NotFoundError('Requisicao de material nao encontrada.');
    }

    if (requisition.status !== 'rascunho') {
      throw new BadRequestError(
        `Apenas requisicoes com status "rascunho" podem ser editadas. Status atual: "${requisition.status}".`
      );
    }

    return db.$transaction(async (tx) => {
      if (input.items) {
        // Remove itens existentes (hard delete pois nao tem deleted_at na tabela de itens)
        await tx.material_requisition_items.deleteMany({
          where: { material_requisitions_id: BigInt(id) },
        });

        // Cria novos itens
        for (const item of input.items) {
          await tx.material_requisition_items.create({
            data: {
              material_requisitions_id: BigInt(id),
              product_description: item.description,
              quantity_requested: item.quantity_requested,
              unity: item.unit ?? null,
              observations: item.notes ?? null,
            },
          });
        }
      }

      return tx.material_requisitions.update({
        where: { id: BigInt(id) },
        data: {
          description: input.title,
          needed_by_date: input.required_by_date ? new Date(input.required_by_date) : undefined,
          priority: input.priority,
          updated_at: new Date(),
        },
        include: { items: true },
      });
    });
  }

  /**
   * Submete requisicao para aprovacao (rascunho -> submetida)
   */
  static async submitRequisition(id: number) {
    const requisition = await db.material_requisitions.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!requisition) {
      throw new NotFoundError('Requisicao de material nao encontrada.');
    }

    if (requisition.status !== 'rascunho') {
      throw new BadRequestError(
        `Apenas requisicoes com status "rascunho" podem ser submetidas. Status atual: "${requisition.status}".`
      );
    }

    return db.material_requisitions.update({
      where: { id: BigInt(id) },
      data: {
        status: 'submetida',
        updated_at: new Date(),
      },
    });
  }

  /**
   * Aprova requisicao (submetida -> aprovada)
   */
  static async approveRequisition(id: number, _input: ApproveRequisitionInput, approved_by_user_id?: number) {
    const requisition = await db.material_requisitions.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!requisition) {
      throw new NotFoundError('Requisicao de material nao encontrada.');
    }

    if (requisition.status !== 'submetida') {
      throw new BadRequestError(
        `Apenas requisicoes com status "submetida" podem ser aprovadas. Status atual: "${requisition.status}".`
      );
    }

    return db.material_requisitions.update({
      where: { id: BigInt(id) },
      data: {
        status: 'aprovada',
        approved_by_user_id: approved_by_user_id ? BigInt(approved_by_user_id) : null,
        approved_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  /**
   * Rejeita requisicao (submetida -> rejeitada)
   */
  static async rejectRequisition(id: number, _input: RejectRequisitionInput) {
    const requisition = await db.material_requisitions.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!requisition) {
      throw new NotFoundError('Requisicao de material nao encontrada.');
    }

    if (requisition.status !== 'submetida') {
      throw new BadRequestError(
        `Apenas requisicoes com status "submetida" podem ser rejeitadas. Status atual: "${requisition.status}".`
      );
    }

    return db.material_requisitions.update({
      where: { id: BigInt(id) },
      data: {
        status: 'rejeitada',
        updated_at: new Date(),
      },
    });
  }
}

export default MaterialRequisitionsService;
