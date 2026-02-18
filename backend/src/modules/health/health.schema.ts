// =============================================================================
// INDUSTRYVIEW BACKEND - Health Module Schema
// Schemas de validacao do modulo de saude ocupacional
// enum health_exam_type: admissional, periodico, retorno_trabalho, mudanca_funcao, demissional
// =============================================================================

import { z } from 'zod';

const HEALTH_EXAM_TYPES = [
  'admissional',
  'periodico',
  'retorno_trabalho',
  'mudanca_funcao',
  'demissional',
] as const;

// =============================================================================
// Health Records Schemas
// =============================================================================

export const listHealthRecordsSchema = z.object({
  users_id: z.coerce.number().int().optional(),
  company_id: z.coerce.number().int().optional(),
  exam_type: z.enum(HEALTH_EXAM_TYPES).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const getExpiringExamsSchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional().default(30),
});

export const getHealthRecordByIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const createHealthRecordSchema = z.object({
  users_id: z.coerce.number().int().min(1, 'users_id e obrigatorio'),
  exam_type: z.enum(HEALTH_EXAM_TYPES, {
    errorMap: () => ({ message: `exam_type deve ser um de: ${HEALTH_EXAM_TYPES.join(', ')}` }),
  }),
  exam_date: z.string().min(1, 'exam_date e obrigatorio'),
  expiry_date: z.string().optional(),
  result: z.string().trim().optional().default('apto'),
  restrictions: z.string().trim().optional(),
  physician_name: z.string().trim().optional(),
  physician_crm: z.string().trim().optional(),
  file_url: z.string().trim().optional(),
});

export const updateHealthRecordSchema = z.object({
  exam_type: z.enum(HEALTH_EXAM_TYPES).optional(),
  exam_date: z.string().optional(),
  expiry_date: z.string().optional(),
  result: z.string().trim().optional(),
  restrictions: z.string().trim().optional(),
  physician_name: z.string().trim().optional(),
  physician_crm: z.string().trim().optional(),
  file_url: z.string().trim().optional(),
});

export const checkWorkerFitnessSchema = z.object({
  user_id: z.coerce.number().int().min(1),
});

// =============================================================================
// Type Exports
// =============================================================================

export type ListHealthRecordsInput = z.infer<typeof listHealthRecordsSchema>;
export type GetExpiringExamsInput = z.infer<typeof getExpiringExamsSchema>;
export type GetHealthRecordByIdInput = z.infer<typeof getHealthRecordByIdSchema>;
export type CreateHealthRecordInput = z.infer<typeof createHealthRecordSchema>;
export type UpdateHealthRecordInput = z.infer<typeof updateHealthRecordSchema>;
export type CheckWorkerFitnessInput = z.infer<typeof checkWorkerFitnessSchema>;
