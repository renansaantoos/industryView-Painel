import { z } from 'zod';

export const createScheduleSchema = z.object({
  teams_id: z.coerce.number().int().positive(),
  projects_id: z.coerce.number().int().positive(),
  schedule_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato esperado: YYYY-MM-DD'),
  users_id: z.array(z.coerce.number().int().positive()).min(1),
  sprints_id: z.coerce.number().int().positive().optional().nullable(),
});

export const listScheduleSchema = z.object({
  projects_id: z.coerce.number().int().positive(),
  teams_id: z.coerce.number().int().positive(),
});

export const updateScheduleSchema = z.object({
  users_id: z.array(z.coerce.number().int().positive()).min(1),
});
