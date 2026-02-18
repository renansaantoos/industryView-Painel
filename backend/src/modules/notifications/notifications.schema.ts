// =============================================================================
// INDUSTRYVIEW BACKEND - Notifications Module Schema
// Schemas de validacao do modulo de notificacoes
// =============================================================================

import { z } from 'zod';

export const listNotificationsSchema = z.object({
  is_read: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const getNotificationByIdSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export const createNotificationSchema = z.object({
  users_id: z.coerce.number().int().min(1, 'users_id e obrigatorio'),
  title: z.string().trim().min(1, 'title e obrigatorio'),
  message: z.string().trim().min(1, 'message e obrigatorio'),
  notification_type: z.string().trim().optional().default('info'),
  reference_type: z.string().trim().optional(),
  reference_id: z.coerce.number().int().optional(),
});

// =============================================================================
// Type Exports
// =============================================================================

export type ListNotificationsInput = z.infer<typeof listNotificationsSchema>;
export type GetNotificationByIdInput = z.infer<typeof getNotificationByIdSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
