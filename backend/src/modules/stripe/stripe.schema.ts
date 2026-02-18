// =============================================================================
// INDUSTRYVIEW BACKEND - Stripe Schemas
// Schemas de validacao para endpoints de Stripe Checkout
// Equivalente aos input definitions do api_group stripe_checkout do Xano
// =============================================================================

import { z } from 'zod';

// =============================================================================
// CHECKOUT SESSIONS
// =============================================================================

/**
 * Schema para criar sessao de checkout
 * Equivalente a: query sessions verb=POST do Xano (endpoint 715)
 */
export const createSessionSchema = z.object({
  success_url: z.string().url().trim(),
  cancel_url: z.string().url().trim(),
  line_items: z.array(z.object({
    price: z.string().optional(),
    quantity: z.number().int().positive().optional().default(1),
  })).optional(),
  company_id: z.number().int().optional(),
  first_time: z.boolean().optional().default(false),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

/**
 * Schema para listar sessoes
 * Equivalente a: query sessions verb=GET do Xano (endpoint 716)
 */
export const listSessionsSchema = z.object({
  payment_intent: z.boolean().optional(),
  starting_after: z.string().trim().optional(),
  limit: z.number().int().min(1).max(100).optional().default(10),
  ending_before: z.string().trim().optional(),
  subscription: z.boolean().optional(),
});

export type ListSessionsInput = z.infer<typeof listSessionsSchema>;

/**
 * Schema para query string de sessoes
 */
export const listSessionsQuerySchema = z.object({
  payment_intent: z.string().transform((v) => v === 'true').optional(),
  starting_after: z.string().trim().optional(),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional().default('10'),
  ending_before: z.string().trim().optional(),
  subscription: z.string().transform((v) => v === 'true').optional(),
});

export type ListSessionsQuery = z.infer<typeof listSessionsQuerySchema>;

/**
 * Schema para params de sessao
 */
export const sessionParamsSchema = z.object({
  session_id: z.string().trim(),
});

export type SessionParams = z.infer<typeof sessionParamsSchema>;

// =============================================================================
// PRICES
// =============================================================================

/**
 * Schema para listar precos
 * Equivalente a: query prices verb=GET do Xano (endpoint 720)
 */
export const listPricesSchema = z.object({
  payment_intent: z.boolean().optional(),
  starting_after: z.string().trim().optional(),
  limit: z.number().int().min(1).max(100).optional().default(10),
  ending_before: z.string().trim().optional(),
  subscription: z.boolean().optional(),
});

export type ListPricesInput = z.infer<typeof listPricesSchema>;

/**
 * Schema para query string de precos
 */
export const listPricesQuerySchema = z.object({
  payment_intent: z.string().transform((v) => v === 'true').optional(),
  starting_after: z.string().trim().optional(),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional().default('10'),
  ending_before: z.string().trim().optional(),
  subscription: z.string().transform((v) => v === 'true').optional(),
});

export type ListPricesQuery = z.infer<typeof listPricesQuerySchema>;

// =============================================================================
// WEBHOOKS
// =============================================================================

/**
 * Schema para webhook do Stripe
 * Equivalente a: query webhooks verb=POST do Xano (endpoint 719)
 */
export const webhookSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.any(),
  }),
}).passthrough();

export type WebhookInput = z.infer<typeof webhookSchema>;

// =============================================================================
// STATUS PAYMENT
// =============================================================================

/**
 * Schema para listagem de status de pagamento
 * Equivalente a: query status_payment verb=GET do Xano (endpoint 723)
 */
export const listStatusPaymentSchema = z.object({});

export type ListStatusPaymentInput = z.infer<typeof listStatusPaymentSchema>;

/**
 * Schema para params de status de pagamento
 */
export const statusPaymentParamsSchema = z.object({
  status_payment_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type StatusPaymentParams = z.infer<typeof statusPaymentParamsSchema>;

/**
 * Schema para criacao de status de pagamento
 * Equivalente a: query status_payment verb=POST do Xano (endpoint 724)
 */
export const createStatusPaymentSchema = z.object({
  name: z.string().trim().min(1, 'Nome e obrigatorio'),
});

export type CreateStatusPaymentInput = z.infer<typeof createStatusPaymentSchema>;

/**
 * Schema para atualizacao de status de pagamento
 * Equivalente a: query status_payment/{status_payment_id} verb=PATCH do Xano (endpoint 725)
 */
export const updateStatusPaymentSchema = z.object({
  name: z.string().trim().optional(),
});

export type UpdateStatusPaymentInput = z.infer<typeof updateStatusPaymentSchema>;

// =============================================================================
// SUBSCRIPTIONS
// =============================================================================

/**
 * Schema para listar assinaturas do usuario
 */
export const listSubscriptionsSchema = z.object({
  company_id: z.number().int().optional(),
});

export type ListSubscriptionsInput = z.infer<typeof listSubscriptionsSchema>;

/**
 * Schema para query string de assinaturas
 */
export const listSubscriptionsQuerySchema = z.object({
  company_id: z.string().transform(Number).pipe(z.number().int()).optional(),
});

export type ListSubscriptionsQuery = z.infer<typeof listSubscriptionsQuerySchema>;
