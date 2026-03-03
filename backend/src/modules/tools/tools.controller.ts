// =============================================================================
// INDUSTRYVIEW BACKEND - Tools Module Controller
// Controller do modulo de Ferramentas
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { serializeBigInt } from '../../utils/bigint';
import { ToolsService } from './tools.service';
import { AuditService } from '../audit/audit.service';
import { AuthenticatedRequest } from '../../types';
import {
  listDepartmentsSchema,
  getDepartmentByIdSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  listCategoriesSchema,
  getCategoryByIdSchema,
  createCategorySchema,
  updateCategorySchema,
  listToolsSchema,
  getToolByIdSchema,
  createToolSchema,
  updateToolSchema,
  listMovementsSchema,
  transferSchema,
  assignEmployeeSchema,
  assignTeamSchema,
  assignProjectSchema,
  returnToolSchema,
  assignKitSchema,
  listAcceptanceTermsSchema,
  getAcceptanceTermByIdSchema,
  createAcceptanceTermSchema,
  listKitsSchema,
  getKitByIdSchema,
  createKitSchema,
  updateKitSchema,
  addKitItemSchema,
  deleteKitItemSchema,
  getUserToolsSchema,
} from './tools.schema';

/**
 * ToolsController - Controller do modulo de Ferramentas
 */
export class ToolsController {
  // ===========================================================================
  // Departments
  // ===========================================================================

