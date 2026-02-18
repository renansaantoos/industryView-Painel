// =============================================================================
// INDUSTRYVIEW BACKEND - Quality Module Controller
// Controller do modulo de qualidade
// Abrange: non_conformances, documents (GED), checklists, golden_rules
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { serializeBigInt } from '../../utils/bigint';
import { QualityService } from './quality.service';
import { AuthenticatedRequest } from '../../types';
import {
  listNonConformancesSchema,
  createNonConformanceSchema,
  updateNonConformanceSchema,
  closeNonConformanceSchema,
  getNcStatisticsSchema,
  createNcAttachmentSchema,
  listDocumentsSchema,
  createDocumentSchema,
  updateDocumentSchema,
  approveDocumentSchema,
  listTaskDocumentsSchema,
  createTaskDocumentSchema,
  listChecklistTemplatesSchema,
  createChecklistTemplateSchema,
  updateChecklistTemplateSchema,
  listChecklistResponsesSchema,
  createChecklistResponseSchema,
  listGoldenRulesSchema,
  createGoldenRuleSchema,
  updateGoldenRuleSchema,
  listTaskGoldenRulesSchema,
  createTaskGoldenRuleSchema,
  listTaskChecklistsSchema,
  createTaskChecklistSchema,
} from './quality.schema';
import { z } from 'zod';

const idParamSchema = z.object({
  id: z.coerce.number().int().min(1),
});

const userIdQuerySchema = z.object({
  users_id: z.coerce.number().int().min(1),
});

/**
 * QualityController - Controller do modulo de qualidade
 */
export class QualityController {
  // ===========================================================================
  // Non Conformances
  // ===========================================================================

