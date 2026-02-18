import apiClient from './apiClient';
import type { DailyReportListResponse } from '../../types';

const REPORTS_BASE = '/reports';

// === Daily Reports ===

export async function queryAllDailyReports(params: {
  projects_id: number;
  page?: number;
  per_page?: number;
  initial_date?: string;
  final_date?: string;
  sort_field?: string;
  sort_direction?: 'asc' | 'desc';
}): Promise<DailyReportListResponse> {
  const response = await apiClient.get(`${REPORTS_BASE}/daily`, { params });
  return response.data;
}

export async function getDailyReportDates(projectsId: number): Promise<unknown[]> {
  const response = await apiClient.get(`${REPORTS_BASE}/daily/dates`, {
    params: { projects_id: projectsId },
  });
  return response.data;
}

export async function deleteDailyReport(dailyReportId: number): Promise<void> {
  await apiClient.delete(`${REPORTS_BASE}/daily/${dailyReportId}`);
}

export async function addDailyReport(data: {
  projects_id: number;
  schedule_id: number[];
  date: string;
}): Promise<unknown> {
  const response = await apiClient.post(`${REPORTS_BASE}/daily`, data);
  return response.data;
}

export async function editDailyReport(dailyReportId: number, data: Record<string, unknown>): Promise<unknown> {
  const response = await apiClient.patch(`${REPORTS_BASE}/daily/${dailyReportId}`, data);
  return response.data;
}

export async function getDailyReport(dailyReportId: number): Promise<unknown> {
  const response = await apiClient.get(`${REPORTS_BASE}/daily/${dailyReportId}`);
  return response.data;
}

export async function getDailyReportPdf(dailyReportId: number): Promise<Blob> {
  const response = await apiClient.get(`${REPORTS_BASE}/daily/${dailyReportId}/pdf`, {
    responseType: 'blob',
  });
  return response.data;
}

// === Burndown ===

export async function getBurndown(params: {
  sprints_id: number;
  teams_ids?: number[];
}): Promise<unknown> {
  const response = await apiClient.get(`${REPORTS_BASE}/burndown`, { params });
  return response.data;
}

// === Schedule (backend uses GET /reports/schedule/day) ===

export async function getSchedule(params: {
  projects_id: number;
  sprints_id?: number;
}): Promise<unknown> {
  const response = await apiClient.get(`${REPORTS_BASE}/schedule/day`, { params });
  return response.data;
}

// === Dashboard ===

export async function getDashboard(params?: {
  projects_id?: number;
}): Promise<unknown> {
  const response = await apiClient.get(`${REPORTS_BASE}/dashboard`, { params });
  return response.data;
}

// === Daily Production Report (backend uses GET /reports/informe-diario) ===

export async function getDailyProduction(params: {
  projects_id: number;
  date?: string;
  page?: number;
  per_page?: number;
}): Promise<unknown> {
  const response = await apiClient.get(`${REPORTS_BASE}/informe-diario`, { params });
  return response.data;
}

// === Informe Diarias Prod ===

export async function getInformeDiario(params: {
  projects_id: number;
  date?: string;
  teams_ids?: number[];
}): Promise<unknown> {
  const response = await apiClient.get(`${REPORTS_BASE}/informe-diario`, { params });
  return response.data;
}

/** Filtered daily report (backend uses GET /reports/informe-diario/filtered) */
export async function getNovoInformeDiario(params: {
  projects_id: number;
  date?: string;
  teams_ids?: number[];
  sections_ids?: number[];
}): Promise<unknown> {
  const response = await apiClient.get(`${REPORTS_BASE}/informe-diario/filtered`, { params });
  return response.data;
}
