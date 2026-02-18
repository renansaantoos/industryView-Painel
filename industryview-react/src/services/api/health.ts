import apiClient from './apiClient';
import type { HealthRecord, PaginatedResponse } from '../../types';

const BASE = '/health';

export async function listRecords(params?: {
  users_id?: number;
  company_id?: number;
  exam_type?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<HealthRecord>> {
  const response = await apiClient.get(`${BASE}/records`, { params });
  return response.data;
}

export async function getExpiringRecords(params?: {
  company_id?: number;
  days_ahead?: number;
}): Promise<HealthRecord[]> {
  const response = await apiClient.get(`${BASE}/records/expiring`, { params });
  return response.data;
}

export async function checkFitness(userId: number): Promise<{ is_fit: boolean; record?: HealthRecord }> {
  const response = await apiClient.get(`${BASE}/check-fitness/${userId}`);
  return response.data;
}

export async function getRecord(id: number): Promise<HealthRecord> {
  const response = await apiClient.get(`${BASE}/records/${id}`);
  return response.data;
}

export async function createRecord(data: {
  users_id: number;
  exam_type: string;
  exam_date: string;
  expiry_date?: string;
  result: string;
  restriction_description?: string;
  doctor_name?: string;
  crm?: string;
  file_url?: string;
  observation?: string;
}): Promise<HealthRecord> {
  const response = await apiClient.post(`${BASE}/records`, data);
  return response.data;
}

export async function updateRecord(id: number, data: Record<string, unknown>): Promise<HealthRecord> {
  const response = await apiClient.patch(`${BASE}/records/${id}`, data);
  return response.data;
}
