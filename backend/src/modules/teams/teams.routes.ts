// =============================================================================
// INDUSTRYVIEW BACKEND - Teams Routes
// Rotas do modulo de equipes
// Equivalente aos endpoints relacionados a teams do Xano
// =============================================================================

import { Router } from 'express';
import { TeamsController } from './teams.controller';
import { authenticate } from '../../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../../middleware/validation';
import {
  listTeamsSchema,
  projectIdParamsSchema,
  createTeamSchema,
  teamParamsSchema,
  updateTeamSchema,
  listTeamMembersQuerySchema,
  createTeamMemberSchema,
  teamMemberParamsSchema,
  listTeamLeadersQuerySchema,
  createTeamLeaderSchema,
  teamLeaderParamsSchema,
  editTeamMembersSchema,
  editTeamLeadersSchema,
  listAllTeamsQuerySchema,
  linkTeamProjectSchema,
  unlinkTeamProjectSchema,
  teamProjectHistoryQuerySchema,
  checkTeamConflictsParamsSchema,
  listTeamProjectsQuerySchema,
  teamMembersHistoryQuerySchema,
} from './teams.schema';

const router = Router();

// =============================================================================
// TEAMS PROJECTS - Rotas devem vir antes das rotas com :teams_id
// =============================================================================

/**
 * @swagger
 * /api/teams/projects:
 *   get:
 *     summary: Lista projetos vinculados a equipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/projects',
  authenticate,
  validateQuery(listTeamProjectsQuerySchema),
  TeamsController.listTeamProjects
);

/**
 * @swagger
 * /api/teams/projects/conflicts/{teams_id}:
 *   get:
 *     summary: Checa conflitos de equipe com outros projetos
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/projects/conflicts/:teams_id',
  authenticate,
  validateParams(checkTeamConflictsParamsSchema),
  TeamsController.checkTeamConflicts
);

/**
 * @swagger
 * /api/teams/projects/link:
 *   post:
 *     summary: Vincula equipe a projeto
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/projects/link',
  authenticate,
  validateBody(linkTeamProjectSchema),
  TeamsController.linkTeamToProject
);

/**
 * @swagger
 * /api/teams/projects/unlink:
 *   post:
 *     summary: Desvincula equipe de projeto
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/projects/unlink',
  authenticate,
  validateBody(unlinkTeamProjectSchema),
  TeamsController.unlinkTeamFromProject
);

/**
 * @swagger
 * /api/teams/projects/history:
 *   get:
 *     summary: Lista historico de vinculos equipe-projeto
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/projects/history',
  authenticate,
  validateQuery(teamProjectHistoryQuerySchema),
  TeamsController.listTeamProjectHistory
);

// =============================================================================
// TEAM MEMBERS - Rotas devem vir antes das rotas com :teams_id
// =============================================================================

/**
 * @swagger
 * /api/teams/members:
 *   get:
 *     summary: Lista membros da equipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/members',
  authenticate,
  validateQuery(listTeamMembersQuerySchema),
  TeamsController.listMembers
);

/**
 * @swagger
 * /api/teams/members:
 *   post:
 *     summary: Adiciona membro a equipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/members',
  authenticate,
  validateBody(createTeamMemberSchema),
  TeamsController.createMember
);

/**
 * @swagger
 * /api/teams/members/history:
 *   get:
 *     summary: Lista historico de membros/lideres da equipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/members/history',
  authenticate,
  validateQuery(teamMembersHistoryQuerySchema),
  TeamsController.listMembersHistory
);

/**
 * @swagger
 * /api/teams/members/edit:
 *   put:
 *     summary: Edita membros da equipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/members/edit',
  authenticate,
  validateBody(editTeamMembersSchema),
  TeamsController.editMembers
);

/**
 * @swagger
 * /api/teams/members/{teams_members_id}:
 *   get:
 *     summary: Busca membro por ID
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/members/:teams_members_id',
  authenticate,
  validateParams(teamMemberParamsSchema),
  TeamsController.getMemberById
);

/**
 * @swagger
 * /api/teams/members/{teams_members_id}:
 *   delete:
 *     summary: Remove membro da equipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/members/:teams_members_id',
  authenticate,
  validateParams(teamMemberParamsSchema),
  TeamsController.deleteMember
);

// =============================================================================
// TEAM LEADERS
// =============================================================================

/**
 * @swagger
 * /api/teams/leaders:
 *   get:
 *     summary: Lista lideres da equipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/leaders',
  authenticate,
  validateQuery(listTeamLeadersQuerySchema),
  TeamsController.listLeaders
);

/**
 * @swagger
 * /api/teams/leaders:
 *   post:
 *     summary: Adiciona lider a equipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/leaders',
  authenticate,
  validateBody(createTeamLeaderSchema),
  TeamsController.createLeader
);

/**
 * @swagger
 * /api/teams/leaders/edit:
 *   put:
 *     summary: Edita lideres da equipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/leaders/edit',
  authenticate,
  validateBody(editTeamLeadersSchema),
  TeamsController.editLeaders
);

/**
 * @swagger
 * /api/teams/leaders/all/{teams_id}:
 *   get:
 *     summary: Lista todos os lideres de uma equipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/leaders/all/:teams_id',
  authenticate,
  validateParams(teamParamsSchema),
  TeamsController.listAllLeadersByTeam
);

/**
 * @swagger
 * /api/teams/leaders/{teams_leaders_id}:
 *   get:
 *     summary: Busca lider por ID
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/leaders/:teams_leaders_id',
  authenticate,
  validateParams(teamLeaderParamsSchema),
  TeamsController.getLeaderById
);

/**
 * @swagger
 * /api/teams/leaders/{teams_leaders_id}:
 *   delete:
 *     summary: Remove lider da equipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/leaders/:teams_leaders_id',
  authenticate,
  validateParams(teamLeaderParamsSchema),
  TeamsController.deleteLeader
);

// =============================================================================
// TEAMS - Rotas principais
// =============================================================================

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Lista todas as equipes
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  authenticate,
  validateQuery(listAllTeamsQuerySchema),
  TeamsController.listAll
);

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Cria equipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  authenticate,
  validateBody(createTeamSchema),
  TeamsController.create
);

/**
 * @swagger
 * /api/teams/{projects_id}/list:
 *   post:
 *     summary: Lista equipes do projeto
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:projects_id/list',
  authenticate,
  validateParams(projectIdParamsSchema),
  validateBody(listTeamsSchema),
  TeamsController.listByProject
);

/**
 * @swagger
 * /api/teams/{teams_id}:
 *   get:
 *     summary: Busca equipe por ID
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:teams_id',
  authenticate,
  validateParams(teamParamsSchema),
  TeamsController.getById
);

/**
 * @swagger
 * /api/teams/{teams_id}:
 *   patch:
 *     summary: Atualiza equipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:teams_id',
  authenticate,
  validateParams(teamParamsSchema),
  validateBody(updateTeamSchema),
  TeamsController.update
);

/**
 * @swagger
 * /api/teams/{teams_id}:
 *   delete:
 *     summary: Remove equipe
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:teams_id',
  authenticate,
  validateParams(teamParamsSchema),
  TeamsController.delete
);

export default router;