  /**
   * Lista nao conformidades
   * Route: GET /api/v1/quality/non-conformances
   */
  static async listNonConformances(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listNonConformancesSchema.parse(req.query) as any;
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await QualityService.listNonConformances(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retorna estatisticas de nao conformidades (Pareto por categoria, severidade e origem)
   * Route: GET /api/v1/quality/non-conformances/statistics
   */
  static async getNcStatistics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = getNcStatisticsSchema.parse(req.query) as any;
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await QualityService.getNcStatistics(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca nao conformidade por ID
   * Route: GET /api/v1/quality/non-conformances/:id
   */
  static async getNcById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const result = await QualityService.getNcById(id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria nao conformidade com numero automatico RNC-YYYY-NNN
   * Route: POST /api/v1/quality/non-conformances
   */
  static async createNc(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createNonConformanceSchema.parse(req.body);
      const result = await QualityService.createNc(input);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza nao conformidade
   * Route: PATCH /api/v1/quality/non-conformances/:id
   */
  static async updateNc(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const input = updateNonConformanceSchema.parse(req.body);
      const result = await QualityService.updateNc(id, input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fecha nao conformidade (requer root_cause_analysis e corrective_action_plan)
   * Route: POST /api/v1/quality/non-conformances/:id/close
   */
  static async closeNc(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const input = closeNonConformanceSchema.parse(req.body);
      const result = await QualityService.closeNc(id, input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria anexo para nao conformidade
   * Route: POST /api/v1/quality/non-conformances/:id/attachments
   */
  static async createNcAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const input = createNcAttachmentSchema.parse({
        ...req.body,
        non_conformances_id: id,
      });
      const result = await QualityService.createNcAttachment(input);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Documents (GED)
  // ===========================================================================

  /**
   * Lista documentos
   * Route: GET /api/v1/quality/documents
   */
  static async listDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listDocumentsSchema.parse(req.query);
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await QualityService.listDocuments(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista documentos pendentes de ciencia para o usuario
   * Route: GET /api/v1/quality/documents/pending-acknowledgments
   */
  static async getPendingAcknowledgments(req: Request, res: Response, next: NextFunction) {
    try {
      const { users_id } = userIdQuerySchema.parse(req.query);
      const result = await QualityService.getPendingAcknowledgments(users_id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca documento por ID
   * Route: GET /api/v1/quality/documents/:id
   */
  static async getDocumentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const result = await QualityService.getDocumentById(id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria documento
   * Route: POST /api/v1/quality/documents
   */
  static async createDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const body = { ...req.body };
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        body.company_id = req.user.companyId;
      }
      const input = createDocumentSchema.parse(body);
      const result = await QualityService.createDocument(input);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza documento (bloqueado se status='aprovado')
   * Route: PATCH /api/v1/quality/documents/:id
   */
  static async updateDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const input = updateDocumentSchema.parse(req.body);
      const result = await QualityService.updateDocument(id, input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Aprova documento e muda status para 'aprovado'
   * Route: POST /api/v1/quality/documents/:id/approve
   */
  static async approveDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const input = approveDocumentSchema.parse(req.body);
      const result = await QualityService.approveDocument(id, input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Registra ciencia de documento pelo usuario
   * Route: POST /api/v1/quality/documents/:id/acknowledge
   */
  static async acknowledgeDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: document_id } = idParamSchema.parse(req.params);
      const { users_id } = z.object({
        users_id: z.coerce.number().int().min(1, 'users_id e obrigatorio'),
      }).parse(req.body);
      const result = await QualityService.acknowledgeDocument(document_id, users_id);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Task Documents
  // ===========================================================================

  /**
   * Lista vinculos task-documento
   * Route: GET /api/v1/quality/task-documents
   */
  static async listTaskDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listTaskDocumentsSchema.parse(req.query);
      const result = await QualityService.listTaskDocuments(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria vinculo task-documento
   * Route: POST /api/v1/quality/task-documents
   */
  static async createTaskDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createTaskDocumentSchema.parse(req.body);
      const result = await QualityService.createTaskDocument(input);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove vinculo task-documento
   * Route: DELETE /api/v1/quality/task-documents/:id
   */
  static async deleteTaskDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      await QualityService.deleteTaskDocument(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Checklist Templates
  // ===========================================================================

  /**
   * Lista templates de checklist
   * Route: GET /api/v1/quality/checklist-templates
   */
  static async listChecklistTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listChecklistTemplatesSchema.parse(req.query);
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await QualityService.listChecklistTemplates(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria template de checklist com itens
   * Route: POST /api/v1/quality/checklist-templates
   */
  static async createChecklistTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const body = { ...req.body };
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        body.company_id = req.user.companyId;
      }
      const input = createChecklistTemplateSchema.parse(body);
      const result = await QualityService.createChecklistTemplate(input);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza template de checklist e seus itens
   * Route: PATCH /api/v1/quality/checklist-templates/:id
   */
  static async updateChecklistTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const input = updateChecklistTemplateSchema.parse(req.body);
      const result = await QualityService.updateChecklistTemplate(id, input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Soft delete de template de checklist
   * Route: DELETE /api/v1/quality/checklist-templates/:id
   */
  static async deleteChecklistTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      await QualityService.deleteChecklistTemplate(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Checklist Responses
  // ===========================================================================

  /**
   * Lista respostas de checklist
   * Route: GET /api/v1/quality/checklist-responses
   */
  static async listChecklistResponses(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listChecklistResponsesSchema.parse(req.query);
      const result = await QualityService.listChecklistResponses(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca resposta de checklist por ID
   * Route: GET /api/v1/quality/checklist-responses/:id
   */
  static async getChecklistResponse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const result = await QualityService.getChecklistResponse(id);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria resposta de checklist com todos os itens
   * Route: POST /api/v1/quality/checklist-responses
   */
  static async createChecklistResponse(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createChecklistResponseSchema.parse(req.body);
      const result = await QualityService.createChecklistResponse(input);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Golden Rules
  // ===========================================================================

  /**
   * Lista regras de ouro
   * Route: GET /api/v1/quality/golden-rules
   */
  static async listGoldenRules(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = listGoldenRulesSchema.parse(req.query);
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        input.company_id = req.user.companyId;
      }
      const result = await QualityService.listGoldenRules(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria regra de ouro
   * Route: POST /api/v1/quality/golden-rules
   */
  static async createGoldenRule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const body = { ...req.body };
      // company_id SEMPRE vem do usuario autenticado
      if (req.user?.companyId) {
        body.company_id = req.user.companyId;
      }
      const input = createGoldenRuleSchema.parse(body);
      const result = await QualityService.createGoldenRule(input);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza regra de ouro
   * Route: PATCH /api/v1/quality/golden-rules/:id
   */
  static async updateGoldenRule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const input = updateGoldenRuleSchema.parse(req.body);
      const result = await QualityService.updateGoldenRule(id, input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Soft delete de regra de ouro
   * Route: DELETE /api/v1/quality/golden-rules/:id
   */
  static async deleteGoldenRule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      await QualityService.deleteGoldenRule(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Task Golden Rules
  // ===========================================================================

  /**
   * Lista vinculos task-golden rule
   * Route: GET /api/v1/quality/task-golden-rules
   */
  static async listTaskGoldenRules(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listTaskGoldenRulesSchema.parse(req.query);
      const result = await QualityService.listTaskGoldenRules(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria vinculo task/template-golden rule
   * Route: POST /api/v1/quality/task-golden-rules
   */
  static async createTaskGoldenRule(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createTaskGoldenRuleSchema.parse(req.body);
      const result = await QualityService.createTaskGoldenRule(input);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove vinculo task-golden rule
   * Route: DELETE /api/v1/quality/task-golden-rules/:id
   */
  static async deleteTaskGoldenRule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      await QualityService.deleteTaskGoldenRule(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Task Checklists
  // ===========================================================================

  /**
   * Lista vinculos task/template-checklist
   * Route: GET /api/v1/quality/task-checklists
   */
  static async listTaskChecklists(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listTaskChecklistsSchema.parse(req.query);
      const result = await QualityService.listTaskChecklists(input);
      res.json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria vinculo task/template-checklist (idempotente)
   * Route: POST /api/v1/quality/task-checklists
   */
  static async createTaskChecklist(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createTaskChecklistSchema.parse(req.body);
      const result = await QualityService.createTaskChecklist(input);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove vinculo task-checklist
   * Route: DELETE /api/v1/quality/task-checklists/:id
   */
  static async deleteTaskChecklist(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = z.object({ id: z.coerce.number().int().min(1) }).parse(req.params);
      await QualityService.deleteTaskChecklist(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default QualityController;
