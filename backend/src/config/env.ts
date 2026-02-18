// =============================================================================
// INDUSTRYVIEW BACKEND - Environment Configuration
// Equivalente a variaveis de ambiente do Xano ($env.workspace.*)
// =============================================================================

import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

// Schema de validacao das variaveis de ambiente
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  API_VERSION: z.string().default('v1'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().transform(Number).default('86400'), // 24 hours in seconds
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().transform(Number).default('604800'), // 7 days in seconds

  // SendGrid
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().optional(),
  SENDGRID_FROM_NAME: z.string().optional().default('IndustryView'),
  SENDGRID_TEMPLATE_PASSWORD_RESET: z.string().optional().default('d-07180de2dae0404c98e79e7caef2abe0'),
  SENDGRID_TEMPLATE_WELCOME: z.string().optional().default('d-c129705b3e8b4e448ec30be8128d53f8'),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_ID: z.string().optional(),

  // OpenAI
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  OPENAI_MAX_TOKENS: z.string().transform(Number).default('2000'),
  OPENAI_TEMPERATURE: z.string().transform(Number).default('0.7'),

  // Storage
  STORAGE_TYPE: z.enum(['local', 's3']).default('local'),
  STORAGE_PATH: z.string().default('./uploads'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_BUCKET_NAME: z.string().optional(),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // CORS
  CORS_ORIGIN: z.string().default('*'),
  CORS_CREDENTIALS: z.string().transform(val => val === 'true').default('true'),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  LOG_FORMAT: z.enum(['json', 'pretty']).default('pretty'),

  // Timezone
  TZ: z.string().default('America/Sao_Paulo'),
});

// Parse and validate environment variables
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:');
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;

// Helper function to parse CORS origin
// Se CORS_ORIGIN for '*', retorna true (aceita qualquer origem)
// Caso contrario, retorna um array de origens permitidas ou uma funcao de callback
function parseCorsOrigin(corsOrigin: string): boolean | string | string[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void) {
  const trimmedOrigin = corsOrigin.trim();

  // Se for wildcard '*'
  if (trimmedOrigin === '*') {
    // Em desenvolvimento, aceita qualquer origem dinamicamente
    // Isso permite credentials: true funcionar com qualquer origem
    if (env.NODE_ENV === 'development') {
      return (_origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Aceita qualquer origem em desenvolvimento, incluindo requests sem origin (como curl)
        callback(null, true);
      };
    }
    // Em producao com wildcard, nao pode usar credentials
    return true;
  }

  // Se for uma lista de origens separadas por virgula
  const origins = trimmedOrigin.split(',').map(o => o.trim()).filter(o => o.length > 0);

  // Se for apenas uma origem, retorna como string
  if (origins.length === 1) {
    return origins[0];
  }

  // Se for multiplas origens, retorna como array
  return origins;
}

// Export individual configs for convenience
export const config = {
  app: {
    env: env.NODE_ENV,
    port: env.PORT,
    apiVersion: env.API_VERSION,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isStaging: env.NODE_ENV === 'staging',
  },
  database: {
    url: env.DATABASE_URL,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  sendgrid: {
    apiKey: env.SENDGRID_API_KEY,
    fromEmail: env.SENDGRID_FROM_EMAIL,
    fromName: env.SENDGRID_FROM_NAME,
    templates: {
      passwordReset: env.SENDGRID_TEMPLATE_PASSWORD_RESET,
      welcome: env.SENDGRID_TEMPLATE_WELCOME,
    },
  },
  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    priceId: env.STRIPE_PRICE_ID,
  },
  openai: {
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
    maxTokens: env.OPENAI_MAX_TOKENS,
    temperature: env.OPENAI_TEMPERATURE,
  },
  storage: {
    type: env.STORAGE_TYPE,
    path: env.STORAGE_PATH,
    aws: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION,
      bucketName: env.AWS_BUCKET_NAME,
    },
  },
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
  },
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  cors: {
    origin: parseCorsOrigin(env.CORS_ORIGIN),
    credentials: env.CORS_CREDENTIALS,
  },
  logging: {
    level: env.LOG_LEVEL,
    format: env.LOG_FORMAT,
  },
};

export default config;
