// =============================================================================
// INDUSTRYVIEW BACKEND - Inventory Module Schema
// Schemas de validacao do modulo de inventario
// Equivalente aos inputs dos endpoints do Xano em apis/inventory/
// =============================================================================

import { z } from 'zod';

// =============================================================================
// Product Inventory Schemas
// =============================================================================

/**
 * Schema para listar produtos do inventario
 * Equivalente a: query product_inventory verb=GET do Xano
 */
export const listProductInventorySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
  category_id: z.coerce.number().int().optional(),
  status_id: z.coerce.number().int().optional(),
  search: z.string().trim().optional(),
  projects_id: z.coerce.number().int().optional(),
  company_id: z.coerce.number().int().optional(),
  sort_field: z.string().optional(),
  sort_direction: z.enum(['asc', 'desc']).optional(),
});

/**
 * Schema para buscar produto por ID
 * Equivalente a: query "product_inventory/{product_inventory_id}" verb=GET do Xano
 */
export const getProductInventoryByIdSchema = z.object({
  product_inventory_id: z.coerce.number().int().min(1),
});

/**
 * Schema para criar produto no inventario
 * Equivalente a: query product_inventory verb=POST do Xano
 */
export const createProductInventorySchema = z.object({
  code: z.string().trim().max(50).optional(),
  product: z.string().trim().min(1, 'Produto e obrigatorio'),
  specifications: z.string().trim().optional(),
  inventory_quantity: z.coerce.number().int().optional().default(0),
  min_quantity: z.coerce.number().int().optional().default(0),
  unity_id: z.coerce.number().int().optional(),
  status_inventory_id: z.coerce.number().int().optional(),
  equipaments_types_id: z.coerce.number().int().optional(),
  manufacturers_id: z.coerce.number().int().optional(),
  projects_id: z.coerce.number().int().optional(),
  // Bloco K fields
  ncm_code: z.string().trim().max(8).optional(),
  cest_code: z.string().trim().max(7).optional(),
  origin_indicator: z.coerce.number().int().min(0).max(8).optional(),
  custody_type: z.enum(['own', 'third_party']).optional(),
  cost_price: z.coerce.number().min(0).optional(),
  batch_lot: z.string().trim().max(100).optional(),
  fiscal_classification: z.string().trim().optional(),
  barcode: z.string().trim().max(14).optional(),
});

/**
 * Schema para atualizar produto
 * Equivalente a: query "product_inventory/{product_inventory_id}" verb=PATCH do Xano
 */
export const updateProductInventorySchema = z.object({
  product_inventory_id: z.coerce.number().int().min(1),
  product: z.string().trim().optional(),
  specifications: z.string().trim().optional(),
  inventory_quantity: z.coerce.number().int().optional(),
  min_quantity: z.coerce.number().int().optional(),
  unity_id: z.coerce.number().int().optional(),
  status_inventory_id: z.coerce.number().int().optional(),
  equipaments_types_id: z.coerce.number().int().optional(),
  manufacturers_id: z.coerce.number().int().optional(),
  // Bloco K fields
  ncm_code: z.string().trim().max(8).optional(),
  cest_code: z.string().trim().max(7).optional(),
  origin_indicator: z.coerce.number().int().min(0).max(8).optional(),
  custody_type: z.enum(['own', 'third_party']).optional(),
  cost_price: z.coerce.number().min(0).optional(),
  batch_lot: z.string().trim().max(100).optional(),
  fiscal_classification: z.string().trim().optional(),
  barcode: z.string().trim().max(14).optional(),
});

/**
 * Schema para atualizar produto (PUT - update completo)
 * Equivalente a: query "product_inventory/{product_inventory_id}" verb=PUT do Xano
 */
