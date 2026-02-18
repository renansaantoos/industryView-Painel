// =============================================================================
// INDUSTRYVIEW BACKEND - Manufacturers Controller
// Controller de fabricantes
// Equivalente aos endpoints do api_group Manufacturers do Xano
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { ManufacturersService } from './manufacturers.service';
import { AuthenticatedRequest } from '../../types';
import { logger } from '../../utils/logger';
import { serializeBigInt } from '../../utils/bigint';

/**
 * ManufacturersController - Controller do modulo de fabricantes
 */
export class ManufacturersController {
  /**
   * GET /manufacturers
   * Lista fabricantes com paginacao e filtros
   * Equivalente a: query manufacturers verb=GET do Xano (endpoint 422)
   */
  static async list(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const input = {
        page: parseInt(req.query.page as string, 10) || 1,
        per_page: parseInt(req.query.per_page as string, 10) || 20,
        search: req.query.search as string,
        equipaments_types_id: req.query.equipaments_types_id
          ? parseInt(req.query.equipaments_types_id as string, 10)
          : undefined,
      };
      const result = await ManufacturersService.list(input);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /manufacturers/:manufacturers_id
   * Busca fabricante por ID
   * Equivalente a: query manufacturers/{manufacturers_id} verb=GET do Xano (endpoint 421)
   */
  static async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const manufacturerId = parseInt(req.params.manufacturers_id, 10);
      const result = await ManufacturersService.getById(manufacturerId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /manufacturers
   * Cria um novo fabricante
   * Equivalente a: query manufacturers verb=POST do Xano (endpoint 423)
   */
  static async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ManufacturersService.create(req.body);

      logger.info({ manufacturerId: result.id, name: result.name }, 'Manufacturer created via API');

      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /manufacturers/:manufacturers_id
   * Atualiza fabricante
   * Equivalente a: query manufacturers/{manufacturers_id} verb=PATCH do Xano (endpoint 424)
   */
  static async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const manufacturerId = parseInt(req.params.manufacturers_id, 10);
      const result = await ManufacturersService.update(manufacturerId, req.body);

      logger.info({ manufacturerId }, 'Manufacturer updated via API');

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /manufacturers/:manufacturers_id
   * Remove fabricante (soft delete)
   * Equivalente a: query manufacturers/{manufacturers_id} verb=DELETE do Xano (endpoint 420)
   */
  static async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const manufacturerId = parseInt(req.params.manufacturers_id, 10);
      const result = await ManufacturersService.delete(manufacturerId);

      logger.info({ manufacturerId }, 'Manufacturer deleted via API');

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }
}

export default ManufacturersController;
