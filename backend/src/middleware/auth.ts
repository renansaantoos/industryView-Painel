// =============================================================================
// INDUSTRYVIEW BACKEND - Authentication Middleware
// Middleware de autenticacao JWT
// Equivalente a: auth = "users" do Xano
// =============================================================================

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { db } from '../config/database';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { AuthenticatedRequest, JwtPayload, UserWithPermissions } from '../types';
import { logger } from '../utils/logger';
import { toNumber } from '../utils/bigint';

/**
 * Extrai o token do header Authorization
 */
function extractToken(req: AuthenticatedRequest): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Suporta "Bearer <token>" e "<token>" direto
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return authHeader;
}

/**
 * Verifica e decodifica o JWT token
 */
function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token expirado');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Token invalido');
    }
    throw new UnauthorizedError('Falha na autenticacao');
  }
}

/**
 * Middleware de autenticacao obrigatoria
 * Equivalente a: auth = "users" do Xano
 */
export async function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new UnauthorizedError('Token de autenticacao nao fornecido');
    }

    const payload = verifyToken(token);
    req.auth = payload;

    // Busca dados completos do usuario com permissoes
    const user = await db.users.findFirst({
      where: {
        id: payload.id,
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
      throw new UnauthorizedError('Usuario nao encontrado');
    }

    if (user.deleted_at) {
      throw new UnauthorizedError('Usuario desativado');
    }

    // Mapeia para o tipo esperado convertendo BigInt para number
    req.user = {
      id: toNumber(user.id) as number,
      name: user.name,
      nameNormalized: user.name_normalized,
      email: user.email,
      phone: user.phone,
      passwordHash: user.password_hash,
      profilePicture: user.profile_picture,
      forgetPasswordCode: user.forget_password_code,
      usersPermissionsId: toNumber(user.users_permissions_id),
      companyId: toNumber(user.company_id),
      firstLogin: user.first_login,
      qrcode: user.qrcode,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      deletedAt: user.deleted_at,
      usersPermissions: user.users_permissions ? {
        id: toNumber(user.users_permissions.id) as number,
        userId: toNumber(user.users_permissions.user_id),
        usersSystemAccessId: toNumber(user.users_permissions.users_system_access_id),
        usersRolesId: toNumber(user.users_permissions.users_roles_id),
        usersControlSystemId: toNumber(user.users_permissions.users_control_system_id),
        createdAt: user.users_permissions.created_at,
        updatedAt: user.users_permissions.updated_at,
        deletedAt: user.users_permissions.deleted_at,
        usersSystemAccess: user.users_permissions.users_system_access ? {
          id: toNumber(user.users_permissions.users_system_access.id) as number,
          env: user.users_permissions.users_system_access.env,
          createdAt: user.users_permissions.users_system_access.created_at,
          updatedAt: user.users_permissions.users_system_access.updated_at,
          deletedAt: user.users_permissions.users_system_access.deleted_at,
        } : undefined,
        usersRoles: user.users_permissions.users_roles ? {
          id: toNumber(user.users_permissions.users_roles.id) as number,
          role: user.users_permissions.users_roles.role,
          roleNormalized: user.users_permissions.users_roles.role_normalized,
          createdAt: user.users_permissions.users_roles.created_at,
          updatedAt: user.users_permissions.users_roles.updated_at,
          deletedAt: user.users_permissions.users_roles.deleted_at,
        } : undefined,
        usersControlSystem: user.users_permissions.users_control_system ? {
          id: toNumber(user.users_permissions.users_control_system.id) as number,
          accessLevel: user.users_permissions.users_control_system.access_level,
          createdAt: user.users_permissions.users_control_system.created_at,
          updatedAt: user.users_permissions.users_control_system.updated_at,
          deletedAt: user.users_permissions.users_control_system.deleted_at,
        } : undefined,
      } : undefined,
      company: user.company ? {
        id: toNumber(user.company.id) as number,
        brandName: user.company.brand_name,
        legalName: user.company.legal_name,
        cnpj: user.company.cnpj,
        phone: user.company.phone,
        email: user.company.email,
        cep: user.company.cep,
        numero: user.company.numero,
        addressLine: user.company.address_line,
        addressLine2: user.company.address_line2,
        city: user.company.city,
        state: user.company.state,
        statusPaymentId: toNumber(user.company.status_payment_id),
        createdAt: user.company.created_at,
        updatedAt: user.company.updated_at,
        deletedAt: user.company.deleted_at,
      } : undefined,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware de autenticacao opcional
 * Nao lanca erro se nao tiver token
 */
export async function optionalAuthenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);

    if (token) {
      const payload = verifyToken(token);
      req.auth = payload;

      const user = await db.users.findFirst({
        where: {
          id: payload.id,
          deleted_at: null,
        },
      });

      if (user) {
        req.user = user as unknown as UserWithPermissions;
      }
    }

    next();
  } catch (error) {
    // Em autenticacao opcional, ignora erros de token
    logger.debug({ error }, 'Optional auth failed');
    next();
  }
}

/**
 * Middleware para verificar se usuario e admin
 * Equivalente a: check_permission do Xano
 */
export function requireAdmin(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Usuario nao autenticado');
    }

    const controlSystemId = req.user.usersPermissions?.usersControlSystemId;

    // users_control_system_id = 1 (Super Admin) ou 2 (Admin)
    if (controlSystemId !== 1 && controlSystemId !== 2) {
      throw new ForbiddenError('Acesso restrito a administradores');
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware para verificar roles especificas
 * @param allowedRoles - Array de IDs de roles permitidos
 */
export function requireRoles(...allowedRoles: number[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Usuario nao autenticado');
      }

      const userRoleId = req.user.usersPermissions?.usersRolesId;

      if (!userRoleId || !allowedRoles.includes(userRoleId)) {
        throw new ForbiddenError('Voce nao tem permissao para acessar este recurso');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware para verificar se usuario pertence a uma empresa especifica
 */
export function requireCompany(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Usuario nao autenticado');
    }

    if (!req.user.companyId) {
      throw new ForbiddenError('Usuario nao associado a nenhuma empresa');
    }

    next();
  } catch (error) {
    next(error);
  }
}

export default authenticate;
