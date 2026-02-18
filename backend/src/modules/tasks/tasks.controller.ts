// =============================================================================
// INDUSTRYVIEW BACKEND - Tasks Controller
// Controller de tasks (tasks_template, priorities, unity, discipline, comments)
// Equivalente aos endpoints do api_group Tasks do Xano
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { TasksService } from './tasks.service';
import { AuthenticatedRequest } from '../../types';
import { serializeBigInt } from '../../utils/bigint';

/**
 * TasksController - Controller do modulo de tasks
 */
export class TasksController {
  // =============================================================================
  // TASKS (tasks_template)
  // =============================================================================

  /**
   * GET /all_tasks_template
   * Lista templates de tasks
   * Equivalente a: query all_tasks_template verb=GET do Xano
   */
  static async listTemplates(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await TasksService.listTemplates();
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /tasks/list
   * Lista tasks com paginacao e filtros
   * Equivalente a: query tasks_list verb=POST do Xano (endpoint 427)
   */
  static async list(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // company_id SEMPRE vem do usuario autenticado — ignora o que veio no body
      const companyId = req.user?.companyId ?? undefined;
      const input = {
        page: req.body.page || 1,
        per_page: req.body.per_page || 20,
        search: req.body.search,
        equipaments_types_id: req.body.equipaments_types_id,
        company_id: companyId,
      };
      const result = await TasksService.list(input);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /tasks/:tasks_id
   * Busca task por ID
   * Equivalente a: query tasks/{tasks_id} verb=GET do Xano (endpoint 426)
   */
  static async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const taskId = parseInt(req.params.tasks_id, 10);
      const result = await TasksService.getById(taskId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /tasks
   * Cria uma nova task
   * Equivalente a: query tasks verb=POST do Xano (endpoint 428)
   */
  static async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await TasksService.create(req.body);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /tasks/:tasks_id
   * Atualiza task
   * Equivalente a: query tasks/{tasks_id} verb=PATCH do Xano (endpoint 429)
   */
  static async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const taskId = parseInt(req.params.tasks_id, 10);
      const result = await TasksService.update(taskId, req.body);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /tasks/:tasks_id
   * Remove task (soft delete)
   * Equivalente a: query tasks/{tasks_id} verb=DELETE do Xano (endpoint 425)
   */
  static async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const taskId = parseInt(req.params.tasks_id, 10);
      const result = await TasksService.delete(taskId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // TASKS PRIORITIES
  // =============================================================================

  /**
   * GET /tasks/priorities
   * Lista todas as prioridades
   * Equivalente a: query tasks_priorities verb=GET do Xano (endpoint 432)
   */
  static async listPriorities(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await TasksService.listPriorities();
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /tasks/priorities/:tasks_priorities_id
   * Busca prioridade por ID
   * Equivalente a: query tasks_priorities/{tasks_priorities_id} verb=GET do Xano (endpoint 431)
   */
  static async getPriorityById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const priorityId = parseInt(req.params.tasks_priorities_id, 10);
      const result = await TasksService.getPriorityById(priorityId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /tasks/priorities
   * Cria uma nova prioridade
   * Equivalente a: query tasks_priorities verb=POST do Xano (endpoint 433)
   */
  static async createPriority(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await TasksService.createPriority(req.body);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /tasks/priorities/:tasks_priorities_id
   * Atualiza prioridade
   * Equivalente a: query tasks_priorities/{tasks_priorities_id} verb=PATCH do Xano (endpoint 434)
   */
  static async updatePriority(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const priorityId = parseInt(req.params.tasks_priorities_id, 10);
      const result = await TasksService.updatePriority(priorityId, req.body);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /tasks/priorities/:tasks_priorities_id
   * Remove prioridade (soft delete)
   * Equivalente a: query tasks_priorities/{tasks_priorities_id} verb=DELETE do Xano (endpoint 430)
   */
  static async deletePriority(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const priorityId = parseInt(req.params.tasks_priorities_id, 10);
      const result = await TasksService.deletePriority(priorityId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // UNITY
  // =============================================================================

  /**
   * GET /tasks/unity
   * Lista todas as unidades
   * Equivalente a: query unity verb=GET do Xano (endpoint 659)
   */
  static async listUnity(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.query.company_id ? parseInt(req.query.company_id as string, 10) : undefined;
      const result = await TasksService.listUnity(companyId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /tasks/unity/:unity_id
   * Busca unidade por ID
   */
  static async getUnityById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const unityId = parseInt(req.params.unity_id, 10);
      const result = await TasksService.getUnityById(unityId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /tasks/unity
   * Cria uma nova unidade
   * Equivalente a: query unity verb=POST do Xano (endpoint 660)
   */
  static async createUnity(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await TasksService.createUnity(req.body);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /tasks/unity/:unity_id
   * Atualiza unidade
   * Equivalente a: query unity/{unity_id} verb=PATCH do Xano (endpoint 661)
   */
  static async updateUnity(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const unityId = parseInt(req.params.unity_id, 10);
      const result = await TasksService.updateUnity(unityId, req.body);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /tasks/unity/:unity_id
   * Remove unidade (soft delete)
   * Equivalente a: query unity/{unity_id} verb=DELETE do Xano (endpoint 657)
   */
  static async deleteUnity(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const unityId = parseInt(req.params.unity_id, 10);
      const result = await TasksService.deleteUnity(unityId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // DISCIPLINE
  // =============================================================================

  /**
   * GET /tasks/discipline
   * Lista todas as disciplinas
   * Equivalente a: query discipline verb=GET do Xano (endpoint 714)
   */
  static async listDiscipline(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.query.company_id ? parseInt(req.query.company_id as string, 10) : undefined;
      const result = await TasksService.listDiscipline(companyId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /tasks/discipline/:discipline_id
   * Busca disciplina por ID
   */
  static async getDisciplineById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const disciplineId = parseInt(req.params.discipline_id, 10);
      const result = await TasksService.getDisciplineById(disciplineId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /tasks/discipline
   * Cria uma nova disciplina
   * Equivalente a: query creat_discipline verb=POST do Xano (endpoint 729)
   */
  static async createDiscipline(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await TasksService.createDiscipline(req.body);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /tasks/discipline/:discipline_id
   * Atualiza disciplina
   * Equivalente a: query edit_discipline verb=PUT do Xano (endpoint 730)
   */
  static async updateDiscipline(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const disciplineId = parseInt(req.params.discipline_id, 10);
      const result = await TasksService.updateDiscipline(disciplineId, req.body);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /tasks/discipline/:discipline_id
   * Remove disciplina (soft delete)
   * Equivalente a: query deleted_discipline verb=DELETE do Xano (endpoint 731)
   */
  static async deleteDiscipline(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const disciplineId = parseInt(req.params.discipline_id, 10);
      const result = await TasksService.deleteDiscipline(disciplineId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // TASK COMMENTS
  // =============================================================================

  /**
   * GET /tasks/comments/subtasks
   * Lista comentarios de subtasks
   * Equivalente a: query comment_subtasks verb=GET do Xano (endpoint 702)
   */
  static async listCommentSubtasks(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const subtasksId = req.query.subtasks_id ? parseInt(req.query.subtasks_id as string, 10) : undefined;
      const result = await TasksService.listCommentSubtasks(subtasksId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /tasks/comments/backlogs
   * Lista comentarios de backlogs
   * Equivalente a: query comment_backlogs verb=GET do Xano (endpoint 705)
   */
  static async listCommentBacklogs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const projectsBacklogsId = req.query.projects_backlogs_id ? parseInt(req.query.projects_backlogs_id as string, 10) : undefined;
      const result = await TasksService.listCommentBacklogs(projectsBacklogsId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /tasks/comments/:task_comments_id
   * Busca comentario por ID
   * Equivalente a: query task_comments/{task_comments_id} verb=GET do Xano (endpoint 701)
   */
  static async getCommentById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const commentId = parseInt(req.params.task_comments_id, 10);
      const result = await TasksService.getCommentById(commentId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /tasks/comments
   * Cria um novo comentario
   * Equivalente a: query task_comments verb=POST do Xano (endpoint 703)
   */
  static async createComment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Se o usuario esta autenticado, use o ID dele como created_user_id
      const input = {
        ...req.body,
        created_user_id: req.body.created_user_id || req.user?.id,
      };
      const result = await TasksService.createComment(input);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /tasks/comments/:task_comments_id
   * Atualiza comentario
   * Equivalente a: query task_comments/{task_comments_id} verb=PATCH do Xano (endpoint 704)
   */
  static async updateComment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const commentId = parseInt(req.params.task_comments_id, 10);
      const result = await TasksService.updateComment(commentId, req.body);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /tasks/comments/:task_comments_id
   * Remove comentario (soft delete)
   * Equivalente a: query task_comments/{task_comments_id} verb=DELETE do Xano (endpoint 700)
   */
  static async deleteComment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const commentId = parseInt(req.params.task_comments_id, 10);
      const result = await TasksService.deleteComment(commentId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }
}

export default TasksController;
