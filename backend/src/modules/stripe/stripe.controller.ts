// =============================================================================
// INDUSTRYVIEW BACKEND - Stripe Controller
// Controller de integracao com Stripe
// Equivalente aos endpoints do api_group stripe_checkout do Xano
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { StripeService } from './stripe.service';
import { logger } from '../../utils/logger';
import { AuthenticatedRequest } from '../../types';

/**
 * StripeController - Controller do modulo de Stripe
 */
export class StripeController {
  // =============================================================================
  // CHECKOUT SESSIONS
  // =============================================================================

  /**
   * POST /stripe/sessions
   * Cria uma sessao de checkout
   * Equivalente a: query sessions verb=POST do Xano (endpoint 715)
   */
  static async createSession(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await StripeService.createSession(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /stripe/sessions
   * Lista sessoes de checkout
   * Equivalente a: query sessions verb=GET do Xano (endpoint 716)
   */
  static async listSessions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const result = await StripeService.listSessions(limit);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /stripe/sessions/:session_id
   * Busca sessao por ID
   * Equivalente a: query sessions/{id} verb=GET do Xano (endpoint 717)
   */
  static async getSessionById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionId = req.params.session_id;
      const result = await StripeService.getSessionById(sessionId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /stripe/sessions/:session_id/line-items
   * Lista line items de uma sessao
   * Equivalente a: query sessions/{id}/line_items verb=GET do Xano (endpoint 718)
   */
  static async getSessionLineItems(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessionId = req.params.session_id;
      const result = await StripeService.getSessionLineItems(sessionId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // PRICES
  // =============================================================================

  /**
   * GET /stripe/prices
   * Lista precos do Stripe
   * Equivalente a: query prices verb=GET do Xano (endpoint 720)
   */
  static async listPrices(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const input = {
        limit: parseInt(req.query.limit as string, 10) || 10,
        starting_after: req.query.starting_after as string,
        ending_before: req.query.ending_before as string,
      };
      const result = await StripeService.listPrices(input);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // WEBHOOKS
  // =============================================================================

  /**
   * POST /stripe/webhooks
   * Processa webhook do Stripe
   * Equivalente a: query webhooks verb=POST do Xano (endpoint 719)
   */
  static async handleWebhook(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      // O corpo ja vem parseado pelo express.json()
      // Em producao, validar signature do Stripe
      const result = await StripeService.handleWebhook(req.body);
      res.status(200).json(result);
    } catch (error) {
      logger.error({ error }, 'Webhook processing failed');
      // Sempre retorna 200 para o Stripe nao reenviar
      res.status(200).json({ received: true, error: true });
    }
  }

  // =============================================================================
  // STATUS PAYMENT
  // =============================================================================

  /**
   * GET /stripe/status-payment
   * Lista status de pagamento
   * Equivalente a: query status_payment verb=GET do Xano (endpoint 723)
   */
  static async listStatusPayment(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await StripeService.listStatusPayment();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /stripe/status-payment/:status_payment_id
   * Busca status de pagamento por ID
   * Equivalente a: query status_payment/{status_payment_id} verb=GET do Xano (endpoint 722)
   */
  static async getStatusPaymentById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const statusPaymentId = parseInt(req.params.status_payment_id, 10);
      const result = await StripeService.getStatusPaymentById(statusPaymentId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /stripe/status-payment
   * Cria status de pagamento
   * Equivalente a: query status_payment verb=POST do Xano (endpoint 724)
   */
  static async createStatusPayment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await StripeService.createStatusPayment(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /stripe/status-payment/:status_payment_id
   * Atualiza status de pagamento
   * Equivalente a: query status_payment/{status_payment_id} verb=PATCH do Xano (endpoint 725)
   */
  static async updateStatusPayment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const statusPaymentId = parseInt(req.params.status_payment_id, 10);
      const result = await StripeService.updateStatusPayment(statusPaymentId, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /stripe/status-payment/:status_payment_id
   * Remove status de pagamento
   * Equivalente a: query status_payment/{status_payment_id} verb=DELETE do Xano (endpoint 721)
   */
  static async deleteStatusPayment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const statusPaymentId = parseInt(req.params.status_payment_id, 10);
      const result = await StripeService.deleteStatusPayment(statusPaymentId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // =============================================================================
  // SUBSCRIPTIONS
  // =============================================================================

  /**
   * GET /stripe/subscriptions
   * Lista assinaturas
   * company_id SEMPRE vem do usuario autenticado
   */
  static async listSubscriptions(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.user?.companyId ?? undefined;
      const result = await StripeService.listSubscriptions(companyId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default StripeController;
