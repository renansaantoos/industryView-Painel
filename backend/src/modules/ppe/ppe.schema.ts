// =============================================================================
// INDUSTRYVIEW BACKEND - PPE Module Schema
// Schemas de validacao do modulo de EPIs (Equipamentos de Protecao Individual)
// =============================================================================

import { z } from 'zod';

// =============================================================================
// PPE Types Schemas
// =============================================================================

export const listPpeTypesSchema = z.object({
  company_id: z.coerce.number().int().optional(),
});

export const getPpeTypeByIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const createPpeTypeSchema = z.object({
  company_id: z.coerce.number().int().min(1, 'company_id e obrigatorio'),
  name: z.string().trim().min(1, 'name e obrigatorio'),
  description: z.string().trim().optional(),
  ca_number: z.string().trim().optional(),
  validity_months: z.coerce.number().int().min(1).optional(),
  is_active: z.boolean().optional().default(true),
});

export const updatePpeTypeSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  ca_number: z.string().trim().optional(),
  validity_months: z.coerce.number().int().min(1).optional(),
  is_active: z.boolean().optional(),
});

// =============================================================================
// PPE Deliveries Schemas
// =============================================================================

export const listDeliveriesSchema = z.object({
  users_id: z.coerce.number().int().optional(),
  ppe_types_id: z.coerce.number().int().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const getDeliveryByIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const createDeliverySchema = z.object({
  users_id: z.coerce.number().int().min(1, 'users_id e obrigatorio'),
  ppe_types_id: z.coerce.number().int().min(1, 'ppe_types_id e obrigatorio'),
  quantity: z.coerce.number().int().min(1).default(1),
  delivered_at: z.string().optional(),
  delivered_by_users_id: z.coerce.number().int().optional(),
  batch_number: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const registerReturnSchema = z.object({
  id: z.coerce.number().int().min(1),
  condition: z.enum(['bom', 'danificado', 'descartado']).optional().default('bom'),
  returned_at: z.string().optional(),
  notes: z.string().trim().optional(),
});

// =============================================================================
// Task Required PPE Schemas
// =============================================================================

export const listTaskRequiredPpeSchema = z.object({
  tasks_id: z.coerce.number().int().optional(),
  ppe_types_id: z.coerce.number().int().optional(),
});

export const createTaskRequiredPpeSchema = z.object({
  tasks_id: z.coerce.number().int().min(1, 'tasks_id e obrigatorio'),
  ppe_types_id: z.coerce.number().int().min(1, 'ppe_types_id e obrigatorio'),
  is_mandatory: z.boolean().optional().default(true),
});

export const deleteTaskRequiredPpeSchema = z.object({
  id: z.coerce.number().int().min(1),
});

// =============================================================================
// User PPE Status Schema
// =============================================================================

export const getUserPpeStatusSchema = z.object({
  user_id: z.coerce.number().int().min(1),
});

// =============================================================================
// Type Exports
// =============================================================================

export type ListPpeTypesInput = z.infer<typeof listPpeTypesSchema>;
export type GetPpeTypeByIdInput = z.infer<typeof getPpeTypeByIdSchema>;
export type CreatePpeTypeInput = z.infer<typeof createPpeTypeSchema>;
export type UpdatePpeTypeInput = z.infer<typeof updatePpeTypeSchema>;
export type ListDeliveriesInput = z.infer<typeof listDeliveriesSchema>;
export type GetDeliveryByIdInput = z.infer<typeof getDeliveryByIdSchema>;
export type CreateDeliveryInput = z.infer<typeof createDeliverySchema>;
export type RegisterReturnInput = z.infer<typeof registerReturnSchema>;
export type ListTaskRequiredPpeInput = z.infer<typeof listTaskRequiredPpeSchema>;
export type CreateTaskRequiredPpeInput = z.infer<typeof createTaskRequiredPpeSchema>;
export type DeleteTaskRequiredPpeInput = z.infer<typeof deleteTaskRequiredPpeSchema>;
export type GetUserPpeStatusInput = z.infer<typeof getUserPpeStatusSchema>;
