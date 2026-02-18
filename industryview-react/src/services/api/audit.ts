import apiClient from './apiClient';
import type { AuditLog, PaginatedResponse } from '../../types';

const BASE = '/audit';

export async function listLogs(params?: {
  company_id?: number;
  table_name?: string;
  action?: string;
  users_id?: number;
  initial_date?: string;
  final_date?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<AuditLog>> {
  const response = await apiClient.get(`${BASE}/logs`, { params });
  return response.data;
}

export async function getLogsByRecord(tableName: string, recordId: number): Promise<AuditLog[]> {
  const response = await apiClient.get(`${BASE}/logs/${tableName}/${recordId}`);
  return response.data;
}
