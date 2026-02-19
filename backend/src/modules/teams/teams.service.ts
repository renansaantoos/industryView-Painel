// =============================================================================
// INDUSTRYVIEW BACKEND - Teams Module Service
// Service de equipes
// Equivalente a logica dos endpoints relacionados a teams do Xano
// =============================================================================

import { db } from '../../config/database';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import {
  ListTeamsInput,
  CreateTeamInput,
  UpdateTeamInput,
  CreateTeamMemberInput,
  CreateTeamLeaderInput,
  EditTeamMembersInput,
  EditTeamLeadersInput,
  LinkTeamProjectInput,
  UnlinkTeamProjectInput,
  ListTeamProjectsQuery,
  TeamProjectHistoryQuery,
  TeamMembersHistoryQuery,
  BulkAddTeamMembersInput,
  BulkAddTeamLeadersInput,
} from './teams.schema';

/**
 * TeamsService - Service do modulo de equipes
 */
export class TeamsService {
  // =============================================================================
  // TEAMS
  // =============================================================================

  /**
   * Lista equipes do projeto
   * Equivalente a: query teams_list_all/{projects_id} verb=POST do Xano (endpoint 537)
   */
  static async listByProject(projectId: number, input: ListTeamsInput, companyId?: number) {
    const { page, per_page, search } = input;

    const whereConditions: any = {
      deleted_at: null,
      OR: [
        { projects_id: projectId },
        { teams_projects: { some: { projects_id: projectId, deleted_at: null } } },
      ],
    };

    // Isolamento multi-tenant via projects.company_id
    if (companyId) {
      whereConditions.projects = { company_id: BigInt(companyId) };
    }

    // Filtro de busca (usa campo name diretamente ja que teams nao tem name_normalized)
    if (search && search.trim() !== '') {
      whereConditions.name = { contains: search, mode: 'insensitive' };
    }

    const total = await db.teams.count({ where: whereConditions });

    const teams = await db.teams.findMany({
      where: whereConditions,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * per_page,
      take: per_page,
    });

    // Busca membros e lideres de cada equipe
    const teamsWithDetails = await Promise.all(
      teams.map(async (team) => {
        const userSelect = {
          id: true,
          name: true,
          email: true,
          phone: true,
          qrcode: true,
          profile_picture: true,
          users_permissions: {
            select: {
              id: true,
              users_system_access_id: true,
              users_roles_id: true,
              users_control_system_id: true,
              users_roles: {
                select: { id: true, role: true },
              },
              users_system_access: {
                select: { id: true, created_at: true, updated_at: true, deleted_at: true, env: true },
              },
              users_control_system: {
                select: { id: true, created_at: true, updated_at: true, deleted_at: true, access_level: true },
              },
            },
          },
        } as const;

        const members = await db.teams_members.findMany({
          where: {
            teams_id: team.id,
            deleted_at: null,
          },
          include: {
            users: {
              select: userSelect,
            },
          },
        });

        const leaders = await db.teams_leaders.findMany({
          where: {
            teams_id: team.id,
            deleted_at: null,
          },
          include: {
            users: {
              select: userSelect,
            },
          },
        });

        return {
          ...team,
          _members: members,
          _leaders: leaders,
          members_count: members.length,
          leaders_count: leaders.length,
        };
      })
    );

    return {
      items: teamsWithDetails,
      curPage: page,
      perPage: per_page,
      itemsReceived: teamsWithDetails.length,
      itemsTotal: total,
      pageTotal: Math.ceil(total / per_page),
    };
  }

