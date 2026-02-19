// =============================================================================
// INDUSTRYVIEW BACKEND - Users Controller
// Controller de usuarios
// Equivalente aos endpoints do api_group User do Xano
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { AuthenticatedRequest } from '../../types';
import { logger } from '../../utils/logger';
import { serializeBigInt } from '../../utils/bigint';
import { searchUsersForTeamSchema } from './users.schema';

/**
 * UsersController - Controller do modulo de usuarios
 */
export class UsersController {
  /**
   * POST /users/list
   * Lista usuarios com paginacao e filtros
   * Equivalente a: query users_list verb=POST do Xano (endpoint 406)
   */
  static async list(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // company_id SEMPRE do usuario autenticado
      const companyId = req.user?.companyId;
      const input = { ...req.body, company_id: companyId || undefined };
      const result = await UsersService.list(input, req.auth!.id);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /users
   * Cria um novo usuario
   * Equivalente a: query users verb=POST do Xano (endpoint 408)
   */
  static async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Injeta company_id do usuario autenticado
      const companyId = req.user?.companyId;
      if (companyId && !req.body.company_id) {
        req.body.company_id = companyId;
      }
      const result = await UsersService.create(req.body, req.auth!.id);

      logger.info({ userId: result.id, email: result.email }, 'User created');

      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /users/:users_id
   * Busca usuario por ID
   * Equivalente a: query users/{users_id} verb=GET do Xano (endpoint 407)
   */
  static async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = parseInt(req.params.users_id, 10);
      const result = await UsersService.getById(userId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /users/:users_id
   * Atualiza usuario
   * Equivalente a: query users/{users_id} verb=PATCH do Xano (endpoint 409)
   */
  static async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = parseInt(req.params.users_id, 10);
      const result = await UsersService.update(userId, req.body);

      logger.info({ userId }, 'User updated');

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /users/:users_id
   * Remove usuario (soft delete)
   * Equivalente a: query users/{users_id} verb=DELETE do Xano (endpoint 410)
   */
  static async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = parseInt(req.params.users_id, 10);
      const result = await UsersService.delete(userId);

      logger.info({ userId }, 'User deleted');

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /users/change-password
   * Altera senha do usuario autenticado
   * Equivalente a: query change_password verb=PUT do Xano (endpoint 589)
   */
  static async changePassword(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await UsersService.changePassword(req.auth!.id, req.body);

      logger.info({ userId: req.auth!.id }, 'Password changed');

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /users/roles
   * Lista todos os roles
   * Equivalente a: query users_roles verb=GET do Xano (endpoint 447)
   */
  static async listRoles(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const perPage = parseInt(req.query.per_page as string, 10) || 20;
      const result = await UsersService.listRoles(page, perPage);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /users/system-access
   * Lista todos os system access
   * Equivalente a: query users_system_access verb=GET do Xano (endpoint 442)
   */
  static async listSystemAccess(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await UsersService.listSystemAccess();
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /users/control-system
   * Lista todos os control system
   * Equivalente a: query users_control_system verb=GET do Xano (endpoint 452)
   */
  static async listControlSystem(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await UsersService.listControlSystem();
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /users/users_0
   * Lista usuarios disponiveis para atribuicao a equipes
   * Equivalente a: endpoint 586 do Xano (users_0)
   */
  static async listForTeams(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user?.companyId;
      const input = { ...req.body, company_id: companyId || undefined };
      const result = await UsersService.listForTeams(input);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // COMPANY METHODS
  // =============================================================================

  /**
   * POST /users/company
   * Cria uma nova empresa
   */
  static async createCompany(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      logger.info({ userId: req.auth?.id, body: req.body }, 'Received createCompany request');
      const result = await UsersService.createCompany(req.body, req.auth!.id);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /users/company/:company_id
   * Busca empresa por ID
   */
  static async getCompany(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = parseInt(req.params.company_id, 10);
      const result = await UsersService.getCompany(companyId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /users/company/:company_id
   * Atualiza empresa
   */
  static async updateCompany(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = parseInt(req.params.company_id, 10);
      const result = await UsersService.updateCompany(companyId, req.body);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /users/search-for-team
   * Busca paginada de usuarios para adicionar como membros/lideres de times
   * Prioriza usuarios sem atribuicao de time ativo (hasTeam: false vem primeiro)
   * Filtra pela empresa do usuario autenticado
   */
  static async searchForTeam(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const input = searchUsersForTeamSchema.parse(req.query);
      const companyId = req.user?.companyId;
      if (!companyId) {
        res.status(403).json({ message: 'Usuario nao associado a uma empresa' });
        return;
      }
      const result = await UsersService.searchForTeam(input, companyId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /users/query_all_users
   * Lista todos os usuarios para dropdowns (id, name, email)
   */
  static async queryAll(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user?.companyId ?? undefined;
      const result = await UsersService.queryAllForDropdown(companyId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default UsersController;
