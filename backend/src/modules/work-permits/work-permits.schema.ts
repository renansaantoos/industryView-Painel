// =============================================================================
// INDUSTRYVIEW BACKEND - Work Permits Module Schema
// enum permit_type: pt_geral, pt_quente, pt_altura, pt_confinado, pt_eletrica
// enum permit_status: solicitada, aprovada, ativa, encerrada, cancelada
// =============================================================================

import { z } from 'zod';

const PERMIT_TYPES = ['pt_geral', 'pt_quente', 'pt_altura', 'pt_confinado', 'pt_eletrica'] as const;

// =============================================================================
// List / Get Schemas
// =============================================================================

export const listPermitsSchema = z.object({
  projects_id: z.coerce.number().int().optional(),
  company_id: z.coerce.number().int().optional(),
  status: z.string().trim().optional(),
  permit_type: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const getPermitByIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const getActivePermitsSchema = z.object({
  projects_id: z.coerce.number().int().min(1),
});

// =============================================================================
// Create / Update Schemas
// =============================================================================

export const createPermitSchema = z.object({
  projects_id: z.coerce.number().int().min(1, 'projects_id e obrigatorio'),
  permit_type: z.enum(PERMIT_TYPES, {
    errorMap: () => ({ message: `permit_type deve ser um de: ${PERMIT_TYPES.join(', ')}` }),
  }),
  risk_description: z.string().trim().min(1, 'risk_description e obrigatorio'),
  control_measures: z.string().trim().min(1, 'control_measures e obrigatorio'),
  location: z.string().trim().optional(),
  valid_from: z.string().min(1, 'valid_from e obrigatorio'),
  valid_until: z.string().min(1, 'valid_until e obrigatorio'),
  observations: z.string().trim().optional(),
});

export const updatePermitSchema = z.object({
  permit_type: z.enum(PERMIT_TYPES).optional(),
  risk_description: z.string().trim().optional(),
  control_measures: z.string().trim().optional(),
  location: z.string().trim().optional(),
  valid_from: z.string().optional(),
  valid_until: z.string().optional(),
  observations: z.string().trim().optional(),
});

// =============================================================================
// Action Schemas
// =============================================================================

export const approvePermitSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const closePermitSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const cancelPermitSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const addSignatureSchema = z.object({
  permit_id: z.coerce.number().int().min(1),
  user_id: z.coerce.number().int().min(1, 'user_id e obrigatorio'),
  role: z.string().trim().min(1, 'role e obrigatorio'),
});

// =============================================================================
// Type Exports
// =============================================================================

export type ListPermitsInput = z.infer<typeof listPermitsSchema> & { company_id?: number };
export type GetPermitByIdInput = z.infer<typeof getPermitByIdSchema>;
export type GetActivePermitsInput = z.infer<typeof getActivePermitsSchema>;
export type CreatePermitInput = z.infer<typeof createPermitSchema>;
export type UpdatePermitInput = z.infer<typeof updatePermitSchema>;
export type ApprovePermitInput = z.infer<typeof approvePermitSchema>;
export type ClosePermitInput = z.infer<typeof closePermitSchema>;
export type CancelPermitInput = z.infer<typeof cancelPermitSchema>;
export type AddSignatureInput = z.infer<typeof addSignatureSchema>;
