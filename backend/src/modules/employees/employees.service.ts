// =============================================================================
// INDUSTRYVIEW BACKEND - Employees Module Service
// Service do modulo de funcionarios (dados de RH, ferias, documentos)
// =============================================================================

import { db } from '../../config/database';
import { NotFoundError, BadRequestError, ConflictError } from '../../utils/errors';
import { buildPaginationResponse, normalizeText, generateRandomPassword, generateQRCodeUrl } from '../../utils/helpers';
import { toNumber } from '../../utils/bigint';
import { AuthService } from '../../services/auth.service';
import { EmailService } from '../../services/email.service';
import { logger } from '../../utils/logger';
import {
  CreateEmployeeInput,
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
  ListLogisticsInput,
  UpdateLogisticsInput,
} from './employees.schema';
import { NotificationsService } from '../notifications/notifications.service';

/**
 * EmployeesService - Service do modulo de funcionarios
 */
export class EmployeesService {
  // ===========================================================================
  // Employee Creation (User + HR Data atomically)
  // ===========================================================================

  /**
   * Cria um funcionario: gera usuario com senha aleatoria, envia email de
   * boas-vindas e salva os dados de RH em uma unica operacao atomica.
   */
  static async createEmployee(input: CreateEmployeeInput, companyId?: number) {
    const { email, phone, nome_completo, ...hrFields } = input;

    // Verifica se email ja existe
    const existing = await db.users.findFirst({
      where: { email, deleted_at: null },
    });
    if (existing) {
      throw new ConflictError('Ja existe um usuario com este e-mail.');
    }

    const randomPassword = generateRandomPassword();
    const hashedPassword = await AuthService.hashPassword(randomPassword);

    const result = await db.$transaction(async (tx) => {
      // Cria usuario
      const user = await tx.users.create({
        data: {
          name: nome_completo,
          name_normalized: normalizeText(nome_completo),
          email,
          phone: phone || null,
          password_hash: hashedPassword,
          first_login: true,
          qrcode: '',
          company_id: companyId ? BigInt(companyId) : null,
        },
      });

      // Atualiza QR code
      await tx.users.update({
        where: { id: user.id },
        data: { qrcode: generateQRCodeUrl(toNumber(user.id)!) },
      });

      // Cria permissoes padrao (acesso basico de funcionario)
      const userPermissions = await tx.users_permissions.create({
        data: {
          user_id: user.id,
          users_system_access_id: BigInt(1),
          users_roles_id: BigInt(1),
          users_control_system_id: BigInt(1),
        },
      });

      await tx.users.update({
        where: { id: user.id },
        data: { users_permissions_id: userPermissions.id },
      });

      // Cria dados de RH com todos os campos preenchidos
      const hrData = await tx.employees_hr_data.create({
        data: {
          users_id: user.id,
          nome_completo,
          cpf: hrFields.cpf,
          rg: hrFields.rg,
          rg_orgao_emissor: hrFields.rg_orgao_emissor,
          rg_data_emissao: hrFields.rg_data_emissao ? new Date(hrFields.rg_data_emissao) : undefined,
          data_nascimento: hrFields.data_nascimento ? new Date(hrFields.data_nascimento) : undefined,
          genero: hrFields.genero,
          estado_civil: hrFields.estado_civil,
          nacionalidade: hrFields.nacionalidade,
          naturalidade: hrFields.naturalidade,
          pais_nascimento: hrFields.pais_nascimento,
          nome_mae: hrFields.nome_mae,
          nome_pai: hrFields.nome_pai,
          cep: hrFields.cep,
          logradouro: hrFields.logradouro,
          numero: hrFields.numero,
          complemento: hrFields.complemento,
          bairro: hrFields.bairro,
          cidade: hrFields.cidade,
          estado: hrFields.estado,
          matricula: hrFields.matricula,
          data_admissao: hrFields.data_admissao ? new Date(hrFields.data_admissao) : undefined,
          data_demissao: hrFields.data_demissao ? new Date(hrFields.data_demissao) : undefined,
          tipo_contrato: hrFields.tipo_contrato,
          cargo: hrFields.cargo,
          senioridade: hrFields.senioridade,
          nivel: hrFields.nivel,
          departamento: hrFields.departamento,
          salario: hrFields.salario,
          jornada_trabalho: hrFields.jornada_trabalho,
          trabalho_insalubre: hrFields.trabalho_insalubre,
          pis_pasep: hrFields.pis_pasep,
          ctps_numero: hrFields.ctps_numero,
          ctps_serie: hrFields.ctps_serie,
          ctps_uf: hrFields.ctps_uf,
          distancia_moradia_obra: hrFields.distancia_moradia_obra,
          folga_campo_dias_trabalho: hrFields.folga_campo_dias_trabalho,
          folga_campo_dias_folga: hrFields.folga_campo_dias_folga,
          folga_campo_dias_uteis: hrFields.folga_campo_dias_uteis,
          cnh_numero: hrFields.cnh_numero,
          cnh_categoria: hrFields.cnh_categoria,
          cnh_validade: hrFields.cnh_validade ? new Date(hrFields.cnh_validade) : undefined,
          banco_nome: hrFields.banco_nome,
          banco_agencia: hrFields.banco_agencia,
          banco_conta: hrFields.banco_conta,
          banco_tipo_conta: hrFields.banco_tipo_conta,
          banco_pix: hrFields.banco_pix,
          emergencia_nome: hrFields.emergencia_nome,
          emergencia_parentesco: hrFields.emergencia_parentesco,
          emergencia_telefone: hrFields.emergencia_telefone,
          escolaridade: hrFields.escolaridade,
          curso: hrFields.curso,
          instituicao: hrFields.instituicao,
          pcd: hrFields.pcd,
          tipo_deficiencia: hrFields.tipo_deficiencia,
          cid: hrFields.cid,
          grau_deficiencia: hrFields.grau_deficiencia,
          reabilitado_inss: hrFields.reabilitado_inss,
          observacoes: hrFields.observacoes,
          foto_documento_url: hrFields.foto_documento_url,
        },
      });

      return { user, hrData };
    });

    // Envia email de boas-vindas com credenciais
    try {
      await EmailService.sendWelcomeEmail(email, nome_completo, randomPassword);
    } catch (error) {
      logger.error({ error, email }, 'Failed to send employee welcome email');
    }

    return {
      user: result.user,
      hr_data: result.hrData,
      email_sent: true,
    };
  }

