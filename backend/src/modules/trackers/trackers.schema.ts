// =============================================================================
// INDUSTRYVIEW BACKEND - Trackers Module Schema
// Schemas de validacao do modulo de trackers (rastreadores solares)
// Equivalente aos inputs dos endpoints do Xano em apis/trackers/
// =============================================================================

import { z } from 'zod';

// =============================================================================
// Trackers Schemas
// =============================================================================

/**
 * Schema para listagem de trackers com paginacao
 * Equivalente a: query trackers verb=GET do Xano
 */
export const listTrackersSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().trim().optional(),
  company_id: z.coerce.number().int().optional(),
});

/**
 * Schema para listagem de trackers sem paginacao (para dropdowns)
 * Equivalente a: query trackers_0 verb=GET do Xano
 */
export const listAllTrackersSchema = z.object({
  company_id: z.coerce.number().int().optional(),
});

/**
 * Schema para buscar tracker por ID
 * Equivalente a: query "trackers/{trackers_id}" verb=GET do Xano
 */
export const getTrackerByIdSchema = z.object({
  trackers_id: z.coerce.number().int().min(1),
});

/**
 * Schema de estacas para criacao/edicao de tracker
 */
export const stakeOnTrackerSchema = z.object({
  stakes_position: z.string().trim().optional(),
  stakes_is_motor: z.boolean().optional(),
  stakes_types_id: z.coerce.number().int().optional(),
  stakes_statuses_id: z.coerce.number().int().optional(),
  stakes_id: z.coerce.number().int().optional(),
});

/**
 * Schema para criar tracker
 * Equivalente a: query trackers verb=POST do Xano
 */
export const createTrackerSchema = z.object({
  trackers_types_id: z.coerce.number().int().optional(),
  manufacturers_id: z.coerce.number().int().optional(),
  stake_quantity: z.coerce.number().int().optional(),
  max_modules: z.coerce.number().int().optional(),
  stakes_on_traker: z.array(stakeOnTrackerSchema).max(99999).optional(),
  company_id: z.coerce.number().int().optional(),
});

/**
 * Schema para atualizar tracker
 * Equivalente a: query "trackers/{trackers_id}" verb=PATCH do Xano
 */
export const updateTrackerSchema = z.object({
  trackers_id: z.coerce.number().int().min(1),
  trackers_types_id: z.coerce.number().int().optional(),
  manufacturers_id: z.coerce.number().int().optional(),
  stake_quantity: z.coerce.number().int().optional(),
  max_modules: z.coerce.number().int().optional(),
  stakes_on_traker: z.array(stakeOnTrackerSchema).optional(),
});

/**
 * Schema para deletar tracker
 * Equivalente a: query "trackers/{trackers_id}" verb=DELETE do Xano
 */
export const deleteTrackerSchema = z.object({
  trackers_id: z.coerce.number().int().min(1),
});

// =============================================================================
// Trackers Types Schemas
// =============================================================================

/**
 * Schema para listar tipos de trackers
 * Equivalente a: query trackers_types verb=GET do Xano
 */
export const listTrackerTypesSchema = z.object({
  search: z.string().trim().optional(),
});

/**
 * Schema para criar tipo de tracker
 * Equivalente a: query trackers_types verb=POST do Xano
 */
export const createTrackerTypeSchema = z.object({
  type: z.string().trim().min(1, 'Tipo e obrigatorio'),
});

/**
 * Schema para buscar tipo de tracker por ID
 */
export const getTrackerTypeByIdSchema = z.object({
  trackers_types_id: z.coerce.number().int().min(1),
});

/**
 * Schema para atualizar tipo de tracker
 */
export const updateTrackerTypeSchema = z.object({
  trackers_types_id: z.coerce.number().int().min(1),
  type: z.string().trim().min(1).optional(),
});

/**
 * Schema para deletar tipo de tracker
 */
export const deleteTrackerTypeSchema = z.object({
  trackers_types_id: z.coerce.number().int().min(1),
});

// =============================================================================
// Fields Schemas (Campos solares)
// =============================================================================

/**
 * Schema para listar fields
 * Equivalente a: query fields verb=GET do Xano
 */