export const replaceProductInventorySchema = z.object({
  product_inventory_id: z.coerce.number().int().min(1),
  product: z.string().trim().min(1, 'Produto e obrigatorio'),
  specifications: z.string().trim().optional(),
  inventory_quantity: z.coerce.number().int().default(0),
  min_quantity: z.coerce.number().int().default(0),
  unity_id: z.coerce.number().int().optional(),
  status_inventory_id: z.coerce.number().int().optional(),
  equipaments_types_id: z.coerce.number().int().optional(),
  manufacturers_id: z.coerce.number().int().optional(),
  // Bloco K fields
  ncm_code: z.string().trim().max(8).optional(),
  cest_code: z.string().trim().max(7).optional(),
  origin_indicator: z.coerce.number().int().min(0).max(8).optional(),
  custody_type: z.enum(['own', 'third_party']).optional(),
  cost_price: z.coerce.number().min(0).optional(),
  batch_lot: z.string().trim().max(100).optional(),
  fiscal_classification: z.string().trim().optional(),
  barcode: z.string().trim().max(14).optional(),
});

/**
 * Schema para deletar produto
 * Equivalente a: query "product_inventory/{product_inventory_id}" verb=DELETE do Xano
 */
export const deleteProductInventorySchema = z.object({
  product_inventory_id: z.coerce.number().int().min(1),
});

// =============================================================================
// Inventory Quantity Operations Schemas
// =============================================================================

/**
 * Schema para adicionar quantidade ao inventario
 * Equivalente a: query Add_quantity_inventory verb=POST do Xano
 */
export const addQuantityInventorySchema = z.object({
  product_inventory_id: z.coerce.number().int().min(1),
  quantity: z.coerce.number().int().min(1, 'Quantidade deve ser maior que 0'),
});

/**
 * Schema para remover quantidade do inventario
 * Equivalente a: query Remove_quantity_inventory verb=POST do Xano
 */
export const removeQuantityInventorySchema = z.object({
  product_inventory_id: z.coerce.number().int().min(1),
  quantity: z.coerce.number().int().min(1, 'Quantidade deve ser maior que 0'),
  received_user: z.coerce.number().int().optional(),
});

// =============================================================================
// Status Inventory Schemas
// =============================================================================

/**
 * Schema para listar status do inventario
 * Equivalente a: query status_inventory verb=GET do Xano
 */
export const listStatusInventorySchema = z.object({});

/**
 * Schema para buscar status por ID
 */
export const getStatusInventoryByIdSchema = z.object({
  status_inventory_id: z.coerce.number().int().min(1),
});

/**
 * Schema para criar status
 */
export const createStatusInventorySchema = z.object({
  status: z.string().trim().min(1, 'Status e obrigatorio'),
});

/**
 * Schema para atualizar status
 */
export const updateStatusInventorySchema = z.object({
  status_inventory_id: z.coerce.number().int().min(1),
  status: z.string().trim().optional(),
});

/**
 * Schema para deletar status
 */
export const deleteStatusInventorySchema = z.object({
  status_inventory_id: z.coerce.number().int().min(1),
});

// =============================================================================
// Inventory Logs Schemas
// =============================================================================

/**
 * Schema para listar logs de inventario
 * Equivalente a: query inventory_logs verb=GET do Xano
 */
export const listInventoryLogsSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(10),
  projects_id: z.coerce.number().int().optional(),
});

/**
 * Schema para buscar log por ID
 */
export const getInventoryLogByIdSchema = z.object({
  inventory_logs_id: z.coerce.number().int().min(1),
});

/**
 * Schema para criar log de inventario
 */
export const createInventoryLogSchema = z.object({
  code: z.string().trim().optional(),
  quantity: z.coerce.number().int(),
  type: z.boolean(), // true = entrada, false = saida
  observations: z.string().trim().optional(),
  responsible_users_id: z.coerce.number().int().optional(),
  received_user: z.coerce.number().int().optional(),
  product_inventory_id: z.coerce.number().int(),
  projects_id: z.coerce.number().int().optional(),
});

/**
 * Schema para atualizar log
 */
export const updateInventoryLogSchema = z.object({
  inventory_logs_id: z.coerce.number().int().min(1),
  code: z.string().trim().optional(),
  quantity: z.coerce.number().int().optional(),
  type: z.boolean().optional(),
  observations: z.string().trim().optional(),
});

