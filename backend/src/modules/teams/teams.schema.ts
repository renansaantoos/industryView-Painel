// =============================================================================
// INDUSTRYVIEW BACKEND - Teams Schemas
// Schemas de validacao para endpoints de equipes
// Equivalente aos input definitions relacionados a teams do Xano
// =============================================================================

import { z } from 'zod';

/**
 * Schema para listagem de equipes
 * Equivalente a: query teams_list_all/{projects_id} verb=POST do Xano (endpoint 537)
 */
export const listTeamsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  per_page: z.number().int().positive().max(100).optional().default(10),
  search: z.string().trim().nullish(),
  teams_id: z.number().int().nullish(),
  projects_id: z.number().int().nullish(),
  users_roles_id: z.array(z.number().int()).nullish(),
});

export type ListTeamsInput = z.infer<typeof listTeamsSchema>;

/**
 * Schema para params de projeto
 */
export const projectIdParamsSchema = z.object({
  projects_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type ProjectIdParams = z.infer<typeof projectIdParamsSchema>;

/**
 * Schema para criacao de equipe
 * Equivalente a: query teams verb=POST do Xano (endpoint 538)
 */
export const createTeamSchema = z.object({
  name: z.string().min(1, 'Nome da equipe e obrigatorio').trim(),
  projects_id: z.number().int(),
  users_on_team: z.array(z.number().int()).optional().default([]),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

/**
 * Schema para params de equipe
 */
export const teamParamsSchema = z.object({
  teams_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type TeamParams = z.infer<typeof teamParamsSchema>;

/**
 * Schema para atualizacao de equipe
 * Equivalente a: query teams/{teams_id} verb=PATCH do Xano (endpoint 539)
 */
export const updateTeamSchema = z.object({
  name: z.string().trim().optional(),
});

export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;

/**
 * Schema para listagem de membros da equipe
 * Equivalente a: query teams_members verb=GET do Xano (endpoint 557)
 */
export const listTeamMembersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  per_page: z.coerce.number().int().positive().max(100).optional().default(20),
  teams_id: z.coerce.number().int().optional(),
  projects_id: z.coerce.number().int().optional(),
});

export type ListTeamMembersQuery = z.infer<typeof listTeamMembersQuerySchema>;

/**
 * Schema para adicao de membro a equipe
 * Equivalente a: query teams_members verb=POST do Xano (endpoint 558)
 */
export const createTeamMemberSchema = z.object({
  users_id: z.number().int(),
  teams_id: z.number().int(),
});

export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>;

/**
 * Schema para params de membro da equipe
 */
export const teamMemberParamsSchema = z.object({
  teams_members_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type TeamMemberParams = z.infer<typeof teamMemberParamsSchema>;

/**
 * Schema para listagem de lideres da equipe
 * Equivalente a: query teams_leaders verb=GET do Xano (endpoint 552)
 */
export const listTeamLeadersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  per_page: z.coerce.number().int().positive().max(100).optional().default(20),
  teams_id: z.coerce.number().int().optional(),
  projects_id: z.coerce.number().int().optional(),
});

export type ListTeamLeadersQuery = z.infer<typeof listTeamLeadersQuerySchema>;

/**
 * Schema para adicao de lider a equipe
 * Equivalente a: query teams_leaders verb=POST do Xano (endpoint 553)
 */
export const createTeamLeaderSchema = z.object({
  users_id: z.number().int(),
  teams_id: z.number().int(),
});

export type CreateTeamLeaderInput = z.infer<typeof createTeamLeaderSchema>;

/**
 * Schema para params de lider da equipe
 */
export const teamLeaderParamsSchema = z.object({
  teams_leaders_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type TeamLeaderParams = z.infer<typeof teamLeaderParamsSchema>;

/**
 * Schema para edicao de membros da equipe
 * Equivalente a: query edit_teams_member verb=PUT do Xano (endpoint 584)
 */
export const editTeamMembersSchema = z.object({
  teams_id: z.number().int(),
  users_ids: z.array(z.number().int()),
});

export type EditTeamMembersInput = z.infer<typeof editTeamMembersSchema>;

/**
 * Schema para edicao de lideres da equipe
 * Equivalente a: query edit_teams_leaders verb=PUT do Xano (endpoint 585)
 */
export const editTeamLeadersSchema = z.object({
  teams_id: z.number().int(),
  users_ids: z.array(z.number().int()),
});

export type EditTeamLeadersInput = z.infer<typeof editTeamLeadersSchema>;

/**
 * Schema para listagem geral de equipes
 * Equivalente a: query teams verb=GET do Xano (endpoint 583)
 */
export const listAllTeamsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  per_page: z.coerce.number().int().positive().max(100).optional().default(20),
  projects_id: z.coerce.number().int().optional(),
});

export type ListAllTeamsQuery = z.infer<typeof listAllTeamsQuerySchema>;

// =============================================================================
// TEAMS PROJECTS (N:M junction + history)
// =============================================================================

/**
 * Schema para vincular equipe a projeto
 */
export const linkTeamProjectSchema = z.object({
  teams_id: z.number().int(),
  projects_id: z.number().int(),
});

export type LinkTeamProjectInput = z.infer<typeof linkTeamProjectSchema>;

/**
 * Schema para desvincular equipe de projeto
 */
export const unlinkTeamProjectSchema = z.object({
  teams_id: z.number().int(),
  projects_id: z.number().int(),
});

export type UnlinkTeamProjectInput = z.infer<typeof unlinkTeamProjectSchema>;

/**
 * Schema para query de historico de equipe-projeto
 */
export const teamProjectHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  per_page: z.coerce.number().int().positive().max(100).optional().default(20),
  teams_id: z.coerce.number().int().optional(),
  projects_id: z.coerce.number().int().optional(),
});

export type TeamProjectHistoryQuery = z.infer<typeof teamProjectHistoryQuerySchema>;

/**
 * Schema para params de conflito de equipe
 */
export const checkTeamConflictsParamsSchema = z.object({
  teams_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type CheckTeamConflictsParams = z.infer<typeof checkTeamConflictsParamsSchema>;

/**
 * Schema para query de projetos vinculados a uma equipe
 */
export const listTeamProjectsQuerySchema = z.object({
  teams_id: z.coerce.number().int().optional(),
  projects_id: z.coerce.number().int().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  per_page: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type ListTeamProjectsQuery = z.infer<typeof listTeamProjectsQuerySchema>;

// =============================================================================
// TEAMS MEMBERS HISTORY
// =============================================================================

/**
 * Schema para query de historico de membros da equipe
 */
export const teamMembersHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  per_page: z.coerce.number().int().positive().max(100).optional().default(20),
  teams_id: z.coerce.number().int().optional(),
  users_id: z.coerce.number().int().optional(),
  member_type: z.enum(['member', 'leader']).optional(),
});

export type TeamMembersHistoryQuery = z.infer<typeof teamMembersHistoryQuerySchema>;