export const listFieldsSchema = z.object({
  projects_id: z.coerce.number().int().optional(),
  company_id: z.coerce.number().int().optional(),
});

/**
 * Schema para criar field
 * Equivalente a: query fields verb=POST do Xano
 */
export const createFieldSchema = z.object({
  name: z.string().trim().min(1, 'Nome e obrigatorio'),
  projects_id: z.coerce.number().int().optional(),
});

/**
 * Schema para buscar field por ID
 */
export const getFieldByIdSchema = z.object({
  fields_id: z.coerce.number().int().min(1),
});

/**
 * Schema para atualizar field
 */
export const updateFieldSchema = z.object({
  fields_id: z.coerce.number().int().min(1),
  name: z.string().trim().optional(),
});

/**
 * Schema para deletar field
 */
export const deleteFieldSchema = z.object({
  fields_id: z.coerce.number().int().min(1),
});

/**
 * Schema para atualizar nome do field
 * Equivalente a: query field_name verb=PUT do Xano
 */
export const updateFieldNameSchema = z.object({
  fields_id: z.coerce.number().int().min(1),
  name: z.string().trim().min(1, 'Nome e obrigatorio'),
});

// =============================================================================
// Sections Schemas
// =============================================================================

/**
 * Schema para listar secoes
 * Equivalente a: query sections verb=GET do Xano
 */
export const listSectionsSchema = z.object({
  fields_id: z.coerce.number().int().optional(),
});

/**
 * Schema para criar secao
 * Equivalente a: query sections verb=POST do Xano
 */
export const createSectionSchema = z.object({
  fields_id: z.coerce.number().int(),
  rows_quantity: z.coerce.number().int().optional(),
});

/**
 * Schema para buscar secao por ID
 */
export const getSectionByIdSchema = z.object({
  sections_id: z.coerce.number().int().min(1),
});

/**
 * Schema para atualizar secao
 */
export const updateSectionSchema = z.object({
  sections_id: z.coerce.number().int().min(1),
  section_number: z.coerce.number().int().optional(),
  x: z.coerce.number().int().optional(),
  y: z.coerce.number().int().optional(),
});

/**
 * Schema para deletar secao
 */
export const deleteSectionSchema = z.object({
  sections_id: z.coerce.number().int().min(1),
});

/**
 * Schema para duplicar secao
 * Equivalente a: query section_duplicate verb=POST do Xano
 */
export const duplicateSectionSchema = z.object({
  sections_id: z.coerce.number().int().min(1),
});

// =============================================================================
// Rows Schemas
// =============================================================================

/**
 * Schema para listar rows com filtros
 * Equivalente a: query rows_list verb=POST do Xano
 */
export const listRowsSchema = z.object({
  sections_id: z.coerce.number().int().optional(),
  stakes_statuses_id: z.array(z.coerce.number().int()).optional(),
  rows_trackers_statuses_id: z.array(z.coerce.number().int()).optional(),
  trackers_types_id: z.array(z.coerce.number().int()).optional(),
});

/**
 * Schema para criar row
 */
export const createRowSchema = z.object({
  sections_id: z.coerce.number().int(),
  row_number: z.coerce.number().int().optional(),
  x: z.coerce.number().int().optional(),
  y: z.coerce.number().int().optional(),
  groupOffsetX: z.coerce.number().int().optional(),
});

/**
 * Schema para buscar row por ID
 */
export const getRowByIdSchema = z.object({
  rows_id: z.coerce.number().int().min(1),
});

/**
 * Schema para atualizar row
 */
export const updateRowSchema = z.object({
  rows_id: z.coerce.number().int().min(1),
  row_number: z.coerce.number().int().optional(),
  x: z.coerce.number().int().optional(),
  y: z.coerce.number().int().optional(),
  groupOffsetX: z.coerce.number().int().optional(),
});

/**
 * Schema para deletar row
 */
export const deleteRowSchema = z.object({
  rows_id: z.coerce.number().int().min(1),
});

// =============================================================================
// Rows Trackers Schemas
// =============================================================================

/**
 * Schema para listar rows_trackers
 * Equivalente a: query rows_trackers verb=GET do Xano
 */
