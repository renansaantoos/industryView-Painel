// =============================================================================
// INDUSTRYVIEW BACKEND - Database Configuration
// Configuracao do Prisma Client para conexao com PostgreSQL
// =============================================================================

import { PrismaClient } from '@prisma/client';
import { config } from './env';
import { logger } from '../utils/logger';

// Singleton do Prisma Client
let prisma: PrismaClient;

// Configuracao de logging do Prisma baseado no ambiente
const prismaClientOptions = {
  log: config.app.isDevelopment
    ? [
        { emit: 'event', level: 'query' } as const,
        { emit: 'event', level: 'error' } as const,
        { emit: 'event', level: 'warn' } as const,
      ]
    : [
        { emit: 'event', level: 'error' } as const,
      ],
};

/**
 * Inicializa e retorna o Prisma Client
 * Usa singleton para evitar multiplas conexoes
 */
export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient(prismaClientOptions);

    // Event listeners para logging
    if (config.app.isDevelopment) {
      // @ts-ignore - Prisma types are complex
      prisma.$on('query', (e: { query: string; params: string; duration: number }) => {
        logger.debug({
          query: e.query,
          params: e.params,
          duration: `${e.duration}ms`,
        }, 'Database Query');
      });
    }

    // @ts-ignore
    prisma.$on('error', (e: { message: string }) => {
      logger.error({ error: e.message }, 'Database Error');
    });

    // @ts-ignore
    prisma.$on('warn', (e: { message: string }) => {
      logger.warn({ warning: e.message }, 'Database Warning');
    });
  }

  return prisma;
}

/**
 * Conecta ao banco de dados
 */
export async function connectDatabase(): Promise<void> {
  try {
    const client = getPrismaClient();
    await client.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error({ error }, 'Failed to connect to database');
    throw error;
  }
}

/**
 * Desconecta do banco de dados
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    if (prisma) {
      await prisma.$disconnect();
      logger.info('Database disconnected successfully');
    }
  } catch (error) {
    logger.error({ error }, 'Failed to disconnect from database');
    throw error;
  }
}

/**
 * Verifica a saude da conexao com o banco
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = getPrismaClient();
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error({ error }, 'Database health check failed');
    return false;
  }
}

// Export o prisma client como default
export const db = getPrismaClient();

export default db;
