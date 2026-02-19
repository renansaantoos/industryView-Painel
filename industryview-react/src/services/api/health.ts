import apiClient from './apiClient';
import type { HealthRecord, PaginatedResponse } from '../../types';

const BASE = '/health';

/** Mapeia campos do backend (DB) para nomes do frontend */
function mapRecord(raw: any): HealthRecord {
  return {
    ...raw,
    user_name: raw.user?.name ?? raw.user_name,
    doctor_name: raw.physician_name ?? raw.doctor_name,
    crm: raw.physician_crm ?? raw.crm,
    restriction_description: raw.restrictions ?? raw.restriction_description,
  };
}

export async function listRecords(params?: {
  users_id?: number;
  company_id?: number;
  exam_type?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<HealthRecord>> {
  const response = await apiClient.get(`${BASE}/records`, { params });
  const data = response.data;
  return {
    ...data,
    items: (data.items ?? []).map(mapRecord),
  };
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
  const payload = {
    users_id: data.users_id,
    exam_type: data.exam_type,
    exam_date: data.exam_date,
    expiry_date: data.expiry_date,
    result: data.result,
    restrictions: data.restriction_description,
    physician_name: data.doctor_name,
    physician_crm: data.crm,
    file_url: data.file_url,
  };
  const response = await apiClient.post(`${BASE}/records`, payload);
  return response.data;
}

export async function updateRecord(id: number, data: Record<string, unknown>): Promise<HealthRecord> {
  const payload: Record<string, unknown> = { ...data };
  if ('doctor_name' in payload) { payload.physician_name = payload.doctor_name; delete payload.doctor_name; }
  if ('crm' in payload) { payload.physician_crm = payload.crm; delete payload.crm; }
  if ('restriction_description' in payload) { payload.restrictions = payload.restriction_description; delete payload.restriction_description; }
  const response = await apiClient.patch(`${BASE}/records/${id}`, payload);
  return response.data;
}
