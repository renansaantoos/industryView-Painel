// =============================================================================
// INDUSTRYVIEW BACKEND - Employees Module Controller
// Controller do modulo de funcionarios (dados de RH, ferias, documentos)
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { EmployeesService } from './employees.service';
import { serializeBigInt } from '../../utils/bigint';
import { AuthenticatedRequest } from '../../types';
import {
  getHrDataParamsSchema,
  upsertHrDataSchema,
  listVacationsSchema,
  createVacationSchema,
  updateVacationSchema,
  approveVacationSchema,
  idParamSchema,
  listDocumentsSchema,
  createDocumentSchema,
  updateDocumentSchema,
  listDayOffsSchema,
  createDayOffSchema,
  updateDayOffSchema,
  approveDayOffSchema,
  listBenefitsSchema,
  createBenefitSchema,
  updateBenefitSchema,
  listCareerHistorySchema,
  createCareerHistorySchema,
  updateCareerHistorySchema,
} from './employees.schema';

/**
 * EmployeesController - Controller do modulo de funcionarios
 */
export class EmployeesController {
  // ===========================================================================
  // HR Data
  // ===========================================================================

  static async getHrData(req: Request, res: Response, next: NextFunction) {
    try {
      const { users_id } = getHrDataParamsSchema.parse(req.params);
      const result = await EmployeesService.getHrData(users_id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async upsertHrData(req: Request, res: Response, next: NextFunction) {
    try {
      const { users_id } = getHrDataParamsSchema.parse(req.params);
      const data = upsertHrDataSchema.parse(req.body);
      const result = await EmployeesService.upsertHrData(users_id, data);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Vacations
  // ===========================================================================

  static async listVacations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listVacationsSchema.parse(req.query) as any;
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await EmployeesService.listVacations(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async createVacation(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createVacationSchema.parse(req.body);
      const result = await EmployeesService.createVacation(data);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async updateVacation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data = updateVacationSchema.parse(req.body);
      const result = await EmployeesService.updateVacation(id, data);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async approveVacation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const { status } = approveVacationSchema.parse(req.body);
      const approvedById = (req as any).user?.id || (req as any).auth?.id;
      const result = await EmployeesService.approveVacation(id, approvedById, status);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async deleteVacation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      await EmployeesService.deleteVacation(id);
      res.json({ message: 'Ferias excluidas com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  static async getVacationBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const { users_id } = getHrDataParamsSchema.parse(req.params);
      const result = await EmployeesService.getVacationBalance(users_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Documents
  // ===========================================================================

  static async listDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listDocumentsSchema.parse(req.query) as any;
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await EmployeesService.listDocuments(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async createDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createDocumentSchema.parse(req.body);
      const result = await EmployeesService.createDocument(data);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async updateDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data = updateDocumentSchema.parse(req.body);
      const result = await EmployeesService.updateDocument(id, data);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      await EmployeesService.deleteDocument(id);
      res.json({ message: 'Documento excluido com sucesso' });
    } catch (error) {
      next(error);
    }
  }
  // ===========================================================================
  // Day Offs
  // ===========================================================================

  static async listDayOffs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listDayOffsSchema.parse(req.query) as any;
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await EmployeesService.listDayOffs(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async createDayOff(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createDayOffSchema.parse(req.body);
      const result = await EmployeesService.createDayOff(data);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async updateDayOff(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data = updateDayOffSchema.parse(req.body);
      const result = await EmployeesService.updateDayOff(id, data);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async approveDayOff(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const { status } = approveDayOffSchema.parse(req.body);
      const approvedById = (req as any).user?.id || (req as any).auth?.id;
      const result = await EmployeesService.approveDayOff(id, approvedById, status);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async deleteDayOff(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      await EmployeesService.deleteDayOff(id);
      res.json({ message: 'Folga excluida com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  static async getDayOffBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const { users_id } = getHrDataParamsSchema.parse(req.params);
      const result = await EmployeesService.getDayOffBalance(users_id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Benefits
  // ===========================================================================

  static async listBenefits(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listBenefitsSchema.parse(req.query) as any;
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await EmployeesService.listBenefits(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async createBenefit(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createBenefitSchema.parse(req.body);
      const result = await EmployeesService.createBenefit(data);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async updateBenefit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data = updateBenefitSchema.parse(req.body);
      const result = await EmployeesService.updateBenefit(id, data);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async deleteBenefit(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      await EmployeesService.deleteBenefit(id);
      res.json({ message: 'Beneficio excluido com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Career History
  // ===========================================================================

  static async listCareerHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listCareerHistorySchema.parse(req.query) as any;
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await EmployeesService.listCareerHistory(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async createCareerHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createCareerHistorySchema.parse(req.body);
      const registeredById = (req as any).user?.id || (req as any).auth?.id;
      const result = await EmployeesService.createCareerHistory(data, registeredById);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async updateCareerHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data = updateCareerHistorySchema.parse(req.body);
      const result = await EmployeesService.updateCareerHistory(id, data);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  static async deleteCareerHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      await EmployeesService.deleteCareerHistory(id);
      res.json({ message: 'Registro de carreira excluido com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

export default EmployeesController;
