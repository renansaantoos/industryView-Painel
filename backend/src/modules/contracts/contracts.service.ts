// =============================================================================
// INDUSTRYVIEW BACKEND - Contracts Module Service
// Service do modulo de contratos (Medicoes e Reivindicacoes)
// Tabela contract_measurements: measurement_period_start/end, items (relacao), total_value (Decimal)
// Tabela contract_claims: claimed_value, approved_value, evidences (relacao via claim_evidences)
// claim_number e measurement_number sao gerados automaticamente
// =============================================================================

import { db } from '../../config/database';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { buildPaginationResponse } from '../../utils/helpers';
import {
  ListMeasurementsInput,
  CreateMeasurementInput,
  UpdateMeasurementInput,
  ListClaimsInput,
  CreateClaimInput,
  UpdateClaimInput,
  CloseClaimInput,
  AddClaimEvidenceInput,
} from './contracts.schema';

/**
 * ContractsService - Service do modulo de contratos
 */
export class ContractsService {
  // ===========================================================================
  // Measurements
  // ===========================================================================

  /**
   * Lista medicoes de um projeto com paginacao
   */
  static async listMeasurements(input: ListMeasurementsInput) {
    const { projects_id, status, page, per_page } = input;
    const company_id = (input as any).company_id;
    const skip = (page - 1) * per_page;

    const whereClause: any = {
      deleted_at: null,
      projects_id: BigInt(projects_id),
    };

    // Isolamento multi-tenant: garante que o projeto pertence a empresa do usuario
    if (company_id) {
      whereClause.projects = { company_id: BigInt(company_id) };
    }

    if (status) {
      whereClause.status = status;
    }

    const [items, total] = await Promise.all([
      db.contract_measurements.findMany({
        where: whereClause,
        include: {
          projects: { select: { id: true, name: true } },
          created_by: { select: { id: true, name: true } },
        },
        orderBy: { measurement_period_start: 'desc' },
        skip,
        take: per_page,
      }),
      db.contract_measurements.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  /**
   * Busca medicao por ID com itens
   * Relacao de itens e 'items' (measurement_items)
   */
  static async getMeasurementById(id: number) {
    const measurement = await db.contract_measurements.findFirst({
      where: { id: BigInt(id), deleted_at: null },
      include: {
        projects: { select: { id: true, name: true } },
        created_by: { select: { id: true, name: true } },
        items: {
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!measurement) {
      throw new NotFoundError('Medicao nao encontrada.');
    }

    return measurement;
  }

  /**
   * Cria medicao com itens em transacao
   * created_by_user_id e obrigatorio (users_id do autor)
   */
  static async createMeasurement(input: CreateMeasurementInput, created_by_user_id?: number) {
    if (!created_by_user_id) {
      throw new BadRequestError('created_by_user_id e obrigatorio para criar uma medicao.');
    }

    const totalValue = input.items.reduce(
      (acc, item) => acc + item.quantity * item.unit_price,
      0
    );

    // Calcula proximo measurement_number do projeto
    const lastMeasurement = await db.contract_measurements.findFirst({
      where: { projects_id: BigInt(input.projects_id) },
      orderBy: { measurement_number: 'desc' },
      select: { measurement_number: true },
    });

    const measurement_number = (lastMeasurement?.measurement_number ?? 0) + 1;

    return db.$transaction(async (tx) => {
      const measurement = await tx.contract_measurements.create({
        data: {
          projects_id: BigInt(input.projects_id),
          measurement_number,
          measurement_period_start: new Date(input.period_start ?? input.measurement_date),
          measurement_period_end: new Date(input.period_end ?? input.measurement_date),
          total_value: totalValue,
          status: 'rascunho',
          created_by_user_id: BigInt(created_by_user_id),
          observations: input.notes ?? null,
        },
      });

      // Cria itens da medicao
      for (const item of input.items) {
        await tx.measurement_items.create({
          data: {
            contract_measurements_id: measurement.id,
            description: item.description,
            unity: item.unit ?? null,
            quantity_measured: item.quantity,
            unit_price: item.unit_price,
            total_price: item.quantity * item.unit_price,
          },
        });
      }

      return tx.contract_measurements.findFirst({
        where: { id: measurement.id },
        include: {
          items: true,
        },
      });
    });
  }

  /**
   * Atualiza medicao (apenas se status = rascunho)
   */
  static async updateMeasurement(id: number, input: UpdateMeasurementInput) {
    const measurement = await db.contract_measurements.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!measurement) {
      throw new NotFoundError('Medicao nao encontrada.');
    }

    if (measurement.status !== 'rascunho') {
      throw new BadRequestError(
        `Apenas medicoes com status "rascunho" podem ser editadas. Status atual: "${measurement.status}".`
      );
    }

    return db.$transaction(async (tx) => {
      let totalValue = Number(measurement.total_value ?? 0);

      if (input.items) {
        totalValue = input.items.reduce(
          (acc, item) => acc + item.quantity * item.unit_price,
          0
        );

        // Remove todos os itens existentes e recria
        await tx.measurement_items.deleteMany({
          where: { contract_measurements_id: BigInt(id) },
        });

        for (const item of input.items) {
          await tx.measurement_items.create({
            data: {
              contract_measurements_id: BigInt(id),
              description: item.description,
              unity: item.unit ?? null,
              quantity_measured: item.quantity,
              unit_price: item.unit_price,
              total_price: item.quantity * item.unit_price,
            },
          });
        }
      }

      return tx.contract_measurements.update({
        where: { id: BigInt(id) },
        data: {
          measurement_period_start: input.period_start ? new Date(input.period_start) : undefined,
          measurement_period_end: input.period_end ? new Date(input.period_end) : undefined,
          total_value: totalValue,
          observations: input.notes,
          updated_at: new Date(),
        },
        include: {
          items: true,
        },
      });
    });
  }

  /**
   * Submete medicao para aprovacao (rascunho -> submetida)
   */
  static async submitMeasurement(id: number) {
    const measurement = await db.contract_measurements.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!measurement) {
      throw new NotFoundError('Medicao nao encontrada.');
    }

    if (measurement.status !== 'rascunho') {
      throw new BadRequestError(
        `Apenas medicoes com status "rascunho" podem ser submetidas. Status atual: "${measurement.status}".`
      );
    }

    return db.contract_measurements.update({
      where: { id: BigInt(id) },
      data: {
        status: 'submetida',
        updated_at: new Date(),
      },
    });
  }

  /**
   * Aprova medicao (submetida -> aprovada)
   */
  static async approveMeasurement(id: number) {
    const measurement = await db.contract_measurements.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!measurement) {
      throw new NotFoundError('Medicao nao encontrada.');
    }

    if (measurement.status !== 'submetida') {
      throw new BadRequestError(
        `Apenas medicoes com status "submetida" podem ser aprovadas. Status atual: "${measurement.status}".`
      );
    }

    return db.contract_measurements.update({
      where: { id: BigInt(id) },
      data: {
        status: 'aprovada',
        approved_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  /**
   * Rejeita medicao (submetida -> rejeitada)
   */
  static async rejectMeasurement(id: number) {
    const measurement = await db.contract_measurements.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!measurement) {
      throw new NotFoundError('Medicao nao encontrada.');
    }

    if (measurement.status !== 'submetida') {
      throw new BadRequestError(
        `Apenas medicoes com status "submetida" podem ser rejeitadas. Status atual: "${measurement.status}".`
      );
    }

    return db.contract_measurements.update({
      where: { id: BigInt(id) },
      data: {
        status: 'rejeitada',
        updated_at: new Date(),
      },
    });
  }

  // ===========================================================================
  // Claims
  // ===========================================================================

  /**
   * Lista reivindicacoes de um projeto com paginacao
   */
  static async listClaims(input: ListClaimsInput) {
    const { projects_id, status, page, per_page } = input;
    const company_id = (input as any).company_id;
    const skip = (page - 1) * per_page;

    const whereClause: any = {
      deleted_at: null,
      projects_id: BigInt(projects_id),
    };

    // Isolamento multi-tenant: garante que o projeto pertence a empresa do usuario
    if (company_id) {
      whereClause.projects = { company_id: BigInt(company_id) };
    }

    if (status) {
      whereClause.status = status;
    }

    const [items, total] = await Promise.all([
      db.contract_claims.findMany({
        where: whereClause,
        include: {
          projects: { select: { id: true, name: true } },
          created_by: { select: { id: true, name: true } },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: per_page,
      }),
      db.contract_claims.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  /**
   * Busca reivindicacao por ID com evidencias
   * Relacao: evidences (claim_evidences)
   */
  static async getClaimById(id: number) {
    const claim = await db.contract_claims.findFirst({
      where: { id: BigInt(id), deleted_at: null },
      include: {
        projects: { select: { id: true, name: true } },
        created_by: { select: { id: true, name: true } },
        closed_by: { select: { id: true, name: true } },
        evidences: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!claim) {
      throw new NotFoundError('Reivindicacao nao encontrada.');
    }

    return claim;
  }

  /**
   * Cria reivindicacao
   * Campos reais: claimed_value (nao value_requested), claim_number (auto)
   */
  static async createClaim(input: CreateClaimInput, created_by_user_id?: number) {
    if (!created_by_user_id) {
      throw new BadRequestError('created_by_user_id e obrigatorio para criar uma reivindicacao.');
    }

    // Gera proximo claim_number do projeto
    const lastClaim = await db.contract_claims.findFirst({
      where: { projects_id: BigInt(input.projects_id) },
      orderBy: { claim_number: 'desc' },
      select: { claim_number: true },
    });

    // claim_number e string no schema, ex: CLM-001
    const nextNum = parseInt((lastClaim?.claim_number ?? 'CLM-000').split('-')[1] ?? '0', 10) + 1;
    const claim_number = `CLM-${String(nextNum).padStart(3, '0')}`;

    return db.contract_claims.create({
      data: {
        projects_id: BigInt(input.projects_id),
        claim_number,
        title: input.title,
        description: input.description,
        claim_type: input.claim_type ?? 'geral',
        claimed_value: input.value_requested ?? null,
        status: 'aberta',
        created_by_user_id: BigInt(created_by_user_id),
      },
      include: {
        projects: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Atualiza reivindicacao (apenas se status em aberto/em_analise)
   */
  static async updateClaim(id: number, input: UpdateClaimInput) {
    const claim = await db.contract_claims.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!claim) {
      throw new NotFoundError('Reivindicacao nao encontrada.');
    }

    const lockedStatuses = ['encerrada', 'aceita', 'rejeitada'];
    if (lockedStatuses.includes(claim.status ?? '')) {
      throw new BadRequestError(
        `Nao e possivel editar uma reivindicacao com status "${claim.status}".`
      );
    }

    return db.contract_claims.update({
      where: { id: BigInt(id) },
      data: {
        title: input.title,
        description: input.description,
        claim_type: input.claim_type,
        claimed_value: input.value_requested,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Fecha uma reivindicacao com resolucao
   */
  static async closeClaim(id: number, input: CloseClaimInput, closed_by_user_id?: number) {
    const claim = await db.contract_claims.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!claim) {
      throw new NotFoundError('Reivindicacao nao encontrada.');
    }

    if (claim.status === 'encerrada') {
      throw new BadRequestError('Reivindicacao ja esta encerrada.');
    }

    // Mapeia outcome para status do enum
    const outcomeToStatus: Record<string, string> = {
      aprovada: 'aceita',
      negada: 'rejeitada',
      parcialmente_aprovada: 'aceita',
    };

    const newStatus = outcomeToStatus[input.outcome ?? 'aprovada'] ?? 'encerrada';

    return db.contract_claims.update({
      where: { id: BigInt(id) },
      data: {
        status: newStatus as any,
        approved_value: input.value_approved ?? null,
        closed_by_user_id: closed_by_user_id ? BigInt(closed_by_user_id) : null,
        closed_at: new Date(),
        submitted_at: claim.submitted_at ?? new Date(),
        updated_at: new Date(),
      },
    });
  }

  /**
   * Adiciona evidencia a uma reivindicacao
   * Tabela: claim_evidences
   */
  static async addClaimEvidence(claim_id: number, input: AddClaimEvidenceInput) {
    const claim = await db.contract_claims.findFirst({
      where: { id: BigInt(claim_id), deleted_at: null },
    });

    if (!claim) {
      throw new NotFoundError('Reivindicacao nao encontrada.');
    }

    if (claim.status === 'encerrada') {
      throw new BadRequestError('Nao e possivel adicionar evidencias em reivindicacoes encerradas.');
    }

    return db.claim_evidences.create({
      data: {
        contract_claims_id: BigInt(claim_id),
        file_url: input.file_url,
        description: input.description ?? null,
        evidence_type: input.file_type ?? 'documento',
      },
    });
  }
}

export default ContractsService;
