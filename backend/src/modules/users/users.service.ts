// =============================================================================
// INDUSTRYVIEW BACKEND - Users Module Service
// Service de usuarios
// Equivalente a logica dos endpoints do api_group User do Xano
// =============================================================================

import { db } from '../../config/database';
import { AuthService } from '../../services/auth.service';
import { EmailService } from '../../services/email.service';
import { BadRequestError, NotFoundError, ConflictError } from '../../utils/errors';
import { normalizeText, generateRandomPassword, generateQRCodeUrl } from '../../utils/helpers';
import { logger } from '../../utils/logger';
import { toNumberRequired } from '../../utils/bigint';
import {
  ListUsersInput,
  CreateUserInput,
  UpdateUserInput,
  ChangePasswordInput,
  ListUsersForTeamsInput,
  SearchUsersForTeamInput,
} from './users.schema';

/**
 * UsersService - Service do modulo de usuarios
 */
export class UsersService {
  /**
   * Lista usuarios com paginacao e filtros
   * Equivalente a: query users_list verb=POST do Xano (endpoint 406)
   */
  static async list(input: ListUsersInput, _authUserId: number) {
    const { page, per_page, search, users_roles_id, company_id, sort_field, sort_direction } = input;

    // Base query conditions
    const whereConditions: any = {
      deleted_at: null,
    };

    // Filtro por empresa
    if (company_id) {
      whereConditions.company_id = company_id;
    }

    // Filtro por roles
    if (users_roles_id && users_roles_id.length > 0) {
      whereConditions.users_permissions = {
        users_roles_id: { in: users_roles_id },
      };
    }

    // Filtro de busca
    if (search && search.trim() !== '') {
      const searchNormalized = normalizeText(search);
      whereConditions.OR = [
        { name_normalized: { contains: searchNormalized } },
        { email: { contains: search.toLowerCase() } },
      ];
    }

    // Conta total de registros
    const total = await db.users.count({ where: whereConditions });

    // Busca usuarios com paginacao
    const users = await db.users.findMany({
      where: whereConditions,
      include: {
        users_permissions: {
          include: {
            users_system_access: {
              select: { id: true, env: true },
            },
            users_roles: {
              select: { id: true, role: true },
            },
            users_control_system: {
              select: { id: true, access_level: true },
            },
          },
        },
        company: {
          select: { id: true, brand_name: true },
        },
        hr_data: {
          select: { cargo: true },
        },
      },
      orderBy: (() => {
        const ALLOWED_SORT_FIELDS = ['name', 'email', 'phone', 'created_at'];
        if (sort_field && ALLOWED_SORT_FIELDS.includes(sort_field)) {
          return { [sort_field]: sort_direction || 'asc' };
        }
        return { name: 'asc' };
      })(),
      skip: (page - 1) * per_page,
      take: per_page,
    });

    // Busca projetos de cada usuario
    const usersWithProjects = await Promise.all(
      users.map(async (user) => {
        const projectsUsers = await db.projects_users.findMany({
          where: {
            users_id: user.id,
            deleted_at: null,
          },
          include: {
            projects: {
              select: { id: true, name: true },
            },
          },
        });

        return {
          ...user,
          _projects: projectsUsers
            .filter(pu => pu.projects)
            .map(pu => pu.projects),
        };
      })
    );

    return {
      items: usersWithProjects,
      curPage: page,
      perPage: per_page,
      itemsReceived: usersWithProjects.length,
      itemsTotal: total,
      pageTotal: Math.ceil(total / per_page),
    };
  }

