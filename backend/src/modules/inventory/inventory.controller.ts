// =============================================================================
// INDUSTRYVIEW BACKEND - Inventory Module Controller
// Controller do modulo de inventario
// Equivalente aos endpoints do Xano em apis/inventory/
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { InventoryService } from './inventory.service';
import { serializeBigInt } from '../../utils/bigint';
import { AuthenticatedRequest } from '../../types';
import {
  listProductInventorySchema,
  getProductInventoryByIdSchema,
  createProductInventorySchema,
  updateProductInventorySchema,
  deleteProductInventorySchema,
  addQuantityInventorySchema,
  removeQuantityInventorySchema,
  getStatusInventoryByIdSchema,
  createStatusInventorySchema,
  updateStatusInventorySchema,
  deleteStatusInventorySchema,
  listInventoryLogsSchema,
  getInventoryLogByIdSchema,
  createInventoryLogSchema,
  updateInventoryLogSchema,
  deleteInventoryLogSchema,
  listInventoryLogsFilteredSchema,
  importInventorySchema,
  exportInventorySchema,
} from './inventory.schema';

/**
 * InventoryController - Controller do modulo de inventario
 */
export class InventoryController {
  // ===========================================================================
  // Product Inventory CRUD
  // ===========================================================================

  /**
   * Lista produtos do inventario
   * Equivalente a: query product_inventory verb=GET do Xano
   * Route: GET /api/v1/inventory/products
   */
  static async listProductInventory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listProductInventorySchema.parse(req.query) as any;
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await InventoryService.listProductInventory(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca produto por ID
   * Equivalente a: query "product_inventory/{product_inventory_id}" verb=GET do Xano
   * Route: GET /api/v1/inventory/products/:product_inventory_id
   */
  static async getProductInventoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const input = getProductInventoryByIdSchema.parse(req.params);
      const result = await InventoryService.getProductInventoryById(input.product_inventory_id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria produto no inventario
   * Equivalente a: query product_inventory verb=POST do Xano
   * Route: POST /api/v1/inventory/products
   */
  static async createProductInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createProductInventorySchema.parse(req.body);
      const userId = (req as any).user?.id;
      const result = await InventoryService.createProductInventory(input, userId);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza produto (PATCH)
   * Equivalente a: query "product_inventory/{product_inventory_id}" verb=PATCH do Xano
   * Route: PATCH /api/v1/inventory/products/:product_inventory_id
   */
  static async updateProductInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const params = getProductInventoryByIdSchema.parse(req.params);
      const input = updateProductInventorySchema.parse(req.body);
      const result = await InventoryService.updateProductInventory(
        params.product_inventory_id,
        input
      );
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza produto (PUT - update completo)
   * Equivalente a: query "product_inventory/{product_inventory_id}" verb=PUT do Xano
   * Route: PUT /api/v1/inventory/products/:product_inventory_id
   */
  static async replaceProductInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const params = getProductInventoryByIdSchema.parse(req.params);
      const input = updateProductInventorySchema.parse(req.body);
      const result = await InventoryService.updateProductInventory(
        params.product_inventory_id,
        input
      );
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deleta produto (soft delete)
   * Equivalente a: query "product_inventory/{product_inventory_id}" verb=DELETE do Xano
   * Route: DELETE /api/v1/inventory/products/:product_inventory_id
   */
  static async deleteProductInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const input = deleteProductInventorySchema.parse(req.params);
      const result = await InventoryService.deleteProductInventory(input.product_inventory_id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Inventory Quantity Operations
  // ===========================================================================

  /**
   * Adiciona quantidade ao inventario
   * Equivalente a: query Add_quantity_inventory verb=POST do Xano
   * Route: POST /api/v1/inventory/add-quantity
   */
  static async addQuantityInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const input = addQuantityInventorySchema.parse(req.body);
      const userId = (req as any).user?.id;
      await InventoryService.addQuantityInventory(input, userId);
      res.json(null);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove quantidade do inventario
   * Equivalente a: query Remove_quantity_inventory verb=POST do Xano
   * Route: POST /api/v1/inventory/remove-quantity
   */
  static async removeQuantityInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const input = removeQuantityInventorySchema.parse(req.body);
      const userId = (req as any).user?.id;
      await InventoryService.removeQuantityInventory(input, userId);
      res.json(null);
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Status Inventory CRUD
  // ===========================================================================

  /**
   * Lista status do inventario
   * Equivalente a: query status_inventory verb=GET do Xano
   * Route: GET /api/v1/inventory/status
   */
  static async listStatusInventory(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await InventoryService.listStatusInventory();
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca status por ID
   * Route: GET /api/v1/inventory/status/:status_inventory_id
   */
  static async getStatusInventoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const input = getStatusInventoryByIdSchema.parse(req.params);
      const result = await InventoryService.getStatusInventoryById(input.status_inventory_id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria status de inventario
   * Route: POST /api/v1/inventory/status
   */
  static async createStatusInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createStatusInventorySchema.parse(req.body);
      const result = await InventoryService.createStatusInventory(input.status);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza status (PATCH)
   * Route: PATCH /api/v1/inventory/status/:status_inventory_id
   */
  static async updateStatusInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const params = getStatusInventoryByIdSchema.parse(req.params);
      const input = updateStatusInventorySchema.parse(req.body);
      const result = await InventoryService.updateStatusInventory(
        params.status_inventory_id,
        input.status
      );
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza status (PUT)
   * Route: PUT /api/v1/inventory/status/:status_inventory_id
   */
  static async replaceStatusInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const params = getStatusInventoryByIdSchema.parse(req.params);
      const input = updateStatusInventorySchema.parse(req.body);
      const result = await InventoryService.updateStatusInventory(
        params.status_inventory_id,
        input.status
      );
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deleta status (soft delete)
   * Route: DELETE /api/v1/inventory/status/:status_inventory_id
   */
  static async deleteStatusInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const input = deleteStatusInventorySchema.parse(req.params);
      const result = await InventoryService.deleteStatusInventory(input.status_inventory_id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Inventory Logs CRUD
  // ===========================================================================

  /**
   * Lista logs de inventario
   * Equivalente a: query inventory_logs verb=GET do Xano
   * Route: GET /api/v1/inventory/logs
   */
  static async listInventoryLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listInventoryLogsSchema.parse(req.query);
      const result = await InventoryService.listInventoryLogs(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista logs filtrados
   * Equivalente a: query inventory_logs_0 verb=GET do Xano
   * Route: GET /api/v1/inventory/logs/filtered
   */
  static async listInventoryLogsFiltered(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listInventoryLogsFilteredSchema.parse(req.query);
      const result = await InventoryService.listInventoryLogsFiltered(
        input.product_inventory_id,
        input.projects_id
      );
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca log por ID
   * Route: GET /api/v1/inventory/logs/:inventory_logs_id
   */
  static async getInventoryLogById(req: Request, res: Response, next: NextFunction) {
    try {
      const input = getInventoryLogByIdSchema.parse(req.params);
      const result = await InventoryService.getInventoryLogById(input.inventory_logs_id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria log de inventario
   * Route: POST /api/v1/inventory/logs
   */
  static async createInventoryLog(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createInventoryLogSchema.parse(req.body);
      const result = await InventoryService.createInventoryLog(input);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza log
   * Route: PATCH /api/v1/inventory/logs/:inventory_logs_id
   */
  static async updateInventoryLog(req: Request, res: Response, next: NextFunction) {
    try {
      const params = getInventoryLogByIdSchema.parse(req.params);
      const input = updateInventoryLogSchema.parse(req.body);
      const result = await InventoryService.updateInventoryLog(
        params.inventory_logs_id,
        input
      );
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deleta log (soft delete)
   * Route: DELETE /api/v1/inventory/logs/:inventory_logs_id
   */
  static async deleteInventoryLog(req: Request, res: Response, next: NextFunction) {
    try {
      const input = deleteInventoryLogSchema.parse(req.params);
      const result = await InventoryService.deleteInventoryLog(input.inventory_logs_id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Import/Export Operations
  // ===========================================================================

  /**
   * Importa produtos
   * Equivalente a: query import_inventory verb=POST do Xano
   * Route: POST /api/v1/inventory/import
   */
  static async importInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const input = importInventorySchema.parse(req.body);
      const userId = (req as any).user?.id;
      const result = await InventoryService.importInventory(input, userId);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exporta inventario
   * Equivalente a: query export_inventory verb=GET do Xano
   * Route: GET /api/v1/inventory/export
   */
  static async exportInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const input = exportInventorySchema.parse(req.query);
      const result = await InventoryService.exportInventory(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }
}

export default InventoryController;
