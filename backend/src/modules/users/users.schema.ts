// =============================================================================
// INDUSTRYVIEW BACKEND - Users Schemas
// Schemas de validacao para endpoints de usuarios
// Equivalente aos input definitions do api_group User do Xano
// =============================================================================

import { z } from 'zod';

/**
 * Schema para listagem de usuarios
 * Equivalente a: query users_list verb=POST do Xano (endpoint 406)
 */
export const listUsersSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  per_page: z.number().int().positive().max(100).optional().default(20),
  search: z.string().trim().optional(),
  users_roles_id: z.array(z.number().int()).optional(),
  company_id: z.number().int().optional(),
  sort_field: z.string().optional(),
  sort_direction: z.enum(['asc', 'desc']).optional(),
});

export type ListUsersInput = z.infer<typeof listUsersSchema>;

/**
 * Schema para criacao de usuario
 * Equivalente a: query users verb=POST do Xano (endpoint 408)
 */
// Helper para aceitar string ou number e converter para number
const stringOrNumber = z.union([z.string(), z.number()]).transform((val) => {
  if (typeof val === 'string') {
    const num = parseInt(val, 10);
    return isNaN(num) ? 0 : num;
  }
  return val;
});

// Helper para boolean que aceita string 'true'/'false'
const stringOrBoolean = z.union([z.string(), z.boolean()]).transform((val) => {
  if (typeof val === 'string') {
    return val === 'true';
  }
  return val;
});

export const createUserSchema = z.object({
  name: z.string().min(1, 'Nome e obrigatorio').trim(),
  phone: z.string().trim().optional(),
  email: z.string().email('Email invalido').trim().toLowerCase(),
  users_roles_id: stringOrNumber.optional().default(1),
  users_control_system_id: stringOrNumber.optional().default(1),
  users_system_access_id: stringOrNumber.optional().default(1),
  // Senha é opcional - se não fornecida, será gerada automaticamente
  password: z.string().optional(),
  projects_id: stringOrNumber.optional(),
  company_id: stringOrNumber.optional(),
  teams_id: stringOrNumber.optional(),
  is_leader: stringOrBoolean.optional().default(false),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

/**
 * Schema para busca de usuario por ID
 * Equivalente a: query users/{users_id} verb=GET do Xano (endpoint 407)
 */
export const getUserParamsSchema = z.object({
  users_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type GetUserParams = z.infer<typeof getUserParamsSchema>;

/**
 * Schema para atualizacao de usuario
 * Equivalente a: query users/{users_id} verb=PATCH do Xano (endpoint 409)
 */
export const updateUserSchema = z.object({
  name: z.string().trim().optional(),
  phone: z.string().trim().optional().nullable(),
  email: z.string().email('Email invalido').trim().toLowerCase().optional(),
  users_roles_id: stringOrNumber.optional(),
  users_control_system_id: stringOrNumber.optional(),
  users_system_access_id: stringOrNumber.optional(),
  company_id: stringOrNumber.optional().nullable(),
  first_login: stringOrBoolean.optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/**
 * Schema para alteracao de senha
 * Equivalente a: query change_password verb=PUT do Xano (endpoint 589)
 */
export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Senha atual e obrigatoria'),
  new_password: z
    .string()
    .min(8, 'Nova senha deve ter no minimo 8 caracteres')
    .regex(/[A-Z]/, 'Nova senha deve conter pelo menos uma letra maiuscula')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Nova senha deve conter pelo menos um simbolo'),
  confirm_password: z.string(),
}).refine(data => data.new_password === data.confirm_password, {
  message: 'Senhas nao conferem',
  path: ['confirm_password'],
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Schema para listagem de roles
 * Equivalente a: query users_roles verb=GET do Xano (endpoint 447)
 */
export const listRolesQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default('1'),
  per_page: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional().default('20'),
});

export type ListRolesQuery = z.infer<typeof listRolesQuerySchema>;

/**
 * Schema para criacao de role
 * Equivalente a: query users_roles verb=POST do Xano (endpoint 448)
 */
export const createRoleSchema = z.object({
  role: z.string().min(1, 'Nome do role e obrigatorio').trim(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;

/**
 * Schema para importacao de usuarios
 * Equivalente a: query import_user verb=POST do Xano (endpoint 639)
 */
export const importUsersSchema = z.object({
  users: z.array(z.object({
    name: z.string().min(1).trim(),
    email: z.string().email().trim().toLowerCase(),
    phone: z.string().trim().optional(),
    users_roles_id: z.number().int(),
    users_control_system_id: z.number().int(),
    users_system_access_id: z.number().int(),
  })),
  company_id: z.number().int().optional(),
  projects_id: z.number().int().optional(),
});

export type ImportUsersInput = z.infer<typeof importUsersSchema>;

/**
 * Schema para listagem de usuarios disponiveis para atribuicao a equipes
 * Equivalente a: endpoint 586 do Xano (users_0)
 */
export const listUsersForTeamsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  per_page: z.number().int().positive().max(100).optional().default(20),
  users_roles_id: z.array(z.number().int()).optional().default([]),
  search: z.string().trim().optional(),
  teams_id: z.number().int().optional().nullable(),
  company_id: z.number().int().optional(),
});

export type ListUsersForTeamsInput = z.infer<typeof listUsersForTeamsSchema>;

/**
 * Schema para busca paginada de usuarios para adicionar como membros/lideres de times
 * Retorna usuarios da mesma empresa, priorizando quem nao tem time ativo
 */
export const searchUsersForTeamSchema = z.object({
  search: z.string().trim().optional().default(''),
  teams_id: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().int().positive().optional()
  ),
  page: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? 1 : Number(val)),
    z.number().int().positive().default(1)
  ),
  per_page: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? 15 : Number(val)),
    z.number().int().positive().max(50).default(15)
  ),
});

export type SearchUsersForTeamInput = z.infer<typeof searchUsersForTeamSchema>;
