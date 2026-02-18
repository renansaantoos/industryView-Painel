// =============================================================================
// INDUSTRYVIEW BACKEND - Error Handler Middleware
// Middleware centralizado para tratamento de erros
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError, handlePrismaError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { config } from '../config/env';

/**
 * Converte erros de validacao do Zod para formato padrao
 */
function formatZodError(error: ZodError): ValidationError {
  const errors = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return new ValidationError('Validation Error', errors);
}

/**
 * Middleware de tratamento de erros
 * Equivalente ao error handling do Xano
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log do erro
  logger.error({
    error: {
      name: error.name,
      message: error.message,
      stack: config.app.isDevelopment ? error.stack : undefined,
    },
    request: {
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query,
      body: req.method !== 'GET' ? req.body : undefined,
    },
  }, 'Request Error');

  // Trata erros do Zod (validacao)
  if (error instanceof ZodError) {
    const validationError = formatZodError(error);
    res.status(validationError.statusCode).json(validationError.toJSON());
    return;
  }

  // Trata erros do Prisma (banco de dados)
  if (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientValidationError
  ) {
    const prismaError = handlePrismaError(error);
    res.status(prismaError.statusCode).json(prismaError.toJSON());
    return;
  }

  // Trata erros operacionais da aplicacao
  if (error instanceof AppError) {
    res.status(error.statusCode).json(error.toJSON());
    return;
  }

  // Erro de sintaxe JSON no body
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({
      error: true,
      code: 'INVALID_JSON',
      message: 'Invalid JSON in request body',
    });
    return;
  }

  // Erro desconhecido - retorna 500
  const statusCode = 500;
  const response = {
    error: true,
    code: 'INTERNAL_ERROR',
    message: config.app.isProduction
      ? 'Internal Server Error'
      : error.message || 'Unknown error occurred',
    ...(config.app.isDevelopment && { stack: error.stack }),
  };

  res.status(statusCode).json(response);
}

/**
 * Middleware para rotas nao encontradas
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: true,
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.url} not found`,
  });
}

/**
 * Wrapper para async handlers (evita try-catch em cada rota)
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default errorHandler;
