import apiClient from './apiClient';
import type { PaginatedResponse, Tracker, TrackerType } from '../../types';

const TRACKERS_BASE = '/trackers';

// === Trackers ===

export async function queryAllTrackers(params?: {
  projects_id?: number;
  page?: number;
  per_page?: number;
  search?: string;
  manufacturer_id?: number;
  type_id?: number;
}): Promise<PaginatedResponse<Tracker>> {
  const response = await apiClient.get(TRACKERS_BASE, { params });
  return response.data;
}

export async function getTracker(trackerId: number): Promise<unknown> {
  const response = await apiClient.get(`${TRACKERS_BASE}/${trackerId}`);
  return response.data;
}

export async function addTracker(data: Record<string, unknown>): Promise<Tracker> {
  const response = await apiClient.post(TRACKERS_BASE, data);
  return response.data;
}

export async function editTracker(trackerId: number, data: Record<string, unknown>): Promise<unknown> {
  const response = await apiClient.patch(`${TRACKERS_BASE}/${trackerId}`, data);
  return response.data;
}

export async function deleteTracker(trackerId: number): Promise<void> {
  await apiClient.delete(`${TRACKERS_BASE}/${trackerId}`);
}

// === Tracker Types ===

export async function queryAllTrackerTypes(): Promise<TrackerType[]> {
  const response = await apiClient.get(`${TRACKERS_BASE}/types`);
  return response.data;
}

// === Tracker Map (backend uses /trackers/map) ===

export async function getTrackerModulesMap(params: {
  sections_id?: number;
  fields_id?: number;
  section_number?: number;
  row_id?: number;
  projects_id?: number;
}): Promise<unknown> {
  const response = await apiClient.get(`${TRACKERS_BASE}/map`, { params });
  return response.data;
}

/** Alias for backwards-compat - same as getTrackerModulesMap */
export async function getModulesMap(params: {
  projects_id?: number;
  sections_id?: number;
  fields_id?: number;
}): Promise<unknown> {
  const response = await apiClient.get(`${TRACKERS_BASE}/map`, { params });
  return response.data;
}

// === Sections & Rows ===

export async function getSections(projectId: number): Promise<unknown[]> {
  const response = await apiClient.get(`${TRACKERS_BASE}/sections`, {
    params: { projects_id: projectId },
  });
  return response.data;
}

/** List rows (backend uses POST /trackers/rows/list) */
export async function getRows(sectionId: number): Promise<unknown[]> {
  const response = await apiClient.post(`${TRACKERS_BASE}/rows/list`, {
    sections_id: sectionId,
  });
  return response.data;
}

// === Stakes ===

/** Get stakes (backend uses GET /trackers/stakes with query params) */
export async function getStakes(trackerId: number): Promise<unknown[]> {
  const response = await apiClient.get(`${TRACKERS_BASE}/stakes`, {
    params: { trackers_id: trackerId },
  });
  return response.data;
}

export async function updateStakeStatus(stakeId: number, data: { status: number }): Promise<void> {
  await apiClient.patch(`${TRACKERS_BASE}/stakes/${stakeId}`, data);
}

/** Get stake statuses (backend uses GET /trackers/rows-trackers-statuses) */
export async function getStakeStatuses(): Promise<unknown[]> {
  const response = await apiClient.get(`${TRACKERS_BASE}/rows-trackers-statuses`);
  return response.data;
}

// === Modules ===

export async function getModules(params?: {
  page?: number;
  per_page?: number;
  search?: string;
}): Promise<PaginatedResponse<unknown>> {
  const response = await apiClient.get(`${TRACKERS_BASE}/modules`, { params });
  return response.data;
}

export async function addModule(data: Record<string, unknown>): Promise<unknown> {
  const response = await apiClient.post(`${TRACKERS_BASE}/modules`, data);
  return response.data;
}

export async function editModule(moduleId: number, data: Record<string, unknown>): Promise<unknown> {
  const response = await apiClient.patch(`${TRACKERS_BASE}/modules/${moduleId}`, data);
  return response.data;
}

export async function deleteModule(moduleId: number): Promise<void> {
  await apiClient.delete(`${TRACKERS_BASE}/modules/${moduleId}`);
}
