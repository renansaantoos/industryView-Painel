// =============================================================================
// INDUSTRYVIEW BACKEND - Audit Module Schema
// Schemas de validacao do modulo de auditoria / logs de acoes
// enum audit_action: create, update, delete, status_change, approval
// =============================================================================

import { z } from 'zod';

// =============================================================================
// List Logs Schema
// =============================================================================

export const listLogsSchema = z.object({
  table_name: z.string().trim().optional(),
  record_id: z.coerce.number().int().optional(),
  users_id: z.coerce.number().int().optional(),
  company_id: z.coerce.number().int().optional(),
  action: z.enum(['create', 'update', 'delete', 'status_change', 'approval']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// =============================================================================
// Get Logs By Record Schema
// =============================================================================

export const getLogsByRecordSchema = z.object({
  table_name: z.string().trim().min(1),
  record_id: z.coerce.number().int().min(1),
});

// =============================================================================
// Type Exports
// =============================================================================

export type ListLogsInput = z.infer<typeof listLogsSchema>;
export type GetLogsByRecordInput = z.infer<typeof getLogsByRecordSchema>;
