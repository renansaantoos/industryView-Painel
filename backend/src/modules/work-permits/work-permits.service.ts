// =============================================================================
// INDUSTRYVIEW BACKEND - Work Permits Module Service
// Service do modulo de permissoes de trabalho (PTW)
// Tabela work_permits: permit_number, permit_type (enum), risk_description, control_measures
// location_description, requested_by_user_id, approved_by_user_id, closed_by_user_id
// enum permit_status: solicitada, aprovada, ativa, encerrada, cancelada
// enum permit_type: pt_geral, pt_quente, pt_altura, pt_confinado, pt_eletrica
// Signatures: sem deleted_at, sem signature_data, signature_type (string)
// =============================================================================

import { db } from '../../config/database';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { buildPaginationResponse } from '../../utils/helpers';
import {
  ListPermitsInput,
  CreatePermitInput,
  UpdatePermitInput,
  AddSignatureInput,
} from './work-permits.schema';

/**
 * WorkPermitsService - Service do modulo de permissoes de trabalho
 */
export class WorkPermitsService {
  // ===========================================================================
  // List / Get
  // ===========================================================================

  /**
   * Lista permissoes de trabalho com paginacao e filtros
   */
  static async listPermits(input: ListPermitsInput) {
    const { projects_id, status, permit_type, page, per_page } = input;
    const company_id = (input as any).company_id;
    const skip = (page - 1) * per_page;

    const whereClause: any = {};

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

    if (permit_type) {
      whereClause.permit_type = permit_type;
    }

    const [items, total] = await Promise.all([
      db.work_permits.findMany({
        where: whereClause,
        include: {
          projects: { select: { id: true, name: true } },
          signatures: {
            include: {
              user: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: per_page,
      }),
      db.work_permits.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  /**
   * Busca permissao de trabalho por ID
   */
  static async getPermitById(id: number) {
    const permit = await db.work_permits.findFirst({
      where: { id: BigInt(id) },
      include: {
        projects: { select: { id: true, name: true } },
        signatures: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!permit) {
      throw new NotFoundError('Permissao de trabalho nao encontrada.');
    }

    return permit;
  }

  /**
   * Retorna permissoes ativas (valid_until > now) de um projeto
   * status = ativa ou aprovada
   */
  static async getActivePermits(projects_id: number) {
    const now = new Date();

    return db.work_permits.findMany({
      where: {
        projects_id: BigInt(projects_id),
        status: { in: ['ativa' as any, 'aprovada' as any] },
        valid_until: { gt: now },
      },
      include: {
        signatures: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { valid_until: 'asc' },
    });
  }

  // ===========================================================================
  // Create
  // ===========================================================================

  /**
   * Cria permissao de trabalho com numero auto-gerado (PT-YYYY-NNN)
   * permit_type usa enum: pt_geral, pt_quente, pt_altura, pt_confinado, pt_eletrica
   */
  static async createPermit(input: CreatePermitInput, requested_by_user_id?: number) {
    if (!requested_by_user_id) {
      throw new BadRequestError('requested_by_user_id e obrigatorio.');
    }

    const year = new Date().getFullYear();

    const countThisYear = await db.work_permits.count({
      where: {
        permit_number: { startsWith: `PT-${year}-` },
      },
    });

    const sequence = String(countThisYear + 1).padStart(3, '0');
    const permit_number = `PT-${year}-${sequence}`;

    return db.work_permits.create({
      data: {
        permit_number,
        projects_id: BigInt(input.projects_id),
        permit_type: input.permit_type as any,
        risk_description: input.risk_description,
        control_measures: input.control_measures,
        location_description: input.location ?? null,
        emergency_procedures: input.observations ?? null,
        valid_from: new Date(input.valid_from),
        valid_until: new Date(input.valid_until),
        requested_by_user_id: BigInt(requested_by_user_id),
        status: 'solicitada',
      },
    });
  }

  // ===========================================================================
  // Update
  // ===========================================================================

  /**
   * Atualiza permissao de trabalho (restrito a status solicitada)
   */
  static async updatePermit(id: number, input: UpdatePermitInput) {
    const permit = await db.work_permits.findFirst({
      where: { id: BigInt(id) },
    });

    if (!permit) {
      throw new NotFoundError('Permissao de trabalho nao encontrada.');
    }

    const lockedStatuses = ['aprovada', 'ativa', 'cancelada', 'encerrada'];
    if (lockedStatuses.includes(permit.status ?? '')) {
      throw new BadRequestError(
        `Nao e possivel editar uma permissao com status "${permit.status}".`
      );
    }

    return db.work_permits.update({
      where: { id: BigInt(id) },
      data: {
        permit_type: input.permit_type as any,
        risk_description: input.risk_description,
        control_measures: input.control_measures,
        location_description: input.location,
        emergency_procedures: input.observations,
        valid_from: input.valid_from ? new Date(input.valid_from) : undefined,
        valid_until: input.valid_until ? new Date(input.valid_until) : undefined,
        updated_at: new Date(),
      },
    });
  }

  // ===========================================================================
  // Status transitions
  // ===========================================================================

  /**
   * Aprova permissao de trabalho (solicitada -> aprovada)
   */
  static async approvePermit(id: number, user_id: number) {
    const permit = await db.work_permits.findFirst({
      where: { id: BigInt(id) },
    });

    if (!permit) {
      throw new NotFoundError('Permissao de trabalho nao encontrada.');
    }

    if (permit.status !== 'solicitada') {
      throw new BadRequestError(
        `Apenas permissoes com status "solicitada" podem ser aprovadas. Status atual: "${permit.status}".`
      );
    }

    return db.work_permits.update({
      where: { id: BigInt(id) },
      data: {
        status: 'aprovada',
        approved_by_user_id: BigInt(user_id),
        updated_at: new Date(),
      },
    });
  }

  /**
   * Encerra permissao de trabalho (aprovada/ativa -> encerrada)
   */
  static async closePermit(id: number, user_id: number) {
    const permit = await db.work_permits.findFirst({
      where: { id: BigInt(id) },
    });

    if (!permit) {
      throw new NotFoundError('Permissao de trabalho nao encontrada.');
    }

    const allowedStatuses = ['aprovada', 'ativa'];
    if (!allowedStatuses.includes(permit.status ?? '')) {
      throw new BadRequestError(
        `Apenas permissoes aprovadas ou ativas podem ser encerradas. Status atual: "${permit.status}".`
      );
    }

    return db.work_permits.update({
      where: { id: BigInt(id) },
      data: {
        status: 'encerrada',
        closed_by_user_id: BigInt(user_id),
        closed_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  /**
   * Cancela permissao de trabalho
   */
  static async cancelPermit(id: number) {
    const permit = await db.work_permits.findFirst({
      where: { id: BigInt(id) },
    });

    if (!permit) {
      throw new NotFoundError('Permissao de trabalho nao encontrada.');
    }

    if (permit.status === 'encerrada') {
      throw new BadRequestError('Nao e possivel cancelar uma permissao ja encerrada.');
    }

    if (permit.status === 'cancelada') {
      throw new BadRequestError('Permissao ja esta cancelada.');
    }

    return db.work_permits.update({
      where: { id: BigInt(id) },
      data: {
        status: 'cancelada',
        updated_at: new Date(),
      },
    });
  }

  // ===========================================================================
  // Signatures
  // ===========================================================================

  /**
   * Adiciona assinatura a uma permissao de trabalho
   * Tabela work_permit_signatures: role, signature_type (string, default 'digital')
   * Sem deleted_at, sem signature_data
   */
  static async addSignature(input: AddSignatureInput) {
    const permit = await db.work_permits.findFirst({
      where: { id: BigInt(input.permit_id) },
    });

    if (!permit) {
      throw new NotFoundError('Permissao de trabalho nao encontrada.');
    }

    if (permit.status === 'cancelada' || permit.status === 'encerrada') {
      throw new BadRequestError(
        `Nao e possivel adicionar assinaturas em permissoes com status "${permit.status}".`
      );
    }

    // Verifica se usuario ja assinou neste papel
    const existingSignature = await db.work_permit_signatures.findFirst({
      where: {
        work_permits_id: BigInt(input.permit_id),
        users_id: BigInt(input.user_id),
        role: input.role,
      },
    });

    if (existingSignature) {
      throw new BadRequestError('Usuario ja assinou esta permissao neste papel.');
    }

    return db.work_permit_signatures.create({
      data: {
        work_permits_id: BigInt(input.permit_id),
        users_id: BigInt(input.user_id),
        role: input.role,
        signature_type: 'digital',
        signed_at: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }
}

export default WorkPermitsService;