  /**
   * Cria um novo usuario
   * Equivalente a: query users verb=POST do Xano (endpoint 408)
   */
  static async create(input: CreateUserInput, _authUserId: number) {
    const {
      name,
      phone,
      email,
      users_roles_id,
      users_control_system_id,
      users_system_access_id,
      projects_id,
      company_id,
      teams_id,
      is_leader,
    } = input;

    // Verifica se email ja existe
    const existingUser = await db.users.findFirst({
      where: {
        email,
        deleted_at: null,
      },
    });

    if (existingUser) {
      throw new ConflictError('Ja existe um usuario com este e-mail.');
    }

    // Gera senha aleatoria
    const randomPassword = generateRandomPassword();
    const hashedPassword = await AuthService.hashPassword(randomPassword);

    // Cria usuario em transacao
    const result = await db.$transaction(async (tx) => {
      // Cria usuario
      const user = await tx.users.create({
        data: {
          name,
          name_normalized: normalizeText(name),
          email,
          phone: phone || null,
          password_hash: hashedPassword,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          first_login: true,
          qrcode: '',
          company_id: company_id || null,
        },
      });

      // Atualiza QR code
      await tx.users.update({
        where: { id: user.id },
        data: {
          qrcode: generateQRCodeUrl(toNumberRequired(user.id)),
        },
      });

      // Cria permissoes
      const userPermissions = await tx.users_permissions.create({
        data: {
          created_at: new Date(),
          updated_at: new Date(),
          user_id: user.id,
          users_system_access_id,
          users_roles_id,
          users_control_system_id,
        },
      });

      // Atualiza usuario com referencia de permissoes
      const updatedUser = await tx.users.update({
        where: { id: user.id },
        data: {
          users_permissions_id: userPermissions.id,
          updated_at: new Date(),
        },
      });

      // Associa usuario ao projeto se especificado
      if (projects_id && projects_id !== 0) {
        const project = await tx.projects.findUnique({
          where: { id: projects_id },
        });

        if (!project) {
          throw new BadRequestError('Falha ao associar colaborador ao projeto.');
        }

        await tx.projects_users.create({
          data: {
            users_id: user.id,
            projects_id,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
      }

      // Associa usuario a equipe se especificado
      if (teams_id && teams_id !== 0) {
        if (is_leader) {
          await tx.teams_leaders.create({
            data: {
              users_id: user.id,
              teams_id,
              created_at: new Date(),
              updated_at: new Date(),
              deleted_at: null,
            },
          });
        } else {
          await tx.teams_members.create({
            data: {
              users_id: user.id,
              teams_id,
              created_at: new Date(),
              updated_at: new Date(),
              deleted_at: null,
            },
          });
        }
      }

      return updatedUser;
    });

    // Envia email de boas-vindas com senha (pos processamento)
    try {
      await EmailService.sendWelcomeEmail(email, name, randomPassword);
    } catch (error) {
      logger.error({ error, email }, 'Failed to send welcome email');
      // Nao falha a criacao do usuario se o email falhar
    }

    return result;
  }

  /**
   * Busca usuario por ID
   * Equivalente a: query users/{users_id} verb=GET do Xano (endpoint 407)
   */
  static async getById(userId: number) {
    const user = await db.users.findFirst({
      where: {
        id: userId,
        deleted_at: null,
      },
      include: {
        users_permissions: {
          include: {
            users_system_access: true,
            users_roles: true,
            users_control_system: true,
          },
        },
        company: true,
      },
    });

    if (!user) {
      throw new NotFoundError('Usuario nao encontrado');
    }

    // Busca projetos do usuario
    const projectsUsers = await db.projects_users.findMany({
      where: {
        users_id: userId,
        deleted_at: null,
      },
      include: {
        projects: {
          select: { id: true, name: true },
        },
      },
    });

    // Retorna em result1 como o Flutter espera
    return {
      result1: {
        ...user,
        _projects: projectsUsers
          .filter(pu => pu.projects)
          .map(pu => pu.projects),
      },
    };
  }

  /**
   * Atualiza usuario
   * Equivalente a: query users/{users_id} verb=PATCH do Xano (endpoint 409)
   */
  static async update(userId: number, input: UpdateUserInput) {
    // Verifica se usuario existe
    const existingUser = await db.users.findFirst({
      where: {
        id: userId,
        deleted_at: null,
      },
    });

    if (!existingUser) {
      throw new NotFoundError('Usuario nao encontrado');
    }

    // Verifica email duplicado se estiver alterando
    if (input.email && input.email !== existingUser.email) {
      const emailExists = await db.users.findFirst({
        where: {
          email: input.email,
          deleted_at: null,
          id: { not: userId },
        },
      });

      if (emailExists) {
        throw new ConflictError('Ja existe um usuario com este e-mail.');
      }
    }

    // Prepara dados para atualizacao
    const updateData: any = {
      updated_at: new Date(),
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
      updateData.name_normalized = normalizeText(input.name);
    }
    if (input.email !== undefined) updateData.email = input.email;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.company_id !== undefined) updateData.company_id = input.company_id;
    if (input.first_login !== undefined) updateData.first_login = input.first_login;

    // Atualiza usuario
    const updatedUser = await db.users.update({
      where: { id: userId },
      data: updateData,
    });

    // Atualiza permissoes se necessario
    if (input.users_roles_id || input.users_control_system_id || input.users_system_access_id) {
      if (existingUser.users_permissions_id) {
        const permissionsUpdate: any = { updated_at: new Date() };

        if (input.users_roles_id) permissionsUpdate.users_roles_id = input.users_roles_id;
        if (input.users_control_system_id) permissionsUpdate.users_control_system_id = input.users_control_system_id;
        if (input.users_system_access_id) permissionsUpdate.users_system_access_id = input.users_system_access_id;

        await db.users_permissions.update({
          where: { id: existingUser.users_permissions_id },
          data: permissionsUpdate,
        });
      }
    }

    return updatedUser;
  }

  /**
   * Remove usuario (soft delete)
   * Equivalente a: query users/{users_id} verb=DELETE do Xano (endpoint 410)
   */
  static async delete(userId: number) {
    const existingUser = await db.users.findFirst({
      where: {
        id: userId,
        deleted_at: null,
      },
    });

    if (!existingUser) {
      throw new NotFoundError('Usuario nao encontrado');
    }

    // Soft delete
    await db.users.update({
      where: { id: userId },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    return { message: 'Usuario removido com sucesso' };
  }

  /**
   * Altera senha do usuario
   * Equivalente a: query change_password verb=PUT do Xano (endpoint 589)
   */
  static async changePassword(userId: number, input: ChangePasswordInput) {
    const { current_password, new_password } = input;

    // Busca usuario
    const user = await db.users.findFirst({
      where: {
        id: userId,
        deleted_at: null,
      },
      select: {
        id: true,
        password_hash: true,
      },
    });

    if (!user || !user.password_hash) {
      throw new NotFoundError('Usuario nao encontrado');
    }

    // Verifica senha atual
    const isValidPassword = await AuthService.checkPassword(
      current_password,
      user.password_hash
    );

    if (!isValidPassword) {
      throw new BadRequestError('Senha atual incorreta');
    }

    // Hash da nova senha
    const hashedPassword = await AuthService.hashPassword(new_password);

    // Atualiza senha
    await db.users.update({
      where: { id: userId },
      data: {
        password_hash: hashedPassword,
        updated_at: new Date(),
      },
    });

    return { message: 'Senha alterada com sucesso' };
  }

  /**
   * Lista todos os roles
   * Equivalente a: query users_roles verb=GET do Xano (endpoint 447)
   */
  static async listRoles(page: number = 1, perPage: number = 20) {
    const total = await db.users_roles.count({
      where: { deleted_at: null },
    });

    const roles = await db.users_roles.findMany({
      where: { deleted_at: null },
      orderBy: { role: 'asc' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return {
      items: roles,
      curPage: page,
      perPage,
      itemsReceived: roles.length,
      itemsTotal: total,
      pageTotal: Math.ceil(total / perPage),
    };
  }

  /**
   * Lista todos os system access
   * Equivalente a: query users_system_access verb=GET do Xano (endpoint 442)
   */
  static async listSystemAccess() {
    return db.users_system_access.findMany({
      where: { deleted_at: null },
      orderBy: { env: 'asc' },
    });
  }

  /**
   * Lista todos os control system
   * Equivalente a: query users_control_system verb=GET do Xano (endpoint 452)
   */
  static async listControlSystem() {
    return db.users_control_system.findMany({
      where: { deleted_at: null },
      orderBy: { access_level: 'asc' },
    });
  }

  /**
   * Lista usuarios disponiveis para atribuicao a equipes
   * Equivalente a: endpoint 586 do Xano (users_0)
   *
   * Logica:
   * - Caso 1 (teams_id fornecido e != 0): modo edicao de equipe, inclui membros do time especifico
   * - Caso 2 (teams_id nulo/zero): modo criacao de equipe, inclui apenas usuarios que:
   *   - Possuem role no array users_roles_id
   *   - NAO estao associados a projetos
   *   - NAO sao lideres de nenhuma equipe
   *   - NAO sao membros de nenhuma equipe
   */
  static async listForTeams(input: ListUsersForTeamsInput) {
    const { page, per_page, search, users_roles_id, teams_id, company_id } = input;

    // 1. Busca IDs de usuarios associados a projetos da company
    const projectsUsersRows = await db.projects_users.findMany({
      where: {
        deleted_at: null,
        projects: {
          company_id: company_id ? BigInt(company_id) : undefined,
          deleted_at: null,
        },
      },
      select: { users_id: true },
    });
    const projectsUsersIds = projectsUsersRows.map((r) => r.users_id);

    // 2. Busca IDs de todos os membros de equipes ativos
    const teamsMembersRows = await db.teams_members.findMany({
      where: { deleted_at: null },
      select: { users_id: true },
    });
    const teamsMembersIds = teamsMembersRows
      .filter((r) => r.users_id !== null)
      .map((r) => r.users_id as bigint);

    // 3. Busca IDs de todos os lideres de equipes ativos
    const teamsLeadersRows = await db.teams_leaders.findMany({
      where: { deleted_at: null },
      select: { users_id: true },
    });
    const teamsLeadersIds = teamsLeadersRows
      .filter((r) => r.users_id !== null)
      .map((r) => r.users_id as bigint);

    // 4. Se teams_id fornecido, busca membros desse time especifico
    let specificTeamMembersIds: bigint[] = [];
    if (teams_id && teams_id !== 0) {
      const specificMembersRows = await db.teams_members.findMany({
        where: {
          teams_id: BigInt(teams_id),
          deleted_at: null,
        },
        select: { users_id: true },
      });
      specificTeamMembersIds = specificMembersRows
        .filter((r) => r.users_id !== null)
        .map((r) => r.users_id as bigint);
    }

    // 5. Monta a condicao WHERE usando AND de nivel superior para combinar todas as condicoes
    // Isso evita conflitos de merge entre multiplos OR/AND
    const topLevelAnd: any[] = [];

    // Condicoes basicas: nao deletado e da empresa correta
    topLevelAnd.push({ deleted_at: null });
    if (company_id) {
      topLevelAnd.push({ company_id: BigInt(company_id) });
    }

    // Filtro de busca por nome
    if (search && search.trim() !== '') {
      const searchNormalized = normalizeText(search);
      topLevelAnd.push({
        OR: [
          { name_normalized: { contains: searchNormalized } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // Condicao de elegibilidade:
    // Caso 1: editando time (teams_id fornecido e != 0) -> inclui membros do time especifico OU usuarios livres
    // Caso 2: criando time (teams_id nulo ou zero) -> apenas usuarios livres com a role correta
    if (teams_id && teams_id !== 0) {
      // Condicoes para "usuario livre" (nao esta em projeto, nao e lider, nao e membro)
      const freeUserAndConditions: any[] = [];

      if (projectsUsersIds.length > 0) {
        freeUserAndConditions.push({ id: { notIn: projectsUsersIds } });
      }
      if (teamsLeadersIds.length > 0) {
        freeUserAndConditions.push({ id: { notIn: teamsLeadersIds } });
      }
      if (teamsMembersIds.length > 0) {
        freeUserAndConditions.push({ id: { notIn: teamsMembersIds } });
      }
      if (users_roles_id && users_roles_id.length > 0) {
        freeUserAndConditions.push({
          users_permissions: {
            users_roles_id: { in: users_roles_id.map(BigInt) },
          },
        });
      }

      const freeUserWhere = freeUserAndConditions.length > 0
        ? { AND: freeUserAndConditions }
        : {};

      // Caso 1: membro do time especifico OU usuario livre
      if (specificTeamMembersIds.length > 0) {
        topLevelAnd.push({
          OR: [
            { id: { in: specificTeamMembersIds } },
            freeUserWhere,
          ],
        });
      } else {
        // Nenhum membro no time ainda, retorna apenas usuarios livres
        if (freeUserAndConditions.length > 0) {
          topLevelAnd.push(...freeUserAndConditions);
        }
      }
    } else {
      // Caso 2: criando nova equipe - apenas usuarios livres com a role correta
      if (projectsUsersIds.length > 0) {
        topLevelAnd.push({ id: { notIn: projectsUsersIds } });
      }
      if (teamsLeadersIds.length > 0) {
        topLevelAnd.push({ id: { notIn: teamsLeadersIds } });
      }
      if (teamsMembersIds.length > 0) {
        topLevelAnd.push({ id: { notIn: teamsMembersIds } });
      }
      if (users_roles_id && users_roles_id.length > 0) {
        topLevelAnd.push({
          users_permissions: {
            users_roles_id: { in: users_roles_id.map(BigInt) },
          },
        });
      }
    }

    const whereConditions: any = { AND: topLevelAnd };

    // Conta total de registros
    const total = await db.users.count({ where: whereConditions });

    // Busca usuarios com paginacao
    const users = await db.users.findMany({
      where: whereConditions,
      include: {
        users_permissions: {
          include: {
            users_roles: {
              select: { id: true, role: true },
            },
            users_system_access: {
              select: { id: true, env: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
      skip: (page - 1) * per_page,
      take: per_page,
    });

    // Busca projetos de cada usuario (addon projects)
    const usersWithProjects = await Promise.all(
      users.map(async (user) => {
        const projectsUsers = await db.projects_users.findMany({
          where: {
            users_id: user.id,
            deleted_at: null,
          },
          include: {
            projects: {
              select: { id: true, name: true },
            },
          },
        });

        return {
          ...user,
          projects: projectsUsers
            .filter((pu) => pu.projects)
            .map((pu) => pu.projects),
        };
      })
    );

    // Calcula proxima pagina
    const totalPages = Math.ceil(total / per_page);
    const nextPage = page < totalPages ? page + 1 : null;

    return {
      items: usersWithProjects,
      itemsReceived: usersWithProjects.length,
      itemsTotal: total,
      nextPage,
    };
  }

  // =============================================================================
  // COMPANY METHODS
  // =============================================================================

  /**
   * Cria uma nova empresa
   */
  static async createCompany(input: any, userId: number) {
    logger.info({ userId, input }, 'Creating company');

    const company = await db.company.create({
      data: {
        brand_name: input.brand_name || input.brandName || input.name,
        legal_name: input.legal_name || input.legalName,
        cnpj: input.cnpj,
        phone: input.phone,
        email: input.email,
        cep: input.cep,
        numero: input.numero,
        address_line: input.address_line || input.addressLine,
        address_line2: input.address_line2 || input.addressLine2,
        city: input.city,
        state: input.state,
        company_type: 'matriz',
        bairro: input.bairro,
        complemento: input.complemento,
        pais: input.pais || 'Brasil',
        status_payment_id: input.status_payment_id || input.statusPaymentId || 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    logger.info({ companyId: company.id }, 'Company created successfully');

    // Link the user to the created company
    if (userId) {
      try {
        const updatedUser = await db.users.update({
          where: { id: BigInt(userId) },
          data: { company_id: company.id },
        });
        logger.info({ userId, companyId: company.id }, 'User successfully linked to company');
      } catch (error) {
        logger.error({ error, userId, companyId: company.id }, 'Failed to link user to company');
      }
    }

    return company;
  }

  /**
   * Busca empresa por ID
   */
  static async getCompany(companyId: number) {
    const company = await db.company.findFirst({
      where: {
        id: companyId,
        deleted_at: null,
      },
      include: {
        status_payment: true,
      },
    });

    if (!company) {
      throw new NotFoundError('Empresa nao encontrada');
    }

    return company;
  }

  /**
   * Atualiza empresa
   */
  static async updateCompany(companyId: number, input: any) {
    const existing = await db.company.findFirst({
      where: {
        id: companyId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw new NotFoundError('Empresa nao encontrada');
    }

    const company = await db.company.update({
      where: { id: companyId },
      data: {
        ...input,
        updated_at: new Date(),
      },
    });

    return company;
  }

  // =============================================================================
  // TEAM SEARCH METHOD
  // =============================================================================

  /**
   * Busca usuarios paginada para adicionar como membros/lideres de times
   * Ordena priorizando usuarios SEM atribuicao de time ativo
   * Filtra pela empresa do usuario autenticado
   */
  static async searchForTeam(input: SearchUsersForTeamInput, companyId: number) {
    const { search, page, per_page } = input;

    // Condicoes base: apenas usuarios ativos da mesma empresa
    const whereConditions: any = {
      deleted_at: null,
      company_id: BigInt(companyId),
    };

    if (search && search.trim() !== '') {
      const searchNormalized = normalizeText(search);
      whereConditions.OR = [
        { name_normalized: { contains: searchNormalized } },
        { email: { contains: search.toLowerCase() } },
      ];
    }

    // Total geral de usuarios que satisfazem os filtros
    const total = await db.users.count({ where: whereConditions });

    // Busca IDs de usuarios que ja sao membros ou lideres de times ativos
    const [memberRows, leaderRows] = await Promise.all([
      db.teams_members.findMany({
        where: { deleted_at: null },
        select: { users_id: true },
        distinct: ['users_id'],
      }),
      db.teams_leaders.findMany({
        where: { deleted_at: null },
        select: { users_id: true },
        distinct: ['users_id'],
      }),
    ]);

    const usersInTeams = new Set<string>();
    memberRows.forEach((r) => { if (r.users_id) usersInTeams.add(String(r.users_id)); });
    leaderRows.forEach((r) => { if (r.users_id) usersInTeams.add(String(r.users_id)); });

    // Se um time especifico foi fornecido, busca membros e lideres atuais desse time
    let currentTeamUserIds = new Set<string>();
    if (input.teams_id) {
      const [currentMembers, currentLeaders] = await Promise.all([
        db.teams_members.findMany({
          where: { teams_id: input.teams_id, deleted_at: null },
          select: { users_id: true },
        }),
        db.teams_leaders.findMany({
          where: { teams_id: input.teams_id, deleted_at: null },
          select: { users_id: true },
        }),
      ]);
      currentMembers.forEach((r) => { if (r.users_id) currentTeamUserIds.add(String(r.users_id)); });
      currentLeaders.forEach((r) => { if (r.users_id) currentTeamUserIds.add(String(r.users_id)); });
    }

    // Filtros para "sem time" e "com time"
    const withoutTeamFilter = usersInTeams.size > 0
      ? { id: { notIn: [...usersInTeams].map((id) => BigInt(id)) } }
      : {};

    const withTeamFilter = usersInTeams.size > 0
      ? { id: { in: [...usersInTeams].map((id) => BigInt(id)) } }
      : { id: { in: [] as bigint[] } }; // retorna 0 resultados quando nao ha usuarios em times

    // Conta usuarios SEM time (para calcular a divisao de paginas)
    const countWithoutTeam = await db.users.count({
      where: { ...whereConditions, ...withoutTeamFilter },
    });

    const skip = (page - 1) * per_page;
    let items: { id: number; name: string; email: string; hasTeam: boolean; isMemberOfCurrentTeam: boolean }[] = [];

    if (skip < countWithoutTeam) {
      // A pagina atual comeca no segmento "sem time"
      const fromWithout = await db.users.findMany({
        where: { ...whereConditions, ...withoutTeamFilter },
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' },
        skip,
        take: per_page,
      });
      items = fromWithout.map((u) => ({
        id: Number(u.id),
        name: u.name || '',
        email: u.email || '',
        hasTeam: false,
        isMemberOfCurrentTeam: currentTeamUserIds.has(String(u.id)),
      }));

      // Se precisar de mais itens para completar a pagina, busca do segmento "com time"
      if (items.length < per_page) {
        const remaining = per_page - items.length;
        const fromWith = await db.users.findMany({
          where: { ...whereConditions, ...withTeamFilter },
          select: { id: true, name: true, email: true },
          orderBy: { name: 'asc' },
          skip: 0,
          take: remaining,
        });
        items = [
          ...items,
          ...fromWith.map((u) => ({
            id: Number(u.id),
            name: u.name || '',
            email: u.email || '',
            hasTeam: true,
            isMemberOfCurrentTeam: currentTeamUserIds.has(String(u.id)),
          })),
        ];
      }
    } else {
      // A pagina atual esta inteiramente no segmento "com time"
      const adjustedSkip = skip - countWithoutTeam;
      const fromWith = await db.users.findMany({
        where: { ...whereConditions, ...withTeamFilter },
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' },
        skip: adjustedSkip,
        take: per_page,
      });
      items = fromWith.map((u) => ({
        id: Number(u.id),
        name: u.name || '',
        email: u.email || '',
        hasTeam: true,
        isMemberOfCurrentTeam: currentTeamUserIds.has(String(u.id)),
      }));
    }

    return {
      items,
      curPage: page,
      perPage: per_page,
      itemsReceived: items.length,
      itemsTotal: total,
      pageTotal: Math.ceil(total / per_page),
    };
  }
}

export default UsersService;