  static async listDepartments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listDepartmentsSchema.parse(req.query) as any;
      if (req.user?.companyId) input.company_id = req.user.companyId;
      const result = await ToolsService.listDepartments(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async createDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const body = { ...req.body };
      if (req.user?.companyId) body.company_id = req.user.companyId;
      const input = createDepartmentSchema.parse(body);
      const result = await ToolsService.createDepartment(input);

      await AuditService.logAction({
        table_name: 'departments',
        record_id: Number(result.id),
        action: 'create',
        new_values: { name: result.name, description: result.description },
        users_id: req.user!.id,
        ip_address: req.ip,
      });

      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async updateDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getDepartmentByIdSchema.parse(req.params);
      const input = updateDepartmentSchema.parse(req.body);

      // Captura old values para auditoria
      const old = await ToolsService.listDepartments({}).then(
        depts => depts.find((d: any) => Number(d.id) === id)
      );

      const result = await ToolsService.updateDepartment(id, input);

      await AuditService.logAction({
        table_name: 'departments',
        record_id: id,
        action: 'update',
        old_values: old ? { name: old.name, description: old.description } : undefined,
        new_values: { name: result.name, description: result.description },
        users_id: req.user!.id,
        ip_address: req.ip,
      });

      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async deleteDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getDepartmentByIdSchema.parse(req.params);
      await ToolsService.deleteDepartment(id);

      await AuditService.logAction({
        table_name: 'departments',
        record_id: id,
        action: 'delete',
        users_id: req.user!.id,
        ip_address: req.ip,
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Tool Categories
  // ===========================================================================

  static async listCategories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listCategoriesSchema.parse(req.query) as any;
      if (req.user?.companyId) input.company_id = req.user.companyId;
      const result = await ToolsService.listCategories(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const body = { ...req.body };
      if (req.user?.companyId) body.company_id = req.user.companyId;
      const input = createCategorySchema.parse(body);
      const result = await ToolsService.createCategory(input);

      await AuditService.logAction({
        table_name: 'tool_categories',
        record_id: Number(result.id),
        action: 'create',
        new_values: { name: result.name, description: result.description },
        users_id: req.user!.id,
        ip_address: req.ip,
      });

      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getCategoryByIdSchema.parse(req.params);
      const input = updateCategorySchema.parse(req.body);
      const result = await ToolsService.updateCategory(id, input);

      await AuditService.logAction({
        table_name: 'tool_categories',
        record_id: id,
        action: 'update',
        new_values: { name: result.name, description: result.description },
        users_id: req.user!.id,
        ip_address: req.ip,
      });

      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getCategoryByIdSchema.parse(req.params);
      await ToolsService.deleteCategory(id);

      await AuditService.logAction({
        table_name: 'tool_categories',
        record_id: id,
        action: 'delete',
        users_id: req.user!.id,
        ip_address: req.ip,
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Tools
  // ===========================================================================

  static async listTools(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listToolsSchema.parse(req.query) as any;
      if (req.user?.companyId) input.company_id = req.user.companyId;
      const result = await ToolsService.listTools(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async getToolById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getToolByIdSchema.parse(req.params);
      const result = await ToolsService.getToolById(id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async createTool(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const body = { ...req.body };
      if (req.user?.companyId) body.company_id = req.user.companyId;
      const input = createToolSchema.parse(body);
      const result = await ToolsService.createTool(input, req.user!.id);

      await AuditService.logAction({
        table_name: 'tools',
        record_id: Number(result.id),
        action: 'create',
        new_values: { name: result.name, control_type: result.control_type, patrimonio_code: result.patrimonio_code },
        users_id: req.user!.id,
        ip_address: req.ip,
      });

      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async updateTool(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getToolByIdSchema.parse(req.params);
      const input = updateToolSchema.parse(req.body);

      // Captura old values
      const old = await ToolsService.getToolById(id);
      const result = await ToolsService.updateTool(id, input);

      await AuditService.logAction({
        table_name: 'tools',
        record_id: id,
        action: 'update',
        old_values: { name: old.name, condition: old.condition },
        new_values: { name: result.name, condition: result.condition },
        users_id: req.user!.id,
        ip_address: req.ip,
      });

      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async deleteTool(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getToolByIdSchema.parse(req.params);
      await ToolsService.deleteTool(id);

      await AuditService.logAction({
        table_name: 'tools',
        record_id: id,
        action: 'delete',
        users_id: req.user!.id,
        ip_address: req.ip,
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async getToolMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getToolByIdSchema.parse(req.params);
      const result = await ToolsService.getToolMovements(id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Movements
  // ===========================================================================

  static async listMovements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listMovementsSchema.parse(req.query) as any;
      if (req.user?.companyId) input.company_id = req.user.companyId;
      const result = await ToolsService.listMovements(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async transfer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = transferSchema.parse(req.body);
      const result = await ToolsService.transfer(input, req.user!.id);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async assignEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = assignEmployeeSchema.parse(req.body);
      const result = await ToolsService.assignEmployee(input, req.user!.id);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async assignTeam(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = assignTeamSchema.parse(req.body);
      const result = await ToolsService.assignTeam(input, req.user!.id);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async assignProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = assignProjectSchema.parse(req.body);
      const result = await ToolsService.assignProject(input, req.user!.id);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async returnTool(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = returnToolSchema.parse(req.body);
      const result = await ToolsService.returnTool(input, req.user!.id);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async assignKit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = assignKitSchema.parse(req.body);
      const result = await ToolsService.assignKit(input, req.user!.id);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Acceptance Terms
  // ===========================================================================

  static async listAcceptanceTerms(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listAcceptanceTermsSchema.parse(req.query) as any;
      if (req.user?.companyId) input.company_id = req.user.companyId;
      const result = await ToolsService.listAcceptanceTerms(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async getAcceptanceTermById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getAcceptanceTermByIdSchema.parse(req.params);
      const result = await ToolsService.getAcceptanceTermById(id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async createAcceptanceTerm(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = createAcceptanceTermSchema.parse(req.body);
      const result = await ToolsService.createAcceptanceTerm(input);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Kits
  // ===========================================================================

  static async listKits(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listKitsSchema.parse(req.query) as any;
      if (req.user?.companyId) input.company_id = req.user.companyId;
      const result = await ToolsService.listKits(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async getKitById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = getKitByIdSchema.parse(req.params);
      const result = await ToolsService.getKitById(id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async getKitByCargo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const cargo = decodeURIComponent(req.params.cargo);
      const companyId = req.user!.companyId!;
      const result = await ToolsService.getKitByCargo(cargo, companyId);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async createKit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const body = { ...req.body };
      if (req.user?.companyId) body.company_id = req.user.companyId;
      const input = createKitSchema.parse(body);
      const result = await ToolsService.createKit(input);

      await AuditService.logAction({
        table_name: 'tool_kits',
        record_id: Number(result.id),
        action: 'create',
        new_values: { name: result.name, cargo: result.cargo },
        users_id: req.user!.id,
        ip_address: req.ip,
      });

      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async updateKit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getKitByIdSchema.parse(req.params);
      const input = updateKitSchema.parse(req.body);
      const result = await ToolsService.updateKit(id, input);

      await AuditService.logAction({
        table_name: 'tool_kits',
        record_id: id,
        action: 'update',
        new_values: { name: result.name, cargo: result.cargo },
        users_id: req.user!.id,
        ip_address: req.ip,
      });

      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async deleteKit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getKitByIdSchema.parse(req.params);
      await ToolsService.deleteKit(id);

      await AuditService.logAction({
        table_name: 'tool_kits',
        record_id: id,
        action: 'delete',
        users_id: req.user!.id,
        ip_address: req.ip,
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async addKitItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = getKitByIdSchema.parse(req.params);
      const input = addKitItemSchema.parse(req.body);
      const result = await ToolsService.addKitItem(id, input);

      await AuditService.logAction({
        table_name: 'tool_kit_items',
        record_id: Number(result.id),
        action: 'create',
        new_values: { kit_id: id, category_id: input.category_id, quantity: input.quantity },
        users_id: req.user!.id,
        ip_address: req.ip,
      });

      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async deleteKitItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id, itemId } = deleteKitItemSchema.parse(req.params);
      await ToolsService.deleteKitItem(id, itemId);

      await AuditService.logAction({
        table_name: 'tool_kit_items',
        record_id: itemId,
        action: 'delete',
        users_id: req.user!.id,
        ip_address: req.ip,
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // User Tools & Summary
  // ===========================================================================

  static async getUserTools(req: Request, res: Response, next: NextFunction) {
    try {
      const { user_id } = getUserToolsSchema.parse(req.params);
      const result = await ToolsService.getUserTools(user_id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyId = req.user!.companyId!;
      const result = await ToolsService.getSummary(companyId);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }
}

export default ToolsController;
