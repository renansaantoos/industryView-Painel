// =============================================================================
// INDUSTRYVIEW BACKEND - Schedule Import Schemas
// Schemas de validacao para importacao de cronograma
// Suporta: .xlsx, .xls, .csv, .xml (MS Project)
// =============================================================================

import { z } from 'zod';

// =============================================================================
// UPLOAD / PROCESS IMPORT
// =============================================================================

/**
 * Schema para validacao dos campos do form de upload
 * Usado no controller para validar campos de texto do multipart/form-data
 */
export const uploadScheduleSchema = z.object({
  projects_id: z
    .string({ required_error: 'projects_id e obrigatorio' })
    .transform(Number)
    .pipe(z.number().int().positive('projects_id deve ser um numero positivo')),
  import_mode: z.enum(['create', 'update', 'replace'], {
    required_error: 'import_mode e obrigatorio',
    invalid_type_error: 'import_mode deve ser create, update ou replace',
  }),
  // column_mapping opcional - JSON string com mapeamento de colunas
  column_mapping: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return undefined;
      try {
        return JSON.parse(val) as Record<string, string>;
      } catch {
        return undefined;
      }
    }),
});

export type UploadScheduleInput = z.infer<typeof uploadScheduleSchema>;

// =============================================================================
// CONFIRM IMPORT
// =============================================================================

/**
 * Schema para params do endpoint de confirmacao de importacao
 */
export const confirmImportSchema = z.object({
  id: z.string().transform(Number).pipe(z.number().int().positive()),
});

export type ConfirmImportParams = z.infer<typeof confirmImportSchema>;

// =============================================================================
// HISTORY QUERY
// =============================================================================

/**
 * Schema para query string do historico de importacoes
 */
export const historyQuerySchema = z.object({
  projects_id: z
    .string({ required_error: 'projects_id e obrigatorio' })
    .transform(Number)
    .pipe(z.number().int().positive('projects_id deve ser um numero positivo')),
});

export type HistoryQuery = z.infer<typeof historyQuerySchema>;

// =============================================================================
// TEMPLATE QUERY
// =============================================================================

/**
 * Schema para download de template
 */
export const templateQuerySchema = z.object({
  format: z.enum(['xlsx', 'csv']).default('xlsx'),
});

export type TemplateQuery = z.infer<typeof templateQuerySchema>;
