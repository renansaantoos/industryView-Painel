// =============================================================================
// INDUSTRYVIEW BACKEND - Company Service
// Service do modulo de empresa (matriz/filiais)
// =============================================================================

import { db } from '../../config/database';
import { ForbiddenError, NotFoundError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import {
  UpdateCompanyInput,
  CreateBranchInput,
  UpdateBranchInput,
} from './company.schema';

/**
 * CompanyService - Service do modulo de empresa
 */
export class CompanyService {
  /**
   * Verifica se o usuario autenticado pertence a empresa solicitada.
   * Garante multi-tenant: um usuario so pode acessar sua propria empresa.
   */
  private static async assertUserBelongsToCompany(
    companyId: number,
    authUserId: number
  ): Promise<void> {
    const user = await db.users.findFirst({
      where: {
        id: BigInt(authUserId),
        deleted_at: null,
      },
      select: { company_id: true },
    });

    if (!user) {
      throw new NotFoundError('Usuario nao encontrado');
    }

    if (!user.company_id || user.company_id !== BigInt(companyId)) {
      throw new ForbiddenError('Acesso negado a esta empresa');
    }
  }

  /**
   * GET /company/:company_id
   * Busca a matriz com suas filiais ativas incluidas
   */
  static async getCompanyWithBranches(companyId: number, authUserId: number) {
    await CompanyService.assertUserBelongsToCompany(companyId, authUserId);

    const company = await db.company.findFirst({
      where: {
        id: BigInt(companyId),
        deleted_at: null,
      },
      include: {
        status_payment: {
          select: { id: true, name: true },
        },
        branches: {
          where: { deleted_at: null },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!company) {
      throw new NotFoundError('Empresa nao encontrada');
    }

    return company;
  }

  /**
   * PATCH /company/:company_id
   * Atualiza dados da empresa (matriz)
   */
  static async updateCompany(
    companyId: number,
    input: UpdateCompanyInput,
    authUserId: number
  ) {
    await CompanyService.assertUserBelongsToCompany(companyId, authUserId);

    const existing = await db.company.findFirst({
      where: {
        id: BigInt(companyId),
        deleted_at: null,
      },
    });

    if (!existing) {
      throw new NotFoundError('Empresa nao encontrada');
    }

    // Constroi o objeto de update apenas com campos presentes no input
    const updateData: Record<string, unknown> = { updated_at: new Date() };

    const fields: (keyof UpdateCompanyInput)[] = [
      'brand_name',
      'legal_name',
      'cnpj',
      'phone',
      'email',
      'cep',
      'numero',
      'address_line',
      'address_line2',
      'city',
      'state',
      'company_type',
      'bairro',
      'complemento',
      'pais',
      'inscricao_estadual',
      'inscricao_municipal',
      'cnae',
      'regime_tributario',
      'responsavel_legal',
      'responsavel_cpf',
      'website',
      'logo_url',
    ];

    for (const field of fields) {
      if (input[field] !== undefined) {
        updateData[field] = input[field];
      }
    }

    const updated = await db.company.update({
      where: { id: BigInt(companyId) },
      data: updateData,
    });

    logger.info({ companyId }, 'Company updated');

    return updated;
  }

  /**
   * GET /company/:company_id/branches
   * Lista filiais ativas da empresa (deleted_at IS NULL)
   */
  static async listBranches(companyId: number, authUserId: number) {
    await CompanyService.assertUserBelongsToCompany(companyId, authUserId);

    // Confirma que a empresa existe
    const companyExists = await db.company.findFirst({
      where: { id: BigInt(companyId), deleted_at: null },
      select: { id: true },
    });

    if (!companyExists) {
      throw new NotFoundError('Empresa nao encontrada');
    }

    const branches = await db.company_branches.findMany({
      where: {
        company_id: BigInt(companyId),
        deleted_at: null,
      },
      orderBy: { created_at: 'desc' },
    });

    return {
      items: branches,
      itemsTotal: branches.length,
    };
  }

  /**
   * POST /company/:company_id/branches
   * Cria uma nova filial vinculada a empresa
   */
  static async createBranch(
    companyId: number,
    input: CreateBranchInput,
    authUserId: number
  ) {
    await CompanyService.assertUserBelongsToCompany(companyId, authUserId);

    const companyExists = await db.company.findFirst({
      where: { id: BigInt(companyId), deleted_at: null },
      select: { id: true },
    });

    if (!companyExists) {
      throw new NotFoundError('Empresa nao encontrada');
    }

    const branch = await db.company_branches.create({
      data: {
        company_id: BigInt(companyId),
        brand_name: input.brand_name,
        legal_name: input.legal_name ?? null,
        cnpj: input.cnpj ?? null,
        inscricao_estadual: input.inscricao_estadual ?? null,
        inscricao_municipal: input.inscricao_municipal ?? null,
        cnae: input.cnae ?? null,
        phone: input.phone ?? null,
        email: input.email ?? null,
        website: input.website ?? null,
        cep: input.cep ?? null,
        address_line: input.address_line ?? null,
        complemento: input.complemento ?? null,
        numero: input.numero ?? null,
        bairro: input.bairro ?? null,
        city: input.city ?? null,
        state: input.state ?? null,
        pais: input.pais ?? 'Brasil',
        responsavel_legal: input.responsavel_legal ?? null,
        responsavel_cpf: input.responsavel_cpf ?? null,
        ativo: input.ativo ?? true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    logger.info({ companyId, branchId: branch.id }, 'Branch created');

    return branch;
  }

  /**
   * GET /company/:company_id/branches/:branch_id
   * Busca filial especifica
   */
  static async getBranch(
    companyId: number,
    branchId: number,
    authUserId: number
  ) {
    await CompanyService.assertUserBelongsToCompany(companyId, authUserId);

    const branch = await db.company_branches.findFirst({
      where: {
        id: BigInt(branchId),
        company_id: BigInt(companyId),
        deleted_at: null,
      },
    });

    if (!branch) {
      throw new NotFoundError('Filial nao encontrada');
    }

    return branch;
  }

  /**
   * PATCH /company/:company_id/branches/:branch_id
   * Atualiza dados de uma filial
   */
  static async updateBranch(
    companyId: number,
    branchId: number,
    input: UpdateBranchInput,
    authUserId: number
  ) {
    await CompanyService.assertUserBelongsToCompany(companyId, authUserId);

    const existing = await db.company_branches.findFirst({
      where: {
        id: BigInt(branchId),
        company_id: BigInt(companyId),
        deleted_at: null,
      },
    });

    if (!existing) {
      throw new NotFoundError('Filial nao encontrada');
    }

    // Constroi objeto de update apenas com campos presentes
    const updateData: Record<string, unknown> = { updated_at: new Date() };

    const fields: (keyof UpdateBranchInput)[] = [
      'brand_name',
      'legal_name',
      'cnpj',
      'inscricao_estadual',
      'inscricao_municipal',
      'cnae',
      'phone',
      'email',
      'website',
      'cep',
      'address_line',
      'complemento',
      'numero',
      'bairro',
      'city',
      'state',
      'pais',
      'responsavel_legal',
      'responsavel_cpf',
      'ativo',
    ];

    for (const field of fields) {
      if (input[field] !== undefined) {
        updateData[field] = input[field];
      }
    }

    const updated = await db.company_branches.update({
      where: { id: BigInt(branchId) },
      data: updateData,
    });

    logger.info({ companyId, branchId }, 'Branch updated');

    return updated;
  }

  /**
   * DELETE /company/:company_id/branches/:branch_id
   * Soft delete de uma filial (seta deleted_at)
   */
  static async deleteBranch(
    companyId: number,
    branchId: number,
    authUserId: number
  ) {
    await CompanyService.assertUserBelongsToCompany(companyId, authUserId);

    const existing = await db.company_branches.findFirst({
      where: {
        id: BigInt(branchId),
        company_id: BigInt(companyId),
        deleted_at: null,
      },
    });

    if (!existing) {
      throw new NotFoundError('Filial nao encontrada');
    }

    await db.company_branches.update({
      where: { id: BigInt(branchId) },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    logger.info({ companyId, branchId }, 'Branch soft-deleted');

    return { message: 'Filial removida com sucesso' };
  }
}

export default CompanyService;
