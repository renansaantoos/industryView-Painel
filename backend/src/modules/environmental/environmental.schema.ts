// =============================================================================
// INDUSTRYVIEW BACKEND - Environmental Module Schema
// Schemas de validacao do modulo de licenciamento ambiental
// enum license_status: vigente, vencida, em_renovacao, cancelada
// =============================================================================

import { z } from 'zod';

// =============================================================================
// Licenses Schemas
// =============================================================================

export const listLicensesSchema = z.object({
  projects_id: z.coerce.number().int().optional(),
  company_id: z.coerce.number().int().optional(),
  status: z.string().trim().optional(),
  license_type: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const getExpiringLicensesSchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional().default(30),
  projects_id: z.coerce.number().int().optional(),
});

export const getLicenseByIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const createLicenseSchema = z.object({
  projects_id: z.coerce.number().int().min(1, 'projects_id e obrigatorio'),
  license_type: z.string().trim().min(1, 'license_type e obrigatorio'),
  license_number: z.string().trim().min(1, 'license_number e obrigatorio'),
  issuing_authority: z.string().trim().optional(),
  issued_at: z.string().optional(),
  expires_at: z.string().optional(),
  file_url: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const updateLicenseSchema = z.object({
  license_type: z.string().trim().optional(),
  license_number: z.string().trim().optional(),
  issuing_authority: z.string().trim().optional(),
  status: z.string().trim().optional(),
  issued_at: z.string().optional(),
  expires_at: z.string().optional(),
  file_url: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

// =============================================================================
// Conditions Schemas
// Tabela environmental_conditions: description, deadline, status (string), evidence_file
// Sem deleted_at, sem condition_type, sem responsible_users_id
// =============================================================================

export const getConditionsSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const createConditionSchema = z.object({
  license_id: z.coerce.number().int().min(1),
  description: z.string().trim().min(1, 'description e obrigatorio'),
  due_date: z.string().optional(),
});

export const updateConditionSchema = z.object({
  id: z.coerce.number().int().min(1),
  description: z.string().trim().optional(),
  status: z.string().trim().optional(),
  due_date: z.string().optional(),
  evidence_file: z.string().trim().optional(),
});

// =============================================================================
// Type Exports
// =============================================================================

export type ListLicensesInput = z.infer<typeof listLicensesSchema>;
export type GetExpiringLicensesInput = z.infer<typeof getExpiringLicensesSchema>;
export type GetLicenseByIdInput = z.infer<typeof getLicenseByIdSchema>;
export type CreateLicenseInput = z.infer<typeof createLicenseSchema>;
export type UpdateLicenseInput = z.infer<typeof updateLicenseSchema>;
export type GetConditionsInput = z.infer<typeof getConditionsSchema>;
export type CreateConditionInput = z.infer<typeof createConditionSchema>;
export type UpdateConditionInput = z.infer<typeof updateConditionSchema>;
