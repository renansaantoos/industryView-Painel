// =============================================================================
// INDUSTRYVIEW BACKEND - Agents Module Controller
// Controller do modulo de agentes de IA
// Equivalente aos endpoints do Xano em apis/agent_task_queries/ e apis/agente_ia/
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { AgentsService } from './agents.service';
import { InterpretingAgentService } from './interpreting-agent.service';
import { ResponseGeneratorService } from './response-generator.service';
import {
  projectsAgentSearchSchema,
  invokeInterpretingAgentSchema,
  invokeGeneratorResponseAgentSchema,
  createAgentDashboardLogSchema,
  listAgentDashboardLogsSchema,
} from './agents.schema';

/**
 * AgentsController - Controller do modulo de agentes de IA
 */
export class AgentsController {
  // ===========================================================================
  // Projects Agent Search
  // ===========================================================================

  /**
   * Busca de projetos via agente de IA
   * Equivalente a: query "projetcs/agent/search" verb=POST do Xano
   * Route: POST /api/v1/agents/projects/search
   */
  static async projectsAgentSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const input = projectsAgentSearchSchema.parse(req.body);
      // @ts-ignore - req.user vem do middleware de autenticacao
      const userId = req.user?.id;
      // @ts-ignore - company_id SEMPRE vem do usuario autenticado
      const companyId = req.user?.companyId;
      const result = await AgentsService.projectsAgentSearch(input, userId, companyId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Relatorios Evolucao Agent
  // ===========================================================================

  /**
   * Agente de relatorios de evolucao
   * Equivalente a: query Agente_IA_tarefas verb=GET do Xano
   * Route: GET /api/v1/agents/relatorios-evolucao
   */
  static async relatoriosEvolucaoAgent(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AgentsService.relatoriosEvolucaoAgent();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Direct Agent Invocations (para testes e uso direto)
  // ===========================================================================

  /**
   * Invoca InterpretingAgent diretamente
   * Route: POST /api/v1/agents/interpret
   */
  static async invokeInterpretingAgent(req: Request, res: Response, next: NextFunction) {
    try {
      const input = invokeInterpretingAgentSchema.parse(req.body);
      const result = await InterpretingAgentService.interpret(input.question);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Invoca GeneratorResponseAgent diretamente
   * Route: POST /api/v1/agents/generate-response
   */
  static async invokeGeneratorResponseAgent(req: Request, res: Response, next: NextFunction) {
    try {
      const input = invokeGeneratorResponseAgentSchema.parse(req.body);
      const result = await ResponseGeneratorService.generate({
        question: input.question,
        data: input.data,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Agent Dashboard Logs
  // ===========================================================================

  /**
   * Lista logs de interacao com agente
   * Route: GET /api/v1/agents/logs
   */
  static async listAgentDashboardLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const input = listAgentDashboardLogsSchema.parse(req.query);
      const result = await AgentsService.listAgentDashboardLogs(input);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cria log de interacao com agente
   * Route: POST /api/v1/agents/logs
   */
  static async createAgentDashboardLog(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createAgentDashboardLogSchema.parse(req.body);
      const result = await AgentsService.createAgentDashboardLog(input);
      res.status(201).json({ success: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca log por ID
   * Route: GET /api/v1/agents/logs/:log_id
   */
  static async getAgentDashboardLogById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { log_id } = req.params;
      const result = await AgentsService.getAgentDashboardLogById(log_id);
      if (!result) {
        res.status(404).json({ error: 'Log nao encontrado' });
        return;
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deleta log
   * Route: DELETE /api/v1/agents/logs/:log_id
   */
  static async deleteAgentDashboardLog(req: Request, res: Response, next: NextFunction) {
    try {
      const { log_id } = req.params;
      const result = await AgentsService.deleteAgentDashboardLog(log_id);
      res.json({ success: result });
    } catch (error) {
      next(error);
    }
  }
}

export default AgentsController;
