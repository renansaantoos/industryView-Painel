// =============================================================================
// INDUSTRYVIEW BACKEND - Contracts Module Schema
// Schemas de validacao do modulo de contratos (Medicoes e Reivindicacoes)
// =============================================================================

import { z } from 'zod';

// =============================================================================
// Measurements Schemas
// =============================================================================

export const listMeasurementsSchema = z.object({
  projects_id: z.coerce.number().int().min(1, 'projects_id e obrigatorio'),
  company_id: z.coerce.number().int().optional(),
  status: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const getMeasurementByIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});

const measurementItemSchema = z.object({
  description: z.string().trim().min(1, 'description do item e obrigatorio'),
  unit: z.string().trim().optional(),
  quantity: z.coerce.number().min(0),
  unit_price: z.coerce.number().min(0),
  notes: z.string().trim().optional(),
});

export const createMeasurementSchema = z.object({
  projects_id: z.coerce.number().int().min(1, 'projects_id e obrigatorio'),
  title: z.string().trim().min(1, 'title e obrigatorio'),
  measurement_date: z.string().min(1, 'measurement_date e obrigatorio'),
  period_start: z.string().optional(),
  period_end: z.string().optional(),
  notes: z.string().trim().optional(),
  items: z.array(measurementItemSchema).min(1, 'Pelo menos um item e obrigatorio'),
});

export const updateMeasurementSchema = z.object({
  title: z.string().trim().min(1).optional(),
  measurement_date: z.string().optional(),
  period_start: z.string().optional(),
  period_end: z.string().optional(),
  notes: z.string().trim().optional(),
  items: z.array(measurementItemSchema).optional(),
});

export const measurementIdParamSchema = z.object({
  id: z.coerce.number().int().min(1),
});

// =============================================================================
// Claims Schemas
// =============================================================================

export const listClaimsSchema = z.object({
  projects_id: z.coerce.number().int().min(1, 'projects_id e obrigatorio'),
  company_id: z.coerce.number().int().optional(),
  status: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const getClaimByIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const createClaimSchema = z.object({
  projects_id: z.coerce.number().int().min(1, 'projects_id e obrigatorio'),
  title: z.string().trim().min(1, 'title e obrigatorio'),
  description: z.string().trim().min(1, 'description e obrigatorio'),
  claim_type: z.string().trim().optional().default('geral'),
  value_requested: z.coerce.number().min(0).optional(),
  occurrence_date: z.string().optional(),
  notes: z.string().trim().optional(),
});

export const updateClaimSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  claim_type: z.string().trim().optional(),
  value_requested: z.coerce.number().min(0).optional(),
  occurrence_date: z.string().optional(),
  notes: z.string().trim().optional(),
});

export const closeClaimSchema = z.object({
  id: z.coerce.number().int().min(1),
  resolution: z.string().trim().min(1, 'resolution e obrigatorio para fechar uma reivindicacao'),
  value_approved: z.coerce.number().min(0).optional(),
  outcome: z.enum(['aprovada', 'negada', 'parcialmente_aprovada']).optional().default('aprovada'),
});

export const addClaimEvidenceSchema = z.object({
  claim_id: z.coerce.number().int().min(1),
  file_url: z.string().trim().min(1, 'file_url e obrigatorio'),
  file_name: z.string().trim().optional(),
  file_type: z.string().trim().optional(),
  description: z.string().trim().optional(),
});

// =============================================================================
// Type Exports
// =============================================================================

export type ListMeasurementsInput = z.infer<typeof listMeasurementsSchema>;
export type GetMeasurementByIdInput = z.infer<typeof getMeasurementByIdSchema>;
export type CreateMeasurementInput = z.infer<typeof createMeasurementSchema>;
export type UpdateMeasurementInput = z.infer<typeof updateMeasurementSchema>;
export type ListClaimsInput = z.infer<typeof listClaimsSchema>;
export type GetClaimByIdInput = z.infer<typeof getClaimByIdSchema>;
export type CreateClaimInput = z.infer<typeof createClaimSchema>;
export type UpdateClaimInput = z.infer<typeof updateClaimSchema>;
export type CloseClaimInput = z.infer<typeof closeClaimSchema>;
export type AddClaimEvidenceInput = z.infer<typeof addClaimEvidenceSchema>;
