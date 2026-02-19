import apiClient from './apiClient';
import type { PpeType, PpeDelivery, TaskRequiredPpe, UserPpeStatus, PaginatedResponse } from '../../types';

const BASE = '/ppe';

// PPE Types
export async function listPpeTypes(params?: { company_id?: number }): Promise<PpeType[]> {
  const response = await apiClient.get(`${BASE}/types`, { params });
  return response.data;
}

export async function createPpeType(data: {
  company_id?: number;
  name: string;
  ca_number?: string;
  validity_months?: number;
  description?: string;
}): Promise<PpeType> {
  const response = await apiClient.post(`${BASE}/types`, data);
  return response.data;
}

export async function updatePpeType(id: number, data: Record<string, unknown>): Promise<PpeType> {
  const response = await apiClient.patch(`${BASE}/types/${id}`, data);
  return response.data;
}

export async function deletePpeType(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/types/${id}`);
}

// Deliveries
export async function listDeliveries(params?: {
  company_id?: number;
  ppe_types_id?: number;
  users_id?: number;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<PpeDelivery>> {
  const response = await apiClient.get(`${BASE}/deliveries`, { params });
  return response.data;
}

export async function createDelivery(data: {
  ppe_types_id: number;
  users_id: number;
  quantity: number;
  delivery_date: string;
  observation?: string;
}): Promise<PpeDelivery> {
  const response = await apiClient.post(`${BASE}/deliveries`, data);
  return response.data;
}

export async function registerReturn(deliveryId: number): Promise<PpeDelivery> {
  const response = await apiClient.post(`${BASE}/deliveries/${deliveryId}/return`);
  return response.data;
}

// Task Required PPE
export async function listTaskRequiredPpe(params?: { task_templates_id?: number }): Promise<TaskRequiredPpe[]> {
  const response = await apiClient.get(`${BASE}/task-required`, { params });
  return response.data;
}

export async function createTaskRequiredPpe(data: { task_templates_id: number; ppe_types_id: number }): Promise<TaskRequiredPpe> {
  const response = await apiClient.post(`${BASE}/task-required`, data);
  return response.data;
}

export async function deleteTaskRequiredPpe(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/task-required/${id}`);
}

// User PPE Status
export async function getUserPpeStatus(userId: number): Promise<UserPpeStatus> {
  const response = await apiClient.get(`${BASE}/user-status/${userId}`);
  return response.data;
}
