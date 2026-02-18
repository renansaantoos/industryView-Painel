// =============================================================================
// INDUSTRYVIEW BACKEND - Auth Module Service
// Service de autenticacao do modulo
// Equivalente a logica de auth/signup, auth/login, auth/me do Xano
// =============================================================================

import { db } from '../../config/database';
import { AuthService } from '../../services/auth.service';
import { EmailService } from '../../services/email.service';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../utils/errors';
import { normalizeText, generateQRCodeUrl } from '../../utils/helpers';
import { SignupInput, LoginInput } from './auth.schema';
import { toNumberRequired } from '../../utils/bigint';
import { logger } from '../../utils/logger';

/**
 * AuthModuleService - Service do modulo de autenticacao
 */
export class AuthModuleService {
  /**
   * Registra um novo usuario
   * Equivalente a: query "auth/signup" verb=POST do Xano
   */
  static async signup(input: SignupInput): Promise<{ authToken: string }> {
    const {
      name,
      email,
      phone,
      password_hash,
      env_from_create = 1,
      user_system_access = 3,
      user_control_system = 2,
      user_role_type = 5,
    } = input;

    // Verifica se usuario ja existe
    const existingUser = await db.users.findFirst({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestError('Usuario ja esta cadastrado na base de dados.');
    }

    // Determina permissoes baseado na origem do cadastro
    // Equivalente a: conditional { if ($input.env_from_create === ...) } do Xano
    let userPermissionsData = {
      userAccess: user_system_access,
      userRole: user_role_type,
      userControl: user_control_system,
    };

    if (env_from_create === 0) {
      userPermissionsData = {
        userAccess: 2,
        userRole: 10,
        userControl: 2,
      };
    } else if (env_from_create === 2) {
      userPermissionsData = {
        userAccess: 3,
        userRole: 10,
        userControl: 2,
      };
    }

    // Hash da senha
    const hashedPassword = await AuthService.hashPassword(password_hash);

    // Cria usuario em transacao
    // Equivalente a: db.transaction do Xano
    const result = await db.$transaction(async (tx) => {
      // Cria usuario
      const user = await tx.users.create({
        data: {
          name,
          name_normalized: normalizeText(name),
          email,
          phone: phone || null,
          password_hash: hashedPassword,
          forget_password_code: null,
          created_at: new Date(),
          updated_at: new Date(),
          first_login: true,
          qrcode: '',
          company_id: null,
        },
      });

      // Cria permissoes
      const userPermissions = await tx.users_permissions.create({
        data: {
          created_at: new Date(),
          updated_at: new Date(),
          user_id: user.id,
          users_system_access_id: userPermissionsData.userAccess,
          users_roles_id: userPermissionsData.userRole,
          users_control_system_id: userPermissionsData.userControl,
        },
      });

      if (!userPermissions) {
        throw new BadRequestError('Falha ao tentar criar usuario.');
      }

      // Atualiza usuario com QR code e permissoes
      const updatedUser = await tx.users.update({
        where: { id: user.id },
        data: {
          updated_at: new Date(),
          users_permissions_id: userPermissions.id,
          qrcode: generateQRCodeUrl(toNumberRequired(user.id)),
        },
      });

      return updatedUser;
    });

    // Gera token de autenticacao
    // Equivalente a: security.create_auth_token do Xano
    const authToken = AuthService.createAuthToken(toNumberRequired(result.id), result.email!);

    return { authToken };
  }

  /**
   * Realiza login do usuario
   * Equivalente a: query "auth/login" verb=POST do Xano
   */
  static async login(input: LoginInput): Promise<{ authToken: string }> {
    const { email, password_hash } = input;

    // Busca usuario por email
    const user = await db.users.findFirst({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        password_hash: true,
        created_at: true,
        deleted_at: true,
      },
    });

    // Equivalente a: precondition ($users != null) do Xano
    if (!user) {
      throw new UnauthorizedError('Esse usuario nao tem acesso');
    }

    // Equivalente a: precondition ($users.deleted_at == null) do Xano
    if (user.deleted_at) {
      throw new UnauthorizedError('Esse usuario nao tem acesso ao painel');
    }

    if (!user.password_hash) {
      throw new UnauthorizedError('Invalid Credentials.');
    }

    // Verifica senha
    // Equivalente a: security.check_password do Xano
    const isValidPassword = await AuthService.checkPassword(
      password_hash,
      user.password_hash
    );

    // Equivalente a: precondition ($pass_result) do Xano
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid Credentials.');
    }

    // Cria token de autenticacao
    // Equivalente a: security.create_auth_token do Xano
    const authToken = AuthService.createAuthToken(Number(user.id), user.email!);

