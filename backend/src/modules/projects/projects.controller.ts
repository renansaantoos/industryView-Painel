// =============================================================================
// INDUSTRYVIEW BACKEND - Projects Controller
// Controller de projetos
// Equivalente aos endpoints do api_group Projects do Xano
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { ProjectsService } from './projects.service';
import { logger } from '../../utils/logger';
import { serializeBigInt } from '../../utils/bigint';
import { TeamsService } from '../teams/teams.service';
import { AuthenticatedRequest } from '../../types';

/**
 * ProjectsController - Controller do modulo de projetos
 */
export class ProjectsController {

  /**
   * GET /projects
   * Lista projetos com paginacao e filtros
   */
  static async list(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const perPage = req.query.per_page ? parseInt(req.query.per_page as string, 10) : 20;
      // company_id SEMPRE vem do usuario autenticado — nunca do query string
      const companyId = req.user?.companyId;

      const queryInput: any = {
        ...req.query,
        page,
        per_page: perPage,
        company_id: companyId ? BigInt(companyId) : undefined,
      };

      const result = await ProjectsService.list(queryInput);

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /projects
   * Cria um novo projeto
   */
  static async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // company_id SEMPRE vem do usuario autenticado — ignora o que veio no body
      const companyId = req.user?.companyId;
      const body = { ...req.body };
      if (companyId) {
        body.company_id = companyId;
      }
      const result = await ProjectsService.create(body);

      logger.info({ projectId: result.id, name: result.name }, 'Project created');

      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /projects/:projects_id
   * Busca projeto por ID
   */
  static async getById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const projectId = parseInt(req.params.projects_id, 10);
      const companyId = req.user?.companyId ?? undefined;
      const result = await ProjectsService.getById(projectId, companyId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /projects/:projects_id
   * Atualiza projeto
   */
  static async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const projectId = parseInt(req.params.projects_id, 10);
      const result = await ProjectsService.update(projectId, req.body);

      logger.info({ projectId }, 'Project updated');

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /projects/:projects_id
   * Remove projeto
   */
  static async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const projectId = parseInt(req.params.projects_id, 10);
      const result = await ProjectsService.delete(projectId);

      logger.info({ projectId }, 'Project deleted');

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /projects/statuses
   * Lista status de projetos
   * Equivalente a: query projects_statuses verb=GET do Xano (endpoint 487)
   */
  static async listStatuses(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const perPage = parseInt(req.query.per_page as string, 10) || 20;
      const result = await ProjectsService.listStatuses(page, perPage);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /projects/statuses/:projects_statuses_id
   * Busca status por ID
   * Equivalente a: query projects_statuses/{id} verb=GET do Xano (endpoint 486)
   */
  static async getStatusById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const statusId = parseInt(req.params.projects_statuses_id, 10);
      const result = await ProjectsService.getStatusById(statusId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /projects/statuses
   * Cria status de projeto
   * Equivalente a: query projects_statuses verb=POST do Xano (endpoint 488)
   */
  static async createStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ProjectsService.createStatus(req.body);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /projects/statuses/:projects_statuses_id
   * Atualiza status de projeto
   * Equivalente a: query projects_statuses/{id} verb=PATCH do Xano (endpoint 489)
   */
  static async updateStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const statusId = parseInt(req.params.projects_statuses_id, 10);
      const result = await ProjectsService.updateStatus(statusId, req.body);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /projects/statuses/:projects_statuses_id
   * Remove status de projeto
   * Equivalente a: query projects_statuses/{id} verb=DELETE do Xano (endpoint 485)
   */
  static async deleteStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const statusId = parseInt(req.params.projects_statuses_id, 10);
      const result = await ProjectsService.deleteStatus(statusId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // WORKS SITUATIONS
  // =============================================================================

  /**
   * GET /projects/works-situations
   * Lista situacoes de obra
   * Equivalente a: query projects_works_situations verb=GET do Xano (endpoint 567)
   */
  static async listWorksSituations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const perPage = parseInt(req.query.per_page as string, 10) || 20;
      const result = await ProjectsService.listWorksSituations(page, perPage);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /projects/works-situations/:projects_works_situations_id
   * Busca situacao por ID
   * Equivalente a: query projects_works_situations/{id} verb=GET do Xano (endpoint 566)
   */
  static async getWorksSituationById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const situationId = parseInt(req.params.projects_works_situations_id, 10);
      const result = await ProjectsService.getWorksSituationById(situationId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /projects/works-situations
   * Cria situacao de obra
   * Equivalente a: query projects_works_situations verb=POST do Xano (endpoint 568)
   */
  static async createWorksSituation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ProjectsService.createWorksSituation(req.body);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /projects/works-situations/:projects_works_situations_id
   * Atualiza situacao de obra
   * Equivalente a: query projects_works_situations/{id} verb=PATCH do Xano (endpoint 569)
   */
  static async updateWorksSituation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const situationId = parseInt(req.params.projects_works_situations_id, 10);
      const result = await ProjectsService.updateWorksSituation(situationId, req.body);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /projects/works-situations/:projects_works_situations_id
   * Remove situacao de obra
   * Equivalente a: query projects_works_situations/{id} verb=DELETE do Xano (endpoint 565)
   */
  static async deleteWorksSituation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const situationId = parseInt(req.params.projects_works_situations_id, 10);
      const result = await ProjectsService.deleteWorksSituation(situationId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // PROJECT USERS
  // =============================================================================

  /**
   * GET /projects/users
   * Lista usuarios do projeto
   * Equivalente a: query projects_users verb=GET do Xano (endpoint 437)
   */
  static async listProjectUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const projectId = req.query.projects_id ? parseInt(req.query.projects_id as string, 10) : undefined;
      const page = parseInt(req.query.page as string, 10) || 1;
      const perPage = parseInt(req.query.per_page as string, 10) || 20;
      const result = await ProjectsService.listProjectUsers(projectId, page, perPage);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /projects/teams_list/all/:projects_id
   * Lista membros da equipe com filtros (endpoint customizado para frontend)
   * Equivalente a: query teams_list_members_all/{projects_id} verb=POST
   */
  /**
   * POST /projects/teams_list/all/:projects_id
   * Lista membros da equipe com filtros (endpoint customizado para frontend)
   * Extra: Mapeia 'users' para 'user' para compatibilidade com Frontend
   */
  static async listTeamMembers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const projectId = parseInt(req.params.projects_id, 10);
      const {
        teams_id: teamId,
        page,
        per_page: perPage,
        search,
        users_roles_id: usersRolesId,
      } = req.body;

      const result = await TeamsService.listMembers(
        teamId,
        page || 1,
        perPage || 20,
        projectId,
        search,
        Array.isArray(usersRolesId) ? usersRolesId : (usersRolesId ? [usersRolesId] : undefined)
      );

      // CORREÇÃO CRÍTICA: Mapear 'users' (do Prisma) para 'user' (esperado pelo Frontend)
      const itemsMapped = result.items.map((item: any) => {
        if (item.users && !item.user) {
          return {
            ...item,
            user: item.users
          };
        }
        return item;
      });

      // Atualiza a lista de itens no resultado
      const resultMapped = {
        ...result,
        items: itemsMapped
      };

      res.status(200).json(serializeBigInt(resultMapped));
    } catch (error) {
      next(error);
    }
  }



  /**
   * GET /projects/users/:projects_users_id
   * Busca associacao por ID
   * Equivalente a: query projects_users/{id} verb=GET do Xano (endpoint 436)
   */
  static async getProjectUserById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const projectUserId = parseInt(req.params.projects_users_id, 10);
      const result = await ProjectsService.getProjectUserById(projectUserId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /projects/users
   * Associa usuario ao projeto
   * Equivalente a: query projects_users verb=POST do Xano (endpoint 438)
   */
  static async createProjectUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ProjectsService.createProjectUser(req.body);
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /projects/users/:projects_users_id
   * Remove associacao usuario-projeto
   * Equivalente a: query projects_users/{id} verb=DELETE do Xano (endpoint 435)
   */
  static async deleteProjectUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const projectUserId = parseInt(req.params.projects_users_id, 10);
      const result = await ProjectsService.deleteProjectUser(projectUserId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // PROJECT BACKLOGS
  // =============================================================================

  /**
   * POST /projects/:projects_id/backlogs/list
   * Lista backlogs do projeto com filtros
   * Equivalente a: query projects_backlogs_list/{projects_id} verb=POST do Xano (endpoint 572)
   */
  static async listBacklogs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const projectId = parseInt(req.params.projects_id, 10);
      const result = await ProjectsService.listBacklogs(projectId, req.body);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /projects/backlogs
   * Lista todos os backlogs
   * Equivalente a: query projects_backlogs verb=GET do Xano (endpoint 573)
   */
  static async listAllBacklogs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const projectId = req.query.projects_id ? parseInt(req.query.projects_id as string, 10) : undefined;
      const result = await ProjectsService.listAllBacklogs(projectId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /projects/backlogs/:projects_backlogs_id
   * Busca backlog por ID
   */
  static async getBacklogById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const backlogId = parseInt(req.params.projects_backlogs_id, 10);
      const result = await ProjectsService.getBacklogById(backlogId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /projects/backlogs
   * Cria backlog
   * Equivalente a: query projects_backlogs verb=POST do Xano (endpoint 574)
   */
  static async createBacklog(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ProjectsService.createBacklog(req.body);

      logger.info({ backlogId: result.id, description: result.description }, 'Backlog created');

      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /projects/backlogs/:projects_backlogs_id
   * Atualiza backlog
   * Equivalente a: query projects_backlogs/{id} verb=PUT do Xano (endpoint 571)
   */
  static async updateBacklog(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const backlogId = parseInt(req.params.projects_backlogs_id, 10);
      const result = await ProjectsService.updateBacklog(backlogId, req.body);

      logger.info({ backlogId }, 'Backlog updated');

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /projects/backlogs/:projects_backlogs_id
   * Remove backlog
   * Equivalente a: query projects_backlogs/{id} verb=PATCH (delete) do Xano (endpoint 575)
   */
  static async deleteBacklog(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const backlogId = parseInt(req.params.projects_backlogs_id, 10);
      const result = await ProjectsService.deleteBacklog(backlogId);

      logger.info({ backlogId }, 'Backlog deleted');

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /projects/backlogs/bulk
   * Cria backlogs em massa
   * Equivalente a: query projects_backlogs_bulk verb=POST do Xano (endpoint 581)
   */
  static async createBulkBacklogs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ProjectsService.createBulkBacklogs(req.body);

      logger.info({ count: result.length }, 'Bulk backlogs created');

      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /projects_backlogs_manual
   * Cria backlogs manualmente (repete task_quantity vezes)
   * Equivalente a: query projects_backlogs_manual verb=POST do Xano (endpoint 641)
   */
  static async createManualBacklog(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ProjectsService.createManualBacklog(req.body);

      logger.info({ description: req.body.description, taskQuantity: req.body.task_quantity }, 'Manual backlogs created');

      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /projects/backlogs/filters
   * Retorna filtros disponiveis
   * Equivalente a: query filters_project_backlog verb=POST do Xano (endpoint 599)
   */
  static async getBacklogFilters(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ProjectsService.getBacklogFilters(req.body);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /projects/backlogs/statuses
   * Lista status de backlogs
   * Equivalente a: query projects_backlogs_statuses verb=GET do Xano (endpoint 578)
   */
  static async listBacklogStatuses(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const perPage = parseInt(req.query.per_page as string, 10) || 20;
      const result = await ProjectsService.listBacklogStatuses(page, perPage);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // SUBTASKS
  // =============================================================================

  /**
   * GET /projects/subtasks
   * Lista subtasks
   * Equivalente a: query subtasks verb=GET do Xano (endpoint 667)
   */
  static async listSubtasks(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const backlogId = req.query.projects_backlogs_id
        ? parseInt(req.query.projects_backlogs_id as string, 10)
        : undefined;
      const page = parseInt(req.query.page as string, 10) || 1;
      const perPage = parseInt(req.query.per_page as string, 10) || 20;
      const result = await ProjectsService.listSubtasks(backlogId, page, perPage);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /projects/subtasks/:subtasks_id
   * Busca subtask por ID
   * Equivalente a: query subtasks/{id} verb=GET do Xano (endpoint 664)
   */
  static async getSubtaskById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const subtaskId = parseInt(req.params.subtasks_id, 10);
      const result = await ProjectsService.getSubtaskById(subtaskId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /projects/subtasks
   * Cria subtask
   * Equivalente a: query subtasks verb=POST do Xano (endpoint 663)
   */
  static async createSubtask(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ProjectsService.createSubtask(req.body);

      logger.info({ subtaskId: result.id, description: result.description }, 'Subtask created');

      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /projects/subtasks/:subtasks_id
   * Atualiza subtask
   * Equivalente a: query subtasks/{id} verb=PUT do Xano (endpoint 666)
   */
  static async updateSubtask(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const subtaskId = parseInt(req.params.subtasks_id, 10);
      const result = await ProjectsService.updateSubtask(subtaskId, req.body);

      logger.info({ subtaskId }, 'Subtask updated');

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /projects/subtasks/:subtasks_id
   * Remove subtask
   * Equivalente a: query subtasks/{id} verb=DELETE do Xano (endpoint 665)
   */
  static async deleteSubtask(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const subtaskId = parseInt(req.params.subtasks_id, 10);
      const result = await ProjectsService.deleteSubtask(subtaskId);

      logger.info({ subtaskId }, 'Subtask deleted');

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default ProjectsController;
