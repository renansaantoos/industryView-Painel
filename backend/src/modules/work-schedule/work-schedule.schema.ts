import { z } from 'zod';

const timeStr = z.string().trim().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM').optional();

export const getWorkScheduleSchema = z.object({
  users_id: z.coerce.number().int().min(1),
});

export const upsertWorkScheduleSchema = z.object({
  tolerancia_entrada: z.coerce.number().int().min(0).max(60).optional(),
  intervalo_almoco_min: z.coerce.number().int().min(0).max(120).optional(),
  seg_ativo: z.boolean().optional(),
  seg_entrada: timeStr,
  seg_saida: timeStr,
  ter_ativo: z.boolean().optional(),
  ter_entrada: timeStr,
  ter_saida: timeStr,
  qua_ativo: z.boolean().optional(),
  qua_entrada: timeStr,
  qua_saida: timeStr,
  qui_ativo: z.boolean().optional(),
  qui_entrada: timeStr,
  qui_saida: timeStr,
  sex_ativo: z.boolean().optional(),
  sex_entrada: timeStr,
  sex_saida: timeStr,
  sab_ativo: z.boolean().optional(),
  sab_entrada: timeStr,
  sab_saida: timeStr,
  dom_ativo: z.boolean().optional(),
  dom_entrada: timeStr,
  dom_saida: timeStr,
});

export type GetWorkScheduleInput = z.infer<typeof getWorkScheduleSchema>;
export type UpsertWorkScheduleInput = z.infer<typeof upsertWorkScheduleSchema>;
