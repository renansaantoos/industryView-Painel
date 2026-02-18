// =============================================================================
// INDUSTRYVIEW BACKEND - Rate Limiting Middleware
// Middleware de rate limiting para protecao contra abusos
// =============================================================================

import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

/**
 * Rate limiter padrao para todas as rotas
 */
export const defaultRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.app.isDevelopment ? 10000 : config.rateLimit.maxRequests, // Desabilita em dev
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.app.isDevelopment, // Skip rate limit em desenvolvimento
  message: {
    error: true,
    code: 'TOO_MANY_REQUESTS',
    message: 'Muitas requisicoes. Tente novamente mais tarde.',
  },
  handler: (_req, res) => {
    res.status(429).json({
      error: true,
      code: 'TOO_MANY_REQUESTS',
      message: 'Muitas requisicoes. Tente novamente mais tarde.',
    });
  },
});

/**
 * Rate limiter mais restritivo para endpoints de autenticacao
 * Previne ataques de brute force
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    code: 'TOO_MANY_REQUESTS',
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  },
  handler: (_req, res) => {
    res.status(429).json({
      error: true,
      code: 'TOO_MANY_REQUESTS',
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    });
  },
  // Aplica rate limit apenas em falhas
  skipSuccessfulRequests: true,
});

/**
 * Rate limiter para endpoints de envio de email
 */
export const emailRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 emails por hora
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    code: 'TOO_MANY_REQUESTS',
    message: 'Limite de envio de emails atingido. Tente novamente em 1 hora.',
  },
});

/**
 * Rate limiter para endpoints de IA/Agent
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 requisicoes por minuto
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    code: 'TOO_MANY_REQUESTS',
    message: 'Limite de consultas ao agente atingido. Tente novamente em 1 minuto.',
  },
});

/**
 * Rate limiter para uploads de arquivos
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 50, // 50 uploads por hora
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    code: 'TOO_MANY_REQUESTS',
    message: 'Limite de uploads atingido. Tente novamente em 1 hora.',
  },
});

export default defaultRateLimiter;
