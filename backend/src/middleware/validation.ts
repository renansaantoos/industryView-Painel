// =============================================================================
// INDUSTRYVIEW BACKEND - Validation Middleware
// Middleware de validacao usando Zod
// Equivalente aos input validators do Xano
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';

/**
 * Tipos de dados que podem ser validados
 */
type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Cria um middleware de validacao para o schema especificado
 * Equivalente aos input definitions do Xano
 *
 * @param schema - Schema Zod para validacao
 * @param target - Onde buscar os dados (body, query, params)
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = req[target];
      const result = schema.safeParse(data);

      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        throw new ValidationError('Erro de validacao', errors);
      }

      // Substitui os dados originais pelos dados validados e transformados
      req[target] = result.data;

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Valida body da requisicao
 */
export function validateBody(schema: ZodSchema) {
  return validate(schema, 'body');
}

/**
 * Valida query params da requisicao
 */
export function validateQuery(schema: ZodSchema) {
  return validate(schema, 'query');
}

/**
 * Valida path params da requisicao
 */
export function validateParams(schema: ZodSchema) {
  return validate(schema, 'params');
}

/**
 * Valida multiplos targets ao mesmo tempo
 */
export function validateRequest(schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const errors: Array<{ field: string; message: string }> = [];

      // Valida body
      if (schemas.body) {
        const result = schemas.body.safeParse(req.body);
        if (!result.success) {
          errors.push(
            ...result.error.errors.map(err => ({
              field: `body.${err.path.join('.')}`,
              message: err.message,
            }))
          );
        } else {
          req.body = result.data;
        }
      }

      // Valida query
      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (!result.success) {
          errors.push(
            ...result.error.errors.map(err => ({
              field: `query.${err.path.join('.')}`,
              message: err.message,
            }))
          );
        } else {
          req.query = result.data;
        }
      }

      // Valida params
      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);
        if (!result.success) {
          errors.push(
            ...result.error.errors.map(err => ({
              field: `params.${err.path.join('.')}`,
              message: err.message,
            }))
          );
        } else {
          req.params = result.data;
        }
      }

      if (errors.length > 0) {
        throw new ValidationError('Erro de validacao', errors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export default validate;