  /**
   * Lista todas as equipes
   * Equivalente a: query teams verb=GET do Xano (endpoint 583)
   */
  static async listAll(projectId?: number, page: number = 1, perPage: number = 20, companyId?: number) {
    const whereConditions: any = {
      deleted_at: null,
    };

    if (projectId) {
      whereConditions.OR = [
        { projects_id: projectId },
        { teams_projects: { some: { projects_id: projectId, deleted_at: null } } },
      ];
    }

    // Isolamento multi-tenant: filtra via projects.company_id quando nao ha projectId especifico
    // Inclui equipes vinculadas ao projeto da empresa OU vinculadas via teams_projects
    if (companyId && !projectId) {
      whereConditions.OR = [
        { projects: { company_id: BigInt(companyId) } },
        { teams_projects: { some: { projects: { company_id: BigInt(companyId) }, deleted_at: null } } },
      ];
    }

    const total = await db.teams.count({ where: whereConditions });

    const teams = await db.teams.findMany({
      where: whereConditions,
      include: {
        projects: {
          select: { id: true, name: true },
        },
        teams_projects: {
          where: { deleted_at: null },
          include: {
            projects: { select: { id: true, name: true } },
          },
          orderBy: { created_at: 'desc' },
        },
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return {
      items: teams,
      curPage: page,
      perPage,
      itemsReceived: teams.length,
      itemsTotal: total,
      pageTotal: Math.ceil(total / perPage),
    };
  }

  /**
   * Busca equipe por ID
   * Equivalente a: query teams/{teams_id} verb=GET do Xano (endpoint 536)
   * @param companyId - quando fornecido, garante isolamento multi-tenant via projects
   */
  static async getById(teamId: number, companyId?: number) {
    const where: any = {
      id: teamId,
      deleted_at: null,
    };

    // Isolamento multi-tenant via projeto da equipe
    if (companyId) {
      where.projects = { company_id: BigInt(companyId) };
    }

    const team = await db.teams.findFirst({
      where,
      include: {
        projects: {
          select: { id: true, name: true },
        },
      },
    });

    if (!team) {
      throw new NotFoundError('Equipe nao encontrada.');
    }

    // Busca membros
    const members = await db.teams_members.findMany({
      where: {
        teams_id: teamId,
        deleted_at: null,
      },
      include: {
        users: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Busca lideres
    const leaders = await db.teams_leaders.findMany({
      where: {
        teams_id: teamId,
        deleted_at: null,
      },
      include: {
        users: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return {
      ...team,
      _members: members,
      _leaders: leaders,
      members_count: members.length,
      leaders_count: leaders.length,
    };
  }

  /**
   * Cria equipe
   * Equivalente a: query teams verb=POST do Xano (endpoint 538)
   */
  static async create(input: CreateTeamInput) {
    // Valida se o projeto existe e esta ativo
    const project = await db.projects.findFirst({
      where: { id: input.projects_id },
    });

    if (!project) {
      throw new NotFoundError('Projeto não encontrado.');
    }

    if (project.deleted_at) {
      throw new NotFoundError('Projeto está inativo.');
    }

    const team = await db.$transaction(async (tx) => {
      // Cria a equipe
      const newTeam = await tx.teams.create({
        data: {
          name: input.name,
          projects_id: input.projects_id,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        },
      });

      // Para cada usuario em users_on_team: adiciona como lider e ao projeto
      if (input.users_on_team && input.users_on_team.length > 0) {
        for (const userId of input.users_on_team) {
          // Adiciona como lider da equipe
          await tx.teams_leaders.create({
            data: {
              users_id: userId,
              teams_id: newTeam.id,
              created_at: new Date(),
              updated_at: new Date(),
              deleted_at: null,
            },
          });

          // Associa o usuario ao projeto (ignora se ja existir)
          await tx.projects_users.upsert({
            where: {
              users_id_projects_id: {
                users_id: userId,
                projects_id: input.projects_id,
              },
            },
            create: {
              users_id: userId,
              projects_id: input.projects_id,
              created_at: new Date(),
              updated_at: new Date(),
            },
            update: {}, // no-op se ja existir
          });
        }
      }

      // Cria junction teams_projects + history
      const snapshot = await TeamsService.buildMembersSnapshot(newTeam.id, tx);
      await tx.teams_projects.create({
        data: {
          teams_id: newTeam.id,
          projects_id: input.projects_id,
          start_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      await tx.teams_projects_history.create({
        data: {
          teams_id: newTeam.id,
          projects_id: input.projects_id,
          action: 'VINCULADO',
          team_name: input.name,
          project_name: project.name,
          performed_by_name: 'SISTEMA',
          members_snapshot: snapshot,
          start_at: new Date(),
          created_at: new Date(),
        },
      });

      return newTeam;
    });

    // Atualiza projects_steps se existir
    const projectSteps = await db.projects_steps.findFirst({
      where: { projects_id: input.projects_id },
    });

    if (projectSteps) {
      await db.projects_steps.update({
        where: { id: projectSteps.id },
        data: {
          updated_at: new Date(),
          projects_teams_config_status: 1,
        },
      });
    }

    return team;
  }

  /**
   * Atualiza equipe
   * Equivalente a: query teams/{teams_id} verb=PATCH do Xano (endpoint 539)
   */
  static async update(teamId: number, input: UpdateTeamInput) {
    const existing = await db.teams.findFirst({
      where: {
        id: teamId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw new NotFoundError('Equipe nao encontrada.');
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
    }

    return db.teams.update({
      where: { id: teamId },
      data: updateData,
    });
  }

  /**
   * Remove equipe (soft delete)
   * Equivalente a: query teams/{teams_id} verb=DELETE do Xano (endpoint 535)
   */
  static async delete(teamId: number) {
    const existing = await db.teams.findFirst({
      where: {
        id: teamId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw new NotFoundError('Equipe nao encontrada.');
    }

    // Build snapshot before deletion
    const snapshot = await TeamsService.buildMembersSnapshot(teamId);

    await db.$transaction(async (tx) => {
      // Cria DESVINCULADO history para cada projeto ativo da equipe
      const activeLinks = await tx.teams_projects.findMany({
        where: { teams_id: teamId, deleted_at: null },
        include: { projects: { select: { name: true } } },
      });
      const now = new Date();
      for (const link of activeLinks) {
        await tx.teams_projects_history.create({
          data: {
            teams_id: teamId,
            projects_id: link.projects_id,
            action: 'DESVINCULADO',
            team_name: existing.name,
            project_name: link.projects?.name || null,
            performed_by_name: 'SISTEMA (exclusão de equipe)',
            members_snapshot: snapshot,
            start_at: link.start_at,
            end_at: now,
            created_at: now,
          },
        });
        await tx.teams_projects.update({
          where: { id: link.id },
          data: { deleted_at: now, end_at: now, updated_at: now },
        });
      }

      // Soft delete da equipe, membros e lideres
      await tx.teams.update({
        where: { id: teamId },
        data: { deleted_at: now, updated_at: now },
      });
      await tx.teams_members.updateMany({
        where: { teams_id: teamId },
        data: { deleted_at: now, updated_at: now },
      });
      await tx.teams_leaders.updateMany({
        where: { teams_id: teamId },
        data: { deleted_at: now, updated_at: now },
      });
    });

    return { message: 'Equipe removida com sucesso' };
  }

  // =============================================================================
  // TEAM MEMBERS
  // =============================================================================

  /**
   * Lista membros da equipe
   * Equivalente a: query teams_members verb=GET do Xano (endpoint 557)
   */
  static async listMembers(teamId?: number, page: number = 1, perPage: number = 20, projectId?: number, search?: string, usersRolesId?: number[]) {
    const whereConditions: any = {
      deleted_at: null,
    };

    if (teamId) {
      whereConditions.teams_id = teamId;
    }

    if (projectId) {
      whereConditions.teams = { projects_id: projectId, deleted_at: null };
    }

    // Filtros adicionais (search e usersRolesId)
    if (search && search.trim() !== '') {
      whereConditions.users = {
        name: { contains: search, mode: 'insensitive' },
      };
    }

    if (usersRolesId && usersRolesId.length > 0) {
      // Se nao tiver filtro de user, inicializa
      if (!whereConditions.users) whereConditions.users = {};

      whereConditions.users.users_permissions = {
        users_roles_id: { in: usersRolesId }
      };
    }

    const total = await db.teams_members.count({ where: whereConditions });

    // Filtros de busca e cargo
    if (page === undefined) page = 1;
    if (perPage === undefined) perPage = 20;

    // TODO: Adicionar suporte a filtro de search e usersRolesId aqui se necessário, 
    // mas por enquanto vamos manter simples e filtrar no controller ou adicionar params na assinatura
    // Para simplificar, vamos assumir que teamId/projectId sao os principais filtros agora.
    // Mas para o endpoint POST /teams_list/all, precisamos de mais flexibilidade.
    // Vamos alterar a assinatura do metodo em breve ou criar um novo metodo 'listMembersAdvanced'.

    // Como estamos modificando o comportamento existente, vamos adicionar lógica condicional
    // baseada em argumentos opcionais que passaremos via `any` ou refatorando a assinatura.
    // Para nao quebrar a assinatura atual imediatamente, vamos usar os argumentos existentes.

    const members = await db.teams_members.findMany({
      where: whereConditions,
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profile_picture: true,
            users_permissions: {
              select: {
                id: true,
                users_roles: { select: { id: true, role: true } },
                users_system_access: { select: { id: true, env: true } },
                users_control_system: { select: { id: true, access_level: true } }
              }
            }
          },
        },
        teams: {
          select: { id: true, name: true },
        },
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return {
      items: members,
      curPage: page,
      perPage,
      itemsReceived: members.length,
      itemsTotal: total,
      pageTotal: Math.ceil(total / perPage),
    };
  }

  /**
   * Busca membro por ID
   * Equivalente a: query teams_members/{teams_members_id} verb=GET do Xano (endpoint 556)
   */
  static async getMemberById(memberId: number) {
    const member = await db.teams_members.findFirst({
      where: {
        id: memberId,
        deleted_at: null,
      },
      include: {
        users: true,
        teams: true,
      },
    });

    if (!member) {
      throw new NotFoundError('Membro nao encontrado.');
    }

    return member;
  }

  /**
   * Adiciona membro a equipe
   * Equivalente a: query teams_members verb=POST do Xano (endpoint 558)
   */
  static async createMember(input: CreateTeamMemberInput, performedBy?: { id?: number; name?: string; email?: string }) {
    // Verifica se ja existe
    const existing = await db.teams_members.findFirst({
      where: {
        users_id: input.users_id,
        teams_id: input.teams_id,
        deleted_at: null,
      },
    });

    if (existing) {
      throw new BadRequestError('Usuario ja e membro desta equipe.');
    }

    const [team, user] = await Promise.all([
      db.teams.findFirst({ where: { id: input.teams_id }, select: { name: true } }),
      db.users.findFirst({ where: { id: input.users_id }, select: { name: true, email: true } }),
    ]);

    const member = await db.teams_members.create({
      data: {
        users_id: input.users_id,
        teams_id: input.teams_id,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    });

    await db.teams_members_history.create({
      data: {
        teams_id: input.teams_id,
        users_id: input.users_id,
        action: 'ADICIONADO',
        member_type: 'member',
        team_name: team?.name || null,
        user_name: user?.name || null,
        user_email: user?.email || null,
        performed_by_id: performedBy?.id ? BigInt(performedBy.id) : null,
        performed_by_name: performedBy?.name || null,
        performed_by_email: performedBy?.email || null,
        created_at: new Date(),
      },
    });

    return member;
  }

  /**
   * Adiciona multiplos membros a equipe em uma unica operacao
   * Usuarios que ja sao membros ativos da equipe sao ignorados (sem erro)
   */
  static async bulkCreateMembers(input: BulkAddTeamMembersInput, performedBy?: { id?: number; name?: string; email?: string }) {
    const { teams_id, users_ids } = input;

    // Busca membros existentes para este time e evita duplicatas
    const existingMembers = await db.teams_members.findMany({
      where: {
        teams_id,
        users_id: { in: users_ids },
        deleted_at: null,
      },
      select: { users_id: true },
    });
    const existingSet = new Set(existingMembers.map((m) => Number(m.users_id)));

    // Filtra somente usuarios novos (que ainda nao sao membros)
    const newUserIds = users_ids.filter((id) => !existingSet.has(id));

    if (newUserIds.length === 0) {
      return { added: 0, skipped: users_ids.length, members: [] };
    }

    // Busca dados do time e dos usuarios para registrar no historico
    const [team, users] = await Promise.all([
      db.teams.findFirst({ where: { id: teams_id }, select: { name: true } }),
      db.users.findMany({ where: { id: { in: newUserIds } }, select: { id: true, name: true, email: true } }),
    ]);
    const usersMap = new Map(users.map((u) => [Number(u.id), u]));

    // Cria todos os membros e registros de historico em uma transacao
    const members = await db.$transaction(async (tx) => {
      const created = [];
      for (const userId of newUserIds) {
        const member = await tx.teams_members.create({
          data: {
            users_id: userId,
            teams_id,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
          },
        });
        const userInfo = usersMap.get(userId);
        await tx.teams_members_history.create({
          data: {
            teams_id,
            users_id: userId,
            action: 'ADICIONADO',
            member_type: 'member',
            team_name: team?.name || null,
            user_name: userInfo?.name || null,
            user_email: userInfo?.email || null,
            performed_by_id: performedBy?.id ? BigInt(performedBy.id) : null,
            performed_by_name: performedBy?.name || null,
            performed_by_email: performedBy?.email || null,
            created_at: new Date(),
          },
        });
        created.push(member);
      }
      return created;
    });

    return { added: members.length, skipped: existingSet.size, members };
  }

  /**
   * Remove membro da equipe
   * Equivalente a: query teams_members/{teams_members_id} verb=DELETE do Xano (endpoint 555)
   */
  static async deleteMember(memberId: number, performedBy?: { id?: number; name?: string; email?: string }) {
    const existing = await db.teams_members.findFirst({
      where: {
        id: memberId,
        deleted_at: null,
      },
      include: {
        teams: { select: { name: true } },
        users: { select: { name: true, email: true } },
      },
    });

    if (!existing) {
      throw new NotFoundError('Membro nao encontrado.');
    }

    await db.teams_members.update({
      where: { id: memberId },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    if (existing.teams_id && existing.users_id) {
      await db.teams_members_history.create({
        data: {
          teams_id: existing.teams_id,
          users_id: existing.users_id,
          action: 'REMOVIDO',
          member_type: 'member',
          team_name: existing.teams?.name || null,
          user_name: existing.users?.name || null,
          user_email: existing.users?.email || null,
          performed_by_id: performedBy?.id ? BigInt(performedBy.id) : null,
          performed_by_name: performedBy?.name || null,
          performed_by_email: performedBy?.email || null,
          created_at: new Date(),
        },
      });
    }

    return { message: 'Membro removido com sucesso' };
  }

  /**
   * Edita membros da equipe (substitui todos)
   * Equivalente a: query edit_teams_member verb=PUT do Xano (endpoint 584)
   */
  static async editMembers(input: EditTeamMembersInput, performedBy?: { id?: number; name?: string; email?: string }) {
    const { teams_id, users_ids } = input;

    await db.$transaction(async (tx) => {
      const team = await tx.teams.findFirst({ where: { id: teams_id }, select: { name: true } });
      const now = new Date();

      // Busca membros atuais para logar remoções
      const currentMembers = await tx.teams_members.findMany({
        where: { teams_id, deleted_at: null },
        include: { users: { select: { id: true, name: true, email: true } } },
      });

      const currentIds = new Set(currentMembers.map(m => Number(m.users_id)));
      const newIds = new Set(users_ids);

      // Remove todos os membros atuais
      await tx.teams_members.updateMany({
        where: { teams_id, deleted_at: null },
        data: { deleted_at: now, updated_at: now },
      });

      // Log removidos
      for (const member of currentMembers) {
        if (!newIds.has(Number(member.users_id))) {
          await tx.teams_members_history.create({
            data: {
              teams_id,
              users_id: member.users_id!,
              action: 'REMOVIDO',
              member_type: 'member',
              team_name: team?.name || null,
              user_name: member.users?.name || null,
              user_email: member.users?.email || null,
              performed_by_id: performedBy?.id ? BigInt(performedBy.id) : null,
              performed_by_name: performedBy?.name || null,
              performed_by_email: performedBy?.email || null,
              created_at: now,
            },
          });
        }
      }

      // Adiciona os novos membros
      for (const userId of users_ids) {
        await tx.teams_members.create({
          data: {
            users_id: userId,
            teams_id,
            created_at: now,
            updated_at: now,
            deleted_at: null,
          },
        });

        // Log adicionados (novos que não estavam antes)
        if (!currentIds.has(userId)) {
          const user = await tx.users.findFirst({ where: { id: userId }, select: { name: true, email: true } });
          await tx.teams_members_history.create({
            data: {
              teams_id,
              users_id: userId,
              action: 'ADICIONADO',
              member_type: 'member',
              team_name: team?.name || null,
              user_name: user?.name || null,
              user_email: user?.email || null,
              performed_by_id: performedBy?.id ? BigInt(performedBy.id) : null,
              performed_by_name: performedBy?.name || null,
              performed_by_email: performedBy?.email || null,
              created_at: now,
            },
          });
        }
      }
    });

    return { message: 'Membros atualizados com sucesso' };
  }

  // =============================================================================
  // TEAM LEADERS
  // =============================================================================

  /**
   * Lista lideres da equipe
   * Equivalente a: query teams_leaders verb=GET do Xano (endpoint 552)
   */
  static async listLeaders(teamId?: number, page: number = 1, perPage: number = 20, projectId?: number) {
    const whereConditions: any = {
      deleted_at: null,
    };

    if (teamId) {
      whereConditions.teams_id = teamId;
    }

    if (projectId) {
      whereConditions.teams = { projects_id: projectId, deleted_at: null };
    }

    const total = await db.teams_leaders.count({ where: whereConditions });

    const leaders = await db.teams_leaders.findMany({
      where: whereConditions,
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            qrcode: true,
            profile_picture: true,
            users_permissions: {
              select: {
                id: true,
                users_system_access_id: true,
                users_roles_id: true,
                users_control_system_id: true,
                users_roles: {
                  select: { id: true, role: true },
                },
                users_system_access: {
                  select: { id: true, created_at: true, updated_at: true, deleted_at: true, env: true },
                },
                users_control_system: {
                  select: { id: true, created_at: true, updated_at: true, deleted_at: true, access_level: true },
                },
              },
            },
          },
        },
        teams: {
          select: { id: true, name: true },
        },
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return {
      items: leaders.map((leader) => ({
        ...leader,
        user: leader.users,
      })),
      curPage: page,
      perPage,
      itemsReceived: leaders.length,
      itemsTotal: total,
      pageTotal: Math.ceil(total / perPage),
    };
  }

  /**
   * Busca lider por ID
   * Equivalente a: query teams_leaders/{teams_leaders_id} verb=GET do Xano (endpoint 551)
   */
  static async getLeaderById(leaderId: number) {
    const leader = await db.teams_leaders.findFirst({
      where: {
        id: leaderId,
        deleted_at: null,
      },
      include: {
        users: true,
        teams: true,
      },
    });

    if (!leader) {
      throw new NotFoundError('Lider nao encontrado.');
    }

    return leader;
  }

  /**
   * Adiciona lider a equipe
   * Equivalente a: query teams_leaders verb=POST do Xano (endpoint 553)
   */
  static async createLeader(input: CreateTeamLeaderInput, performedBy?: { id?: number; name?: string; email?: string }) {
    // Verifica se ja existe
    const existing = await db.teams_leaders.findFirst({
      where: {
        users_id: input.users_id,
        teams_id: input.teams_id,
        deleted_at: null,
      },
    });

    if (existing) {
      throw new BadRequestError('Usuario ja e lider desta equipe.');
    }

    const [team, user] = await Promise.all([
      db.teams.findFirst({ where: { id: input.teams_id }, select: { name: true } }),
      db.users.findFirst({ where: { id: input.users_id }, select: { name: true, email: true } }),
    ]);

    const leader = await db.teams_leaders.create({
      data: {
        users_id: input.users_id,
        teams_id: input.teams_id,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      },
    });

    await db.teams_members_history.create({
      data: {
        teams_id: input.teams_id,
        users_id: input.users_id,
        action: 'ADICIONADO',
        member_type: 'leader',
        team_name: team?.name || null,
        user_name: user?.name || null,
        user_email: user?.email || null,
        performed_by_id: performedBy?.id ? BigInt(performedBy.id) : null,
        performed_by_name: performedBy?.name || null,
        performed_by_email: performedBy?.email || null,
        created_at: new Date(),
      },
    });

    return leader;
  }

  /**
   * Adiciona multiplos lideres a equipe em uma unica operacao
   * Usuarios que ja sao lideres ativos da equipe sao ignorados (sem erro)
   */
  static async bulkCreateLeaders(input: BulkAddTeamLeadersInput, performedBy?: { id?: number; name?: string; email?: string }) {
    const { teams_id, users_ids } = input;

    // Busca lideres existentes para este time e evita duplicatas
    const existingLeaders = await db.teams_leaders.findMany({
      where: {
        teams_id,
        users_id: { in: users_ids },
        deleted_at: null,
      },
      select: { users_id: true },
    });
    const existingSet = new Set(existingLeaders.map((l) => Number(l.users_id)));

    // Filtra somente usuarios novos (que ainda nao sao lideres)
    const newUserIds = users_ids.filter((id) => !existingSet.has(id));

    if (newUserIds.length === 0) {
      return { added: 0, skipped: users_ids.length, leaders: [] };
    }

    // Busca dados do time e dos usuarios para registrar no historico
    const [team, users] = await Promise.all([
      db.teams.findFirst({ where: { id: teams_id }, select: { name: true } }),
      db.users.findMany({ where: { id: { in: newUserIds } }, select: { id: true, name: true, email: true } }),
    ]);
    const usersMap = new Map(users.map((u) => [Number(u.id), u]));

    // Cria todos os lideres e registros de historico em uma transacao
    const leaders = await db.$transaction(async (tx) => {
      const created = [];
      for (const userId of newUserIds) {
        const leader = await tx.teams_leaders.create({
          data: {
            users_id: userId,
            teams_id,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
          },
        });
        const userInfo = usersMap.get(userId);
        await tx.teams_members_history.create({
          data: {
            teams_id,
            users_id: userId,
            action: 'ADICIONADO',
            member_type: 'leader',
            team_name: team?.name || null,
            user_name: userInfo?.name || null,
            user_email: userInfo?.email || null,
            performed_by_id: performedBy?.id ? BigInt(performedBy.id) : null,
            performed_by_name: performedBy?.name || null,
            performed_by_email: performedBy?.email || null,
            created_at: new Date(),
          },
        });
        created.push(leader);
      }
      return created;
    });

    return { added: leaders.length, skipped: existingSet.size, leaders };
  }

  /**
   * Remove lider da equipe
   * Equivalente a: query teams_leaders/{teams_leaders_id} verb=DELETE do Xano (endpoint 550)
   */
  static async deleteLeader(leaderId: number, performedBy?: { id?: number; name?: string; email?: string }) {
    const existing = await db.teams_leaders.findFirst({
      where: {
        id: leaderId,
        deleted_at: null,
      },
      include: {
        teams: { select: { name: true } },
        users: { select: { name: true, email: true } },
      },
    });

    if (!existing) {
      throw new NotFoundError('Lider nao encontrado.');
    }

    await db.teams_leaders.update({
      where: { id: leaderId },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    if (existing.teams_id && existing.users_id) {
      await db.teams_members_history.create({
        data: {
          teams_id: existing.teams_id,
          users_id: existing.users_id,
          action: 'REMOVIDO',
          member_type: 'leader',
          team_name: existing.teams?.name || null,
          user_name: existing.users?.name || null,
          user_email: existing.users?.email || null,
          performed_by_id: performedBy?.id ? BigInt(performedBy.id) : null,
          performed_by_name: performedBy?.name || null,
          performed_by_email: performedBy?.email || null,
          created_at: new Date(),
        },
      });
    }

    return { message: 'Lider removido com sucesso' };
  }

  /**
   * Edita lideres da equipe (substitui todos)
   * Equivalente a: query edit_teams_leaders verb=PUT do Xano (endpoint 585)
   */
  static async editLeaders(input: EditTeamLeadersInput, performedBy?: { id?: number; name?: string; email?: string }) {
    const { teams_id, users_ids } = input;

    await db.$transaction(async (tx) => {
      const team = await tx.teams.findFirst({ where: { id: teams_id }, select: { name: true } });
      const now = new Date();

      // Busca lideres atuais para logar remoções
      const currentLeaders = await tx.teams_leaders.findMany({
        where: { teams_id, deleted_at: null },
        include: { users: { select: { id: true, name: true, email: true } } },
      });

      const currentIds = new Set(currentLeaders.map(l => Number(l.users_id)));
      const newIds = new Set(users_ids);

      // Remove todos os lideres atuais
      await tx.teams_leaders.updateMany({
        where: { teams_id, deleted_at: null },
        data: { deleted_at: now, updated_at: now },
      });

      // Log removidos
      for (const leader of currentLeaders) {
        if (!newIds.has(Number(leader.users_id))) {
          await tx.teams_members_history.create({
            data: {
              teams_id,
              users_id: leader.users_id!,
              action: 'REMOVIDO',
              member_type: 'leader',
              team_name: team?.name || null,
              user_name: leader.users?.name || null,
              user_email: leader.users?.email || null,
              performed_by_id: performedBy?.id ? BigInt(performedBy.id) : null,
              performed_by_name: performedBy?.name || null,
              performed_by_email: performedBy?.email || null,
              created_at: now,
            },
          });
        }
      }

      // Adiciona os novos lideres
      for (const userId of users_ids) {
        await tx.teams_leaders.create({
          data: {
            users_id: userId,
            teams_id,
            created_at: now,
            updated_at: now,
            deleted_at: null,
          },
        });

        // Log adicionados
        if (!currentIds.has(userId)) {
          const user = await tx.users.findFirst({ where: { id: userId }, select: { name: true, email: true } });
          await tx.teams_members_history.create({
            data: {
              teams_id,
              users_id: userId,
              action: 'ADICIONADO',
              member_type: 'leader',
              team_name: team?.name || null,
              user_name: user?.name || null,
              user_email: user?.email || null,
              performed_by_id: performedBy?.id ? BigInt(performedBy.id) : null,
              performed_by_name: performedBy?.name || null,
              performed_by_email: performedBy?.email || null,
              created_at: now,
            },
          });
        }
      }
    });

    return { message: 'Lideres atualizados com sucesso' };
  }

  /**
   * Lista todos os lideres de uma equipe especifica
   * Equivalente a: query teams_leaders_all/{teams_id} verb=GET do Xano (endpoint 570)
   */
  static async listAllLeadersByTeam(teamId: number) {
    const leaders = await db.teams_leaders.findMany({
      where: {
        teams_id: teamId,
        deleted_at: null,
      },
      include: {
        users: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return leaders;
  }

  // =============================================================================
  // TEAMS PROJECTS (N:M junction + history)
  // =============================================================================

  /**
   * Cria snapshot JSON dos membros e lideres da equipe
   */
  static async buildMembersSnapshot(teamId: number | bigint, tx?: any) {
    const client = tx || db;
    const leaders = await client.teams_leaders.findMany({
      where: { teams_id: teamId, deleted_at: null },
      include: { users: { select: { id: true, name: true, email: true } } },
    });
    const members = await client.teams_members.findMany({
      where: { teams_id: teamId, deleted_at: null },
      include: { users: { select: { id: true, name: true, email: true } } },
    });
    return [
      ...leaders.map((l: any) => ({
        user_id: Number(l.users?.id),
        name: l.users?.name || '',
        email: l.users?.email || '',
        role: 'leader',
      })),
      ...members.map((m: any) => ({
        user_id: Number(m.users?.id),
        name: m.users?.name || '',
        email: m.users?.email || '',
        role: 'member',
      })),
    ];
  }

  /**
   * Lista projetos vinculados a uma equipe (ou equipes de um projeto)
   */
  static async listTeamProjects(query: ListTeamProjectsQuery) {
    const { teams_id, projects_id, page, per_page } = query;

    const whereConditions: any = { deleted_at: null };
    if (teams_id) whereConditions.teams_id = teams_id;
    if (projects_id) whereConditions.projects_id = projects_id;

    const total = await db.teams_projects.count({ where: whereConditions });

    const items = await db.teams_projects.findMany({
      where: whereConditions,
      include: {
        teams: { select: { id: true, name: true } },
        projects: { select: { id: true, name: true } },
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * per_page,
      take: per_page,
    });

    return {
      items,
      curPage: page,
      perPage: per_page,
      itemsReceived: items.length,
      itemsTotal: total,
      pageTotal: Math.ceil(total / per_page),
    };
  }

  /**
   * Checa conflitos: retorna projetos ativos em que a equipe ja esta vinculada
   */
  static async checkTeamConflicts(teamId: number) {
    const activeLinks = await db.teams_projects.findMany({
      where: { teams_id: teamId, deleted_at: null },
      include: { projects: { select: { id: true, name: true } } },
    });

    return {
      teams_id: teamId,
      active_projects: activeLinks.map((l) => ({
        projects_id: Number(l.projects_id),
        project_name: l.projects?.name || '',
        start_at: l.start_at,
      })),
      has_conflicts: activeLinks.length > 0,
    };
  }

  /**
   * Vincula equipe a projeto
   */
  static async linkTeamToProject(
    input: LinkTeamProjectInput,
    performedBy: { id?: number; name?: string; email?: string }
  ) {
    const team = await db.teams.findFirst({
      where: { id: input.teams_id, deleted_at: null },
    });
    if (!team) throw new NotFoundError('Equipe nao encontrada.');

    const project = await db.projects.findFirst({
      where: { id: input.projects_id, deleted_at: null },
    });
    if (!project) throw new NotFoundError('Projeto nao encontrado.');

    // Verifica se ja existe vinculo ativo
    const existing = await db.teams_projects.findFirst({
      where: {
        teams_id: input.teams_id,
        projects_id: input.projects_id,
        deleted_at: null,
      },
    });
    if (existing) throw new BadRequestError('Equipe ja esta vinculada a este projeto.');

    const snapshot = await TeamsService.buildMembersSnapshot(input.teams_id);
    const now = new Date();

    const result = await db.$transaction(async (tx) => {
      // Upsert: se existir soft-deleted, reativa; senao cria
      const link = await tx.teams_projects.upsert({
        where: {
          teams_id_projects_id: {
            teams_id: input.teams_id,
            projects_id: input.projects_id,
          },
        },
        create: {
          teams_id: input.teams_id,
          projects_id: input.projects_id,
          start_at: now,
          created_at: now,
          updated_at: now,
        },
        update: {
          start_at: now,
          end_at: null,
          deleted_at: null,
          updated_at: now,
        },
      });

      // Cria historico
      await tx.teams_projects_history.create({
        data: {
          teams_id: input.teams_id,
          projects_id: input.projects_id,
          action: 'VINCULADO',
          team_name: team.name,
          project_name: project.name,
          performed_by_id: performedBy.id ? BigInt(performedBy.id) : null,
          performed_by_name: performedBy.name || null,
          performed_by_email: performedBy.email || null,
          members_snapshot: snapshot,
          start_at: now,
          created_at: now,
        },
      });

      // Upsert projects_users para cada membro/lider da equipe
      const allUserIds = snapshot
        .map((s: any) => s.user_id)
        .filter((id: number) => id > 0);
      for (const userId of allUserIds) {
        await tx.projects_users.upsert({
          where: {
            users_id_projects_id: {
              users_id: userId,
              projects_id: input.projects_id,
            },
          },
          create: {
            users_id: userId,
            projects_id: input.projects_id,
            created_at: now,
            updated_at: now,
          },
          update: {},
        });
      }

      return link;
    });

    return result;
  }

  /**
   * Desvincula equipe de projeto
   */
  static async unlinkTeamFromProject(
    input: UnlinkTeamProjectInput,
    performedBy: { id?: number; name?: string; email?: string }
  ) {
    const link = await db.teams_projects.findFirst({
      where: {
        teams_id: input.teams_id,
        projects_id: input.projects_id,
        deleted_at: null,
      },
    });
    if (!link) throw new NotFoundError('Vinculo nao encontrado.');

    const team = await db.teams.findFirst({ where: { id: input.teams_id } });
    const project = await db.projects.findFirst({ where: { id: input.projects_id } });
    const snapshot = await TeamsService.buildMembersSnapshot(input.teams_id);
    const now = new Date();

    await db.$transaction(async (tx) => {
      // Soft-delete junction
      await tx.teams_projects.update({
        where: { id: link.id },
        data: { deleted_at: now, end_at: now, updated_at: now },
      });

      // Cria historico
      await tx.teams_projects_history.create({
        data: {
          teams_id: input.teams_id,
          projects_id: input.projects_id,
          action: 'DESVINCULADO',
          team_name: team?.name || null,
          project_name: project?.name || null,
          performed_by_id: performedBy.id ? BigInt(performedBy.id) : null,
          performed_by_name: performedBy.name || null,
          performed_by_email: performedBy.email || null,
          members_snapshot: snapshot,
          start_at: link.start_at,
          end_at: now,
          created_at: now,
        },
      });
    });

    return { message: 'Equipe desvinculada do projeto com sucesso.' };
  }

  /**
   * Lista historico de membros/lideres adicionados/removidos da equipe
   */
  static async listMembersHistory(query: TeamMembersHistoryQuery) {
    const { teams_id, users_id, page, per_page, member_type } = query;

    const whereConditions: any = {};
    if (teams_id) whereConditions.teams_id = teams_id;
    if (users_id) whereConditions.users_id = users_id;
    if (member_type) whereConditions.member_type = member_type;

    const total = await db.teams_members_history.count({ where: whereConditions });

    const items = await db.teams_members_history.findMany({
      where: whereConditions,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * per_page,
      take: per_page,
    });

    return {
      items,
      curPage: page,
      perPage: per_page,
      itemsReceived: items.length,
      itemsTotal: total,
      pageTotal: Math.ceil(total / per_page),
    };
  }

  /**
   * Lista historico de vinculos/desvinculos paginado
   */
  static async listTeamProjectHistory(query: TeamProjectHistoryQuery) {
    const { teams_id, projects_id, page, per_page } = query;

    const whereConditions: any = {};
    if (teams_id) whereConditions.teams_id = teams_id;
    if (projects_id) whereConditions.projects_id = projects_id;

    const total = await db.teams_projects_history.count({ where: whereConditions });

    const items = await db.teams_projects_history.findMany({
      where: whereConditions,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * per_page,
      take: per_page,
    });

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

export default TeamsService;
