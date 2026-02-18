// =============================================================================
// INDUSTRYVIEW BACKEND - Auth Routes
// Rotas do modulo de autenticacao
// Equivalente ao api_group Authentication do Xano
// =============================================================================

import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateBody } from '../../middleware/validation';
import { authenticate } from '../../middleware/auth';
import { authRateLimiter } from '../../middleware/rateLimit';
import { signupSchema, loginSchema, dailyLoginSchema } from './auth.schema';

const router = Router();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Registra um novo usuario
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password_hash
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               password_hash:
 *                 type: string
 *                 minLength: 8
 *               env_from_create:
 *                 type: integer
 *                 default: 1
 *               user_system_access:
 *                 type: integer
 *                 default: 3
 *               user_control_system:
 *                 type: integer
 *                 default: 2
 *               user_role_type:
 *                 type: integer
 *                 default: 5
 *     responses:
 *       201:
 *         description: Usuario registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authToken:
 *                   type: string
 *       400:
 *         description: Usuario ja cadastrado ou dados invalidos
 */
router.post(
  '/signup',
  authRateLimiter,
  validateBody(signupSchema),
  AuthController.signup
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza login do usuario
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password_hash
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password_hash:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authToken:
 *                   type: string
 *       401:
 *         description: Credenciais invalidas
 */
router.post(
  '/login',
  authRateLimiter,
  validateBody(loginSchema),
  AuthController.login
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Busca dados do usuario autenticado
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuario
 *       401:
 *         description: Nao autenticado
 *       404:
 *         description: Usuario nao encontrado
 */
router.get(
  '/me',
  authenticate,
  AuthController.me
);

/**
 * @swagger
 * /auth/daily-login:
 *   post:
 *     summary: Login diario (app mobile)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 */
router.post(
  '/daily-login',
  authRateLimiter,
  validateBody(dailyLoginSchema),
  AuthController.dailyLogin
);

/**
 * @swagger
 * /auth/me/app:
 *   get:
 *     summary: Busca dados do usuario para app mobile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuario para app
 */
router.get(
  '/me/app',
  authenticate,
  AuthController.meApp
);

// =============================================================================
// PASSWORD RECOVERY ROUTES (SendGrid)
// =============================================================================

/**
 * POST /auth/sendgrid/send/code
 * Envia codigo de recuperacao de senha
 */
router.post(
  '/sendgrid/send/code',
  authRateLimiter,
  AuthController.sendRecoveryCode
);

/**
 * POST /auth/sendgrid/validate/code
 * Valida codigo de recuperacao
 */
router.post(
  '/sendgrid/validate/code',
  authRateLimiter,
  AuthController.validateRecoveryCode
);

/**
 * PATCH /auth/sendgrid/reset/pass
 * Reset de senha
 */
router.patch(
  '/sendgrid/reset/pass',
  authRateLimiter,
  AuthController.resetPassword
);

/**
 * POST /auth/sendgrid/validate
 * Valida servico SendGrid
 */
router.post(
  '/sendgrid/validate',
  authRateLimiter,
  AuthController.validateSendgrid
);

export default router;
