import apiClient from './apiClient';
import type { MaterialRequisition, PaginatedResponse } from '../../types';

const BASE = '/material-requisitions';

export async function listRequisitions(params?: {
  projects_id?: number;
  status?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<MaterialRequisition>> {
  const response = await apiClient.get(BASE, { params });
  return response.data;
}

export async function getRequisition(id: number): Promise<MaterialRequisition> {
  const response = await apiClient.get(`${BASE}/${id}`);
  return response.data;
}

export async function createRequisition(data: {
  projects_id: number;
  title: string;
  requester_name?: string;
  priority?: string;
  required_by_date?: string;
  notes?: string;
  items: { description: string; unit?: string; quantity_requested: number; unit_price_estimate?: number; notes?: string; inventory_product_id?: number }[];
}): Promise<MaterialRequisition> {
  // Strip fields not yet in backend schema (requester_name, inventory_product_id, item notes)
  const { requester_name: _rn, items, ...rest } = data;

  const cleanItems = items.map(({ inventory_product_id: _inv, notes: _n, ...item }) => item);

  const response = await apiClient.post(BASE, { ...rest, items: cleanItems });
  return response.data;
}

export async function updateRequisition(id: number, data: Record<string, unknown>): Promise<MaterialRequisition> {
  const response = await apiClient.patch(`${BASE}/${id}`, data);
  return response.data;
}

export async function submitRequisition(id: number): Promise<MaterialRequisition> {
  const response = await apiClient.post(`${BASE}/${id}/submit`);
  return response.data;
}

export async function approveRequisition(id: number, data?: {
  notes?: string;
  items?: { id: number; quantity_approved: number }[];
}): Promise<MaterialRequisition> {
  const response = await apiClient.post(`${BASE}/${id}/approve`, data);
  return response.data;
}

export async function rejectRequisition(id: number, data?: { reason?: string }): Promise<MaterialRequisition> {
  const response = await apiClient.post(`${BASE}/${id}/reject`, data);
  return response.data;
}
