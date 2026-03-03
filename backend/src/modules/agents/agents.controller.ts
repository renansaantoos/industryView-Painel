// =============================================================================
// INDUSTRYVIEW BACKEND - Agents Module Controller
// Controller do modulo de agentes de IA
// Equivalente aos endpoints do Xano em apis/agent_task_queries/ e apis/agente_ia/
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { AgentsService } from './agents.service';
import { InterpretingAgentService } from './interpreting-agent.service';
import { ResponseGeneratorService } from './response-generator.service';
import { WeightCalculatorAgentService } from './weight-calculator-agent.service';
import { db } from '../../config/database';
import { ChatService } from './chat.service';
import {
  projectsAgentSearchSchema,
  invokeInterpretingAgentSchema,
  invokeGeneratorResponseAgentSchema,
  createAgentDashboardLogSchema,
  listAgentDashboardLogsSchema,
  calculateWeightsSchema,
  applyWeightsSchema,
  chatMessageSchema,
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

  // ===========================================================================
  // Chat Unificado
  // ===========================================================================

  /**
   * Chat unificado com roteamento inteligente
   * Route: POST /api/v1/agents/chat
   */
  static async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const input = chatMessageSchema.parse(req.body);
      // @ts-ignore - company_id vem do usuario autenticado
      const companyId = req.user?.companyId;
      const result = await ChatService.processMessage(input, companyId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // Weight Calculator Agent
  // ===========================================================================

  /**
   * Calcula pesos de subtasks via IA
   * Route: POST /api/v1/agents/calculate-weights
   */
  static async calculateWeights(req: Request, res: Response, next: NextFunction) {
    try {
      const input = calculateWeightsSchema.parse(req.body);

      // Busca subtasks do backlog com dados necessarios
      const subtasks = await db.subtasks.findMany({
        where: {
          projects_backlogs_id: BigInt(input.projects_backlogs_id),
          deleted_at: null,
        },
        include: {
          unity: true,
        },
      });

      if (subtasks.length === 0) {
        res.status(400).json({ error: 'Nenhuma subtask encontrada para este item do cronograma.' });
        return;
      }

      // Busca disciplina do backlog pai
      const backlog = await db.projects_backlogs.findFirst({
        where: { id: BigInt(input.projects_backlogs_id), deleted_at: null },
        include: { discipline: true },
      });

      // Prepara input para o agente
      const subtaskInputs = subtasks.map((s) => ({
        id: Number(s.id),
        description: s.description || 'Sem descricao',
        quantity: s.quantity ? Number(s.quantity) : null,
        unity: s.unity?.unity || null,
        discipline: backlog?.discipline?.discipline || null,
      }));

      // Chama o agente de IA
      const weights = await WeightCalculatorAgentService.calculateWeights(subtaskInputs);

      res.json({ weights });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Aplica pesos calculados nas subtasks
   * Route: POST /api/v1/agents/apply-weights
   */
  static async applyWeights(req: Request, res: Response, next: NextFunction) {
    try {
      const input = applyWeightsSchema.parse(req.body);

      // Atualiza peso de cada subtask
      for (const w of input.weights) {
        await db.subtasks.update({
          where: { id: BigInt(w.subtask_id) },
          data: { weight: w.weight, updated_at: new Date() },
        });
      }

      // Busca o backlog_id da primeira subtask para disparar rollup
      if (input.weights.length > 0) {
        const firstSubtask = await db.subtasks.findFirst({
          where: { id: BigInt(input.weights[0].subtask_id) },
          select: { projects_backlogs_id: true },
        });

        if (firstSubtask?.projects_backlogs_id) {
          const { ProgressRollupService } = await import('../../services/progressRollup');
          await ProgressRollupService.rollupBacklog(Number(firstSubtask.projects_backlogs_id));
        }
      }

      res.json({ success: true, updated: input.weights.length });
    } catch (error) {
      next(error);
    }
  }
}

export default AgentsController;
