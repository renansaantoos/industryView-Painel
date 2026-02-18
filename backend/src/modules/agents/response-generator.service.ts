// =============================================================================
// INDUSTRYVIEW BACKEND - Response Generator Agent Service
// Service do agente gerador de respostas humanizadas
// Equivalente ao agent GeneratorResponseAgent do Xano
// Usa OpenAI GPT-4 mini para gerar respostas em Markdown
// =============================================================================

import OpenAI from 'openai';
import { config } from '../../config/env';
import { GeneratorResponseAgentResponse } from './agents.schema';
import { logger } from '../../utils/logger';

// System prompt do GeneratorResponseAgent
// Equivalente ao system_prompt do agent no Xano
const GENERATOR_RESPONSE_SYSTEM_PROMPT = `
Voce e um assistente que transforma dados tecnicos sobre projetos em respostas amigaveis em formato Markdown.

Voce recebera:

A pergunta original do usuario

Uma lista de projetos em formato JSON (cada item pode conter campos como name, responsible, status, deadline, etc.)

Com base nisso, gere uma resposta clara, util e bem formatada. Caso haja multiplos projetos, organize-os como uma lista em Markdown.

Exemplo:
Input do usuario:
"Quais sao os projetos sob responsabilidade do Myrko?"

Dados recebidos:

json
[
  { "name": "Cadastro Nacional", "responsible": "Myrko", "status": "Em andamento", "deadline": "2025-08-01" },
  { "name": "Integracao Xano", "responsible": "Myrko", "status": "Concluido", "deadline": "2025-06-15" }
]

Resposta esperada em Markdown:

Os projetos sob responsabilidade do Myrko sao:

- **Cadastro Nacional**
  - Status: Em andamento
  - Prazo: 01/08/2025

- **Integracao Xano**
  - Status: Concluido
  - Prazo: 15/06/2025
`;

/**
 * ResponseGeneratorService - Service do agente gerador de respostas
 */
export class ResponseGeneratorService {
  private static openai: OpenAI | null = null;

  /**
   * Inicializa o cliente OpenAI
   */
  private static getOpenAI(): OpenAI {
    if (!this.openai) {
      const apiKey = config.openai?.apiKey || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY nao configurada');
      }
      this.openai = new OpenAI({ apiKey });
    }
    return this.openai;
  }

  /**
   * Gera uma resposta humanizada a partir de dados estruturados
   * Equivalente a: ai.agent.run "GeneratorResponseAgent" do Xano
   */
  static async generate(data: unknown): Promise<GeneratorResponseAgentResponse> {
    try {
      const openai = this.getOpenAI();

      // Converte dados para JSON string se necessario
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Equivalente ao gpt-4.1-mini do Xano
        messages: [
          {
            role: 'system',
            content: GENERATOR_RESPONSE_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: dataString,
          },
        ],
        temperature: 0.9,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        return {
          response: 'Nao foi possivel gerar uma resposta.',
        };
      }

      return {
        response: content.trim(),
      };
    } catch (error) {
      logger.error({ error }, 'Erro no GeneratorResponseAgent');
      return {
        response: 'Erro ao gerar resposta. Tente novamente.',
      };
    }
  }
}

export default ResponseGeneratorService;
