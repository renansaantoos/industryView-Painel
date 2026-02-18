// =============================================================================
// INDUSTRYVIEW BACKEND - Stripe Routes
// Rotas do modulo de integracao com Stripe
// Equivalente aos endpoints do api_group stripe_checkout do Xano
// =============================================================================

import { Router } from 'express';
import { StripeController } from './stripe.controller';
import { validateBody, validateParams, validateQuery } from '../../middleware/validation';
import {
  createSessionSchema,
  listSessionsQuerySchema,
  sessionParamsSchema,
  listPricesQuerySchema,
  statusPaymentParamsSchema,
  createStatusPaymentSchema,
  updateStatusPaymentSchema,
  listSubscriptionsQuerySchema,
} from './stripe.schema';

const router = Router();

// =============================================================================
// STATUS PAYMENT - Rotas devem vir antes de rotas com parametros
// =============================================================================

/**
 * @swagger
 * /api/v1/stripe/status-payment:
 *   get:
 *     summary: Lista status de pagamento
 *     tags: [Stripe]
 *     responses:
 *       200:
 *         description: Lista de status de pagamento
 */
router.get('/status-payment', StripeController.listStatusPayment);

/**
 * @swagger
 * /api/v1/stripe/status-payment:
 *   post:
 *     summary: Cria status de pagamento
 *     tags: [Stripe]
 */
router.post(
  '/status-payment',
  validateBody(createStatusPaymentSchema),
  StripeController.createStatusPayment
);

/**
 * @swagger
 * /api/v1/stripe/status-payment/{status_payment_id}:
 *   get:
 *     summary: Busca status de pagamento por ID
 *     tags: [Stripe]
 */
router.get(
  '/status-payment/:status_payment_id',
  validateParams(statusPaymentParamsSchema),
  StripeController.getStatusPaymentById
);

/**
 * @swagger
 * /api/v1/stripe/status-payment/{status_payment_id}:
 *   patch:
 *     summary: Atualiza status de pagamento
 *     tags: [Stripe]
 */
router.patch(
  '/status-payment/:status_payment_id',
  validateParams(statusPaymentParamsSchema),
  validateBody(updateStatusPaymentSchema),
  StripeController.updateStatusPayment
);

/**
 * @swagger
 * /api/v1/stripe/status-payment/{status_payment_id}:
 *   delete:
 *     summary: Remove status de pagamento
 *     tags: [Stripe]
 */
router.delete(
  '/status-payment/:status_payment_id',
  validateParams(statusPaymentParamsSchema),
  StripeController.deleteStatusPayment
);

// =============================================================================
// SUBSCRIPTIONS
// =============================================================================

/**
 * @swagger
 * /api/v1/stripe/subscriptions:
 *   get:
 *     summary: Lista assinaturas
 *     tags: [Stripe]
 *     parameters:
 *       - in: query
 *         name: company_id
 *         schema:
 *           type: integer
 *         description: Filtrar por empresa
 *     responses:
 *       200:
 *         description: Lista de assinaturas
 */
router.get(
  '/subscriptions',
  validateQuery(listSubscriptionsQuerySchema),
  StripeController.listSubscriptions
);

// =============================================================================
// PRICES
// =============================================================================

/**
 * @swagger
 * /api/v1/stripe/prices:
 *   get:
 *     summary: Lista precos do Stripe
 *     tags: [Stripe]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limite de resultados
 *       - in: query
 *         name: starting_after
 *         schema:
 *           type: string
 *         description: Cursor para paginacao
 *       - in: query
 *         name: ending_before
 *         schema:
 *           type: string
 *         description: Cursor para paginacao reversa
 *     responses:
 *       200:
 *         description: Lista de precos
 */
router.get(
  '/prices',
  validateQuery(listPricesQuerySchema),
  StripeController.listPrices
);

// =============================================================================
// WEBHOOKS - Sem autenticacao (Stripe envia)
// =============================================================================

/**
 * @swagger
 * /api/v1/stripe/webhooks:
 *   post:
 *     summary: Webhook endpoint do Stripe
 *     tags: [Stripe]
 *     description: Endpoint para receber eventos do Stripe
 *     responses:
 *       200:
 *         description: Webhook processado
 */
router.post('/webhooks', StripeController.handleWebhook);

// =============================================================================
// CHECKOUT SESSIONS
// =============================================================================

/**
 * @swagger
 * /api/v1/stripe/sessions:
 *   get:
 *     summary: Lista sessoes de checkout
 *     tags: [Stripe]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limite de resultados
 *     responses:
 *       200:
 *         description: Lista de sessoes
 */
router.get(
  '/sessions',
  validateQuery(listSessionsQuerySchema),
  StripeController.listSessions
);

/**
 * @swagger
 * /api/v1/stripe/sessions:
 *   post:
 *     summary: Cria uma sessao de checkout
 *     tags: [Stripe]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - success_url
 *               - cancel_url
 *             properties:
 *               success_url:
 *                 type: string
 *                 format: uri
 *               cancel_url:
 *                 type: string
 *                 format: uri
 *               line_items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     price:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *               company_id:
 *                 type: integer
 *               first_time:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Sessao criada com sucesso
 */
router.post(
  '/sessions',
  validateBody(createSessionSchema),
  StripeController.createSession
);

/**
 * @swagger
 * /api/v1/stripe/sessions/{session_id}:
 *   get:
 *     summary: Busca sessao por ID
 *     tags: [Stripe]
 *     parameters:
 *       - in: path
 *         name: session_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sessao encontrada
 */
router.get(
  '/sessions/:session_id',
  validateParams(sessionParamsSchema),
  StripeController.getSessionById
);

/**
 * @swagger
 * /api/v1/stripe/sessions/{session_id}/line-items:
 *   get:
 *     summary: Lista line items de uma sessao
 *     tags: [Stripe]
 *     parameters:
 *       - in: path
 *         name: session_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Line items da sessao
 */
router.get(
  '/sessions/:session_id/line-items',
  validateParams(sessionParamsSchema),
  StripeController.getSessionLineItems
);

export default router;
