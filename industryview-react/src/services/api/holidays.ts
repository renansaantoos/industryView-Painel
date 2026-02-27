import apiClient from './apiClient';

export interface Holiday {
  id: number;
  company_id: number;
  date: string;
  name: string;
  type: string;
  recurring: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkCalendar {
  id?: number;
  company_id: number;
  seg_ativo: boolean;
  ter_ativo: boolean;
  qua_ativo: boolean;
  qui_ativo: boolean;
  sex_ativo: boolean;
  sab_ativo: boolean;
  dom_ativo: boolean;
}

const BASE = '/holidays';

export async function listHolidays(companyId: number, year?: number): Promise<Holiday[]> {
  const response = await apiClient.get(BASE, { params: { company_id: companyId, year } });
  return response.data?.items ?? response.data ?? [];
}

export async function createHoliday(data: {
  company_id: number;
  date: string;
  name: string;
  type?: string;
  recurring?: boolean;
}): Promise<Holiday> {
  const response = await apiClient.post(BASE, data);
  return response.data;
}

export async function updateHoliday(id: number, data: {
  date?: string;
  name?: string;
  type?: string;
  recurring?: boolean;
}): Promise<Holiday> {
  const response = await apiClient.patch(`${BASE}/${id}`, data);
  return response.data;
}

export async function deleteHoliday(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}

export async function seedHolidays(companyId: number, year: number): Promise<void> {
  await apiClient.post(`${BASE}/seed`, { company_id: companyId, year });
}

export async function getWorkCalendar(companyId: number): Promise<WorkCalendar> {
  const response = await apiClient.get(`${BASE}/work-calendar`, { params: { company_id: companyId } });
  return response.data;
}

export async function upsertWorkCalendar(data: WorkCalendar): Promise<WorkCalendar> {
  const response = await apiClient.put(`${BASE}/work-calendar`, data);
  return response.data;
}
