// =============================================================================
// INDUSTRYVIEW BACKEND - Commissioning Module Service
// Service do modulo de comissionamento
// Tabela commissioning_systems: system_name, system_code (obrigatorio), planned_date, actual_date
// Tabela commissioning_punch_list: responsible (string), due_date, priority (A/B/C), sem deleted_at
// Tabela commissioning_certificates: issued_date (nao issued_at), sem deleted_at
// enum commissioning_status: pendente, em_andamento, concluido, reprovado
// enum punch_priority: A, B, C
// =============================================================================

import { db } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { buildPaginationResponse } from '../../utils/helpers';
import {
  ListSystemsInput,
  CreateSystemInput,
  UpdateSystemInput,
  CreatePunchListItemInput,
  UpdatePunchListItemInput,
  CreateCertificateInput,
  UpdateCertificateInput,
} from './commissioning.schema';

/**
 * CommissioningService - Service do modulo de comissionamento
 */
export class CommissioningService {
  // ===========================================================================
  // Systems
  // ===========================================================================

  /**
   * Lista sistemas de comissionamento
   */
  static async listSystems(input: ListSystemsInput) {
    const { projects_id, status, page, per_page } = input;
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

    const [items, total] = await Promise.all([
      db.commissioning_systems.findMany({
        where: whereClause,
        include: {
          projects: { select: { id: true, name: true } },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: per_page,
      }),
      db.commissioning_systems.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  /**
   * Busca sistema por ID
   */
  static async getSystemById(id: number) {
    const system = await db.commissioning_systems.findFirst({
      where: { id: BigInt(id), deleted_at: null },
      include: {
        projects: { select: { id: true, name: true } },
        punch_list: {
          orderBy: [{ priority: 'asc' }, { created_at: 'asc' }],
        },
        certificates: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!system) {
      throw new NotFoundError('Sistema de comissionamento nao encontrado.');
    }

    return system;
  }

  /**
   * Cria sistema de comissionamento
   * system_code e obrigatorio - gerado automaticamente se nao fornecido
   */
  static async createSystem(input: CreateSystemInput) {
    // Gera system_code automatico se nao fornecido
    const system_code = input.system_code
      ?? `SYS-${Date.now().toString(36).toUpperCase()}`;

    return db.commissioning_systems.create({
      data: {
        projects_id: BigInt(input.projects_id),
        system_name: input.name,
        system_code,
        description: input.description ?? null,
        planned_date: input.planned_completion_date ? new Date(input.planned_completion_date) : null,
        status: 'pendente',
      },
      include: {
        projects: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Atualiza sistema de comissionamento
   * enum commissioning_status: pendente, em_andamento, concluido, reprovado
   */
  static async updateSystem(id: number, input: UpdateSystemInput) {
    const system = await db.commissioning_systems.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!system) {
      throw new NotFoundError('Sistema de comissionamento nao encontrado.');
    }

    return db.commissioning_systems.update({
      where: { id: BigInt(id) },
      data: {
        system_name: input.name,
        description: input.description,
        status: input.status as any,
        planned_date: input.planned_completion_date ? new Date(input.planned_completion_date) : undefined,
        actual_date: input.actual_completion_date ? new Date(input.actual_completion_date) : undefined,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Remove sistema (soft delete)
   */
  static async deleteSystem(id: number) {
    const system = await db.commissioning_systems.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!system) {
      throw new NotFoundError('Sistema de comissionamento nao encontrado.');
    }

    return db.commissioning_systems.update({
      where: { id: BigInt(id) },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  // ===========================================================================
  // Punch List
  // ===========================================================================

  /**
   * Lista itens da punch list de um sistema
   * Sem deleted_at na tabela, responsible e string (nao FK)
   */
  static async getPunchList(system_id: number) {
    const system = await db.commissioning_systems.findFirst({
      where: { id: BigInt(system_id), deleted_at: null },
    });

    if (!system) {
      throw new NotFoundError('Sistema de comissionamento nao encontrado.');
    }

    return db.commissioning_punch_list.findMany({
      where: {
        commissioning_systems_id: BigInt(system_id),
      },
      orderBy: [
        { priority: 'asc' },
        { created_at: 'asc' },
      ],
    });
  }

  /**
   * Cria item na punch list
   * priority: A, B, C (mapeado de alta->A, media->B, baixa->C)
   * item_number gerado automaticamente
   */
  static async createPunchListItem(input: CreatePunchListItemInput) {
    const system = await db.commissioning_systems.findFirst({
      where: { id: BigInt(input.system_id), deleted_at: null },
    });

    if (!system) {
      throw new NotFoundError('Sistema de comissionamento nao encontrado.');
    }

    // Calcula proximo item_number
    const lastItem = await db.commissioning_punch_list.findFirst({
      where: { commissioning_systems_id: BigInt(input.system_id) },
      orderBy: { item_number: 'desc' },
      select: { item_number: true },
    });

    const item_number = (lastItem?.item_number ?? 0) + 1;

    // Mapeia prioridade textual para enum (A=alta, B=media/default, C=baixa)
    const priorityMap: Record<string, 'A' | 'B' | 'C'> = {
      alta: 'A',
      critica: 'A',
      media: 'B',
      baixa: 'C',
    };

    const priority = priorityMap[input.priority ?? 'media'] ?? 'B';

    return db.commissioning_punch_list.create({
      data: {
        commissioning_systems_id: BigInt(input.system_id),
        item_number,
        description: input.description,
        priority: priority as any,
        responsible: input.responsible_name ?? null,
        status: 'pendente',
        due_date: input.due_date ? new Date(input.due_date) : null,
      },
    });
  }

  /**
   * Atualiza item da punch list
   */
  static async updatePunchListItem(id: number, input: UpdatePunchListItemInput) {
    const item = await db.commissioning_punch_list.findFirst({
      where: { id: BigInt(id) },
    });

    if (!item) {
      throw new NotFoundError('Item da punch list nao encontrado.');
    }

    const priorityMap: Record<string, 'A' | 'B' | 'C'> = {
      alta: 'A',
      critica: 'A',
      media: 'B',
      baixa: 'C',
    };

    return db.commissioning_punch_list.update({
      where: { id: BigInt(id) },
      data: {
        description: input.description,
        priority: input.priority ? (priorityMap[input.priority] as any) : undefined,
        status: input.status as any,
        responsible: input.responsible_name,
        due_date: input.due_date ? new Date(input.due_date) : undefined,
        completed_at: input.status === 'concluido' ? new Date() : undefined,
        updated_at: new Date(),
      },
    });
  }

  // ===========================================================================
  // Certificates
  // ===========================================================================

  /**
   * Lista certificados de um sistema
   * Sem deleted_at, campo issued_date (nao issued_at)
   */
  static async getCertificates(system_id: number) {
    const system = await db.commissioning_systems.findFirst({
      where: { id: BigInt(system_id), deleted_at: null },
    });

    if (!system) {
      throw new NotFoundError('Sistema de comissionamento nao encontrado.');
    }

    return db.commissioning_certificates.findMany({
      where: {
        commissioning_systems_id: BigInt(system_id),
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Cria certificado de comissionamento
   */
  static async createCertificate(input: CreateCertificateInput) {
    const system = await db.commissioning_systems.findFirst({
      where: { id: BigInt(input.system_id), deleted_at: null },
    });

    if (!system) {
      throw new NotFoundError('Sistema de comissionamento nao encontrado.');
    }

    return db.commissioning_certificates.create({
      data: {
        commissioning_systems_id: BigInt(input.system_id),
        certificate_type: input.certificate_type,
        certificate_number: input.certificate_number ?? null,
        issued_date: input.issued_at ? new Date(input.issued_at) : null,
        file_url: input.file_url ?? null,
        status: 'pendente',
      },
    });
  }

  /**
   * Atualiza certificado
   */
  static async updateCertificate(id: number, input: UpdateCertificateInput) {
    const certificate = await db.commissioning_certificates.findFirst({
      where: { id: BigInt(id) },
    });

    if (!certificate) {
      throw new NotFoundError('Certificado nao encontrado.');
    }

    return db.commissioning_certificates.update({
      where: { id: BigInt(id) },
      data: {
        certificate_type: input.certificate_type,
        certificate_number: input.certificate_number,
        status: input.status,
        issued_date: input.issued_at ? new Date(input.issued_at) : undefined,
        file_url: input.file_url,
        updated_at: new Date(),
      },
    });
  }
}

export default CommissioningService;