export const listRowsTrackersSchema = z.object({
  rows_id: z.coerce.number().int().optional(),
});

/**
 * Schema para criar rows_tracker
 */
export const createRowsTrackerSchema = z.object({
  rows_id: z.coerce.number().int(),
  trackers_id: z.coerce.number().int(),
  position: z.string().optional(),
  row_y: z.coerce.number().int().optional(),
  rows_trackers_statuses_id: z.coerce.number().int().optional().default(1),
});

/**
 * Schema para buscar rows_tracker por ID
 */
export const getRowsTrackerByIdSchema = z.object({
  rows_trackers_id: z.coerce.number().int().min(1),
});

/**
 * Schema para atualizar rows_tracker
 */
export const updateRowsTrackerSchema = z.object({
  rows_trackers_id: z.coerce.number().int().min(1),
  position: z.string().optional(),
  row_y: z.coerce.number().int().optional(),
  rows_trackers_statuses_id: z.coerce.number().int().optional(),
});

/**
 * Schema para deletar rows_tracker
 */
export const deleteRowsTrackerSchema = z.object({
  rows_trackers_id: z.coerce.number().int().min(1),
});

// =============================================================================
// Rows Trackers Statuses Schemas
// =============================================================================

/**
 * Schema para listar status de rows_trackers
 */
export const listRowsTrackersStatusesSchema = z.object({});

/**
 * Schema para criar status de rows_tracker
 */
export const createRowsTrackersStatusSchema = z.object({
  status: z.string().trim().min(1, 'Status e obrigatorio'),
});

/**
 * Schema para buscar status por ID
 */
export const getRowsTrackersStatusByIdSchema = z.object({
  rows_trackers_statuses_id: z.coerce.number().int().min(1),
});

/**
 * Schema para atualizar status
 */
export const updateRowsTrackersStatusSchema = z.object({
  rows_trackers_statuses_id: z.coerce.number().int().min(1),
  status: z.string().trim().optional(),
});

/**
 * Schema para deletar status
 */
export const deleteRowsTrackersStatusSchema = z.object({
  rows_trackers_statuses_id: z.coerce.number().int().min(1),
});

// =============================================================================
// Trackers Map Schemas
// =============================================================================

/**
 * Schema para tracker em JSON do mapa
 */
const trackerMapJsonSchema = z.object({
  position: z.coerce.number().int().optional(),
  rowY: z.coerce.number().int().optional(),
  ext: z.object({
    id: z.coerce.number().int(),
    _trackers_types: z.object({
      id: z.coerce.number().int().optional(),
    }).optional(),
  }).optional(),
  id: z.coerce.number().int().optional(),
});

/**
 * Schema para row em JSON do mapa
 */
const rowMapJsonSchema = z.object({
  row_number: z.coerce.number().int().optional(),
  x: z.coerce.number().int().optional(),
  y: z.coerce.number().int().optional(),
  groupOffsetX: z.coerce.number().int().optional(),
  id: z.coerce.number().int().optional(),
  trackers: z.array(trackerMapJsonSchema).optional(),
});

/**
 * Schema para secao em JSON do mapa
 */
const sectionMapJsonSchema = z.object({
  section_number: z.coerce.number().int().optional(),
  x: z.coerce.number().int().optional(),
  y: z.coerce.number().int().optional(),
  id: z.coerce.number().int().optional(),
  rows: z.array(rowMapJsonSchema).optional(),
});

/**
 * Schema para JSON completo do mapa
 */
const jsonMapSchema = z.object({
  groups: z.array(sectionMapJsonSchema).optional(),
});

/**
 * Schema para buscar mapa de trackers
 * Equivalente a: query "trackers-map" verb=GET do Xano
 */
export const getTrackersMapSchema = z.object({
  projects_id: z.coerce.number().int(),
  fields_id: z.coerce.number().int().optional(),
});

/**
 * Schema para criar mapa de trackers
 * Equivalente a: query "trackers-map" verb=POST do Xano
 */
export const createTrackersMapSchema = z.object({
  json_map: jsonMapSchema,
  projects_id: z.coerce.number().int().optional(),
  map_texts: z.any().optional(),
  name: z.string().trim().optional(),
});

