// =============================================================================
// INDUSTRYVIEW BACKEND - Claude Client (Anthropic)
// Cliente compartilhado para chamadas ao Claude API
// =============================================================================

import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/env';
import { logger } from '../utils/logger';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = config.claude.apiKey;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY nao configurada. Defina a variavel de ambiente ANTHROPIC_API_KEY.');
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

/**
 * Faz uma chamada ao Claude e retorna a resposta parseada como JSON.
 * Usa prefill `{` no assistant turn para garantir resposta JSON valida.
 */
export async function claudeJsonCompletion<T = unknown>(options: {
  system: string;
  userMessage: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}): Promise<T> {
  const anthropic = getClient();
  const {
    system,
    userMessage,
    temperature = 0.6,
    maxTokens = config.claude.maxTokens,
    model = config.claude.model,
  } = options;

  logger.debug({ model, temperature }, 'Claude JSON completion request');

  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system: system + '\n\nIMPORTANTE: Retorne EXCLUSIVAMENTE JSON valido. Sem explicacoes, sem markdown, apenas o objeto JSON.',
    messages: [
      { role: 'user', content: userMessage },
      { role: 'assistant', content: '{' },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Resposta vazia do Claude');
  }

  // Reconstituir JSON completo (prefill '{' + resposta)
  const fullJson = '{' + textBlock.text;

  logger.debug({ rawResponse: fullJson.slice(0, 200) }, 'Claude JSON raw response');

  return JSON.parse(fullJson) as T;
}

/**
 * Faz uma chamada ao Claude e retorna a resposta como texto livre (Markdown).
 */
export async function claudeTextCompletion(options: {
  system: string;
  userMessage: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}): Promise<string> {
  const anthropic = getClient();
  const {
    system,
    userMessage,
    temperature = 0.7,
    maxTokens = config.claude.maxTokens,
    model = config.claude.model,
  } = options;

  logger.debug({ model, temperature }, 'Claude text completion request');

  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system,
    messages: [
      { role: 'user', content: userMessage },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Resposta vazia do Claude');
  }

  return textBlock.text.trim();
}

export default getClient;
