// =============================================================================
// INDUSTRYVIEW BACKEND - Stripe Module Service
// Service de integracao com Stripe
// Equivalente a logica dos endpoints do api_group stripe_checkout do Xano
// =============================================================================

import { db } from '../../config/database';
import { config } from '../../config/env';
import { BadRequestError, NotFoundError, ExternalServiceError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import {
  CreateSessionInput,
  ListPricesInput,
  WebhookInput,
  CreateStatusPaymentInput,
  UpdateStatusPaymentInput,
} from './stripe.schema';

// Stripe API base URL
const STRIPE_API_BASE = 'https://api.stripe.com/v1';

/**
 * Helper para fazer requisicoes autenticadas ao Stripe
 */
async function stripeRequest(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: Record<string, any>
): Promise<any> {
  const stripeSecretKey = config.stripe?.secretKey;

  if (!stripeSecretKey) {
    throw new ExternalServiceError('Stripe', 'Stripe API key not configured');
  }

  const authHeader = `Basic ${Buffer.from(`${stripeSecretKey}:`).toString('base64')}`;

  const options: RequestInit = {
    method,
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  if (body && method === 'POST') {
    // Convert object to URL-encoded form data
    const formData = new URLSearchParams();

    const encodeParams = (obj: any, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}[${key}]` : key;

        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === 'object' && item !== null) {
              encodeParams(item, `${fullKey}[${index}]`);
            } else {
              formData.append(`${fullKey}[${index}]`, String(item));
            }
          });
        } else if (typeof value === 'object' && value !== null) {
          encodeParams(value, fullKey);
        } else if (value !== undefined && value !== null) {
          formData.append(fullKey, String(value));
        }
      }
    };

    encodeParams(body);
    options.body = formData.toString();
  }

  try {
    const response = await fetch(`${STRIPE_API_BASE}${endpoint}`, options);
    const result = await response.json() as Record<string, any>;

    if (result.error) {
      logger.error({ error: result.error, endpoint }, 'Stripe API error');
      throw new BadRequestError(result.error.message || 'Stripe API error');
    }

    return result;
  } catch (error: any) {
    if (error instanceof BadRequestError) throw error;

    logger.error({ error, endpoint }, 'Stripe request failed');
    throw new ExternalServiceError('Stripe', error.message || 'Failed to communicate with Stripe');
  }
}

/**
 * StripeService - Service do modulo de Stripe
 */
export class StripeService {
  // =============================================================================
  // CHECKOUT SESSIONS
  // =============================================================================

  /**
   * Cria uma sessao de checkout
   * Equivalente a: query sessions verb=POST do Xano (endpoint 715)
   */
  static async createSession(input: CreateSessionInput) {
    const params: Record<string, any> = {
      success_url: input.success_url,
      cancel_url: input.cancel_url,
      'payment_method_types[0]': 'card',
      mode: 'subscription',
      client_reference_id: input.company_id,
    };

    // Adiciona line_items se fornecidos
    if (input.line_items && input.line_items.length > 0) {
      input.line_items.forEach((item, index) => {
        if (item.price) {
          params[`line_items[${index}][price]`] = item.price;
          params[`line_items[${index}][quantity]`] = item.quantity || 1;
        }
      });
    }

    // Adiciona trial period se for primeiro uso
    if (input.first_time) {
      params['subscription_data[trial_period_days]'] = 90;
    }

    const session = await stripeRequest('/checkout/sessions', 'POST', params);

    logger.info({ sessionId: session.id, companyId: input.company_id }, 'Stripe checkout session created');
    return session;
  }

  /**
   * Lista sessoes de checkout
   * Equivalente a: query sessions verb=GET do Xano (endpoint 716)
   */
  static async listSessions(limit: number = 10) {
    const sessions = await stripeRequest(`/checkout/sessions?limit=${limit}`);
    return sessions;
  }

  /**
   * Busca sessao por ID
   * Equivalente a: query sessions/{id} verb=GET do Xano (endpoint 717)
   */
  static async getSessionById(sessionId: string) {
    const session = await stripeRequest(`/checkout/sessions/${sessionId}`);
    return session;
  }

  /**
   * Lista line items de uma sessao
   * Equivalente a: query sessions/{id}/line_items verb=GET do Xano (endpoint 718)
   */
  static async getSessionLineItems(sessionId: string) {
    const lineItems = await stripeRequest(`/checkout/sessions/${sessionId}/line_items`);
    return lineItems;
  }

  // =============================================================================
  // PRICES
  // =============================================================================

  /**
   * Lista precos do Stripe
   * Equivalente a: query prices verb=GET do Xano (endpoint 720)
   */
  static async listPrices(input?: ListPricesInput) {
    const params = new URLSearchParams();

    if (input?.limit) params.append('limit', String(input.limit));
    if (input?.starting_after) params.append('starting_after', input.starting_after);
    if (input?.ending_before) params.append('ending_before', input.ending_before);

    const queryString = params.toString();
    const endpoint = queryString ? `/prices?${queryString}` : '/prices';

    const prices = await stripeRequest(endpoint);
    return prices;
  }

  // =============================================================================
  // WEBHOOKS
  // =============================================================================

  /**
   * Processa webhook do Stripe
   * Equivalente a: query webhooks verb=POST do Xano (endpoint 719)
   */
  static async handleWebhook(payload: WebhookInput) {
    const webhookData = payload.data?.object;
    const eventType = payload.type;

    logger.info({ eventType }, 'Processing Stripe webhook');

    switch (eventType) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(webhookData);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(webhookData);
        break;

      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(webhookData);
        break;

      case 'invoice.payment_failed':
        await this.handlePaymentFailed(webhookData);
        break;

      default:
        logger.info({ eventType }, 'Unhandled webhook event type');
    }

    return null;
  }

  /**
   * Handler para checkout.session.completed
   */
  private static async handleCheckoutCompleted(webhookData: any) {
    await db.$transaction(async (tx) => {
      // Busca detalhes da subscription
      const subscription = await stripeRequest(`/subscriptions/${webhookData.subscription}`);

      // Cria sessao no banco
      const session = await tx.session.create({
        data: {
          session_id: webhookData.id,
          customer_id: webhookData.customer,
          amount_subtotal: webhookData.amount_subtotal,
          amount_total: webhookData.amount_total,
          payment_intent_id: webhookData.payment_intent,
          payment_status: webhookData.payment_status,
          company_id: webhookData.client_reference_id ? BigInt(webhookData.client_reference_id) : null,
          created_at: new Date(),
        },
      });

      // Calcula datas
      const trialEnd = subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null;
      const currentPeriodEnd = subscription.items?.data?.[0]?.current_period_end
        ? new Date(subscription.items.data[0].current_period_end * 1000)
        : null;

      // Cria subscription no banco
      const subscriptionRecord = await tx.subscriptions.create({
        data: {
          company_id: session.company_id,
          stripe_customer_id: webhookData.customer,
          stripe_subscription_id: webhookData.subscription,
          status: subscription.status,
          trial_end: trialEnd,
          current_period_end: currentPeriodEnd,
          cancel_at_period_end: subscription.cancel_at_period_end,
          last_invoice_id: subscription.latest_invoice,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      // Atualiza session com subscriptions_id
      await tx.session.update({
        where: { id: session.id },
        data: { subscriptions_id: subscriptionRecord.id },
      });

      // Atualiza status_payment da company
      const statusPaymentId = this.getStatusPaymentId(subscription.status);
      if (session.company_id && statusPaymentId) {
        await tx.company.update({
          where: { id: session.company_id },
          data: { status_payment_id: BigInt(statusPaymentId) },
        });
      }

      logger.info({ sessionId: session.id, subscriptionId: subscriptionRecord.id }, 'Checkout completed processed');
    });
  }

  /**
   * Handler para customer.subscription.updated
   */
  private static async handleSubscriptionUpdated(webhookData: any) {
    // Busca detalhes atualizados da subscription
    const subscription = await stripeRequest(`/subscriptions/${webhookData.id}`);

    // Busca subscription no banco
    const existingSubscription = await db.subscriptions.findFirst({
      where: { stripe_subscription_id: subscription.id },
    });

    if (!existingSubscription) {
      logger.warn({ subscriptionId: webhookData.id }, 'Subscription not found in database');
      return;
    }

    // Calcula datas
    const trialEnd = webhookData.trial_end
      ? new Date(webhookData.trial_end * 1000)
      : null;
    const currentPeriodEnd = webhookData.items?.data?.[0]?.current_period_end
      ? new Date(webhookData.items.data[0].current_period_end * 1000)
      : null;

    // Atualiza subscription
    await db.subscriptions.update({
      where: { id: existingSubscription.id },
      data: {
        status: webhookData.status,
        trial_end: trialEnd,
        current_period_end: currentPeriodEnd,
        cancel_at_period_end: webhookData.cancel_at_period_end,
        updated_at: new Date(),
      },
    });

    // Atualiza status_payment da company
    const statusPaymentId = this.getStatusPaymentId(subscription.status);
    if (existingSubscription.company_id && statusPaymentId) {
      await db.company.update({
        where: { id: existingSubscription.company_id },
        data: { status_payment_id: BigInt(statusPaymentId) },
      });
    }

    logger.info({ subscriptionId: existingSubscription.id }, 'Subscription updated processed');
  }

  /**
   * Handler para invoice.payment_succeeded
   */
  private static async handlePaymentSucceeded(webhookData: any) {
    const subscriptionId = webhookData.parent?.subscription_details?.subscription;
    if (!subscriptionId) return;

    const existingSubscription = await db.subscriptions.findFirst({
      where: { stripe_subscription_id: subscriptionId },
    });

    if (!existingSubscription) {
      logger.warn({ subscriptionId }, 'Subscription not found for payment succeeded');
      return;
    }

    // Busca detalhes da subscription
    const subscription = await stripeRequest(`/subscriptions/${existingSubscription.stripe_subscription_id}`);

    // Atualiza subscription com invoice
    await db.subscriptions.update({
      where: { id: existingSubscription.id },
      data: {
        last_invoice_id: webhookData.id,
        updated_at: new Date(),
      },
    });

    // Atualiza status_payment da company
    const statusPaymentId = this.getStatusPaymentId(subscription.status);
    if (existingSubscription.company_id && statusPaymentId) {
      await db.company.update({
        where: { id: existingSubscription.company_id },
        data: { status_payment_id: BigInt(statusPaymentId) },
      });
    }

    logger.info({ subscriptionId: existingSubscription.id }, 'Payment succeeded processed');
  }

  /**
   * Handler para invoice.payment_failed
   */
  private static async handlePaymentFailed(webhookData: any) {
    const subscriptionId = webhookData.parent?.subscription_details?.subscription;
    if (!subscriptionId) return;

    const existingSubscription = await db.subscriptions.findFirst({
      where: { stripe_subscription_id: subscriptionId },
    });

    if (!existingSubscription) {
      logger.warn({ subscriptionId }, 'Subscription not found for payment failed');
      return;
    }

    // Atualiza subscription com invoice
    await db.subscriptions.update({
      where: { id: existingSubscription.id },
      data: {
        last_invoice_id: webhookData.id,
        updated_at: new Date(),
      },
    });

    // Busca detalhes da subscription
    const subscription = await stripeRequest(`/subscriptions/${existingSubscription.stripe_subscription_id}`);

    // Atualiza status_payment da company
    const statusPaymentId = this.getStatusPaymentId(subscription.status);
    if (existingSubscription.company_id && statusPaymentId) {
      await db.company.update({
        where: { id: existingSubscription.company_id },
        data: { status_payment_id: BigInt(statusPaymentId) },
      });
    }

    logger.info({ subscriptionId: existingSubscription.id }, 'Payment failed processed');
  }

  /**
   * Helper para mapear status do Stripe para status_payment_id
   * Equivalente a logica condicional do Xano
   */
  private static getStatusPaymentId(status: string): number | null {
    switch (status) {
      case 'trialing':
        return 1;
      case 'active':
        return 2;
      case 'past_due':
      case 'unpaid':
        return 3;
      case 'canceled':
        return 4;
      default:
        return null;
    }
  }

  // =============================================================================
  // STATUS PAYMENT
  // =============================================================================

  /**
   * Lista status de pagamento
   * Equivalente a: query status_payment verb=GET do Xano (endpoint 723)
   */
  static async listStatusPayment() {
    const statusPayment = await db.status_payment.findMany({
      orderBy: { id: 'asc' },
    });

    return statusPayment;
  }

  /**
   * Busca status de pagamento por ID
   * Equivalente a: query status_payment/{status_payment_id} verb=GET do Xano (endpoint 722)
   */
  static async getStatusPaymentById(statusPaymentId: number) {
    const statusPayment = await db.status_payment.findFirst({
      where: { id: statusPaymentId },
    });

    if (!statusPayment) {
      throw new NotFoundError('Status de pagamento nao encontrado.');
    }

    return statusPayment;
  }

  /**
   * Cria status de pagamento
   * Equivalente a: query status_payment verb=POST do Xano (endpoint 724)
   */
  static async createStatusPayment(input: CreateStatusPaymentInput) {
    const statusPayment = await db.status_payment.create({
      data: {
        name: input.name,
        created_at: new Date(),
      },
    });

    logger.info({ statusPaymentId: statusPayment.id }, 'Status payment created');
    return statusPayment;
  }

  /**
   * Atualiza status de pagamento
   * Equivalente a: query status_payment/{status_payment_id} verb=PATCH do Xano (endpoint 725)
   */
  static async updateStatusPayment(statusPaymentId: number, input: UpdateStatusPaymentInput) {
    const existing = await db.status_payment.findFirst({
      where: { id: statusPaymentId },
    });

    if (!existing) {
      throw new NotFoundError('Status de pagamento nao encontrado.');
    }

    const statusPayment = await db.status_payment.update({
      where: { id: statusPaymentId },
      data: {
        name: input.name,
      },
    });

    logger.info({ statusPaymentId }, 'Status payment updated');
    return statusPayment;
  }

  /**
   * Remove status de pagamento
   * Equivalente a: query status_payment/{status_payment_id} verb=DELETE do Xano (endpoint 721)
   */
  static async deleteStatusPayment(statusPaymentId: number) {
    const existing = await db.status_payment.findFirst({
      where: { id: statusPaymentId },
    });

    if (!existing) {
      throw new NotFoundError('Status de pagamento nao encontrado.');
    }

    await db.status_payment.delete({
      where: { id: statusPaymentId },
    });

    logger.info({ statusPaymentId }, 'Status payment deleted');
    return { message: 'Status de pagamento removido com sucesso' };
  }

  // =============================================================================
  // SUBSCRIPTIONS
  // =============================================================================

  /**
   * Lista assinaturas de uma company
   */
  static async listSubscriptions(companyId?: number) {
    const whereConditions: any = {
      deleted_at: null,
    };

    if (companyId) {
      whereConditions.company_id = companyId;
    }

    const subscriptions = await db.subscriptions.findMany({
      where: whereConditions,
      orderBy: { created_at: 'desc' },
      include: {
        company: {
          select: { id: true, brand_name: true },
        },
      },
    });

    return subscriptions;
  }
}

export default StripeService;
