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
  description?: string;
  priority?: string;
  items?: { description: string; unit?: string; quantity: number; estimated_cost?: number }[];
}): Promise<MaterialRequisition> {
  const response = await apiClient.post(BASE, data);
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

export async function approveRequisition(id: number): Promise<MaterialRequisition> {
  const response = await apiClient.post(`${BASE}/${id}/approve`);
  return response.data;
}

export async function rejectRequisition(id: number, data?: { rejection_reason?: string }): Promise<MaterialRequisition> {
  const response = await apiClient.post(`${BASE}/${id}/reject`, data);
  return response.data;
}
