import apiClient from './apiClient';
import type { DailyReport, DailyReportWorkforce, DailyReportActivity, DailyReportOccurrence, PaginatedResponse } from '../../types';

const BASE = '/daily-reports';

export async function listDailyReports(params?: {
  projects_id?: number;
  page?: number;
  per_page?: number;
  initial_date?: string;
  final_date?: string;
  status?: string;
}): Promise<PaginatedResponse<DailyReport>> {
  const response = await apiClient.get(BASE, { params });
  // Backend wraps paginated data inside "result1" key
  return response.data?.result1 ?? response.data;
}

export async function getDailyReportDates(params?: { projects_id?: number }): Promise<string[]> {
  const response = await apiClient.get(`${BASE}/dates`, { params });
  return response.data;
}

export async function getDailyReport(id: number): Promise<DailyReport> {
  const response = await apiClient.get(`${BASE}/${id}`);
  return response.data;
}

export async function createDailyReport(data: {
  projects_id: number;
  rdo_date: string;
  shift?: string;
  weather_morning?: string;
  weather_afternoon?: string;
  weather_night?: string;
  temperature_min?: number;
  temperature_max?: number;
  safety_topic?: string;
  general_observations?: string;
  schedule_id?: number[];
}): Promise<DailyReport> {
  const response = await apiClient.post(BASE, data);
  return response.data;
}

export async function updateDailyReport(id: number, data: Record<string, unknown>): Promise<DailyReport> {
  const response = await apiClient.patch(`${BASE}/${id}`, data);
  return response.data;
}

export async function finalizeDailyReport(id: number): Promise<DailyReport> {
  const response = await apiClient.post(`${BASE}/${id}/finalize`);
  return response.data;
}

export async function approveDailyReport(id: number): Promise<DailyReport> {
  const response = await apiClient.post(`${BASE}/${id}/approve`);
  return response.data;
}

export async function rejectDailyReport(id: number, data: { rejection_reason: string }): Promise<DailyReport> {
  const response = await apiClient.post(`${BASE}/${id}/reject`, data);
  return response.data;
}

// Workforce
export async function addWorkforce(reportId: number, data: {
  role_category: string;
  quantity_planned: number;
  quantity_present: number;
  quantity_absent?: number;
  absence_reason?: string;
}): Promise<DailyReportWorkforce> {
  const response = await apiClient.post(`${BASE}/${reportId}/workforce`, data);
  return response.data;
}

export async function updateWorkforce(entryId: number, data: Record<string, unknown>): Promise<DailyReportWorkforce> {
  const response = await apiClient.patch(`${BASE}/workforce/${entryId}`, data);
  return response.data;
}

export async function deleteWorkforce(entryId: number): Promise<void> {
  await apiClient.delete(`${BASE}/workforce/${entryId}`);
}

// Activities
export async function addActivity(reportId: number, data: {
  description: string;
  projects_backlogs_id?: number;
  quantity_done?: number;
  unity_id?: number;
  teams_id?: number;
  location_description?: string;
}): Promise<DailyReportActivity> {
  const response = await apiClient.post(`${BASE}/${reportId}/activities`, data);
  return response.data;
}

export async function updateActivity(entryId: number, data: Record<string, unknown>): Promise<DailyReportActivity> {
  const response = await apiClient.patch(`${BASE}/activities/${entryId}`, data);
  return response.data;
}

export async function deleteActivity(entryId: number): Promise<void> {
  await apiClient.delete(`${BASE}/activities/${entryId}`);
}

// Occurrences
export async function addOccurrence(reportId: number, data: {
  occurrence_type: string;
  description: string;
  start_time?: string;
  end_time?: string;
  duration_hours?: number;
  impact_description?: string;
}): Promise<DailyReportOccurrence> {
  const response = await apiClient.post(`${BASE}/${reportId}/occurrences`, data);
  return response.data;
}

export async function updateOccurrence(entryId: number, data: Record<string, unknown>): Promise<DailyReportOccurrence> {
  const response = await apiClient.patch(`${BASE}/occurrences/${entryId}`, data);
  return response.data;
}

export async function deleteOccurrence(entryId: number): Promise<void> {
  await apiClient.delete(`${BASE}/occurrences/${entryId}`);
}

