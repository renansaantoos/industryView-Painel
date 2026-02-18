// =============================================================================
// INDUSTRYVIEW BACKEND - Commissioning Module Schema
// Schemas de validacao do modulo de comissionamento
// =============================================================================

import { z } from 'zod';

// =============================================================================
// Systems Schemas
// =============================================================================

export const listSystemsSchema = z.object({
  projects_id: z.coerce.number().int().optional(),
  company_id: z.coerce.number().int().optional(),
  status: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const getSystemByIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const createSystemSchema = z.object({
  projects_id: z.coerce.number().int().min(1, 'projects_id e obrigatorio'),
  name: z.string().trim().min(1, 'name (system_name) e obrigatorio'),
  system_code: z.string().trim().optional(),
  description: z.string().trim().optional(),
  planned_completion_date: z.string().optional(),
});

export const updateSystemSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  status: z.string().trim().optional(),
  planned_completion_date: z.string().optional(),
  actual_completion_date: z.string().optional(),
});

// =============================================================================
// Punch List Schemas
// responsible e string (nao FK), priority mapeado de alta/media/baixa para A/B/C
// =============================================================================

export const getPunchListSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const createPunchListItemSchema = z.object({
  system_id: z.coerce.number().int().min(1),
  description: z.string().trim().min(1, 'description e obrigatorio'),
  priority: z.enum(['baixa', 'media', 'alta', 'critica']).optional().default('media'),
  responsible_name: z.string().trim().optional(),
  due_date: z.string().optional(),
});

export const updatePunchListItemSchema = z.object({
  id: z.coerce.number().int().min(1),
  description: z.string().trim().optional(),
  priority: z.enum(['baixa', 'media', 'alta', 'critica']).optional(),
  status: z.string().trim().optional(),
  responsible_name: z.string().trim().optional(),
  due_date: z.string().optional(),
});

// =============================================================================
// Certificates Schemas
// issued_date (nao issued_at na tabela), sem deleted_at
// =============================================================================

export const getCertificatesSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const createCertificateSchema = z.object({
  system_id: z.coerce.number().int().min(1),
  certificate_type: z.string().trim().min(1, 'certificate_type e obrigatorio'),
  certificate_number: z.string().trim().optional(),
  issued_at: z.string().optional(),
  file_url: z.string().trim().optional(),
});

export const updateCertificateSchema = z.object({
  id: z.coerce.number().int().min(1),
  certificate_type: z.string().trim().optional(),
  certificate_number: z.string().trim().optional(),
  status: z.string().trim().optional(),
  issued_at: z.string().optional(),
  file_url: z.string().trim().optional(),
});

// =============================================================================
// Type Exports
// =============================================================================

export type ListSystemsInput = z.infer<typeof listSystemsSchema>;
export type GetSystemByIdInput = z.infer<typeof getSystemByIdSchema>;
export type CreateSystemInput = z.infer<typeof createSystemSchema>;
export type UpdateSystemInput = z.infer<typeof updateSystemSchema>;
export type GetPunchListInput = z.infer<typeof getPunchListSchema>;
export type CreatePunchListItemInput = z.infer<typeof createPunchListItemSchema>;
export type UpdatePunchListItemInput = z.infer<typeof updatePunchListItemSchema>;
export type GetCertificatesInput = z.infer<typeof getCertificatesSchema>;
export type CreateCertificateInput = z.infer<typeof createCertificateSchema>;
export type UpdateCertificateInput = z.infer<typeof updateCertificateSchema>;
