// =============================================================================
// INDUSTRYVIEW BACKEND - Sprints Controller
// Controller de sprints
// Equivalente aos endpoints do api_group Sprints do Xano
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { SprintsService } from './sprints.service';
import { AuthenticatedRequest } from '../../types';
import { logger } from '../../utils/logger';
import { serializeBigInt } from '../../utils/bigint';

/**
 * SprintsController - Controller do modulo de sprints
 */
export class SprintsController {
  // =============================================================================
  // SPRINTS
  // =============================================================================

  /**
   * GET /sprints
   * Lista sprints do projeto agrupadas por status
   * Equivalente a: query sprints verb=GET do Xano (endpoint 512)
   */
  static async list(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const projectsId = parseInt(req.query.projects_id as string, 10);
      const page = parseInt(req.query.page as string, 10) || 1;
      const perPage = parseInt(req.query.per_page as string, 10) || 20;
      const dtStart = req.query.dt_start as string | undefined;
      const dtEnd = req.query.dt_end as string | undefined;
      // company_id SEMPRE vem do usuario autenticado
      const companyId = req.user?.companyId;

      const result = await SprintsService.list(projectsId, page, perPage, dtStart, dtEnd, companyId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /sprints/:sprints_id
   * Busca sprint por ID
   * Equivalente a: query sprints/{sprints_id} verb=GET do Xano (endpoint 511)
   */
  static async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sprintId = parseInt(req.params.sprints_id, 10);
      const result = await SprintsService.getById(sprintId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /sprints
   * Cria sprint
   * Equivalente a: query sprints verb=POST do Xano (endpoint 513)
   */
  static async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await SprintsService.create(req.body);

      logger.info({ sprintId: result.id, title: result.title }, 'Sprint created');

      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /sprints/:sprints_id
   * Atualiza sprint
   * Equivalente a: query sprints/{sprints_id} verb=PATCH do Xano (endpoint 514)
   */
  static async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sprintId = parseInt(req.params.sprints_id, 10);
      const result = await SprintsService.update(sprintId, req.body);

      logger.info({ sprintId }, 'Sprint updated');

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /sprints/:sprints_id
   * Remove sprint
   * Equivalente a: query sprints/{sprints_id} verb=DELETE do Xano (endpoint 510)
   */
  static async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sprintId = parseInt(req.params.sprints_id, 10);
      const result = await SprintsService.delete(sprintId);

      logger.info({ sprintId }, 'Sprint deleted');

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /sprints/status
   * Atualiza status da sprint
   * Equivalente a: query update_sprint_status verb=PUT do Xano (endpoint 590)
   */
  static async updateStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await SprintsService.updateStatus(req.body);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // SPRINT STATUSES
  // =============================================================================

  /**
   * GET /sprints/statuses
   * Lista status de sprints
   * Equivalente a: query sprints_statuses verb=GET do Xano (endpoint 517)
   */
  static async listStatuses(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const perPage = parseInt(req.query.per_page as string, 10) || 20;
      const result = await SprintsService.listStatuses(page, perPage);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /sprints/statuses/:sprints_statuses_id
   * Busca status por ID
   * Equivalente a: query sprints_statuses/{id} verb=GET do Xano (endpoint 516)
   */
  static async getStatusById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const statusId = parseInt(req.params.sprints_statuses_id, 10);
      const result = await SprintsService.getStatusById(statusId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /sprints/statuses
   * Cria status de sprint
   * Equivalente a: query sprints_statuses verb=POST do Xano (endpoint 518)
   */
  static async createStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await SprintsService.createStatus(req.body);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /sprints/statuses/:sprints_statuses_id
   * Atualiza status de sprint
   * Equivalente a: query sprints_statuses/{id} verb=PATCH do Xano (endpoint 519)
   */
  static async updateStatusRecord(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const statusId = parseInt(req.params.sprints_statuses_id, 10);
      const result = await SprintsService.updateStatusRecord(statusId, req.body);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /sprints/statuses/:sprints_statuses_id
   * Remove status de sprint
   * Equivalente a: query sprints_statuses/{id} verb=DELETE do Xano (endpoint 515)
   */
  static async deleteStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const statusId = parseInt(req.params.sprints_statuses_id, 10);
      const result = await SprintsService.deleteStatus(statusId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // SPRINT TASKS
  // =============================================================================

  /**
   * POST /sprints/tasks/panel
   * Painel de tarefas da sprint (Kanban)
   * Equivalente a: query sprints_tasks_painel verb=POST do Xano (endpoint 522)
   */
  static async getTasksPanel(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await SprintsService.getTasksPanel(req.body);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /sprints/tasks/:sprints_tasks_id
   * Busca tarefa por ID
   * Equivalente a: query sprints_tasks/{id} verb=GET do Xano (endpoint 521)
   */
  static async getTaskById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const taskId = parseInt(req.params.sprints_tasks_id, 10);
      const result = await SprintsService.getTaskById(taskId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /sprints/tasks
   * Cria tarefa de sprint
   * Equivalente a: query sprints_tasks verb=POST do Xano (endpoint 523)
   */
  static async createTask(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await SprintsService.createTask(req.body);

      logger.info({ taskId: result.id }, 'Sprint task created');

      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /sprints/tasks/:sprints_tasks_id
   * Atualiza tarefa de sprint
   * Equivalente a: query sprints_tasks/{id} verb=PATCH do Xano (endpoint 524)
   */
  static async updateTask(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const taskId = parseInt(req.params.sprints_tasks_id, 10);
      const result = await SprintsService.updateTask(taskId, req.body);

      logger.info({ taskId }, 'Sprint task updated');

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /sprints/tasks/:sprints_tasks_id
   * Remove tarefa de sprint
   * Equivalente a: query sprints_tasks/{id} verb=DELETE do Xano (endpoint 520)
   */
  static async deleteTask(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const taskId = parseInt(req.params.sprints_tasks_id, 10);
      const result = await SprintsService.deleteTask(taskId);

      logger.info({ taskId }, 'Sprint task deleted');

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /sprints/tasks/status
   * Atualiza status da tarefa
   * Equivalente a: query update_sprint_task_status verb=PUT do Xano (endpoint 591)
   */
  static async updateTaskStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await SprintsService.updateTaskStatus(req.body);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /sprints/tasks/status/list
   * Atualiza status de multiplas tarefas
   * Equivalente a: query update_lista_sprint_task_status verb=PUT do Xano (endpoint 631)
   */
  static async updateListTaskStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await SprintsService.updateListTaskStatus(req.body);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // SPRINT TASK STATUSES
  // =============================================================================

  /**
   * GET /sprints/tasks/statuses
   * Lista status de tarefas de sprint
   * Equivalente a: query sprints_tasks_statuses verb=GET do Xano (endpoint 532)
   */
  static async listTaskStatuses(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const perPage = parseInt(req.query.per_page as string, 10) || 20;
      const result = await SprintsService.listTaskStatuses(page, perPage);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /sprints/tasks/statuses/:sprints_tasks_statuses_id
   * Busca status de tarefa por ID
   * Equivalente a: query sprints_tasks_statuses/{id} verb=GET do Xano (endpoint 531)
   */
  static async getTaskStatusById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const statusId = parseInt(req.params.sprints_tasks_statuses_id, 10);
      const result = await SprintsService.getTaskStatusById(statusId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /sprints/tasks/statuses
   * Cria status de tarefa de sprint
   * Equivalente a: query sprints_tasks_statuses verb=POST do Xano (endpoint 533)
   */
  static async createTaskStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await SprintsService.createTaskStatus(req.body);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /sprints/tasks/statuses/:sprints_tasks_statuses_id
   * Atualiza status de tarefa de sprint
   * Equivalente a: query sprints_tasks_statuses/{id} verb=PATCH do Xano (endpoint 534)
   */
  static async updateTaskStatusRecord(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const statusId = parseInt(req.params.sprints_tasks_statuses_id, 10);
      const result = await SprintsService.updateTaskStatusRecord(statusId, req.body);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /sprints/tasks/statuses/:sprints_tasks_statuses_id
   * Remove status de tarefa de sprint
   * Equivalente a: query sprints_tasks_statuses/{id} verb=DELETE do Xano (endpoint 530)
   */
  static async deleteTaskStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const statusId = parseInt(req.params.sprints_tasks_statuses_id, 10);
      const result = await SprintsService.deleteTaskStatus(statusId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // QUALITY STATUS
  // =============================================================================

  /**
   * GET /sprints/quality-status
   * Lista quality status
   * Equivalente a: query quality_status verb=GET do Xano (endpoint 654)
   */
  static async listQualityStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const perPage = parseInt(req.query.per_page as string, 10) || 20;
      const result = await SprintsService.listQualityStatus(page, perPage);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /sprints/quality-status/:quality_status_id
   * Busca quality status por ID
   * Equivalente a: query quality_status/{id} verb=GET do Xano (endpoint 653)
   */
  static async getQualityStatusById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const statusId = parseInt(req.params.quality_status_id, 10);
      const result = await SprintsService.getQualityStatusById(statusId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /sprints/quality-status
   * Cria quality status
   * Equivalente a: query quality_status verb=POST do Xano (endpoint 655)
   */
  static async createQualityStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await SprintsService.createQualityStatus(req.body);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /sprints/quality-status/:quality_status_id
   * Atualiza quality status
   * Equivalente a: query quality_status/{id} verb=PATCH do Xano (endpoint 656)
   */
  static async updateQualityStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const statusId = parseInt(req.params.quality_status_id, 10);
      const result = await SprintsService.updateQualityStatus(statusId, req.body);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /sprints/quality-status/:quality_status_id
   * Remove quality status
   * Equivalente a: query quality_status/{id} verb=DELETE do Xano (endpoint 652)
   */
  static async deleteQualityStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const statusId = parseInt(req.params.quality_status_id, 10);
      const result = await SprintsService.deleteQualityStatus(statusId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /sprints/inspection
   * Atualiza inspecao
   * Equivalente a: query update_inspection verb=POST do Xano (endpoint 669)
   */
  static async updateInspection(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await SprintsService.updateInspection(req.body);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /sprints/subtask/end
   * Finaliza subtask
   * Equivalente a: query end_subtask verb=PUT do Xano (endpoint 668)
   */
  static async endSubtask(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await SprintsService.endSubtask(req.body);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /sprints/subtasks/count
   * Contagem de subtasks
   * Equivalente a: query counts_subtasks verb=GET do Xano (endpoint 712)
   */
  static async countSubtasks(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const backlogId = parseInt(req.query.projects_backlogs_id as string, 10);
      const result = await SprintsService.countSubtasks(backlogId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /sprints/chart
   * Grafico de sprint
   * Equivalente a: query sprints_grafico_filter verb=GET do Xano (endpoint 629)
   */
  static async getChartData(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sprintId = parseInt(req.query.sprints_id as string, 10);
      const teamsId = req.query.teams_id ? parseInt(req.query.teams_id as string, 10) : null;
      const result = await SprintsService.getChartData(sprintId, teamsId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }
}

export default SprintsController;
