import apiClient from './apiClient';
import type { InventoryProduct, InventoryLog, InventoryListResponse, AddInventoryProductRequest } from '../../types';

const INVENTORY_BASE = '/inventory';

/** List products - returns { result1: PaginatedResponse, low, no, all } */
export async function queryAllProducts(params?: {
  projects_id?: number;
  page?: number;
  per_page?: number;
  search?: string;
  category_id?: number;
  status_id?: number;
  sort_field?: string;
  sort_direction?: 'asc' | 'desc';
}): Promise<InventoryListResponse> {
  const response = await apiClient.get(`${INVENTORY_BASE}/products`, { params });
  return response.data;
}

/** Create product - uses backend field names */
export async function addProduct(data: AddInventoryProductRequest): Promise<InventoryProduct> {
  const response = await apiClient.post(`${INVENTORY_BASE}/products`, data);
  return response.data;
}

/** Get product by ID */
export async function getProduct(productId: number): Promise<InventoryProduct> {
  const response = await apiClient.get(`${INVENTORY_BASE}/products/${productId}`);
  return response.data;
}

/** Update product */
export async function editProduct(productId: number, data: Record<string, unknown>): Promise<InventoryProduct> {
  const response = await apiClient.patch(`${INVENTORY_BASE}/products/${productId}`, data);
  return response.data;
}

/** Delete product */
export async function deleteProduct(productId: number): Promise<void> {
  await apiClient.delete(`${INVENTORY_BASE}/products/${productId}`);
}

/** Get all inventory statuses */
export async function getAllStatuses(): Promise<{ id: number; status: string }[]> {
  const response = await apiClient.get(`${INVENTORY_BASE}/status`);
  return response.data;
}

/** Add quantity - uses product_inventory_id */
export async function addQuantity(data: {
  product_inventory_id: number;
  quantity: number;
}): Promise<void> {
  await apiClient.post(`${INVENTORY_BASE}/add-quantity`, data);
}

/** Remove quantity - uses product_inventory_id */
export async function removeQuantity(data: {
  product_inventory_id: number;
  quantity: number;
  received_user?: number;
}): Promise<void> {
  await apiClient.post(`${INVENTORY_BASE}/remove-quantity`, data);
}

export async function queryAllLogs(params: {
  product_inventory_id?: number;
  page?: number;
  per_page?: number;
}): Promise<unknown> {
  const response = await apiClient.get(`${INVENTORY_BASE}/logs`, { params });
  return response.data;
}

/** Get filtered logs */
export async function queryAllLogsClone(params: {
  product_inventory_id?: number;
  projects_id?: number;
}): Promise<InventoryLog[]> {
  const response = await apiClient.get(`${INVENTORY_BASE}/logs/filtered`, { params });
  return response.data;
}

export async function getProductLogs(productId: number): Promise<InventoryLog[]> {
  const response = await apiClient.get(`${INVENTORY_BASE}/logs/filtered`, { params: { product_inventory_id: productId } });
  return response.data || [];
}

export async function exportInventory(params?: {
  projects_id?: number;
}): Promise<unknown[]> {
  const response = await apiClient.get(`${INVENTORY_BASE}/export`, { params });
  return response.data;
}
