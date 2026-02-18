// =============================================================================
// INDUSTRYVIEW BACKEND - Permission Service
// Servico de verificacao de permissoes
// Equivalente a: function check_permission do Xano
// =============================================================================

import { db } from '../config/database';
import { BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * PermissionService - Servico para verificacao de permissoes
 * Equivalente a function check_permission do Xano
 */
export class PermissionService {
  /**
   * Verifica se o usuario e administrador
   * Equivalente a: function check_permission do Xano
   *
   * @param userId - ID do usuario
   * @returns true se o usuario for admin (users_control_system_id = 3)
   */
  static async isAdmin(userId: number): Promise<boolean> {
    try {
      // Busca permissoes do usuario na tabela users_permissions
      const permission = await db.users_permissions.findFirst({
        where: {
          user_id: BigInt(userId),
          deleted_at: null,
        },
        select: {
          id: true,
          user_id: true,
          users_system_access_id: true,
          users_roles_id: true,
          users_control_system_id: true,
        },
      });

      if (!permission) {
        throw new BadRequestError('Permissoes do usuario nao encontrado.');
      }

      // Verifica se e admin (users_control_system_id = 3)
      const isAdmin = permission.users_control_system_id === BigInt(3);

      return isAdmin;
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      logger.error({ error, userId }, 'Erro ao verificar permissao');
      return false;
    }
  }

  /**
   * Busca todas as permissoes do usuario
   *
   * @param userId - ID do usuario
   * @returns Objeto com todas as permissoes
   */
  static async getUserPermissions(userId: number) {
    const permission = await db.users_permissions.findFirst({
      where: {
        user_id: BigInt(userId),
        deleted_at: null,
      },
      include: {
        users_system_access: true,
        users_roles: true,
        users_control_system: true,
      },
    });

    if (!permission) {
      throw new BadRequestError('Permissoes do usuario nao encontrado.');
    }

    return {
      id: Number(permission.id),
      user_id: Number(permission.user_id),
      users_system_access_id: permission.users_system_access_id
        ? Number(permission.users_system_access_id)
        : null,
      users_roles_id: permission.users_roles_id
        ? Number(permission.users_roles_id)
        : null,
      users_control_system_id: permission.users_control_system_id
        ? Number(permission.users_control_system_id)
        : null,
      users_system_access: permission.users_system_access,
      users_roles: permission.users_roles,
      users_control_system: permission.users_control_system,
    };
  }

  /**
   * Verifica se o usuario tem um role especifico
   *
   * @param userId - ID do usuario
   * @param roleId - ID do role
   * @returns true se o usuario tiver o role
   */
  static async hasRole(userId: number, roleId: number): Promise<boolean> {
    const permission = await db.users_permissions.findFirst({
      where: {
        user_id: BigInt(userId),
        users_roles_id: BigInt(roleId),
        deleted_at: null,
      },
    });

    return !!permission;
  }

  /**
   * Verifica se o usuario tem um nivel de acesso especifico
   *
   * @param userId - ID do usuario
   * @param accessId - ID do nivel de acesso
   * @returns true se o usuario tiver o nivel de acesso
   */
  static async hasSystemAccess(userId: number, accessId: number): Promise<boolean> {
    const permission = await db.users_permissions.findFirst({
      where: {
        user_id: BigInt(userId),
        users_system_access_id: BigInt(accessId),
        deleted_at: null,
      },
    });

    return !!permission;
  }

  /**
   * Verifica se o usuario tem acesso a um projeto
   *
   * @param userId - ID do usuario
   * @param projectId - ID do projeto
   * @returns true se o usuario tiver acesso ao projeto
   */
  static async hasProjectAccess(userId: number, projectId: number): Promise<boolean> {
    // Primeiro verifica se e admin
    const isAdmin = await this.isAdmin(userId);
    if (isAdmin) {
      return true;
    }

    // Verifica se o usuario esta vinculado ao projeto
    const projectUser = await db.projects_users.findFirst({
      where: {
        users_id: BigInt(userId),
        projects_id: BigInt(projectId),
        deleted_at: null,
      },
    });

    return !!projectUser;
  }

  /**
   * Verifica se o usuario tem acesso a uma equipe
   *
   * @param userId - ID do usuario
   * @param teamId - ID da equipe
   * @returns true se o usuario tiver acesso a equipe
   */
  static async hasTeamAccess(userId: number, teamId: number): Promise<boolean> {
    // Primeiro verifica se e admin
    const isAdmin = await this.isAdmin(userId);
    if (isAdmin) {
      return true;
    }

    // Verifica se o usuario e membro da equipe
    const teamMember = await db.teams_members.findFirst({
      where: {
        users_id: BigInt(userId),
        teams_id: BigInt(teamId),
        deleted_at: null,
      },
    });

    if (teamMember) {
      return true;
    }

    // Verifica se o usuario e lider da equipe
    const teamLeader = await db.teams_leaders.findFirst({
      where: {
        users_id: BigInt(userId),
        teams_id: BigInt(teamId),
        deleted_at: null,
      },
    });

    return !!teamLeader;
  }
}

export default PermissionService;
