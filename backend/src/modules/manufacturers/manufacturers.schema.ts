// =============================================================================
// INDUSTRYVIEW BACKEND - Manufacturers Schemas
// Schemas de validacao para endpoints de manufacturers
// Equivalente aos input definitions do api_group Manufacturers do Xano
// =============================================================================

import { z } from 'zod';

/**
 * Schema para listagem de fabricantes
 * Equivalente a: query manufacturers verb=GET do Xano (endpoint 422)
 */
export const listManufacturersSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  per_page: z.number().int().positive().max(100).optional().default(20),
  search: z.string().trim().optional(),
  equipaments_types_id: z.number().int().optional(),
});

export type ListManufacturersInput = z.infer<typeof listManufacturersSchema>;

/**
 * Schema para query string de listagem
 */
export const listManufacturersQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default('1'),
  per_page: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional().default('20'),
  search: z.string().trim().optional(),
  equipaments_types_id: z.string().transform(Number).pipe(z.number().int()).optional(),
});

export type ListManufacturersQuery = z.infer<typeof listManufacturersQuerySchema>;

/**
 * Schema para params de fabricante
 */
export const manufacturerParamsSchema = z.object({
  manufacturers_id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type ManufacturerParams = z.infer<typeof manufacturerParamsSchema>;

/**
 * Schema para criacao de fabricante
 * Equivalente a: query manufacturers verb=POST do Xano (endpoint 423)
 */
export const createManufacturerSchema = z.object({
  name: z.string().trim().min(1, 'Nome e obrigatorio'),
  equipaments_types_id: z.number().int().optional().nullable(),
});

export type CreateManufacturerInput = z.infer<typeof createManufacturerSchema>;

/**
 * Schema para atualizacao de fabricante
 * Equivalente a: query manufacturers/{manufacturers_id} verb=PATCH do Xano (endpoint 424)
 */
export const updateManufacturerSchema = z.object({
  name: z.string().trim().optional(),
  equipaments_types_id: z.number().int().optional().nullable(),
  updated_at: z.string().datetime({ local: true, offset: true }).optional().nullable(),
  deleted_at: z.string().datetime({ local: true, offset: true }).optional().nullable(),
});

export type UpdateManufacturerInput = z.infer<typeof updateManufacturerSchema>;
