// =============================================================================
// INDUSTRYVIEW BACKEND - Chat Service (Orchestrator)
// Recebe mensagem -> classifica via Router -> despacha para agente correto
// =============================================================================

import { AgentRouterService, AgentDomain } from './agent-router.service';
import { ExecutiveAgentService } from './executive-agent.service';
import { SafetyAgentService } from './safety-agent.service';
import { PlanningAgentService } from './planning-agent.service';
import { WorkforceAgentService } from './workforce-agent.service';
import { QualityAgentService } from './quality-agent.service';
import { ScheduleManagerAgentService } from './schedule-manager-agent.service';
import { claudeTextCompletion } from '../../services/claude-client';
import { ChatMessageInput, ChatResponse } from './agents.schema';
import { logger } from '../../utils/logger';

const GENERAL_SYSTEM_PROMPT = `
Voce e o assistente de IA do IndustryView, uma plataforma de gestao de projetos industriais.
Responda de forma amigavel e profissional em portugues.
Se o usuario perguntar o que voce pode fazer, liste suas capacidades:
- Visao executiva de projetos (status, progresso, KPIs)
- Seguranca do trabalho (SSMA - incidentes, treinamentos, DDS, EPIs)
- Planejamento e cronograma (sprints, tarefas, previsoes)
- Gestao de equipes (efetivo, alocacao, carga de trabalho)
- Qualidade e conformidade (nao-conformidades, checklists, regras de ouro)
- Gerente de Cronograma (produtividade, RCC, impacto climatico, tarefas sem sucesso, riscos)
`;

/**
 * ChatService - Orquestrador de chat unificado
 */
export class ChatService {
  /**
   * Processa uma mensagem de chat
   */
  static async processMessage(
    input: ChatMessageInput,
    companyId?: number
  ): Promise<ChatResponse> {
    const startTime = Date.now();

    try {
      // 1. Classifica a intencao (usa dominio forcado se fornecido)
      let domain: AgentDomain;
      let confidence: number;

      if (input.context?.domain) {
        domain = input.context.domain;
        confidence = 1.0;
      } else {
        const routerResult = await AgentRouterService.classify(input.message);
        domain = routerResult.domain;
        confidence = routerResult.confidence;
      }

      // 2. Despacha para o agente correto
      let response: string;
      let agentName: string;

      switch (domain) {
        case 'executive':
          response = await ExecutiveAgentService.process(input.message, companyId);
          agentName = 'ExecutiveAgent';
          break;

        case 'safety':
          response = await SafetyAgentService.process(input.message, companyId);
          agentName = 'SafetyAgent';
          break;

        case 'planning':
          response = await PlanningAgentService.process(input.message, companyId);
          agentName = 'PlanningAgent';
          break;

        case 'workforce':
          response = await WorkforceAgentService.process(input.message, companyId);
          agentName = 'WorkforceAgent';
          break;

        case 'quality':
          response = await QualityAgentService.process(input.message, companyId);
          agentName = 'QualityAgent';
          break;

        case 'schedule_manager':
          response = await ScheduleManagerAgentService.process(input.message, input.context?.project_id);
          agentName = 'ScheduleManagerAgent';
          break;

        default:
          response = await claudeTextCompletion({
            system: GENERAL_SYSTEM_PROMPT,
            userMessage: input.message,
            temperature: 0.7,
          });
          agentName = 'GeneralAgent';
          break;
      }

      const processingTime = Date.now() - startTime;

      logger.info({
        domain,
        agent: agentName,
        confidence,
        processingTime,
        messagePreview: input.message.slice(0, 100),
      }, 'Chat message processed');

      return {
        response,
        domain,
        confidence,
        metadata: {
          agent: agentName,
          processing_time_ms: processingTime,
        },
      };
    } catch (error) {
      logger.error({ error }, 'Erro no ChatService');
      const processingTime = Date.now() - startTime;

      return {
        response: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        domain: 'general',
        confidence: 0,
        metadata: {
          agent: 'error',
          processing_time_ms: processingTime,
        },
      };
    }
  }
}

export default ChatService;
