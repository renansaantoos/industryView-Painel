// =============================================================================
// INDUSTRYVIEW BACKEND - Authentication Service
// Servico de autenticacao (JWT, senha, permissoes)
// Equivalente a: security.* do Xano e check_permission function
// =============================================================================

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/env';
import { db } from '../config/database';
import { UnauthorizedError, BadRequestError } from '../utils/errors';
import { JwtPayload } from '../types';
import { toNumberRequired } from '../utils/bigint';

const SALT_ROUNDS = 10;

/**
 * AuthService - Servico de autenticacao
 * Equivalente aos blocos security.* do Xano
 */
export class AuthService {
  /**
   * Cria um token JWT de autenticacao
   * Equivalente a: security.create_auth_token do Xano
   *
   * @param userId - ID do usuario
   * @param email - Email do usuario
   * @param expiresIn - Tempo de expiracao em segundos (default: 24h)
   */
  static createAuthToken(
    userId: number,
    email: string,
    expiresIn: number = config.jwt.expiresIn
  ): string {
    const payload = {
      id: userId,
      email,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn,
    });
  }

  /**
   * Cria um refresh token
   */
  static createRefreshToken(userId: number, email: string): string {
    const payload = {
      id: userId,
      email,
      type: 'refresh',
    };

    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
  }

  /**
   * Verifica e decodifica um token JWT
   * Equivalente a: security.verify_auth_token do Xano
   */
  static verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expirado');
      }
      throw new UnauthorizedError('Token invalido');
    }
  }

  /**
   * Verifica um refresh token
   */
  static verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
    } catch (error) {
      throw new UnauthorizedError('Refresh token invalido');
    }
  }

  /**
   * Cria hash de senha
   * Equivalente a: processo de hash no signup do Xano
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Verifica se a senha corresponde ao hash
   * Equivalente a: security.check_password do Xano
   */
  static async checkPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Verifica permissoes do usuario
   * Equivalente a: check_permission function do Xano
   *
   * @param userId - ID do usuario
   * @returns true se o usuario e admin (users_control_system_id != 3)
   */
  static async checkPermission(userId: number): Promise<boolean> {
    const userPermission = await db.users_permissions.findFirst({
      where: {
        user_id: userId,
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

    if (!userPermission) {
      throw new BadRequestError('Permissoes do usuario nao encontrado.');
    }

    // No Xano: $user_permission_response.users_control_system_id|equals:3
    // users_control_system_id = 3 significa "Usuario" (nao admin)
    // Retorna true se NAO for usuario comum (ou seja, se for admin)
    const isAdmin = userPermission.users_control_system_id !== BigInt(3);

    return isAdmin;
  }

  /**
   * Busca usuario por email
   */
  static async findUserByEmail(email: string) {
    return db.users.findFirst({
      where: {
        email,
        deleted_at: null,
      },
    });
  }

  /**
   * Busca usuario por ID com permissoes completas
   */
  static async findUserById(userId: number) {
    return db.users.findFirst({
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
  }

  /**
   * Valida credenciais de login
   * Equivalente ao fluxo de auth/login do Xano
   */
  static async validateCredentials(
    email: string,
    password: string
  ) {
    // Busca usuario por email
    const user = await db.users.findFirst({
      where: {
        email,
        deleted_at: null,
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

    if (!user) {
      throw new UnauthorizedError('Esse usuario nao tem acesso');
    }

    if (user.deleted_at) {
      throw new UnauthorizedError('Esse usuario nao tem acesso ao painel');
    }

    if (!user.password_hash) {
      throw new UnauthorizedError('Invalid Credentials.');
    }

    // Verifica senha
    const isValidPassword = await this.checkPassword(password, user.password_hash);

    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid Credentials.');
    }

    // Cria token
    const token = this.createAuthToken(toNumberRequired(user.id), user.email!);

    return { user, token };
  }
}

export default AuthService;
