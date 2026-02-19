// =============================================================================
// INDUSTRYVIEW BACKEND - Users Routes
// Rotas do modulo de usuarios
// Equivalente aos endpoints do api_group User do Xano
// =============================================================================

import { Router } from 'express';
import multer from 'multer';
import { UsersController } from './users.controller';
import { authenticate } from '../../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../../middleware/validation';
import {
  listUsersSchema,
  createUserSchema,
  getUserParamsSchema,
  updateUserSchema,
  changePasswordSchema,
  listRolesQuerySchema,
  listUsersForTeamsSchema,
  searchUsersForTeamSchema,
} from './users.schema';

const router = Router();
const upload = multer();

/**
 * @swagger
 * /api/users/list:
 *   post:
 *     summary: Lista usuarios com paginacao e filtros
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 default: 1
 *               per_page:
 *                 type: integer
 *                 default: 20
 *               search:
 *                 type: string
 *               users_roles_id:
 *                 type: array
 *                 items:
 *                   type: integer
 *               company_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.post(
  '/list',
  authenticate,
  validateBody(listUsersSchema),
  UsersController.list
);

/**
 * @swagger
 * /api/users/users_0:
 *   post:
 *     summary: Lista usuarios disponiveis para atribuicao a equipes
 *     description: |
 *       Lista usuarios elegiveis para serem adicionados a equipes.
 *       - Se teams_id fornecido (editando equipe): inclui membros do time + usuarios livres
 *       - Se teams_id ausente (criando equipe): inclui apenas usuarios sem projeto/equipe com a role correta
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 default: 1
 *               per_page:
 *                 type: integer
 *                 default: 20
 *               users_roles_id:
 *                 type: array
 *                 items:
 *                   type: integer
 *               search:
 *                 type: string
 *               teams_id:
 *                 type: integer
 *               company_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Lista de usuarios disponiveis para equipes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                 itemsReceived:
 *                   type: integer
 *                 itemsTotal:
 *                   type: integer
 *                 nextPage:
 *                   type: integer
 *                   nullable: true
 */
router.post(
  '/users_0',
  authenticate,
  validateBody(listUsersForTeamsSchema),
  UsersController.listForTeams
);

/**
 * @swagger
 * /api/users/roles:
 *   get:
 *     summary: Lista todos os roles
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de roles
 */
router.get(
  '/roles',
  authenticate,
  validateQuery(listRolesQuerySchema),
  UsersController.listRoles
);

/**
 * @swagger
 * /api/users/system-access:
 *   get:
 *     summary: Lista todos os system access
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de system access
 */
router.get(
  '/system-access',
  authenticate,
  UsersController.listSystemAccess
);

/**
 * @swagger
 * /api/users/control-system:
 *   get:
 *     summary: Lista todos os control system
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de control system
 */
router.get(
  '/control-system',
  authenticate,
  UsersController.listControlSystem
);

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     summary: Altera senha do usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *               - new_password
 *               - confirm_password
 *             properties:
 *               current_password:
 *                 type: string
 *               new_password:
 *                 type: string
 *               confirm_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 */
router.put(
  '/change-password',
  authenticate,
  validateBody(changePasswordSchema),
  UsersController.changePassword
);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Cria um novo usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - users_roles_id
 *               - users_control_system_id
 *               - users_system_access_id
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               users_roles_id:
 *                 type: integer
 *               users_control_system_id:
 *                 type: integer
 *               users_system_access_id:
 *                 type: integer
 *               projects_id:
 *                 type: integer
 *               company_id:
 *                 type: integer
 *               teams_id:
 *                 type: integer
 *               is_leader:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Usuario criado com sucesso
 */
router.post(
  '/',
  authenticate,
  upload.none(),
  validateBody(createUserSchema),
  UsersController.create
);

/**
 * @swagger
 * /api/users/search-for-team:
 *   get:
 *     summary: Busca paginada de usuarios para adicionar como membros/lideres de times
 *     description: |
 *       Retorna usuarios da empresa do usuario autenticado, paginados e com suporte a busca.
 *       Ordena priorizando usuarios SEM atribuicao de time ativo (hasTeam: false vem primeiro),
 *       depois usuarios que ja estao em times (hasTeam: true).
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Busca por nome ou email
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           default: 15
 *           maximum: 50
 *     responses:
 *       200:
 *         description: Lista paginada de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       hasTeam:
 *                         type: boolean
 *                         description: true se o usuario ja pertence a algum time ativo
 *                 curPage:
 *                   type: integer
 *                 perPage:
 *                   type: integer
 *                 itemsReceived:
 *                   type: integer
 *                 itemsTotal:
 *                   type: integer
 *                 pageTotal:
 *                   type: integer
 *       403:
 *         description: Usuario nao associado a uma empresa
 */
router.get(
  '/search-for-team',
  authenticate,
  validateQuery(searchUsersForTeamSchema),
  UsersController.searchForTeam
);

/**
 * @swagger
 * /api/users/query_all_users:
 *   get:
 *     summary: Lista todos os usuarios para dropdown (id, name, email)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios para dropdown
 */
router.get('/query_all_users', authenticate, UsersController.queryAll);

/**
 * @swagger
 * /api/users/{users_id}:
 *   get:
 *     summary: Busca usuario por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: users_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados do usuario
 *       404:
 *         description: Usuario nao encontrado
 */
router.get(
  '/:users_id',
  authenticate,
  validateParams(getUserParamsSchema),
  UsersController.getById
);

/**
 * @swagger
 * /api/users/{users_id}:
 *   patch:
 *     summary: Atualiza usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: users_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               users_roles_id:
 *                 type: integer
 *               users_control_system_id:
 *                 type: integer
 *               users_system_access_id:
 *                 type: integer
 *               company_id:
 *                 type: integer
 *               first_login:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuario atualizado com sucesso
 *       404:
 *         description: Usuario nao encontrado
 */
router.patch(
  '/:users_id',
  authenticate,
  upload.none(),
  validateParams(getUserParamsSchema),
  validateBody(updateUserSchema),
  UsersController.update
);

/**
 * @swagger
 * /api/users/{users_id}:
 *   delete:
 *     summary: Remove usuario (soft delete)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: users_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario removido com sucesso
 *       404:
 *         description: Usuario nao encontrado
 */
router.delete(
  '/:users_id',
  authenticate,
  validateParams(getUserParamsSchema),
  UsersController.delete
);

// =============================================================================
// COMPANY ROUTES
// =============================================================================

/**
 * @swagger
 * /api/users/company:
 *   post:
 *     summary: Cria uma nova empresa
 *     tags: [Company]
 */
router.post('/company', authenticate, UsersController.createCompany);

/**
 * @swagger
 * /api/users/company/{company_id}:
 *   get:
 *     summary: Busca empresa por ID
 *     tags: [Company]
 */
router.get('/company/:company_id', authenticate, UsersController.getCompany);

/**
 * @swagger
 * /api/users/company/{company_id}:
 *   patch:
 *     summary: Atualiza empresa
 *     tags: [Company]
 */
router.patch('/company/:company_id', authenticate, UsersController.updateCompany);

export default router;
