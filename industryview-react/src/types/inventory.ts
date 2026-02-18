import type { PaginatedResponse } from './index';

/** Inventory product - aligned with backend product_inventory model */
export interface InventoryProduct {
  id: number;
  code?: string;
  product: string;
  specifications?: string;
  inventory_quantity: number;
  min_quantity?: number;
  unity_id?: number;
  status_inventory_id?: number;
  equipaments_types_id?: number;
  manufacturers_id?: number;
  projects_id?: number;
  // Relations included by backend
  unity?: { unity: string };
  status_inventory?: { id: number; status: string };
  equipaments_types?: { id: number; type: string };
  manufacturers?: { id: number; name: string };
  // Bloco K
  ncm_code?: string;
  cest_code?: string;
  origin_indicator?: number;
  custody_type?: string;
  cost_price?: number;
  batch_lot?: string;
  fiscal_classification?: string;
  barcode?: string;
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

/** Inventory status */
export interface InventoryStatus {
  id: number;
  status: string;
}

/** Inventory log entry */
export interface InventoryLog {
  id: number;
  code?: string;
  quantity?: number;
  type?: boolean;
  observations?: string;
  responsible_users_id?: number;
  received_user?: number;
  product_inventory_id?: number;
  responsible_user?: { id: number; name: string };
  product_inventory?: { id: number; code: string; product: string };
  received_user_rel?: { id: number; name: string };
  created_at?: string;
}

/** Add product to inventory request - aligned with backend createProductInventorySchema */
export interface AddInventoryProductRequest {
  code?: string;
  product: string;
  specifications?: string;
  inventory_quantity?: number;
  min_quantity?: number;
  unity_id?: number;
  status_inventory_id?: number;
  equipaments_types_id?: number;
  manufacturers_id?: number;
  projects_id?: number;
  ncm_code?: string;
  cest_code?: string;
  origin_indicator?: number;
  custody_type?: string;
  cost_price?: number;
  batch_lot?: string;
  fiscal_classification?: string;
  barcode?: string;
}

/** Edit inventory product request */
export interface EditInventoryProductRequest extends Partial<AddInventoryProductRequest> {
  id: number;
}

/** Inventory quantity change request - uses product_inventory_id to match backend */
export interface InventoryQuantityRequest {
  product_inventory_id: number;
  quantity: number;
  notes?: string;
}

/** Response from listing inventory - includes KPI counters from backend */
export interface InventoryListResponse {
  result1: PaginatedResponse<InventoryProduct>;
  low: number;
  no: number;
  all: number;
}

/** Unity reference data */
export interface Unity {
  id: number;
  unity: string;
}

/** Equipament type reference data */
export interface EquipamentType {
  id: number;
  type: string;
  code?: string;
}
