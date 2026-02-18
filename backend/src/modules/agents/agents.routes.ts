// =============================================================================
// INDUSTRYVIEW BACKEND - Agents Module Routes
// Rotas do modulo de agentes de IA
// Equivalente aos endpoints do Xano em apis/agent_task_queries/ e apis/agente_ia/
// =============================================================================

import { Router } from 'express';
import { AgentsController } from './agents.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// ===========================================================================
// Projects Agent Search Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/agents/projects/search:
 *   post:
 *     summary: Busca de projetos via agente de IA
 *     description: |
 *       Endpoint principal que:
 *       1. Interpreta a pergunta com InterpretingAgent
 *       2. Busca dados relevantes no banco
 *       3. Gera resposta humanizada com GeneratorResponseAgent
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *             properties:
 *               question:
 *                 type: string
 *                 description: Pergunta em linguagem natural
 *                 example: "Quais sao os projetos do responsavel Joao?"
 *     responses:
 *       200:
 *         description: Resposta do agente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 InterpretingAgent1:
 *                   type: object
 *                   properties:
 *                     response:
 *                       type: object
 *                       properties:
 *                         result:
 *                           type: object
 *                           properties:
 *                             response:
 *                               type: string
 */
router.post('/projects/search', authenticate, AgentsController.projectsAgentSearch);

// ===========================================================================
// Relatorios Evolucao Agent Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/agents/relatorios-evolucao:
 *   get:
 *     summary: Agente de relatorios de evolucao
 *     description: Busca tarefas atrasadas e gera relatorio com IA
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Relatorio gerado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 saida:
 *                   type: string
 */
router.get('/relatorios-evolucao', authenticate, AgentsController.relatoriosEvolucaoAgent);

// ===========================================================================
// Direct Agent Invocation Routes (para testes)
// ===========================================================================

/**
 * @swagger
 * /api/v1/agents/interpret:
 *   post:
 *     summary: Invoca InterpretingAgent diretamente
 *     description: Interpreta uma pergunta em linguagem natural e retorna objeto estruturado
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *             properties:
 *               question:
 *                 type: string
 *                 example: "Quais projetos estao em Sao Paulo?"
 *     responses:
 *       200:
 *         description: Resultado da interpretacao
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 is_about_projects:
 *                   type: boolean
 *                 is_about_delayed_tasks:
 *                   type: boolean
 *                 is_about_structure:
 *                   type: boolean
 *                 requested_info:
 *                   type: string
 *                 query:
 *                   type: object
 *                 error:
 *                   type: string
 */
router.post('/interpret', authenticate, AgentsController.invokeInterpretingAgent);

/**
 * @swagger
 * /api/v1/agents/generate-response:
 *   post:
 *     summary: Invoca GeneratorResponseAgent diretamente
 *     description: Gera resposta humanizada em Markdown a partir de dados estruturados
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - data
 *             properties:
 *               question:
 *                 type: string
 *                 example: "Quais projetos estao em andamento?"
 *               data:
 *                 type: object
 *                 description: Dados estruturados para gerar resposta
 *     responses:
 *       200:
 *         description: Resposta humanizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 */
router.post('/generate-response', authenticate, AgentsController.invokeGeneratorResponseAgent);

// ===========================================================================
// Agent Dashboard Logs Routes
// ===========================================================================

/**
 * @swagger
 * /api/v1/agents/logs:
 *   get:
 *     summary: Lista logs de interacao com agente
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista paginada de logs
 */
router.get('/logs', authenticate, AgentsController.listAgentDashboardLogs);

/**
 * @swagger
 * /api/v1/agents/logs:
 *   post:
 *     summary: Cria log de interacao com agente
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - question
 *               - response
 *             properties:
 *               user_id:
 *                 type: integer
 *               question:
 *                 type: string
 *               response:
 *                 type: string
 *               intent_data:
 *                 type: string
 *               object_answer:
 *                 type: object
 *     responses:
 *       201:
 *         description: Log criado
 */
router.post('/logs', authenticate, AgentsController.createAgentDashboardLog);

/**
 * @swagger
 * /api/v1/agents/logs/{log_id}:
 *   get:
 *     summary: Busca log por ID
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: log_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Log encontrado
 *       404:
 *         description: Log nao encontrado
 */
router.get('/logs/:log_id', authenticate, AgentsController.getAgentDashboardLogById);

/**
 * @swagger
 * /api/v1/agents/logs/{log_id}:
 *   delete:
 *     summary: Deleta log
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: log_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Log deletado
 */
router.delete('/logs/:log_id', authenticate, AgentsController.deleteAgentDashboardLog);

export { router as agentsRoutes };
export default router;