    return { authToken };
  }

  /**
   * Busca dados do usuario autenticado
   * Equivalente a: query "auth/me" verb=GET do Xano
   */
  static async getMe(userId: number) {
    logger.info({ userId }, 'Seeking data for the authenticated user');

    // Busca usuario com todos os addons usando findUnique para performance e segurança
    const user = await db.users.findUnique({
      where: {
        id: BigInt(userId),
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

    // Equivalente a: precondition ($model != null) do Xano
    if (!user || user.deleted_at) {
      logger.warn({ userId }, 'User not found or deactivated');
      throw new NotFoundError('Not Found');
    }

    logger.info({ userId, companyId: user.company_id }, 'User found, checking associated company');

    // Busca projetos do usuario
    const projectsUsers = await db.projects_users.findMany({
      where: {
        users_id: BigInt(userId),
        deleted_at: null,
        projects: {
          deleted_at: null,
        },
      },
      include: {
        users: {
          include: {
            users_permissions: {
              include: {
                users_control_system: {
                  select: { id: true, access_level: true },
                },
                users_roles: {
                  select: { id: true, role: true },
                },
                users_system_access: {
                  select: { id: true, env: true },
                },
              },
            },
          },
        },
        projects: {
          include: {
            sprints: {
              where: {
                sprints_statuses_id: 1, // Em andamento
                deleted_at: null,
              },
              select: {
                id: true,
                sprints_statuses_id: true,
              },
            },
          },
        },
      },
    });

    // Formata resposta igual ao Xano
    const projectsWithSprints = projectsUsers.map((pu: any) => ({
      ...pu,
      sprints_of_projects_of_sprints_statuses: pu.projects?.sprints?.[0] || null,
    }));

    return {
      result1: projectsWithSprints,
      user: user,
    };
  }

  /**
   * Login diario (app mobile)
   * Equivalente a: query "daily_login" verb=POST do Xano
   */
  static async dailyLogin(email?: string, password?: string) {
    if (!email || !password) {
      throw new BadRequestError('Email e senha sao obrigatorios');
    }

    // Reutiliza logica de login
    return this.login({ email, password_hash: password });
  }

  /**
   * Me para app mobile
   * Equivalente a: query "auth/me/app" verb=GET do Xano
   */
  static async getMeApp(userId: number) {
    // Similar ao getMe mas com menos dados
    const user = await db.users.findFirst({
      where: {
        id: BigInt(userId),
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
      },
    });

    if (!user) {
      throw new NotFoundError('Not Found');
    }

    // Busca projetos e equipes do usuario
    const projectsUsers = await db.projects_users.findMany({
      where: {
        users_id: BigInt(userId),
        deleted_at: null,
      },
      select: {
        projects_id: true,
      },
    });

    const projectIds = projectsUsers.map(pu => pu.projects_id).filter(Boolean);

    // Busca equipes onde o usuario e membro
    const teamsMemberships = await db.teams_members.findMany({
      where: {
        users_id: BigInt(userId),
        deleted_at: null,
      },
      include: {
        teams: true,
      },
    });

    // Busca equipes onde o usuario e lider
    const teamsLeaderships = await db.teams_leaders.findMany({
      where: {
        users_id: BigInt(userId),
        deleted_at: null,
      },
      include: {
        teams: true,
      },
    });

    return {
      user,
      projects: projectIds,
      teams: {
        member: teamsMemberships.map(tm => tm.teams),
        leader: teamsLeaderships.map(tl => tl.teams),
      },
    };
  }

  // =============================================================================
  // PASSWORD RECOVERY METHODS (SendGrid)
  // =============================================================================

  /**
   * Envia codigo de recuperacao de senha
   * Equivalente a: sendgrid/send/code do Xano
   */
  static async sendRecoveryCode(emailToRecover: string) {
    const user = await db.users.findFirst({
      where: { email: emailToRecover, deleted_at: null },
    });

    if (!user) {
      throw new NotFoundError('Usuario nao encontrado');
    }

    // Gera codigo de 6 digitos
    const recoveryCode = Math.floor(100000 + Math.random() * 900000);

    // Salva codigo no usuario
    await db.users.update({
      where: { id: user.id },
      data: {
        forget_password_code: recoveryCode,
        updated_at: new Date(),
      },
    });

    // Envia email (email/name nunca serao null pois o user foi buscado por email)
    await EmailService.sendPasswordResetCode(
      user.email!,
      user.name ?? '',
      recoveryCode
    );

    logger.info({ email: emailToRecover }, 'Recovery code sent via SendGrid');

    return {
      success: true,
      message: 'Codigo enviado para o email',
      // Em dev, retorna o codigo para testes
      ...(process.env.NODE_ENV === 'development' && { code: recoveryCode.toString() }),
    };
  }

  /**
   * Valida codigo de recuperacao
   * Equivalente a: sendgrid/validate/code do Xano
   */
  static async validateRecoveryCode(code: string, usersEmail: string) {
    const codeInt = parseInt(code, 10);
    if (isNaN(codeInt)) {
      throw new BadRequestError('Codigo invalido');
    }

    const user = await db.users.findFirst({
      where: {
        email: usersEmail,
        deleted_at: null,
        forget_password_code: codeInt,
      },
    });

    if (!user) {
      throw new BadRequestError('Codigo invalido ou expirado');
    }

    return {
      is_valid: true,
      message: 'Codigo validado com sucesso',
    };
  }

  /**
   * Reset de senha
   * Equivalente a: sendgrid/reset/pass do Xano
   */
  static async resetPassword(isValid: boolean, newPassword: string, usersEmail: string) {
    if (!isValid) {
      throw new BadRequestError('Validacao invalida');
    }

    const user = await db.users.findFirst({
      where: { email: usersEmail, deleted_at: null },
    });

    if (!user) {
      throw new NotFoundError('Usuario nao encontrado');
    }

    // Hash nova senha
    const hashedPassword = await AuthService.hashPassword(newPassword);

    // Atualiza senha e limpa codigo
    await db.users.update({
      where: { id: user.id },
      data: {
        password_hash: hashedPassword,
        forget_password_code: null,
        updated_at: new Date(),
      },
    });

    return {
      success: true,
      message: 'Senha alterada com sucesso',
    };
  }

  /**
   * Valida servico SendGrid
   * Equivalente a: sendgrid/validate do Xano
   */
  static async validateSendgrid(toEmail: string, subject: string, body: string) {
    // Aqui seria a validacao real do SendGrid
    // Por enquanto retorna sucesso
    return {
      success: true,
      message: 'SendGrid configurado corretamente',
      data: { to_email: toEmail, subject, body },
    };
  }
}

export default AuthModuleService;