/**
 * Schema para atualizar mapa de trackers
 * Equivalente a: query "trackers-map" verb=PUT do Xano
 */
export const updateTrackersMapSchema = z.object({
  json_map: jsonMapSchema,
  projects_id: z.coerce.number().int().optional(),
  map_texts: z.any().optional(),
  fields_id: z.coerce.number().int().optional(),
});

// =============================================================================
// Rows Stakes Schemas
// =============================================================================

/**
 * Schema para listar rows_stakes
 */
export const listRowsStakesSchema = z.object({
  rows_trackers_id: z.coerce.number().int().optional(),
});

/**
 * Schema para atualizar status de stake na row
 * Equivalente a: query rows_stakes verb=PUT do Xano
 */
export const updateRowsStakesSchema = z.object({
  rows_stakes: z.array(z.object({
    id: z.coerce.number().int(),
    stakes_statuses_id: z.coerce.number().int(),
  })),
});

// =============================================================================
// Type Exports
// =============================================================================

export type ListTrackersInput = z.infer<typeof listTrackersSchema>;
export type ListAllTrackersInput = z.infer<typeof listAllTrackersSchema>;
export type GetTrackerByIdInput = z.infer<typeof getTrackerByIdSchema>;
export type CreateTrackerInput = z.infer<typeof createTrackerSchema>;
export type UpdateTrackerInput = z.infer<typeof updateTrackerSchema>;
export type DeleteTrackerInput = z.infer<typeof deleteTrackerSchema>;

export type ListTrackerTypesInput = z.infer<typeof listTrackerTypesSchema>;
export type CreateTrackerTypeInput = z.infer<typeof createTrackerTypeSchema>;
export type GetTrackerTypeByIdInput = z.infer<typeof getTrackerTypeByIdSchema>;
export type UpdateTrackerTypeInput = z.infer<typeof updateTrackerTypeSchema>;
export type DeleteTrackerTypeInput = z.infer<typeof deleteTrackerTypeSchema>;

export type ListFieldsInput = z.infer<typeof listFieldsSchema>;
export type CreateFieldInput = z.infer<typeof createFieldSchema>;
export type GetFieldByIdInput = z.infer<typeof getFieldByIdSchema>;
export type UpdateFieldInput = z.infer<typeof updateFieldSchema>;
export type DeleteFieldInput = z.infer<typeof deleteFieldSchema>;
export type UpdateFieldNameInput = z.infer<typeof updateFieldNameSchema>;

export type ListSectionsInput = z.infer<typeof listSectionsSchema>;
export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type GetSectionByIdInput = z.infer<typeof getSectionByIdSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
export type DeleteSectionInput = z.infer<typeof deleteSectionSchema>;
export type DuplicateSectionInput = z.infer<typeof duplicateSectionSchema>;

export type ListRowsInput = z.infer<typeof listRowsSchema>;
export type CreateRowInput = z.infer<typeof createRowSchema>;
export type GetRowByIdInput = z.infer<typeof getRowByIdSchema>;
export type UpdateRowInput = z.infer<typeof updateRowSchema>;
export type DeleteRowInput = z.infer<typeof deleteRowSchema>;

export type ListRowsTrackersInput = z.infer<typeof listRowsTrackersSchema>;
export type CreateRowsTrackerInput = z.infer<typeof createRowsTrackerSchema>;
export type GetRowsTrackerByIdInput = z.infer<typeof getRowsTrackerByIdSchema>;
export type UpdateRowsTrackerInput = z.infer<typeof updateRowsTrackerSchema>;
export type DeleteRowsTrackerInput = z.infer<typeof deleteRowsTrackerSchema>;

export type GetTrackersMapInput = z.infer<typeof getTrackersMapSchema>;
export type CreateTrackersMapInput = z.infer<typeof createTrackersMapSchema>;
export type UpdateTrackersMapInput = z.infer<typeof updateTrackersMapSchema>;

export type ListRowsStakesInput = z.infer<typeof listRowsStakesSchema>;
export type UpdateRowsStakesInput = z.infer<typeof updateRowsStakesSchema>;