/**
 * Schema para deletar log
 */
export const deleteInventoryLogSchema = z.object({
  inventory_logs_id: z.coerce.number().int().min(1),
});

/**
 * Schema para listar logs filtrados (endpoint alternativo)
 * Equivalente a: query inventory_logs_0 verb=GET do Xano
 */
export const listInventoryLogsFilteredSchema = z.object({
  product_inventory_id: z.coerce.number().int().optional(),
  projects_id: z.coerce.number().int().optional(),
});

// =============================================================================
// Import/Export Schemas
// =============================================================================

/**
 * Schema para importar produtos
 * Equivalente a: query import_inventory verb=POST do Xano
 */
export const importInventorySchema = z.object({
  products: z.array(z.object({
    product: z.string().trim(),
    specifications: z.string().trim().optional(),
    inventory_quantity: z.coerce.number().int().optional(),
    min_quantity: z.coerce.number().int().optional(),
    unity_id: z.coerce.number().int().optional(),
    equipaments_types_id: z.coerce.number().int().optional(),
    manufacturers_id: z.coerce.number().int().optional(),
    // Bloco K fields
    ncm_code: z.string().trim().max(8).optional(),
    cest_code: z.string().trim().max(7).optional(),
    origin_indicator: z.coerce.number().int().min(0).max(8).optional(),
    custody_type: z.enum(['own', 'third_party']).optional(),
    cost_price: z.coerce.number().min(0).optional(),
    batch_lot: z.string().trim().max(100).optional(),
    fiscal_classification: z.string().trim().optional(),
    barcode: z.string().trim().max(14).optional(),
  })),
  projects_id: z.coerce.number().int().optional(),
});

/**
 * Schema para exportar inventario
 * Equivalente a: query export_inventory verb=GET do Xano
 */
export const exportInventorySchema = z.object({
  projects_id: z.coerce.number().int().optional(),
});

// =============================================================================
// Type Exports
// =============================================================================

export type ListProductInventoryInput = z.infer<typeof listProductInventorySchema>;
export type GetProductInventoryByIdInput = z.infer<typeof getProductInventoryByIdSchema>;
export type CreateProductInventoryInput = z.infer<typeof createProductInventorySchema>;
export type UpdateProductInventoryInput = z.infer<typeof updateProductInventorySchema>;
export type ReplaceProductInventoryInput = z.infer<typeof replaceProductInventorySchema>;
export type DeleteProductInventoryInput = z.infer<typeof deleteProductInventorySchema>;

export type AddQuantityInventoryInput = z.infer<typeof addQuantityInventorySchema>;
export type RemoveQuantityInventoryInput = z.infer<typeof removeQuantityInventorySchema>;

export type ListStatusInventoryInput = z.infer<typeof listStatusInventorySchema>;
export type GetStatusInventoryByIdInput = z.infer<typeof getStatusInventoryByIdSchema>;
export type CreateStatusInventoryInput = z.infer<typeof createStatusInventorySchema>;
export type UpdateStatusInventoryInput = z.infer<typeof updateStatusInventorySchema>;
export type DeleteStatusInventoryInput = z.infer<typeof deleteStatusInventorySchema>;

export type ListInventoryLogsInput = z.infer<typeof listInventoryLogsSchema>;
export type GetInventoryLogByIdInput = z.infer<typeof getInventoryLogByIdSchema>;
export type CreateInventoryLogInput = z.infer<typeof createInventoryLogSchema>;
export type UpdateInventoryLogInput = z.infer<typeof updateInventoryLogSchema>;
export type DeleteInventoryLogInput = z.infer<typeof deleteInventoryLogSchema>;
export type ListInventoryLogsFilteredInput = z.infer<typeof listInventoryLogsFilteredSchema>;

export type ImportInventoryInput = z.infer<typeof importInventorySchema>;
export type ExportInventoryInput = z.infer<typeof exportInventorySchema>;
