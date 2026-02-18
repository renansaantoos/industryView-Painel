// =============================================================================
// INDUSTRYVIEW BACKEND - Company Controller
// Controller do modulo de empresa (matriz/filiais)
// =============================================================================

import { Response, NextFunction } from 'express';
import { CompanyService } from './company.service';
import { AuthenticatedRequest } from '../../types';
import { serializeBigInt } from '../../utils/bigint';
import { logger } from '../../utils/logger';
import { ForbiddenError } from '../../utils/errors';

/**
 * Valida que o company_id do parametro de rota coincide com a empresa do usuario autenticado.
 * Garante isolamento multi-tenant sem depender de query extra ao banco.
 */
function assertCompanyAccess(req: AuthenticatedRequest, companyId: number): void {
  const userCompanyId = req.user?.companyId;
  if (!userCompanyId) {
    throw new ForbiddenError('Usuario nao associado a nenhuma empresa');
  }
  if (userCompanyId !== companyId) {
    throw new ForbiddenError('Acesso negado a esta empresa');
  }
}

/**
 * CompanyController - Controller do modulo de empresa (matriz/filiais)
 */
export class CompanyController {
  /**
   * GET /company/:company_id
   * Busca a empresa (matriz) com suas filiais ativas
   */
  static async getCompany(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = parseInt(req.params.company_id, 10);
      // Valida que o company_id da URL pertence ao usuario autenticado
      assertCompanyAccess(req, companyId);
      const result = await CompanyService.getCompanyWithBranches(
        companyId,
        req.auth!.id
      );
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /company/:company_id
   * Atualiza dados da empresa (matriz)
   */
  static async updateCompany(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = parseInt(req.params.company_id, 10);
      // Valida que o company_id da URL pertence ao usuario autenticado
      assertCompanyAccess(req, companyId);
      const result = await CompanyService.updateCompany(
        companyId,
        req.body,
        req.auth!.id
      );

      logger.info({ companyId, userId: req.auth!.id }, 'Company updated via API');

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /company/:company_id/branches
   * Lista filiais ativas da empresa
   */
  static async listBranches(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = parseInt(req.params.company_id, 10);
      assertCompanyAccess(req, companyId);
      const result = await CompanyService.listBranches(companyId, req.auth!.id);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /company/:company_id/branches
   * Cria uma nova filial vinculada a empresa
   */
  static async createBranch(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = parseInt(req.params.company_id, 10);
      assertCompanyAccess(req, companyId);
      const result = await CompanyService.createBranch(
        companyId,
        req.body,
        req.auth!.id
      );

      logger.info(
        { companyId, branchId: result.id, userId: req.auth!.id },
        'Branch created via API'
      );

      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /company/:company_id/branches/:branch_id
   * Busca filial especifica
   */
  static async getBranch(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = parseInt(req.params.company_id, 10);
      assertCompanyAccess(req, companyId);
      const branchId = parseInt(req.params.branch_id, 10);
      const result = await CompanyService.getBranch(
        companyId,
        branchId,
        req.auth!.id
      );
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /company/:company_id/branches/:branch_id
   * Atualiza dados de uma filial
   */
  static async updateBranch(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = parseInt(req.params.company_id, 10);
      assertCompanyAccess(req, companyId);
      const branchId = parseInt(req.params.branch_id, 10);
      const result = await CompanyService.updateBranch(
        companyId,
        branchId,
        req.body,
        req.auth!.id
      );

      logger.info(
        { companyId, branchId, userId: req.auth!.id },
        'Branch updated via API'
      );

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /company/:company_id/branches/:branch_id
   * Soft delete de uma filial
   */
  static async deleteBranch(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = parseInt(req.params.company_id, 10);
      assertCompanyAccess(req, companyId);
      const branchId = parseInt(req.params.branch_id, 10);
      const result = await CompanyService.deleteBranch(
        companyId,
        branchId,
        req.auth!.id
      );

      logger.info(
        { companyId, branchId, userId: req.auth!.id },
        'Branch deleted via API'
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default CompanyController;
