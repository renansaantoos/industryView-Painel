import apiClient from './apiClient';
import type { WorkPermit, WorkPermitSignature, PaginatedResponse } from '../../types';

const BASE = '/work-permits';

export async function listWorkPermits(params?: {
  projects_id?: number;
  company_id?: number;
  permit_type?: string;
  status?: string;
  signer_user_id?: number;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<WorkPermit>> {
  const response = await apiClient.get(BASE, { params });
  return response.data;
}

export async function getActivePermits(params?: { projects_id?: number }): Promise<WorkPermit[]> {
  const response = await apiClient.get(`${BASE}/active`, { params });
  return response.data;
}

export async function getWorkPermit(id: number): Promise<WorkPermit> {
  const response = await apiClient.get(`${BASE}/${id}`);
  return response.data;
}

export async function createWorkPermit(data: {
  projects_id?: number;
  company_id?: number;
  permit_type: string;
  location: string;
  risk_description: string;
  control_measures: string;
  valid_from?: string;
  valid_until?: string;
}): Promise<WorkPermit> {
  const response = await apiClient.post(BASE, data);
  return response.data;
}

export async function updateWorkPermit(id: number, data: Record<string, unknown>): Promise<WorkPermit> {
  const response = await apiClient.patch(`${BASE}/${id}`, data);
  return response.data;
}

export async function approveWorkPermit(id: number): Promise<WorkPermit> {
  const response = await apiClient.post(`${BASE}/${id}/approve`);
  return response.data;
}

export async function closeWorkPermit(id: number): Promise<WorkPermit> {
  const response = await apiClient.post(`${BASE}/${id}/close`);
  return response.data;
}

export async function cancelWorkPermit(id: number, data?: { cancellation_reason?: string }): Promise<WorkPermit> {
  const response = await apiClient.post(`${BASE}/${id}/cancel`, data);
  return response.data;
}

export async function addSignature(permitId: number, data: { users_id: number; role?: string }): Promise<WorkPermitSignature> {
  const response = await apiClient.post(`${BASE}/${permitId}/signatures`, data);
  return response.data;
}
