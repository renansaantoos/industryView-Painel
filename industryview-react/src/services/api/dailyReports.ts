import apiClient from './apiClient';
import type { DailyReport, DailyReportWorkforce, DailyReportActivity, DailyReportOccurrence, DailyReportEquipment, PaginatedResponse } from '../../types';

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
  return response.data;
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
  report_date: string;
  shift?: string;
  weather?: string;
  temperature_min?: number;
  temperature_max?: number;
  observations?: string;
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

export async function rejectDailyReport(id: number, data: { rejection_reason?: string }): Promise<DailyReport> {
  const response = await apiClient.post(`${BASE}/${id}/reject`, data);
  return response.data;
}

// Workforce
export async function addWorkforce(reportId: number, data: Omit<DailyReportWorkforce, 'id' | 'daily_reports_id'>): Promise<DailyReportWorkforce> {
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
export async function addActivity(reportId: number, data: Omit<DailyReportActivity, 'id' | 'daily_reports_id'>): Promise<DailyReportActivity> {
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
export async function addOccurrence(reportId: number, data: Omit<DailyReportOccurrence, 'id' | 'daily_reports_id'>): Promise<DailyReportOccurrence> {
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

// Equipment
export async function addEquipment(reportId: number, data: Omit<DailyReportEquipment, 'id' | 'daily_reports_id'>): Promise<DailyReportEquipment> {
  const response = await apiClient.post(`${BASE}/${reportId}/equipment`, data);
  return response.data;
}

export async function updateEquipment(entryId: number, data: Record<string, unknown>): Promise<DailyReportEquipment> {
  const response = await apiClient.patch(`${BASE}/equipment/${entryId}`, data);
  return response.data;
}

export async function deleteEquipment(entryId: number): Promise<void> {
  await apiClient.delete(`${BASE}/equipment/${entryId}`);
}
