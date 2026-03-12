// =============================================================================
// INDUSTRYVIEW BACKEND - Agent Router Service
// Classificador de intencao usando Claude Haiku (rapido e barato)
// Roteia mensagens para o agente especializado correto
// =============================================================================

import { claudeJsonCompletion } from '../../services/claude-client';
import { config } from '../../config/env';
import { logger } from '../../utils/logger';

export type AgentDomain = 'executive' | 'safety' | 'planning' | 'workforce' | 'quality' | 'schedule_manager' | 'general';

export interface RouterResult {
  domain: AgentDomain;
  confidence: number;
  reasoning: string;
}

const ROUTER_SYSTEM_PROMPT = `
Voce e um classificador de intencoes para um sistema de gestao industrial.
Analise a mensagem do usuario e classifique em um dos dominios abaixo.

## Dominios

1. **executive** - Perguntas sobre projetos, status geral, KPIs, progresso, trackers instalados, visao gerencial.
   Exemplos: "Qual projeto esta mais atrasado?", "Quantos trackers instalados esta semana?", "Status geral dos projetos"

2. **safety** - Perguntas sobre seguranca do trabalho (SSMA), incidentes, treinamentos, DDS, permissoes de trabalho, EPIs, saude ocupacional, licencas ambientais.
   Exemplos: "Quantos DDS esta semana?", "Treinamentos vencendo?", "Incidentes de seguranca este mes"

3. **planning** - Perguntas sobre planejamento, cronograma, dependencias de tarefas, baselines, previsoes de conclusao, caminho critico, sprints.
   Exemplos: "Qual a previsao de conclusao?", "Tarefas no caminho critico?", "Progresso do cronograma"

4. **workforce** - Perguntas sobre equipes, alocacao de pessoal, efetivo diario, funcionarios, carga de trabalho, escalas.
   Exemplos: "Qual equipe esta sobrecarregada?", "Quantos funcionarios no Projeto X?", "Efetivo de hoje"

5. **quality** - Perguntas sobre qualidade, nao-conformidades, checklists, regras de ouro, compliance, auditorias.
   Exemplos: "Padrao de nao-conformidades?", "Compliance de checklists?", "Regras de ouro violadas"

6. **schedule_manager** - Perguntas sobre gestao avancada de cronograma, produtividade (SPI/CPI), impacto climatico, tarefas sem sucesso, analise cruzada de dados, RCC (Relatorio de Cronograma Critico), trabalhadores ociosos, correlacao clima-produtividade, progresso por area/campo, gargalos e riscos.
   Exemplos: "Gere um RCC", "Como esta a produtividade?", "Impacto da chuva", "Tarefas sem sucesso", "Quem esta ocioso?", "Quais os riscos?", "Area mais atrasada", "Relatorio critico"

7. **general** - Perguntas genericas, saudacoes, ou que nao se encaixam em nenhum dominio acima.
   Exemplos: "Ola", "O que voce pode fazer?", "Ajuda"

## Resposta

Retorne um JSON com:
- domain: string (um dos dominios acima)
- confidence: number (0 a 1, quao certo voce esta)
- reasoning: string (breve explicacao em portugues, 1 frase)
`;

/**
 * AgentRouterService - Classificador de intencao
 */
export class AgentRouterService {
  /**
   * Classifica a mensagem do usuario em um dominio de agente
   */
  static async classify(message: string): Promise<RouterResult> {
    try {
      const result = await claudeJsonCompletion<RouterResult>({
        system: ROUTER_SYSTEM_PROMPT,
        userMessage: message,
        temperature: 0.1,
        maxTokens: 200,
        model: config.claude.routerModel,
      });

      logger.info({ message: message.slice(0, 100), domain: result.domain, confidence: result.confidence }, 'Router classified message');

      return {
        domain: result.domain || 'general',
        confidence: result.confidence || 0.5,
        reasoning: result.reasoning || '',
      };
    } catch (error) {
      logger.error({ error }, 'Erro no AgentRouter');
      return {
        domain: 'general',
        confidence: 0,
        reasoning: 'Fallback - erro na classificacao',
      };
    }
  }
}

export default AgentRouterService;
