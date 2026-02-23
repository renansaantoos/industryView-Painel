// =============================================================================
// INDUSTRYVIEW BACKEND - Clients Module Controller
// Controller do modulo de clientes
// =============================================================================

import { Response, NextFunction } from 'express';
import { ClientsService } from './clients.service';
import { serializeBigInt } from '../../utils/bigint';
import { AuthenticatedRequest } from '../../types';
import {
  listClientsSchema,
  createClientSchema,
  updateClientSchema,
  clientIdParamSchema,
} from './clients.schema';

/**
 * ClientsController - Controller do modulo de clientes
 */
export class ClientsController {
  // ===========================================================================
  // List
  // ===========================================================================

  static async listClients(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listClientsSchema.parse(req.query) as any;
      // company_id SEMPRE vem do usuario autenticado (multi-tenant)
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await ClientsService.listClients(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Get One
  // ===========================================================================

  static async getClient(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = clientIdParamSchema.parse(req.params);
      const company_id = req.user?.companyId ?? undefined;
      const result = await ClientsService.getClient(id, company_id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Create
  // ===========================================================================

  static async createClient(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = createClientSchema.parse(req.body);
      const company_id = req.user?.companyId;
      if (!company_id) {
        res.status(403).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Empresa nao identificada para o usuario autenticado.',
          },
        });
        return;
      }
      const result = await ClientsService.createClient(data, company_id);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Update
  // ===========================================================================

  static async updateClient(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = clientIdParamSchema.parse(req.params);
      const data = updateClientSchema.parse(req.body);
      const company_id = req.user?.companyId ?? undefined;
      const result = await ClientsService.updateClient(id, data, company_id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Delete
  // ===========================================================================

  static async deleteClient(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = clientIdParamSchema.parse(req.params);
      const company_id = req.user?.companyId ?? undefined;
      await ClientsService.deleteClient(id, company_id);
      res.json({ message: 'Cliente excluido com sucesso.' });
    } catch (error) {
      next(error);
    }
  }
}

export default ClientsController;
