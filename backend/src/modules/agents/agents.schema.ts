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
