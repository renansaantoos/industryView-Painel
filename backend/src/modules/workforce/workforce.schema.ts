// =============================================================================
// INDUSTRYVIEW BACKEND - Workforce Module Schema
// Schemas de validacao do modulo de mao de obra / presenca diaria
// Tabela: workforce_daily_log (singular)
// =============================================================================

import { z } from 'zod';

// =============================================================================
// Daily Logs Schemas
// =============================================================================

export const listDailyLogsSchema = z.object({
  projects_id: z.coerce.number().int().optional(),
  teams_id: z.coerce.number().int().optional(),
  users_id: z.coerce.number().int().optional(),
  company_id: z.coerce.number().int().optional(),
  date: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const getDailyLogByIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const createDailyLogSchema = z.object({
  projects_id: z.coerce.number().int().optional(),
  users_id: z.coerce.number().int().min(1, 'users_id e obrigatorio'),
  teams_id: z.coerce.number().int().optional(),
  log_date: z.string().min(1, 'log_date e obrigatorio'),
  status: z.string().trim().optional().default('presente'),
  hours_normal: z.coerce.number().min(0).max(24).optional().default(0),
  hours_overtime: z.coerce.number().min(0).max(24).optional().default(0),
  check_in: z.string().optional(),
  check_out: z.string().optional(),
  observation: z.string().optional(),
});

export const updateDailyLogSchema = z.object({
  teams_id: z.coerce.number().int().optional(),
  log_date: z.string().optional(),
  status: z.string().trim().optional(),
  hours_normal: z.coerce.number().min(0).max(24).optional(),
  hours_overtime: z.coerce.number().min(0).max(24).optional(),
  check_in: z.string().optional(),
  check_out: z.string().optional(),
  observation: z.string().optional(),
});

// =============================================================================
// Histogram Schema
// =============================================================================

export const getHistogramSchema = z.object({
  projects_id: z.coerce.number().int().min(1, 'projects_id e obrigatorio'),
  start_date: z.string().min(1, 'start_date e obrigatorio'),
  end_date: z.string().min(1, 'end_date e obrigatorio'),
});

// =============================================================================
// Check-in / Check-out Schemas
// =============================================================================

export const checkInSchema = z.object({
  projects_id: z.coerce.number().int().optional(),
  users_id: z.coerce.number().int().min(1, 'users_id e obrigatorio'),
  teams_id: z.coerce.number().int().optional(),
});

export const checkOutSchema = z.object({
  id: z.coerce.number().int().min(1),
});

// =============================================================================
// Type Exports
// =============================================================================

export type ListDailyLogsInput = z.infer<typeof listDailyLogsSchema>;
export type GetDailyLogByIdInput = z.infer<typeof getDailyLogByIdSchema>;
export type CreateDailyLogInput = z.infer<typeof createDailyLogSchema>;
export type UpdateDailyLogInput = z.infer<typeof updateDailyLogSchema>;
export type GetHistogramInput = z.infer<typeof getHistogramSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;
