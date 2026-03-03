// =============================================================================
// INDUSTRYVIEW BACKEND - Agents Module Schema
// Schemas de validacao do modulo de agentes de IA
// Equivalente aos agents do Xano
// =============================================================================

import { z } from 'zod';

// =============================================================================
// Query Schema (output do InterpretingAgent)
// =============================================================================

export const queryObjectSchema = z.object({
  field: z.string().trim().optional(),
  operator: z.string().trim().optional(),
  value: z.string().trim().optional(),
  project_id: z.string().trim().optional(),
  project_name: z.string().trim().optional(),
  project_number: z.string().trim().optional(),
});

// =============================================================================
// Interpreting Agent Schemas
// =============================================================================

/**
 * Schema de resposta do InterpretingAgent
 * Equivalente ao output do agent InterpretingAgent do Xano
 */
export const interpretingAgentResponseSchema = z.object({
  is_about_projects: z.boolean(),
  is_about_delayed_tasks: z.boolean().optional(),
  is_about_structure: z.boolean().optional(),
  requested_info: z.string().trim().optional(),
  query: queryObjectSchema.optional(),
  error: z.string().trim().nullable().optional(),
});

/**
 * Schema para invocar InterpretingAgent
 */
export const invokeInterpretingAgentSchema = z.object({
  question: z.string().trim().min(1, 'Pergunta e obrigatoria'),
});

// =============================================================================
// Generator Response Agent Schemas
// =============================================================================

/**
 * Schema de resposta do GeneratorResponseAgent
 * Equivalente ao output do agent GeneratorResponseAgent do Xano
 */
export const generatorResponseAgentResponseSchema = z.object({
  response: z.string().trim().optional(),
});

/**
 * Schema para invocar GeneratorResponseAgent
 */
export const invokeGeneratorResponseAgentSchema = z.object({
  question: z.string().trim(),
  data: z.any(),
});

// =============================================================================
// Agent Task Queries Schemas
// =============================================================================

/**
 * Schema para busca de projetos via agente
 * Equivalente a: query projetcs_agent_search verb=POST do Xano
 */
export const projectsAgentSearchSchema = z.object({
  question: z.string().trim().min(1, 'Pergunta e obrigatoria'),
  user_id: z.coerce.number().int().optional(),
});

// =============================================================================
// Agent Dashboard Log Schemas
// =============================================================================

/**
 * Schema para criar log de interacao com agente
 */
export const createAgentDashboardLogSchema = z.object({
  user_id: z.coerce.number().int(),
  question: z.string().trim(),
  response: z.string().trim(),
  intent_data: z.string().optional(),
  object_answer: z.any().optional(),
});

/**
 * Schema para listar logs
 */
export const listAgentDashboardLogsSchema = z.object({
  user_id: z.coerce.number().int().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

// =============================================================================
// Relatorios Evolucao Agent Schemas
// =============================================================================

/**
 * Schema para agente de relatorios de evolucao
 * Equivalente ao agent "relatorios evolucao" do Xano
 */
export const relatoriosEvolucaoAgentSchema = z.object({
  // Este agente nao recebe input, apenas executa
});

// =============================================================================
// Weight Calculator Agent Schemas
// =============================================================================

/**
 * Schema para calculo de pesos via IA
 */
export const calculateWeightsSchema = z.object({
  projects_backlogs_id: z.coerce.number().int().positive('ID do backlog e obrigatorio'),
});

export type CalculateWeightsInput = z.infer<typeof calculateWeightsSchema>;

/**
 * Schema para aplicar pesos calculados
 */
export const applyWeightsSchema = z.object({
  weights: z.array(z.object({
    subtask_id: z.number().int().positive(),
    weight: z.number().min(0).max(1),
  })),
});

export type ApplyWeightsInput = z.infer<typeof applyWeightsSchema>;

// =============================================================================
// Chat Schemas
// =============================================================================

/**
 * Schema para mensagem de chat unificado
 */
export const chatMessageSchema = z.object({
  message: z.string().trim().min(1, 'Mensagem e obrigatoria'),
  context: z.object({
    project_id: z.coerce.number().int().optional(),
    domain: z.enum(['executive', 'safety', 'planning', 'workforce', 'quality', 'general']).optional(),
  }).optional(),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

/**
 * Schema de resposta do chat
 */
export const chatResponseSchema = z.object({
  response: z.string(),
  domain: z.string(),
  confidence: z.number(),
  metadata: z.object({
    agent: z.string(),
    processing_time_ms: z.number(),
  }),
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;

// =============================================================================
// Type Exports
// =============================================================================

export type QueryObject = z.infer<typeof queryObjectSchema>;
export type InterpretingAgentResponse = z.infer<typeof interpretingAgentResponseSchema>;
export type InvokeInterpretingAgentInput = z.infer<typeof invokeInterpretingAgentSchema>;
export type GeneratorResponseAgentResponse = z.infer<typeof generatorResponseAgentResponseSchema>;
export type InvokeGeneratorResponseAgentInput = z.infer<typeof invokeGeneratorResponseAgentSchema>;
export type ProjectsAgentSearchInput = z.infer<typeof projectsAgentSearchSchema>;
export type CreateAgentDashboardLogInput = z.infer<typeof createAgentDashboardLogSchema>;
export type ListAgentDashboardLogsInput = z.infer<typeof listAgentDashboardLogsSchema>;
