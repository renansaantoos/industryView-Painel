// =============================================================================
// INDUSTRYVIEW BACKEND - Logger Configuration
// Logger estruturado usando Pino
// =============================================================================

import pino from 'pino';
import { config } from '../config/env';

// Configuracao do transport baseado no ambiente
const transport = config.logging.format === 'pretty'
  ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    }
  : undefined;

// Cria o logger
export const logger = pino({
  level: config.logging.level,
  transport,
  base: {
    env: config.app.env,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  redact: {
    paths: ['password', 'password_hash', 'token', 'authToken', 'Authorization'],
    censor: '[REDACTED]',
  },
});

// Logger para requisicoes HTTP
export const httpLogger = logger.child({ module: 'http' });

// Logger para banco de dados
export const dbLogger = logger.child({ module: 'database' });

// Logger para jobs/cron
export const jobLogger = logger.child({ module: 'jobs' });

// Logger para servicos externos
export const externalLogger = logger.child({ module: 'external' });

// Logger para agentes de IA
export const agentLogger = logger.child({ module: 'agent' });

export default logger;
