// =============================================================================
// INDUSTRYVIEW BACKEND - Custom Error Classes
// Equivalente aos error_type do Xano (badrequest, notfound, unauthorized, etc)
// =============================================================================

/**
 * Base error class for application errors
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;
  public readonly payload?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    payload?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.payload = payload;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      error: true,
      code: this.code,
      message: this.message,
      payload: this.payload,
    };
  }
}

/**
 * BadRequest Error - Equivalente a error_type = "badrequest" do Xano
 * Status: 400
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', payload?: unknown) {
    super(message, 400, 'BAD_REQUEST', true, payload);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * Validation Error - Para erros de validacao de input
 * Status: 400
 */
export class ValidationError extends AppError {
  public readonly errors: Array<{ field: string; message: string }>;

  constructor(
    message: string = 'Validation Error',
    errors: Array<{ field: string; message: string }> = []
  ) {
    super(message, 400, 'VALIDATION_ERROR', true, errors);
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  toJSON() {
    return {
      error: true,
      code: this.code,
      message: this.message,
      errors: this.errors,
      payload: this.payload,
    };
  }
}

/**
 * Unauthorized Error - Equivalente a error_type = "unauthorized" do Xano
 * Status: 401
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', payload?: unknown) {
    super(message, 401, 'UNAUTHORIZED', true, payload);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Forbidden Error - Para recursos que o usuario nao tem permissao
 * Status: 403
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', payload?: unknown) {
    super(message, 403, 'FORBIDDEN', true, payload);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * NotFound Error - Equivalente a error_type = "notfound" do Xano
 * Status: 404
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Not Found', payload?: unknown) {
    super(message, 404, 'NOT_FOUND', true, payload);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Conflict Error - Para conflitos (ex: email ja cadastrado)
 * Status: 409
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Conflict', payload?: unknown) {
    super(message, 409, 'CONFLICT', true, payload);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * TooManyRequests Error - Para rate limiting
 * Status: 429
 */
export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too Many Requests', payload?: unknown) {
    super(message, 429, 'TOO_MANY_REQUESTS', true, payload);
    Object.setPrototypeOf(this, TooManyRequestsError.prototype);
  }
}

/**
 * InternalServer Error - Para erros internos do servidor
 * Status: 500
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal Server Error', payload?: unknown) {
    super(message, 500, 'INTERNAL_ERROR', false, payload);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

/**
 * ServiceUnavailable Error - Para servicos externos indisponiveis
 * Status: 503
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service Unavailable', payload?: unknown) {
    super(message, 503, 'SERVICE_UNAVAILABLE', true, payload);
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}

/**
 * Database Error - Para erros de banco de dados
 * Status: 500
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database Error', payload?: unknown) {
    super(message, 500, 'DATABASE_ERROR', false, payload);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * ExternalService Error - Para erros de servicos externos (SendGrid, Stripe, OpenAI)
 * Status: 502
 */
export class ExternalServiceError extends AppError {
  public readonly service: string;

  constructor(service: string, message: string = 'External Service Error', payload?: unknown) {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR', true, payload);
    this.service = service;
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }

  toJSON() {
    return {
      error: true,
      code: this.code,
      message: this.message,
      service: this.service,
      payload: this.payload,
    };
  }
}

/**
 * Helper function to check if error is operational (expected) or programming error
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Helper to convert Prisma errors to AppError
 */
export function handlePrismaError(error: unknown): AppError {
  // @ts-ignore - Prisma error types
  const code = error?.code;
  // @ts-ignore
  const meta = error?.meta;

  switch (code) {
    case 'P2002': // Unique constraint violation
      return new ConflictError(
        `Registro duplicado: ${meta?.target?.join(', ') || 'campo unico'}`,
        meta
      );
    case 'P2025': // Record not found
      return new NotFoundError('Registro nao encontrado', meta);
    case 'P2003': // Foreign key constraint failed
      return new BadRequestError(
        `Referencia invalida: ${meta?.field_name || 'campo'}`,
        meta
      );
    case 'P2014': // Required relation violation
      return new BadRequestError('Violacao de relacao obrigatoria', meta);
    default:
      return new DatabaseError('Erro no banco de dados', { code, meta });
  }
}