  // ===========================================================================
  // HR Data
  // ===========================================================================

  /**
   * Busca dados de RH de um funcionario pelo users_id.
   * Retorna null se nao encontrado (sem lancar erro).
   */
  static async getHrData(userId: number) {
    const existing = await db.employees_hr_data.findFirst({
      where: { users_id: BigInt(userId) },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (existing) {
      // Se nome_completo estiver nulo, preenche com o nome do usuário e persiste
      if (!existing.nome_completo && existing.user?.name) {
        await db.employees_hr_data.update({
          where: { id: existing.id },
          data: { nome_completo: existing.user.name },
        });
        existing.nome_completo = existing.user.name;
      }
      return existing;
    }

    // Verifica se o usuario existe antes de criar o registro
    const user = await db.users.findFirst({
      where: { id: BigInt(userId), deleted_at: null },
      select: { id: true, name: true, email: true },
    });

    if (!user) return null;

    // Cria registro vazio automaticamente na primeira consulta
    return db.employees_hr_data.create({
      data: {
        users_id: BigInt(userId),
        nome_completo: user.name ?? null,
      },
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
      pais_nascimento: data.pais_nascimento,
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
      data_demissao: data.data_demissao === null ? null : (data.data_demissao ? new Date(data.data_demissao) : undefined),
      tipo_contrato: data.tipo_contrato,
      cargo: data.cargo,
      senioridade: data.senioridade,
      nivel: data.nivel,
      departamento: data.departamento,
      salario: data.salario !== undefined ? data.salario : undefined,
      jornada_trabalho: data.jornada_trabalho,
      trabalho_insalubre: data.trabalho_insalubre,
      pis_pasep: data.pis_pasep,
      ctps_numero: data.ctps_numero,
      ctps_serie: data.ctps_serie,
      ctps_uf: data.ctps_uf,
      distancia_moradia_obra: data.distancia_moradia_obra !== undefined ? data.distancia_moradia_obra : undefined,
      folga_campo_dias_trabalho: data.folga_campo_dias_trabalho,
      folga_campo_dias_folga: data.folga_campo_dias_folga,
      folga_campo_dias_uteis: data.folga_campo_dias_uteis,
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
      pcd: data.pcd,
      tipo_deficiencia: data.tipo_deficiencia,
      cid: data.cid,
      grau_deficiencia: data.grau_deficiencia,
      reabilitado_inss: data.reabilitado_inss,
      observacoes: data.observacoes,
      foto_documento_url: data.foto_documento_url,
    };

    const result = await db.$transaction(async (tx) => {
      const hrData = await tx.employees_hr_data.upsert({
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

      if (data.nome_completo) {
        await tx.users.update({
          where: { id: BigInt(userId) },
          data: {
            name: data.nome_completo,
            name_normalized: normalizeText(data.nome_completo),
            updated_at: new Date(),
          },
        });
        // Update the returned object's user name so the caller gets the new name
        if (hrData.user) {
          hrData.user.name = data.nome_completo;
        }
      }

      return hrData;
    });

    return result;
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
   * Para tipo 'ferias', valida regras CLT de parcelamento:
   * - Maximo 3 periodos por periodo aquisitivo
   * - Nenhum periodo pode ter menos de 5 dias corridos
   * - Pelo menos 1 dos periodos deve ter >= 14 dias
   * - Dias solicitados nao podem exceder o saldo disponivel
   * - Nenhum periodo pode se sobrepor com ausencias existentes
   */
  static async createVacation(data: CreateVacationInput) {
    // --- Verificacao de saldo disponivel (para todos os tipos de ferias) ---
    const balance = await this.getVacationBalance(data.users_id);
    if (data.dias_total > balance.dias_disponiveis) {
      throw new BadRequestError(
        `Dias solicitados (${data.dias_total}) excedem o saldo disponivel (${balance.dias_disponiveis} dias).`
      );
    }

    // --- Auto-populate do periodo aquisitivo para tipo 'ferias' ---
    let periodoAquisitivoInicio = data.periodo_aquisitivo_inicio;
    let periodoAquisitivoFim = data.periodo_aquisitivo_fim;

    if (
      data.tipo === 'ferias' &&
      !periodoAquisitivoInicio &&
      !periodoAquisitivoFim &&
      balance.periodo_aquisitivo_inicio &&
      balance.periodo_aquisitivo_fim
    ) {
      periodoAquisitivoInicio = balance.periodo_aquisitivo_inicio;
      periodoAquisitivoFim = balance.periodo_aquisitivo_fim;
    }

    // --- Verificacao de sobreposicao de datas com ausencias existentes ---
    const novaInicio = new Date(data.data_inicio);
    const novaFim = new Date(data.data_fim);

    const overlapping = await db.employees_vacations.findFirst({
      where: {
        users_id: BigInt(data.users_id),
        deleted_at: null,
        status: { notIn: ['cancelado'] },
        data_inicio: { lte: novaFim },
        data_fim: { gte: novaInicio },
      },
      select: { tipo: true, data_inicio: true, data_fim: true },
    });

    if (overlapping) {
      const inicioStr = overlapping.data_inicio.toISOString().substring(0, 10);
      const fimStr = overlapping.data_fim.toISOString().substring(0, 10);
      throw new BadRequestError(
        `O periodo solicitado conflita com uma ausencia existente (${overlapping.tipo} de ${inicioStr} a ${fimStr}).`
      );
    }

    // --- Validacoes de parcelamento CLT para tipo 'ferias' ---
    if (data.tipo === 'ferias') {
      if (data.dias_total < 5) {
        throw new BadRequestError('Periodo minimo de ferias e de 5 dias corridos (CLT Art. 134 §1).');
      }

      // Buscar ferias existentes no mesmo periodo aquisitivo (aprovadas + pendentes)
      // Inclui ferias sem periodo_aquisitivo definido que caiam dentro do periodo atual
      const periodoFilterOR: any[] = [];
      if (periodoAquisitivoInicio && periodoAquisitivoFim) {
        periodoFilterOR.push({
          periodo_aquisitivo_inicio: new Date(periodoAquisitivoInicio),
          periodo_aquisitivo_fim: new Date(periodoAquisitivoFim),
        });
        // Ferias antigas sem periodo aquisitivo definido mas com data_inicio dentro do periodo
        periodoFilterOR.push({
          periodo_aquisitivo_inicio: null,
          data_inicio: {
            gte: new Date(periodoAquisitivoInicio),
            lte: new Date(periodoAquisitivoFim),
          },
        });
      }

      const existingVacations = await db.employees_vacations.findMany({
        where: {
          users_id: BigInt(data.users_id),
          tipo: 'ferias',
          status: { in: ['pendente', 'aprovado', 'em_andamento'] },
          deleted_at: null,
          ...(periodoFilterOR.length > 0 ? { OR: periodoFilterOR } : {}),
        },
        select: { dias_total: true },
      });

      if (existingVacations.length >= 3) {
        throw new BadRequestError('Maximo de 3 periodos de ferias por periodo aquisitivo (CLT Art. 134 §1).');
      }

      // Verificar regra de pelo menos 1 periodo >= 14 dias
      // Se ja existem 2+ periodos e nenhum tem >= 14 dias, o novo periodo deve ter >= 14
      // Se este e o 3o periodo e nenhum (incluindo o novo) tem >= 14 dias, rejeitar
      const allPeriods = [...existingVacations.map(v => v.dias_total ?? 0), data.dias_total];
      if (allPeriods.length >= 2) {
        const hasLongPeriod = allPeriods.some(d => d >= 14);
        if (!hasLongPeriod && allPeriods.length === 3) {
          throw new BadRequestError('Pelo menos 1 dos 3 periodos de ferias deve ter no minimo 14 dias corridos (CLT Art. 134 §1).');
        }
        // Para o 2o periodo: se nenhum dos dois tem >= 14, avisar (via erro preventivo)
        if (!hasLongPeriod && allPeriods.length === 2) {
          // Nao bloqueia ainda — so alerta quando fechar o 3o periodo sem cumprir a regra
          // A validacao definitiva ocorre ao criar o 3o periodo acima
        }
      }
    }

    return db.employees_vacations.create({
      data: {
        users_id: BigInt(data.users_id),
        tipo: data.tipo,
        data_inicio: novaInicio,
        data_fim: novaFim,
        dias_total: data.dias_total,
        dias_abono: data.dias_abono ?? null,
        periodo_aquisitivo_inicio: periodoAquisitivoInicio
          ? new Date(periodoAquisitivoInicio)
          : null,
        periodo_aquisitivo_fim: periodoAquisitivoFim
          ? new Date(periodoAquisitivoFim)
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
   * Apenas registros com status 'pendente' podem ser editados.
   * Para tipo 'ferias', valida minimo de 5 dias se dias_total for alterado.
   */
  static async updateVacation(id: number, data: UpdateVacationInput) {
    const vacation = await db.employees_vacations.findFirst({
      where: { id: BigInt(id), deleted_at: null },
    });

    if (!vacation) {
      throw new NotFoundError('Ferias nao encontradas.');
    }

    // Apenas registros pendentes podem ser editados
    const statusesImutaveis = ['aprovado', 'em_andamento', 'concluido', 'cancelado'];
    if (statusesImutaveis.includes(vacation.status)) {
      throw new BadRequestError('Apenas solicitacoes pendentes podem ser editadas.');
    }

    // Validacao de minimo de 5 dias para tipo 'ferias' ao alterar dias_total
    const tipoFinal = data.tipo ?? vacation.tipo;
    const diasFinal = data.dias_total ?? vacation.dias_total;
    if (tipoFinal === 'ferias' && data.dias_total !== undefined && diasFinal !== null && diasFinal < 5) {
      throw new BadRequestError('Periodo minimo de ferias e de 5 dias corridos (CLT Art. 134 §1).');
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
   * Aplica a tabela CLT Art. 130 para determinar dias de ferias por faltas injustificadas.
   */
  private static calcDiasDireitoCLT(faltas: number): number {
    if (faltas <= 5) return 30;
    if (faltas <= 14) return 24;
    if (faltas <= 23) return 18;
    if (faltas <= 32) return 12;
    return 0;
  }

  /**
   * Calcula o periodo aquisitivo atual baseado na data de admissao.
   * Retorna { inicio, fim } do ciclo de 12 meses ativo na data atual.
   */
  private static calcPeriodoAquisitivo(dataAdmissao: Date): { inicio: Date; fim: Date } {
    const hoje = new Date();
    const admYear = dataAdmissao.getFullYear();
    const admMonth = dataAdmissao.getMonth();
    const admDay = dataAdmissao.getDate();

    // Iterar ciclos de 12 meses a partir da admissao ate encontrar o periodo que contem "hoje"
    let cicloInicio = new Date(admYear, admMonth, admDay);
    let cicloFim = new Date(admYear + 1, admMonth, admDay - 1);

    while (cicloFim < hoje) {
      cicloInicio = new Date(cicloFim.getFullYear(), cicloFim.getMonth(), cicloFim.getDate() + 1);
      cicloFim = new Date(cicloInicio.getFullYear() + 1, cicloInicio.getMonth(), cicloInicio.getDate() - 1);
    }

    return { inicio: cicloInicio, fim: cicloFim };
  }

  /**
   * Calcula o saldo de ferias de um funcionario com regras CLT.
   * - Busca data_admissao para calcular periodo aquisitivo
   * - Conta faltas injustificadas (status 'ausente') no periodo aquisitivo
   * - Aplica tabela CLT Art. 130 para dias de direito
   * - Calcula data prevista e periodo concessivo
   */
  static async getVacationBalance(userId: number) {
    // Buscar dados de RH para data_admissao
    const hrData = await db.employees_hr_data.findFirst({
      where: { users_id: BigInt(userId) },
      select: { data_admissao: true },
    });

    const dataAdmissao = hrData?.data_admissao;

    let dias_direito = 30;
    let faltas_injustificadas = 0;
    let periodo_aquisitivo_inicio: string | null = null;
    let periodo_aquisitivo_fim: string | null = null;
    let periodo_concessivo_fim: string | null = null;
    let data_prevista_ferias: string | null = null;

    if (dataAdmissao) {
      const periodo = this.calcPeriodoAquisitivo(dataAdmissao);
      periodo_aquisitivo_inicio = periodo.inicio.toISOString().substring(0, 10);
      periodo_aquisitivo_fim = periodo.fim.toISOString().substring(0, 10);

      // Data prevista = primeiro dia apos fim do periodo aquisitivo (inicio do concessivo)
      const prevista = new Date(periodo.fim);
      prevista.setDate(prevista.getDate() + 1);
      data_prevista_ferias = prevista.toISOString().substring(0, 10);

      // Periodo concessivo = 12 meses apos o fim do aquisitivo
      const concessivoFim = new Date(prevista);
      concessivoFim.setFullYear(concessivoFim.getFullYear() + 1);
      concessivoFim.setDate(concessivoFim.getDate() - 1);
      periodo_concessivo_fim = concessivoFim.toISOString().substring(0, 10);

      // Contar faltas injustificadas no periodo aquisitivo
      faltas_injustificadas = await db.workforce_daily_log.count({
        where: {
          users_id: BigInt(userId),
          status: 'ausente',
          log_date: {
            gte: periodo.inicio,
            lte: periodo.fim,
          },
        },
      });

      dias_direito = this.calcDiasDireitoCLT(faltas_injustificadas);
    }

    // Buscar ferias usadas e pendentes (do periodo aquisitivo atual se disponivel)
    // Inclui ferias sem periodo_aquisitivo definido cujo data_inicio caia dentro do periodo atual
    let periodoWhereClause: any = {};
    if (dataAdmissao && periodo_aquisitivo_inicio && periodo_aquisitivo_fim) {
      periodoWhereClause = {
        OR: [
          // Ferias com periodo aquisitivo definido e correspondente ao atual
          {
            periodo_aquisitivo_inicio: new Date(periodo_aquisitivo_inicio),
            periodo_aquisitivo_fim: new Date(periodo_aquisitivo_fim),
          },
          // Ferias antigas sem periodo aquisitivo definido mas com data_inicio dentro do periodo
          {
            periodo_aquisitivo_inicio: null,
            data_inicio: {
              gte: new Date(periodo_aquisitivo_inicio),
              lte: new Date(periodo_aquisitivo_fim),
            },
          },
        ],
      };
    }

    const [usedVacations, pendingVacations] = await Promise.all([
      db.employees_vacations.findMany({
        where: {
          users_id: BigInt(userId),
          status: { in: ['aprovado', 'em_andamento', 'concluido'] },
          deleted_at: null,
          ...periodoWhereClause,
        },
        select: { dias_total: true },
      }),
      db.employees_vacations.findMany({
        where: {
          users_id: BigInt(userId),
          status: 'pendente',
          deleted_at: null,
          ...periodoWhereClause,
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
      faltas_injustificadas,
      periodo_aquisitivo_inicio,
      periodo_aquisitivo_fim,
      periodo_concessivo_fim,
      data_prevista_ferias,
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

    const result = await db.employees_day_offs.update({
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

    // Hook: se folga_campo foi aprovada, criar logistica e notificacoes
    if (status === 'aprovado' && dayOff.tipo === 'folga_campo') {
      await this.handleFolgaCampoApproval(dayOff, approvedById);
    }

    return result;
  }

  private static async handleFolgaCampoApproval(
    dayOff: { id: bigint; users_id: bigint; data: Date },
    approvedById: number,
  ) {
    const userId = Number(dayOff.users_id);
    const dayOffId = Number(dayOff.id);

    // Buscar dados de hr para calcular datas de saida/retorno
    const hrData = await db.employees_hr_data.findFirst({
      where: { users_id: dayOff.users_id },
      select: {
        folga_campo_dias_folga: true,
        folga_campo_dias_uteis: true,
      },
    });

    const diasFolga = hrData?.folga_campo_dias_folga ?? 0;
    const diasUteis = hrData?.folga_campo_dias_uteis ?? 0;

    // data_saida = data da folga - dias_uteis (viagem de ida)
    const dataSaida = new Date(dayOff.data);
    dataSaida.setDate(dataSaida.getDate() - diasUteis);

    // data_retorno = data da folga + dias_folga + dias_uteis (viagem de volta)
    const dataRetorno = new Date(dayOff.data);
    dataRetorno.setDate(dataRetorno.getDate() + diasFolga + diasUteis);

    // 1. Criar registro de logistica
    await db.employees_logistics.create({
      data: {
        day_off_id: dayOff.id,
        users_id: dayOff.users_id,
        data_saida: dataSaida,
        data_retorno: dataRetorno,
        status: 'pendente',
      },
    });

    // 2. Notificacao para o funcionario
    try {
      await NotificationsService.createNotification({
        users_id: userId,
        title: 'Folga de Campo Aprovada',
        message: `Sua folga de campo foi aprovada. Saida prevista: ${dataSaida.toISOString().substring(0, 10)}, Retorno: ${dataRetorno.toISOString().substring(0, 10)}.`,
        notification_type: 'success',
        reference_type: 'day_off',
        reference_id: dayOffId,
      });
    } catch (err) {
      console.error('Falha ao criar notificacao para funcionario (folga_campo):', err);
    }

    // 3. Notificacao para o aprovador (responsavel logistica)
    try {
      await NotificationsService.createNotification({
        users_id: approvedById,
        title: 'Nova Logistica Pendente',
        message: `Folga de campo aprovada gerou um registro de logistica pendente. Organize o transporte.`,
        notification_type: 'info',
        reference_type: 'day_off',
        reference_id: dayOffId,
      });
    } catch (err) {
      console.error('Falha ao criar notificacao para aprovador (folga_campo):', err);
    }
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

  // ===========================================================================
  // Logistics (Logistica de Folga de Campo)
  // ===========================================================================

  static async listLogistics(input: ListLogisticsInput) {
    const { users_id, status, page, per_page } = input;
    const company_id = (input as any).company_id;
    const skip = (page - 1) * per_page;

    const whereClause: any = {};

    if (users_id) whereClause.users_id = BigInt(users_id);
    if (company_id && !users_id) whereClause.user = { company_id: BigInt(company_id) };
    if (status) whereClause.status = status;

    const [items, total] = await Promise.all([
      db.employees_logistics.findMany({
        where: whereClause,
        include: {
          user: { select: { id: true, name: true, email: true } },
          responsavel: { select: { id: true, name: true } },
          day_off: { select: { id: true, tipo: true, data: true, status: true } },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: per_page,
      }),
      db.employees_logistics.count({ where: whereClause }),
    ]);

    return buildPaginationResponse(items, total, page, per_page);
  }

  static async updateLogistics(id: number, data: UpdateLogisticsInput) {
    const record = await db.employees_logistics.findFirst({
      where: { id: BigInt(id) },
    });

    if (!record) {
      throw new NotFoundError('Registro de logistica nao encontrado.');
    }

    return db.employees_logistics.update({
      where: { id: BigInt(id) },
      data: {
        tipo_transporte: data.tipo_transporte,
        data_saida: data.data_saida ? new Date(data.data_saida) : undefined,
        data_retorno: data.data_retorno ? new Date(data.data_retorno) : undefined,
        status: data.status,
        responsavel_id: data.responsavel_id ? BigInt(data.responsavel_id) : undefined,
        observacoes: data.observacoes,
        updated_at: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        responsavel: { select: { id: true, name: true } },
        day_off: { select: { id: true, tipo: true, data: true, status: true } },
      },
    });
  }
}

export default EmployeesService;
