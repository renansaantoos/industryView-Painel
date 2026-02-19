// =============================================================================
// INDUSTRYVIEW BACKEND - Teams Controller
// Controller de equipes
// Equivalente aos endpoints relacionados a teams do Xano
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { TeamsService } from './teams.service';
import { logger } from '../../utils/logger';
import { serializeBigInt } from '../../utils/bigint';
import { AuthenticatedRequest } from '../../types';

/**
 * TeamsController - Controller do modulo de equipes
 */
export class TeamsController {
  // =============================================================================
  // TEAMS
  // =============================================================================

  /**
   * POST /teams/:projects_id/list
   * Lista equipes do projeto
   * Equivalente a: query teams_list_all/{projects_id} verb=POST do Xano (endpoint 537)
   */
  static async listByProject(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const projectId = parseInt(req.params.projects_id, 10);
      const companyId = req.user?.companyId ?? undefined;
      const result = await TeamsService.listByProject(projectId, req.body, companyId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /teams
   * Lista todas as equipes
   * Equivalente a: query teams verb=GET do Xano (endpoint 583)
   */
  static async listAll(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const projectId = req.query.projects_id ? parseInt(req.query.projects_id as string, 10) : undefined;
      const page = parseInt(req.query.page as string, 10) || 1;
      const perPage = parseInt(req.query.per_page as string, 10) || 20;
      // company_id SEMPRE vem do usuario autenticado
      const companyId = req.user?.companyId ?? undefined;
      const result = await TeamsService.listAll(projectId, page, perPage, companyId);
      res.status(200).json(serializeBigInt(result.items));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /teams/:teams_id
   * Busca equipe por ID
   * Equivalente a: query teams/{teams_id} verb=GET do Xano (endpoint 536)
   */
  static async getById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const teamId = parseInt(req.params.teams_id, 10);
      const companyId = req.user?.companyId ?? undefined;
      const result = await TeamsService.getById(teamId, companyId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /teams
   * Cria equipe
   * Equivalente a: query teams verb=POST do Xano (endpoint 538)
   */
  static async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user?.companyId ?? undefined;
      const body = { ...req.body };
      if (companyId) {
        body.company_id = companyId;
      }
      const result = await TeamsService.create(body);

      logger.info({ teamId: result.id, name: result.name }, 'Team created');

      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /teams/:teams_id
   * Atualiza equipe
   * Equivalente a: query teams/{teams_id} verb=PATCH do Xano (endpoint 539)
   */
  static async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const teamId = parseInt(req.params.teams_id, 10);
      const result = await TeamsService.update(teamId, req.body);

      logger.info({ teamId }, 'Team updated');

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /teams/:teams_id
   * Remove equipe
   * Equivalente a: query teams/{teams_id} verb=DELETE do Xano (endpoint 535)
   */
  static async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const teamId = parseInt(req.params.teams_id, 10);
      const result = await TeamsService.delete(teamId);

      logger.info({ teamId }, 'Team deleted');

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // TEAM MEMBERS
  // =============================================================================

  /**
   * GET /teams/members
   * Lista membros da equipe
   * Equivalente a: query teams_members verb=GET do Xano (endpoint 557)
   */
  static async listMembers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const teamId = req.query.teams_id ? parseInt(req.query.teams_id as string, 10) : undefined;
      const projectId = req.query.projects_id ? parseInt(req.query.projects_id as string, 10) : undefined;
      const page = parseInt(req.query.page as string, 10) || 1;
      const perPage = parseInt(req.query.per_page as string, 10) || 20;
      const result = await TeamsService.listMembers(teamId, page, perPage, projectId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /teams/members/:teams_members_id
   * Busca membro por ID
   * Equivalente a: query teams_members/{teams_members_id} verb=GET do Xano (endpoint 556)
   */
  static async getMemberById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const memberId = parseInt(req.params.teams_members_id, 10);
      const result = await TeamsService.getMemberById(memberId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /teams/members
   * Adiciona membro a equipe
   * Equivalente a: query teams_members verb=POST do Xano (endpoint 558)
   */
  static async createMember(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = (req as any).user || {};
      const performedBy = {
        id: user.id ? Number(user.id) : undefined,
        name: user.name || undefined,
        email: user.email || undefined,
      };
      const result = await TeamsService.createMember(req.body, performedBy);

      logger.info({ memberId: result.id }, 'Team member added');

      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /teams/members/bulk
   * Adiciona multiplos membros a equipe em uma unica chamada
   */
  static async bulkCreateMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user || {};
      const performedBy = {
        id: user.id ? Number(user.id) : undefined,
        name: user.name || undefined,
        email: user.email || undefined,
      };
      const result = await TeamsService.bulkCreateMembers(req.body, performedBy);
      logger.info({ teamsId: req.body.teams_id, added: result.added, skipped: result.skipped }, 'Bulk team members added');
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /teams/members/:teams_members_id
   * Remove membro da equipe
   * Equivalente a: query teams_members/{teams_members_id} verb=DELETE do Xano (endpoint 555)
   */
  static async deleteMember(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const memberId = parseInt(req.params.teams_members_id, 10);
      const user = (req as any).user || {};
      const performedBy = {
        id: user.id ? Number(user.id) : undefined,
        name: user.name || undefined,
        email: user.email || undefined,
      };
      const result = await TeamsService.deleteMember(memberId, performedBy);

      logger.info({ memberId }, 'Team member removed');

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /teams/members/edit
   * Edita membros da equipe
   * Equivalente a: query edit_teams_member verb=PUT do Xano (endpoint 584)
   */
  static async editMembers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = (req as any).user || {};
      const performedBy = {
        id: user.id ? Number(user.id) : undefined,
        name: user.name || undefined,
        email: user.email || undefined,
      };
      const result = await TeamsService.editMembers(req.body, performedBy);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // TEAM LEADERS
  // =============================================================================

  /**
   * GET /teams/leaders
   * Lista lideres da equipe
   * Equivalente a: query teams_leaders verb=GET do Xano (endpoint 552)
   */
  static async listLeaders(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const teamId = req.query.teams_id ? parseInt(req.query.teams_id as string, 10) : undefined;
      const projectId = req.query.projects_id ? parseInt(req.query.projects_id as string, 10) : undefined;
      const page = parseInt(req.query.page as string, 10) || 1;
      const perPage = parseInt(req.query.per_page as string, 10) || 20;
      const result = await TeamsService.listLeaders(teamId, page, perPage, projectId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /teams/leaders/:teams_leaders_id
   * Busca lider por ID
   * Equivalente a: query teams_leaders/{teams_leaders_id} verb=GET do Xano (endpoint 551)
   */
  static async getLeaderById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const leaderId = parseInt(req.params.teams_leaders_id, 10);
      const result = await TeamsService.getLeaderById(leaderId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /teams/leaders
   * Adiciona lider a equipe
   * Equivalente a: query teams_leaders verb=POST do Xano (endpoint 553)
   */
  static async createLeader(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = (req as any).user || {};
      const performedBy = {
        id: user.id ? Number(user.id) : undefined,
        name: user.name || undefined,
        email: user.email || undefined,
      };
      const result = await TeamsService.createLeader(req.body, performedBy);

      logger.info({ leaderId: result.id }, 'Team leader added');

      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /teams/leaders/bulk
   * Adiciona multiplos lideres a equipe em uma unica chamada
   */
  static async bulkCreateLeaders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user || {};
      const performedBy = {
        id: user.id ? Number(user.id) : undefined,
        name: user.name || undefined,
        email: user.email || undefined,
      };
      const result = await TeamsService.bulkCreateLeaders(req.body, performedBy);
      logger.info({ teamsId: req.body.teams_id, added: result.added, skipped: result.skipped }, 'Bulk team leaders added');
      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /teams/leaders/:teams_leaders_id
   * Remove lider da equipe
   * Equivalente a: query teams_leaders/{teams_leaders_id} verb=DELETE do Xano (endpoint 550)
   */
  static async deleteLeader(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const leaderId = parseInt(req.params.teams_leaders_id, 10);
      const user = (req as any).user || {};
      const performedBy = {
        id: user.id ? Number(user.id) : undefined,
        name: user.name || undefined,
        email: user.email || undefined,
      };
      const result = await TeamsService.deleteLeader(leaderId, performedBy);

      logger.info({ leaderId }, 'Team leader removed');

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /teams/leaders/edit
   * Edita lideres da equipe
   * Equivalente a: query edit_teams_leaders verb=PUT do Xano (endpoint 585)
   */
  static async editLeaders(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = (req as any).user || {};
      const performedBy = {
        id: user.id ? Number(user.id) : undefined,
        name: user.name || undefined,
        email: user.email || undefined,
      };
      const result = await TeamsService.editLeaders(req.body, performedBy);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /teams/leaders/all/:teams_id
   * Lista todos os lideres de uma equipe
   * Equivalente a: query teams_leaders_all/{teams_id} verb=GET do Xano (endpoint 570)
   */
  static async listAllLeadersByTeam(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const teamId = parseInt(req.params.teams_id, 10);
      const result = await TeamsService.listAllLeadersByTeam(teamId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }
  // =============================================================================
  // TEAMS MEMBERS HISTORY
  // =============================================================================

  /**
   * GET /teams/members/history
   * Lista historico de membros/lideres da equipe
   */
  static async listMembersHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await TeamsService.listMembersHistory(req.query as any);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // TEAMS PROJECTS (N:M junction + history)
  // =============================================================================

  /**
   * GET /teams/projects
   * Lista projetos vinculados a equipe(s)
   */
  static async listTeamProjects(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await TeamsService.listTeamProjects(req.query as any);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /teams/projects/conflicts/:teams_id
   * Checa conflitos de equipe
   */
  static async checkTeamConflicts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const teamId = parseInt(req.params.teams_id, 10);
      const result = await TeamsService.checkTeamConflicts(teamId);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /teams/projects/link
   * Vincula equipe a projeto
   */
  static async linkTeamToProject(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = (req as any).user || {};
      const performedBy = {
        id: user.id ? Number(user.id) : undefined,
        name: user.name || undefined,
        email: user.email || undefined,
      };
      const result = await TeamsService.linkTeamToProject(req.body, performedBy);

      logger.info({ teamsId: req.body.teams_id, projectsId: req.body.projects_id }, 'Team linked to project');

      res.status(201).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /teams/projects/unlink
   * Desvincula equipe de projeto
   */
  static async unlinkTeamFromProject(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = (req as any).user || {};
      const performedBy = {
        id: user.id ? Number(user.id) : undefined,
        name: user.name || undefined,
        email: user.email || undefined,
      };
      const result = await TeamsService.unlinkTeamFromProject(req.body, performedBy);

      logger.info({ teamsId: req.body.teams_id, projectsId: req.body.projects_id }, 'Team unlinked from project');

      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /teams/projects/history
   * Lista historico de vinculos
   */
  static async listTeamProjectHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await TeamsService.listTeamProjectHistory(req.query as any);
      res.status(200).json(serializeBigInt(result));
    } catch (error) {
      next(error);
    }
  }
}

export default TeamsController;
