import apiClient from './apiClient';
import type { WorkforceDailyLog, WorkforceHistogram, PaginatedResponse } from '../../types';

const BASE = '/workforce';

export async function listDailyLogs(params?: {
  projects_id?: number;
  company_id?: number;
  log_date?: string;
  team?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<WorkforceDailyLog>> {
  const response = await apiClient.get(BASE, { params });
  return response.data;
}

export async function createDailyLog(data: {
  projects_id?: number;
  users_id: number;
  log_date: string;
  check_in?: string;
  team?: string;
  status?: string;
  observation?: string;
}): Promise<WorkforceDailyLog> {
  const response = await apiClient.post(BASE, data);
  return response.data;
}

export async function updateDailyLog(id: number, data: Record<string, unknown>): Promise<WorkforceDailyLog> {
  const response = await apiClient.patch(`${BASE}/${id}`, data);
  return response.data;
}

export async function deleteDailyLog(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}

export async function checkIn(data: {
  projects_id?: number;
  users_id: number;
  log_date: string;
  check_in: string;
  team?: string;
}): Promise<WorkforceDailyLog> {
  const response = await apiClient.post(`${BASE}/check-in`, data);
  return response.data;
}

export async function checkOut(id: number, data: { check_out: string }): Promise<WorkforceDailyLog> {
  const response = await apiClient.post(`${BASE}/${id}/check-out`, data);
  return response.data;
}

export async function getHistogram(params: {
  projects_id: number;
  initial_date?: string;
  final_date?: string;
}): Promise<WorkforceHistogram[]> {
  const response = await apiClient.get(`${BASE}/histogram`, { params });
  return response.data;
}
