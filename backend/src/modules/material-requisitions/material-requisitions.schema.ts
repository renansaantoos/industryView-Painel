// =============================================================================
// INDUSTRYVIEW BACKEND - Material Requisitions Module Schema
// Schemas de validacao do modulo de requisicoes de materiais
// =============================================================================

import { z } from 'zod';

// =============================================================================
// Requisitions Schemas
// =============================================================================

export const listRequisitionsSchema = z.object({
  projects_id: z.coerce.number().int().optional(),
  company_id: z.coerce.number().int().optional(),
  status: z.string().trim().optional(),
  requested_by_users_id: z.coerce.number().int().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const getRequisitionByIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});

const requisitionItemSchema = z.object({
  description: z.string().trim().min(1, 'description do item e obrigatorio'),
  unit: z.string().trim().optional(),
  quantity_requested: z.coerce.number().min(0.01),
  unit_price_estimate: z.coerce.number().min(0).optional(),
  notes: z.string().trim().optional(),
});

export const createRequisitionSchema = z.object({
  projects_id: z.coerce.number().int().min(1, 'projects_id e obrigatorio'),
  title: z.string().trim().min(1, 'title e obrigatorio'),
  required_by_date: z.string().optional(),
  notes: z.string().trim().optional(),
  priority: z.enum(['baixa', 'normal', 'urgente']).optional().default('normal'),
  items: z.array(requisitionItemSchema).min(1, 'Pelo menos um item e obrigatorio'),
});

export const updateRequisitionSchema = z.object({
  title: z.string().trim().min(1).optional(),
  required_by_date: z.string().optional(),
  notes: z.string().trim().optional(),
  priority: z.enum(['baixa', 'normal', 'urgente']).optional(),
  items: z.array(requisitionItemSchema).optional(),
});

export const submitRequisitionSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const approveRequisitionSchema = z.object({
  id: z.coerce.number().int().min(1),
  notes: z.string().trim().optional(),
});

export const rejectRequisitionSchema = z.object({
  id: z.coerce.number().int().min(1),
  reason: z.string().trim().min(1, 'reason e obrigatorio para rejeitar uma requisicao'),
});

// =============================================================================
// Type Exports
// =============================================================================

export type ListRequisitionsInput = z.infer<typeof listRequisitionsSchema>;
export type GetRequisitionByIdInput = z.infer<typeof getRequisitionByIdSchema>;
export type CreateRequisitionInput = z.infer<typeof createRequisitionSchema>;
export type UpdateRequisitionInput = z.infer<typeof updateRequisitionSchema>;
export type SubmitRequisitionInput = z.infer<typeof submitRequisitionSchema>;
export type ApproveRequisitionInput = z.infer<typeof approveRequisitionSchema>;
export type RejectRequisitionInput = z.infer<typeof rejectRequisitionSchema>;
