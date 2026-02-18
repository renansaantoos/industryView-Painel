// =============================================================================
// INDUSTRYVIEW BACKEND - Planning Controller
// Controller do modulo de planning
// Cobre: company_modules, schedule_baselines, task_dependencies, gantt, backlog_planning
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { PlanningService } from './planning.service';
import { AuthenticatedRequest } from '../../types';
import { logger } from '../../utils/logger';
import { serializeBigInt } from '../../utils/bigint';

/**
 * PlanningController - Controller do modulo de planning
 */
export class PlanningController {
  // =============================================================================
  // COMPANY MODULES
  // =============================================================================

  /**
   * GET /planning/company-modules
   * Lista todos os modulos configurados para uma empresa
   */
  static async listCompanyModules(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // company_id SEMPRE vem do usuario autenticado
      const companyId = req.user?.companyId ?? parseInt(req.query.company_id as string, 10);
      const result = await PlanningService.listCompanyModules(companyId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /planning/company-modules
   * Ativa ou desativa um modulo para uma empresa (upsert)
   */
  static async updateCompanyModule(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await PlanningService.updateCompanyModule(req.body);

      logger.info(
        { company_id: req.body.company_id, module_name: req.body.module_name, is_active: req.body.is_active },
        'Company module updated'
      );

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /planning/company-modules/check
   * Verifica se um modulo especifico esta ativo para uma empresa
   */
  static async checkCompanyModule(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // company_id SEMPRE vem do usuario autenticado
      const companyId = req.user?.companyId ?? parseInt(req.query.company_id as string, 10);
      const moduleName = req.query.module_name as string;
      const isActive = await PlanningService.isModuleActive(companyId, moduleName);
      res.status(200).json({ is_active: isActive });
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // SCHEDULE BASELINES
  // =============================================================================

  /**
   * GET /planning/baselines
   * Lista os baselines de um projeto ordenados pelo numero descrescente
   */
  static async listBaselines(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const projectsId = parseInt(req.query.projects_id as string, 10);
      const result = await PlanningService.listBaselines(projectsId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /planning/baselines/:id
   * Busca um baseline especifico por ID
   */
  static async getBaselineById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await PlanningService.getBaselineById(id);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /planning/baselines
   * Cria um novo baseline com snapshot de todos os backlogs do projeto
   */
  static async createBaseline(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id ? parseInt(String(req.user.id), 10) : undefined;
      const result = await PlanningService.createBaseline(req.body, userId);

      logger.info(
        { projects_id: req.body.projects_id },
        'Schedule baseline created'
      );

      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /planning/baselines/:id/curve-s
   * Retorna os dados da Curva S comparando baseline vs progresso real
   */
  static async getCurveSData(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const baselineId = parseInt(req.params.id, 10);
      const projectsId = parseInt(req.query.projects_id as string, 10);
      const result = await PlanningService.getCurveSData(projectsId, baselineId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // TASK DEPENDENCIES
  // =============================================================================

  /**
   * GET /planning/dependencies
   * Lista todas as dependencias de um projeto
   */
  static async listDependencies(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const projectsId = parseInt(req.query.projects_id as string, 10);
      const result = await PlanningService.listDependencies(projectsId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /planning/dependencies
   * Cria uma nova dependencia entre dois backlogs com validacao de ciclos
   */
  static async createDependency(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await PlanningService.createDependency(req.body);

      logger.info(
        {
          predecessor_backlog_id: req.body.predecessor_backlog_id,
          successor_backlog_id: req.body.successor_backlog_id,
        },
        'Task dependency created'
      );

      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /planning/dependencies/:id
   * Remove uma dependencia (soft delete)
   */
  static async deleteDependency(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await PlanningService.deleteDependency(id);

      logger.info({ dependencyId: id }, 'Task dependency deleted');

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /planning/dependencies/backlog/:backlog_id
   * Retorna predecessores e sucessores de um backlog especifico
   */
  static async getDependenciesForBacklog(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const backlogId = parseInt(req.params.backlog_id, 10);
      const result = await PlanningService.getDependenciesForBacklog(backlogId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // GANTT DATA
  // =============================================================================

  /**
   * GET /planning/gantt
   * Retorna os dados estruturados para o Gantt do projeto
   */
  static async getGanttData(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const projectsId = parseInt(req.query.projects_id as string, 10);
      const sprintsId = req.query.sprints_id
        ? parseInt(req.query.sprints_id as string, 10)
        : undefined;
      const result = await PlanningService.getGanttData(projectsId, sprintsId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // BACKLOG PLANNING
  // =============================================================================

  /**
   * PATCH /planning/backlog-planning/:id
   * Atualiza os campos de planejamento de um backlog especifico
   */
  static async updateBacklogPlanning(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const backlogId = parseInt(req.params.id, 10);
      const result = await PlanningService.updateBacklogPlanning(backlogId, req.body);

      logger.info({ backlogId }, 'Backlog planning fields updated');

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /planning/backlog-planning/bulk
   * Atualiza os campos de planejamento de multiplos backlogs de uma vez
   */
  static async bulkUpdateBacklogPlanning(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await PlanningService.bulkUpdateBacklogPlanning(req.body.items);

      logger.info({ count: result.length }, 'Bulk backlog planning update completed');

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // CAMINHO CRITICO
  // =============================================================================

  /**
   * GET /planning/critical-path?projects_id=X
   * Calcula o caminho critico do projeto (CPM)
   */
  static async getCriticalPath(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const projectsId = parseInt(req.query.projects_id as string, 10);
      const result = await PlanningService.getCriticalPath(projectsId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // SAUDE DO CRONOGRAMA
  // =============================================================================

  /**
   * GET /planning/schedule-health?projects_id=X
   * Retorna indicadores de saude do cronograma (SPI, atrasos, progresso)
   */
  static async getScheduleHealth(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const projectsId = parseInt(req.query.projects_id as string, 10);
      const result = await PlanningService.getScheduleHealth(projectsId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // ROLLUP DE PROGRESSO
  // =============================================================================

  /**
   * POST /planning/rollup/:backlog_id
   * Recalcula percent_complete de um backlog e propaga para ancestrais
   */
  static async rollupBacklog(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const backlogId = parseInt(req.params.backlog_id, 10);
      const result = await PlanningService.rollupBacklog(backlogId);

      logger.info({ backlogId }, 'Progress rollup triggered for backlog');

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /planning/rollup-project/:projects_id
   * Recalcula percent_complete de todos os backlogs de um projeto (bottom-up)
   */
  static async rollupProject(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const projectsId = parseInt(req.params.projects_id, 10);
      const result = await PlanningService.rollupProject(projectsId);

      logger.info({ projectsId }, 'Full project progress rollup triggered');

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default PlanningController;
