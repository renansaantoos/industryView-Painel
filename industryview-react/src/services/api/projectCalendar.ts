import apiClient from './apiClient';

export interface ProjectHoliday {
  id: number;
  projects_id: number;
  date: string;
  name: string;
  type: string;
  recurring: boolean;
  created_at: string;
  updated_at: string;
}

export interface CalendarOverride {
  id: number;
  project_work_calendar_id: number;
  month: number;
  year: number | null;
  seg_ativo: boolean; seg_entrada: string; seg_intervalo_ini: string; seg_intervalo_fim: string; seg_saida: string;
  ter_ativo: boolean; ter_entrada: string; ter_intervalo_ini: string; ter_intervalo_fim: string; ter_saida: string;
  qua_ativo: boolean; qua_entrada: string; qua_intervalo_ini: string; qua_intervalo_fim: string; qua_saida: string;
  qui_ativo: boolean; qui_entrada: string; qui_intervalo_ini: string; qui_intervalo_fim: string; qui_saida: string;
  sex_ativo: boolean; sex_entrada: string; sex_intervalo_ini: string; sex_intervalo_fim: string; sex_saida: string;
  sab_ativo: boolean; sab_entrada: string; sab_intervalo_ini: string; sab_intervalo_fim: string; sab_saida: string;
  dom_ativo: boolean; dom_entrada: string; dom_intervalo_ini: string; dom_intervalo_fim: string; dom_saida: string;
}

export interface ProjectWorkCalendar {
  id?: number;
  projects_id: number;
  seg_ativo: boolean; seg_entrada: string; seg_intervalo_ini: string; seg_intervalo_fim: string; seg_saida: string;
  ter_ativo: boolean; ter_entrada: string; ter_intervalo_ini: string; ter_intervalo_fim: string; ter_saida: string;
  qua_ativo: boolean; qua_entrada: string; qua_intervalo_ini: string; qua_intervalo_fim: string; qua_saida: string;
  qui_ativo: boolean; qui_entrada: string; qui_intervalo_ini: string; qui_intervalo_fim: string; qui_saida: string;
  sex_ativo: boolean; sex_entrada: string; sex_intervalo_ini: string; sex_intervalo_fim: string; sex_saida: string;
  sab_ativo: boolean; sab_entrada: string; sab_intervalo_ini: string; sab_intervalo_fim: string; sab_saida: string;
  dom_ativo: boolean; dom_entrada: string; dom_intervalo_ini: string; dom_intervalo_fim: string; dom_saida: string;
  overrides?: CalendarOverride[];
}

export interface CountryOption {
  name: string;
  code: string;
}

const BASE = '/project-calendar';

// ── Holidays ──

export async function listHolidays(projectsId: number, year?: number): Promise<ProjectHoliday[]> {
  const response = await apiClient.get(`${BASE}/holidays`, { params: { projects_id: projectsId, year } });
  return response.data?.items ?? response.data ?? [];
}

export async function createHoliday(data: {
  projects_id: number;
  date: string;
  name: string;
  type?: string;
  recurring?: boolean;
}): Promise<ProjectHoliday> {
  const response = await apiClient.post(`${BASE}/holidays`, data);
  return response.data;
}

export async function updateHoliday(id: number, data: {
  date?: string;
  name?: string;
  type?: string;
  recurring?: boolean;
}): Promise<ProjectHoliday> {
  const response = await apiClient.patch(`${BASE}/holidays/${id}`, data);
  return response.data;
}

export async function deleteHoliday(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/holidays/${id}`);
}

export async function seedHolidays(projectsId: number, year: number): Promise<{ ok: boolean; message?: string; count?: number; country?: string }> {
  const response = await apiClient.post(`${BASE}/holidays/seed`, { projects_id: projectsId, year });
  return response.data;
}

// ── Work Calendar ──

export async function getWorkCalendar(projectsId: number): Promise<ProjectWorkCalendar> {
  const response = await apiClient.get(`${BASE}/work-calendar`, { params: { projects_id: projectsId } });
  return response.data;
}

export async function upsertWorkCalendar(data: Partial<ProjectWorkCalendar> & { projects_id: number }): Promise<ProjectWorkCalendar> {
  const response = await apiClient.put(`${BASE}/work-calendar`, data);
  return response.data;
}

export async function listCalendarOverrides(projectsId: number): Promise<CalendarOverride[]> {
  const response = await apiClient.get(`${BASE}/work-calendar/overrides`, { params: { projects_id: projectsId } });
  return response.data ?? [];
}

export async function upsertCalendarOverride(data: Partial<CalendarOverride> & { project_work_calendar_id: number; month: number; year?: number | null }): Promise<CalendarOverride> {
  const response = await apiClient.put(`${BASE}/work-calendar/overrides`, data);
  return response.data;
}

export async function deleteCalendarOverride(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/work-calendar/overrides/${id}`);
}

// ── Countries ──

export async function getCountries(): Promise<CountryOption[]> {
  const response = await apiClient.get(`${BASE}/countries`);
  return response.data ?? [];
}
