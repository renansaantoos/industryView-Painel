// =============================================================================
// INDUSTRYVIEW BACKEND - Employees Module Service
// Service do modulo de funcionarios (dados de RH, ferias, documentos)
// =============================================================================

import { db } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { buildPaginationResponse } from '../../utils/helpers';
import {
  UpsertHrDataInput,
  ListVacationsInput,
  CreateVacationInput,
  UpdateVacationInput,
  ListDocumentsInput,
  CreateDocumentInput,
  UpdateDocumentInput,
  ListDayOffsInput,
  CreateDayOffInput,
  UpdateDayOffInput,
  ListBenefitsInput,
  CreateBenefitInput,
  UpdateBenefitInput,
  ListCareerHistoryInput,
  CreateCareerHistoryInput,
  UpdateCareerHistoryInput,
} from './employees.schema';

/**
 * EmployeesService - Service do modulo de funcionarios
 */
export class EmployeesService {
  // ===========================================================================
  // HR Data
  // ===========================================================================

  /**
   * Busca dados de RH de um funcionario pelo users_id.
   * Retorna null se nao encontrado (sem lancar erro).
   */
  static async getHrData(userId: number) {
    return db.employees_hr_data.findFirst({
      where: { users_id: BigInt(userId) },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Cria ou atualiza os dados de RH de um funcionario (upsert).
   * Converte campos de data e salario para os tipos esperados pelo Prisma.
   */
  static async upsertHrData(userId: number, data: UpsertHrDataInput) {
    const sharedData = {
      nome_completo: data.nome_completo,
      cpf: data.cpf,
      rg: data.rg,
      rg_orgao_emissor: data.rg_orgao_emissor,
      rg_data_emissao: data.rg_data_emissao ? new Date(data.rg_data_emissao) : undefined,
      data_nascimento: data.data_nascimento ? new Date(data.data_nascimento) : undefined,
      genero: data.genero,
      estado_civil: data.estado_civil,
      nacionalidade: data.nacionalidade,
      naturalidade: data.naturalidade,
      nome_mae: data.nome_mae,
      nome_pai: data.nome_pai,
      cep: data.cep,
      logradouro: data.logradouro,
      numero: data.numero,
      complemento: data.complemento,
      bairro: data.bairro,
      cidade: data.cidade,
      estado: data.estado,
      matricula: data.matricula,
      data_admissao: data.data_admissao ? new Date(data.data_admissao) : undefined,
      data_demissao: data.data_demissao ? new Date(data.data_demissao) : undefined,
      tipo_contrato: data.tipo_contrato,
      cargo: data.cargo,
      departamento: data.departamento,
      salario: data.salario !== undefined ? data.salario : undefined,
      jornada_trabalho: data.jornada_trabalho,
      pis_pasep: data.pis_pasep,
      ctps_numero: data.ctps_numero,
      ctps_serie: data.ctps_serie,
      ctps_uf: data.ctps_uf,
      cnh_numero: data.cnh_numero,
      cnh_categoria: data.cnh_categoria,
      cnh_validade: data.cnh_validade ? new Date(data.cnh_validade) : undefined,
      banco_nome: data.banco_nome,
      banco_agencia: data.banco_agencia,
      banco_conta: data.banco_conta,
      banco_tipo_conta: data.banco_tipo_conta,
      banco_pix: data.banco_pix,
      emergencia_nome: data.emergencia_nome,
      emergencia_parentesco: data.emergencia_parentesco,
      emergencia_telefone: data.emergencia_telefone,
      escolaridade: data.escolaridade,
      curso: data.curso,
      instituicao: data.instituicao,
      observacoes: data.observacoes,
      foto_documento_url: data.foto_documento_url,
    };

    return db.employees_hr_data.upsert({
      where: { users_id: BigInt(userId) },
      create: {
        users_id: BigInt(userId),
        ...sharedData,
      },
      update: {
        ...sharedData,
        updated_at: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  // ===========================================================================
  // Vacations
  // ===========================================================================

  /**
   * Lista ferias/licencas com paginacao e filtros opcionais por usuario e status.
   */
  static async listVacations(input: ListVacationsInput) {
    const { users_id, status, page, per_page } = input;
    const company_id = (input as any).company_id;
    const skip = (page - 1) * per_page;

    const whereClause: any = { deleted_at: null };

    if (users_id) {
      whereClause.users_id = BigInt(users_id);
    }

    // Isolamento multi-tenant via user.company_id
    if (company_id && !users_id) {
      whereClause.user = { company_id: BigInt(company_id) };
    }

    if (status) {
      whereClause.status = status;
    }

    const [items, total] = await Promise.all([
      db.employees_vacations.findMany({
        where: whereClause,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { data_inicio: 'desc' },
        skip,
        take: per_page,
      }),
      db.employees_vacations.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  /**
   * Cria um registro de ferias/licenca para um funcionario.
   */
  static async createVacation(data: CreateVacationInput) {
    return db.employees_vacations.create({
      data: {
        users_id: BigInt(data.users_id),
        tipo: data.tipo,
        data_inicio: new Date(data.data_inicio),
        data_fim: new Date(data.data_fim),
        dias_total: data.dias_total,
        dias_abono: data.dias_abono ?? null,
        periodo_aquisitivo_inicio: data.periodo_aquisitivo_inicio
          ? new Date(data.periodo_aquisitivo_inicio)
          : null,
        periodo_aquisitivo_fim: data.periodo_aquisitivo_fim
          ? new Date(data.periodo_aquisitivo_fim)
          : null,
        observacoes: data.observacoes ?? null,
        status: 'pendente',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Atualiza um registro de ferias/licenca existente.
   */
  static async updateVacation(id: number, data: UpdateVacationInput) {
    const vacation = await db.employees_vacations.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!vacation) {
      throw new NotFoundError('Ferias nao encontradas.');
    }

    return db.employees_vacations.update({
      where: { id: BigInt(id) },
      data: {
        tipo: data.tipo,
        data_inicio: data.data_inicio ? new Date(data.data_inicio) : undefined,
        data_fim: data.data_fim ? new Date(data.data_fim) : undefined,
        dias_total: data.dias_total,
        dias_abono: data.dias_abono,
        periodo_aquisitivo_inicio: data.periodo_aquisitivo_inicio
          ? new Date(data.periodo_aquisitivo_inicio)
          : undefined,
        periodo_aquisitivo_fim: data.periodo_aquisitivo_fim
          ? new Date(data.periodo_aquisitivo_fim)
          : undefined,
        status: data.status,
        observacoes: data.observacoes,
        updated_at: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Aprova ou cancela um registro de ferias/licenca.
   * Registra quem aprovou e quando.
   */
  static async approveVacation(id: number, approvedById: number, status: string) {
    const vacation = await db.employees_vacations.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!vacation) {
      throw new NotFoundError('Ferias nao encontradas.');
    }

    return db.employees_vacations.update({
      where: { id: BigInt(id) },
      data: {
        status,
        aprovado_por_id: BigInt(approvedById),
        aprovado_em: new Date(),
        updated_at: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Soft delete de um registro de ferias/licenca.
   */
  static async deleteVacation(id: number) {
    const vacation = await db.employees_vacations.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!vacation) {
      throw new NotFoundError('Ferias nao encontradas.');
    }

    return db.employees_vacations.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });
  }

  /**
   * Calcula o saldo de ferias de um funcionario.
   * Direito padrao: 30 dias/ano.
   * Soma dias das ferias aprovadas/em andamento/concluidas.
   */
  static async getVacationBalance(userId: number) {
    const dias_direito = 30;

    const [usedVacations, pendingVacations] = await Promise.all([
      db.employees_vacations.findMany({
        where: {
          users_id: BigInt(userId),
          status: { in: ['aprovado', 'em_andamento', 'concluido'] },
          deleted_at: null,
        },
        select: { dias_total: true },
      }),
      db.employees_vacations.findMany({
        where: {
          users_id: BigInt(userId),
          status: 'pendente',
          deleted_at: null,
        },
        select: { dias_total: true },
      }),
    ]);

    const dias_usados = usedVacations.reduce((acc, v) => acc + (v.dias_total ?? 0), 0);
    const dias_pendentes = pendingVacations.reduce((acc, v) => acc + (v.dias_total ?? 0), 0);

    return {
      dias_direito,
      dias_usados,
      dias_pendentes,
      dias_disponiveis: dias_direito - dias_usados,
    };
  }

  // ===========================================================================
  // Documents
  // ===========================================================================

  /**
   * Lista documentos do funcionario com paginacao e filtros por usuario e tipo.
   */
  static async listDocuments(input: ListDocumentsInput) {
    const { users_id, tipo, page, per_page } = input;
    const company_id = (input as any).company_id;
    const skip = (page - 1) * per_page;

    const whereClause: any = { deleted_at: null };

    if (users_id) {
      whereClause.users_id = BigInt(users_id);
    }

    // Isolamento multi-tenant via user.company_id
    if (company_id && !users_id) {
      whereClause.user = { company_id: BigInt(company_id) };
    }

    if (tipo) {
      whereClause.tipo = tipo;
    }

    const [items, total] = await Promise.all([
      db.employees_documents.findMany({
        where: whereClause,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: per_page,
      }),
      db.employees_documents.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  /**
   * Cria um registro de documento para um funcionario.
   */
  static async createDocument(data: CreateDocumentInput) {
    return db.employees_documents.create({
      data: {
        users_id: BigInt(data.users_id),
        tipo: data.tipo,
        nome: data.nome,
        descricao: data.descricao ?? null,
        numero_documento: data.numero_documento ?? null,
        data_emissao: data.data_emissao ? new Date(data.data_emissao) : null,
        data_validade: data.data_validade ? new Date(data.data_validade) : null,
        file_url: data.file_url ?? null,
        status: 'ativo',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Atualiza um documento existente do funcionario.
   */
  static async updateDocument(id: number, data: UpdateDocumentInput) {
    const document = await db.employees_documents.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!document) {
      throw new NotFoundError('Documento nao encontrado.');
    }

    return db.employees_documents.update({
      where: { id: BigInt(id) },
      data: {
        tipo: data.tipo,
        nome: data.nome,
        descricao: data.descricao,
        numero_documento: data.numero_documento,
        data_emissao: data.data_emissao ? new Date(data.data_emissao) : undefined,
        data_validade: data.data_validade ? new Date(data.data_validade) : undefined,
        file_url: data.file_url,
        status: data.status,
        updated_at: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Soft delete de um documento do funcionario.
   */
  static async deleteDocument(id: number) {
    const document = await db.employees_documents.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!document) {
      throw new NotFoundError('Documento nao encontrado.');
    }

    return db.employees_documents.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });
  }
  // ===========================================================================
  // Day Offs (Folgas / Banco de Horas)
  // ===========================================================================

  static async listDayOffs(input: ListDayOffsInput) {
    const { users_id, tipo, status, data_inicio, data_fim, page, per_page } = input;
    const company_id = (input as any).company_id;
    const skip = (page - 1) * per_page;

    const whereClause: any = { deleted_at: null };

    if (users_id) whereClause.users_id = BigInt(users_id);
    // Isolamento multi-tenant via user.company_id
    if (company_id && !users_id) whereClause.user = { company_id: BigInt(company_id) };
    if (tipo) whereClause.tipo = tipo;
    if (status) whereClause.status = status;
    if (data_inicio || data_fim) {
      whereClause.data = {};
      if (data_inicio) whereClause.data.gte = new Date(data_inicio);
      if (data_fim) whereClause.data.lte = new Date(data_fim);
    }

    const [items, total] = await Promise.all([
      db.employees_day_offs.findMany({
        where: whereClause,
        include: {
          user: { select: { id: true, name: true, email: true } },
          aprovado_por: { select: { id: true, name: true } },
        },
        orderBy: { data: 'desc' },
        skip,
        take: per_page,
      }),
      db.employees_day_offs.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  static async createDayOff(data: CreateDayOffInput) {
    return db.employees_day_offs.create({
      data: {
        users_id: BigInt(data.users_id),
        tipo: data.tipo,
        data: new Date(data.data),
        motivo: data.motivo ?? null,
        horas_banco: data.horas_banco ?? null,
        observacoes: data.observacoes ?? null,
        status: 'pendente',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  static async updateDayOff(id: number, data: UpdateDayOffInput) {
    const dayOff = await db.employees_day_offs.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!dayOff) {
      throw new NotFoundError('Folga nao encontrada.');
    }

    return db.employees_day_offs.update({
      where: { id: BigInt(id) },
      data: {
        tipo: data.tipo,
        data: data.data ? new Date(data.data) : undefined,
        motivo: data.motivo,
        horas_banco: data.horas_banco,
        status: data.status,
        observacoes: data.observacoes,
        updated_at: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  static async approveDayOff(id: number, approvedById: number, status: string) {
    const dayOff = await db.employees_day_offs.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!dayOff) {
      throw new NotFoundError('Folga nao encontrada.');
    }

    return db.employees_day_offs.update({
      where: { id: BigInt(id) },
      data: {
        status,
        aprovado_por_id: BigInt(approvedById),
        aprovado_em: new Date(),
        updated_at: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  static async deleteDayOff(id: number) {
    const dayOff = await db.employees_day_offs.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!dayOff) {
      throw new NotFoundError('Folga nao encontrada.');
    }

    return db.employees_day_offs.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });
  }

  static async getDayOffBalance(userId: number) {
    const records = await db.employees_day_offs.findMany({
      where: {
        users_id: BigInt(userId),
        tipo: 'banco_horas',
        status: 'aprovado',
        deleted_at: null,
      },
      select: { horas_banco: true },
    });

    const total_horas = records.reduce(
      (acc, r) => acc + (r.horas_banco ? Number(r.horas_banco) : 0),
      0
    );

    const pendentes = await db.employees_day_offs.count({
      where: {
        users_id: BigInt(userId),
        status: 'pendente',
        deleted_at: null,
      },
    });

    return { total_horas, folgas_pendentes: pendentes };
  }

  // ===========================================================================
  // Benefits (Beneficios)
  // ===========================================================================

  static async listBenefits(input: ListBenefitsInput) {
    const { users_id, tipo, status, page, per_page } = input;
    const company_id = (input as any).company_id;
    const skip = (page - 1) * per_page;

    const whereClause: any = { deleted_at: null };

    if (users_id) whereClause.users_id = BigInt(users_id);
    // Isolamento multi-tenant via user.company_id
    if (company_id && !users_id) whereClause.user = { company_id: BigInt(company_id) };
    if (tipo) whereClause.tipo = tipo;
    if (status) whereClause.status = status;

    const [items, total] = await Promise.all([
      db.employees_benefits.findMany({
        where: whereClause,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: per_page,
      }),
      db.employees_benefits.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  static async createBenefit(data: CreateBenefitInput) {
    return db.employees_benefits.create({
      data: {
        users_id: BigInt(data.users_id),
        tipo: data.tipo,
        descricao: data.descricao ?? null,
        valor: data.valor ?? null,
        data_inicio: new Date(data.data_inicio),
        data_fim: data.data_fim ? new Date(data.data_fim) : null,
        observacoes: data.observacoes ?? null,
        status: 'ativo',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  static async updateBenefit(id: number, data: UpdateBenefitInput) {
    const benefit = await db.employees_benefits.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!benefit) {
      throw new NotFoundError('Beneficio nao encontrado.');
    }

    return db.employees_benefits.update({
      where: { id: BigInt(id) },
      data: {
        tipo: data.tipo,
        descricao: data.descricao,
        valor: data.valor,
        data_inicio: data.data_inicio ? new Date(data.data_inicio) : undefined,
        data_fim: data.data_fim ? new Date(data.data_fim) : undefined,
        status: data.status,
        observacoes: data.observacoes,
        updated_at: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  static async deleteBenefit(id: number) {
    const benefit = await db.employees_benefits.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!benefit) {
      throw new NotFoundError('Beneficio nao encontrado.');
    }

    return db.employees_benefits.update({
      where: { id: BigInt(id) },
      data: { deleted_at: new Date() },
    });
  }

  // ===========================================================================
  // Career History (Historico de Cargos)
  // ===========================================================================

  static async listCareerHistory(input: ListCareerHistoryInput) {
    const { users_id, tipo, page, per_page } = input;
    const company_id = (input as any).company_id;
    const skip = (page - 1) * per_page;

    const whereClause: any = {};

    if (users_id) whereClause.users_id = BigInt(users_id);
    // Isolamento multi-tenant via user.company_id
    if (company_id && !users_id) whereClause.user = { company_id: BigInt(company_id) };
    if (tipo) whereClause.tipo = tipo;

    const [items, total] = await Promise.all([
      db.employees_career_history.findMany({
        where: whereClause,
        include: {
          user: { select: { id: true, name: true, email: true } },
          registrado_por: { select: { id: true, name: true } },
        },
        orderBy: { data_efetivacao: 'desc' },
        skip,
        take: per_page,
      }),
      db.employees_career_history.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  static async createCareerHistory(data: CreateCareerHistoryInput, registeredById?: number) {
    return db.employees_career_history.create({
      data: {
        users_id: BigInt(data.users_id),
        tipo: data.tipo,
        cargo_anterior: data.cargo_anterior ?? null,
        cargo_novo: data.cargo_novo ?? null,
        departamento_anterior: data.departamento_anterior ?? null,
        departamento_novo: data.departamento_novo ?? null,
        salario_anterior: data.salario_anterior ?? null,
        salario_novo: data.salario_novo ?? null,
        data_efetivacao: new Date(data.data_efetivacao),
        motivo: data.motivo ?? null,
        observacoes: data.observacoes ?? null,
        registrado_por_id: registeredById ? BigInt(registeredById) : null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        registrado_por: { select: { id: true, name: true } },
      },
    });
  }

  static async updateCareerHistory(id: number, data: UpdateCareerHistoryInput) {
    const record = await db.employees_career_history.findFirst({
      where: { id: BigInt(id) },
    });

    if (!record) {
      throw new NotFoundError('Registro de carreira nao encontrado.');
    }

    return db.employees_career_history.update({
      where: { id: BigInt(id) },
      data: {
        tipo: data.tipo,
        cargo_anterior: data.cargo_anterior,
        cargo_novo: data.cargo_novo,
        departamento_anterior: data.departamento_anterior,
        departamento_novo: data.departamento_novo,
        salario_anterior: data.salario_anterior,
        salario_novo: data.salario_novo,
        data_efetivacao: data.data_efetivacao ? new Date(data.data_efetivacao) : undefined,
        motivo: data.motivo,
        observacoes: data.observacoes,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        registrado_por: { select: { id: true, name: true } },
      },
    });
  }

  static async deleteCareerHistory(id: number) {
    const record = await db.employees_career_history.findFirst({
      where: { id: BigInt(id) },
    });

    if (!record) {
      throw new NotFoundError('Registro de carreira nao encontrado.');
    }

    return db.employees_career_history.delete({
      where: { id: BigInt(id) },
    });
  }
}

export default EmployeesService;
