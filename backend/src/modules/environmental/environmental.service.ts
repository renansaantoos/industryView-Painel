// =============================================================================
// INDUSTRYVIEW BACKEND - Environmental Module Service
// Service do modulo de licenciamento ambiental
// Tabela environmental_licenses: expiry_date, issued_date, issuing_agency
// Tabela environmental_conditions: sem deleted_at, deadline (nao due_date), sem condition_type
// enum license_status: vigente, vencida, em_renovacao, cancelada
// =============================================================================

import { db } from '../../config/database';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { buildPaginationResponse } from '../../utils/helpers';
import {
  ListLicensesInput,
  GetExpiringLicensesInput,
  CreateLicenseInput,
  UpdateLicenseInput,
  CreateConditionInput,
  UpdateConditionInput,
} from './environmental.schema';

/**
 * EnvironmentalService - Service do modulo de licenciamento ambiental
 */
export class EnvironmentalService {
  // ===========================================================================
  // Licenses
  // ===========================================================================

  /**
   * Lista licencas ambientais com paginacao e filtros
   */
  static async listLicenses(input: ListLicensesInput) {
    const { projects_id, status, license_type, page, per_page } = input;
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

    if (license_type) {
      whereClause.license_type = license_type;
    }

    const [items, total] = await Promise.all([
      db.environmental_licenses.findMany({
        where: whereClause,
        include: {
          projects: { select: { id: true, name: true } },
        },
        orderBy: { expiry_date: 'asc' },
        skip,
        take: per_page,
      }),
      db.environmental_licenses.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  /**
   * Lista licencas que expiram nos proximos N dias
   * Campo real: expiry_date
   */
  static async getExpiringLicenses(input: GetExpiringLicensesInput) {
    const { days, projects_id } = input;
    const now = new Date();
    const limitDate = new Date(now);
    limitDate.setDate(limitDate.getDate() + days);

    const whereClause: any = {
      deleted_at: null,
      status: { notIn: ['cancelada' as any] },
      expiry_date: {
        gte: now,
        lte: limitDate,
      },
    };

    if (projects_id) {
      whereClause.projects_id = BigInt(projects_id);
    }

    const licenses = await db.environmental_licenses.findMany({
      where: whereClause,
      include: {
        projects: { select: { id: true, name: true } },
      },
      orderBy: { expiry_date: 'asc' },
    });

    return licenses.map(license => ({
      ...license,
      days_until_expiry: license.expiry_date
        ? Math.ceil((license.expiry_date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null,
    }));
  }

  /**
   * Busca licenca por ID com condicoes
   */
  static async getLicenseById(id: number) {
    const license = await db.environmental_licenses.findFirst({
      where: { id: BigInt(id), deleted_at: null },
      include: {
        projects: { select: { id: true, name: true } },
        conditions: {
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!license) {
      throw new NotFoundError('Licenca ambiental nao encontrada.');
    }

    return license;
  }

  /**
   * Cria licenca ambiental
   * Campos reais: issuing_agency (nao issuing_authority), issued_date, expiry_date
   */
  static async createLicense(input: CreateLicenseInput) {
    // company_id e obrigatorio na tabela - requer que o projeto tenha company associada
    // Busca company_id do projeto
    const project = await db.projects.findFirst({
      where: { id: BigInt(input.projects_id), deleted_at: null },
      select: { company_id: true },
    });

    if (!project) {
      throw new NotFoundError('Projeto nao encontrado.');
    }

    if (!project.company_id) {
      throw new BadRequestError('Projeto nao possui empresa associada.');
    }

    return db.environmental_licenses.create({
      data: {
        projects_id: BigInt(input.projects_id),
        company_id: project.company_id,
        license_type: input.license_type,
        license_number: input.license_number,
        issuing_agency: input.issuing_authority ?? null,
        issued_date: input.issued_at ? new Date(input.issued_at) : null,
        expiry_date: input.expires_at ? new Date(input.expires_at) : null,
        file_url: input.file_url ?? null,
        observations: input.notes ?? null,
        status: 'vigente',
      },
      include: {
        projects: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Atualiza licenca ambiental
   */
  static async updateLicense(id: number, input: UpdateLicenseInput) {
    const license = await db.environmental_licenses.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!license) {
      throw new NotFoundError('Licenca ambiental nao encontrada.');
    }

    return db.environmental_licenses.update({
      where: { id: BigInt(id) },
      data: {
        license_type: input.license_type,
        license_number: input.license_number,
        issuing_agency: input.issuing_authority,
        status: input.status as any,
        issued_date: input.issued_at ? new Date(input.issued_at) : undefined,
        expiry_date: input.expires_at ? new Date(input.expires_at) : undefined,
        file_url: input.file_url,
        observations: input.notes,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Remove licenca ambiental (soft delete)
   */
  static async deleteLicense(id: number) {
    const license = await db.environmental_licenses.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!license) {
      throw new NotFoundError('Licenca ambiental nao encontrada.');
    }

    return db.environmental_licenses.update({
      where: { id: BigInt(id) },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  // ===========================================================================
  // Conditions
  // ===========================================================================

  /**
   * Lista condicoes de uma licenca
   * Tabela environmental_conditions: sem deleted_at, deadline (nao due_date)
   */
  static async getConditions(license_id: number) {
    const license = await db.environmental_licenses.findFirst({
      where: { id: BigInt(license_id), deleted_at: null },
    });

    if (!license) {
      throw new NotFoundError('Licenca ambiental nao encontrada.');
    }

    return db.environmental_conditions.findMany({
      where: {
        environmental_licenses_id: BigInt(license_id),
      },
      orderBy: { created_at: 'asc' },
    });
  }

  /**
   * Cria condicao de licenca ambiental
   * Campos reais: description, deadline, status, evidence_file
   * Sem: condition_type, responsible_users_id
   */
  static async createCondition(license_id: number, input: CreateConditionInput) {
    const license = await db.environmental_licenses.findFirst({
      where: { id: BigInt(license_id), deleted_at: null },
    });

    if (!license) {
      throw new NotFoundError('Licenca ambiental nao encontrada.');
    }

    // Calcula o proximo condition_number
    const lastCondition = await db.environmental_conditions.findFirst({
      where: { environmental_licenses_id: BigInt(license_id) },
      orderBy: { condition_number: 'desc' },
      select: { condition_number: true },
    });

    const condition_number = (lastCondition?.condition_number ?? 0) + 1;

    return db.environmental_conditions.create({
      data: {
        environmental_licenses_id: BigInt(license_id),
        condition_number,
        description: input.description,
        deadline: input.due_date ? new Date(input.due_date) : null,
        status: 'pendente',
      },
    });
  }

  /**
   * Atualiza condicao de licenca
   */
  static async updateCondition(id: number, input: UpdateConditionInput) {
    const condition = await db.environmental_conditions.findFirst({
      where: { id: BigInt(id) },
    });

    if (!condition) {
      throw new NotFoundError('Condicao ambiental nao encontrada.');
    }

    return db.environmental_conditions.update({
      where: { id: BigInt(id) },
      data: {
        description: input.description,
        status: input.status,
        deadline: input.due_date ? new Date(input.due_date) : undefined,
        completed_at: input.status === 'atendida' ? new Date() : undefined,
        updated_at: new Date(),
      },
    });
  }
}

export default EnvironmentalService;
