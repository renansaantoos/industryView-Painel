import apiClient from './apiClient';
import type {
  CompanyModule,
  ScheduleBaseline,
  TaskDependency,
  GanttItem,
  CurveSData,
  BacklogPlanningUpdate,
  ScheduleImport,
  ImportResult,
  ScheduleHealthData,
  CriticalPathData,
} from '../../types';

const PLANNING_BASE = '/planning';

// ── Company Modules (feature toggles) ─────────────────────────────────────────

/** List all modules configured for a company */
export async function listCompanyModules(params: {
  company_id: number;
}): Promise<CompanyModule[]> {
  const response = await apiClient.get(`${PLANNING_BASE}/company-modules`, { params });
  return response.data;
}

/** Check whether a specific module is active for a company */
export async function checkModuleActive(params: {
  company_id: number;
  module_name: string;
}): Promise<{ is_active: boolean }> {
  const response = await apiClient.get(`${PLANNING_BASE}/company-modules/check`, { params });
  return response.data;
}

/** Enable or disable a module for a company */
export async function updateCompanyModule(data: {
  company_id: number;
  module_name: string;
  is_active: boolean;
}): Promise<CompanyModule> {
  const response = await apiClient.put(`${PLANNING_BASE}/company-modules`, data);
  return response.data;
}

// ── Schedule Baselines ─────────────────────────────────────────────────────────

/** List all baselines for a project */
export async function listBaselines(params: { projects_id: number }): Promise<ScheduleBaseline[]> {
  const response = await apiClient.get(`${PLANNING_BASE}/baselines`, { params });
  return response.data;
}

/** Create a new schedule baseline (snapshot of current plan) */
export async function createBaseline(data: Record<string, unknown>): Promise<ScheduleBaseline> {
  const response = await apiClient.post(`${PLANNING_BASE}/baselines`, data);
  return response.data;
}

/** Get a single baseline by ID */
export async function getBaseline(id: number): Promise<ScheduleBaseline> {
  const response = await apiClient.get(`${PLANNING_BASE}/baselines/${id}`);
  return response.data;
}

/** Get Curve-S (planned vs actual progress over time) for a baseline */
export async function getCurveS(
  id: number,
  params: { projects_id: number },
): Promise<CurveSData[]> {
  const response = await apiClient.get(`${PLANNING_BASE}/baselines/${id}/curve-s`, { params });
  return response.data;
}

// ── Task Dependencies ──────────────────────────────────────────────────────────

/** List all task dependencies for a project */
export async function listDependencies(params: {
  projects_id: number;
}): Promise<TaskDependency[]> {
  const response = await apiClient.get(`${PLANNING_BASE}/dependencies`, { params });
  return response.data;
}

/** List dependencies for a specific backlog item */
export async function getDependenciesForBacklog(backlogId: number): Promise<TaskDependency[]> {
  const response = await apiClient.get(`${PLANNING_BASE}/dependencies/backlog/${backlogId}`);
  return response.data;
}

/** Create a dependency between two backlog items */
export async function createDependency(data: Record<string, unknown>): Promise<TaskDependency> {
  const response = await apiClient.post(`${PLANNING_BASE}/dependencies`, data);
  return response.data;
}

/** Delete a task dependency */
export async function deleteDependency(id: number): Promise<void> {
  await apiClient.delete(`${PLANNING_BASE}/dependencies/${id}`);
}

// ── Gantt ──────────────────────────────────────────────────────────────────────

/** Get Gantt chart data for a project, optionally scoped to a sprint */
export async function getGanttData(params: {
  projects_id: number;
  sprints_id?: number;
}): Promise<GanttItem[]> {
  const response = await apiClient.get(`${PLANNING_BASE}/gantt`, { params });
  return response.data;
}

// ── Backlog Planning ───────────────────────────────────────────────────────────

/** Bulk update planned dates/costs for multiple backlog items at once */
export async function bulkUpdateBacklogPlanning(data: {
  projects_id: number;
  items: BacklogPlanningUpdate[];
}): Promise<void> {
  await apiClient.put(`${PLANNING_BASE}/backlog-planning/bulk`, data);
}

/** Partially update the planning data for a single backlog item */
export async function updateBacklogPlanning(
  id: number,
  data: Record<string, unknown>,
): Promise<void> {
  await apiClient.patch(`${PLANNING_BASE}/backlog-planning/${id}`, data);
}

// ── Schedule Import ──────────────────────────────────────────────────────────

/** Upload schedule file and process import */
export async function uploadSchedule(
  projectsId: number,
  file: File,
  importMode: string = 'create',
  columnMapping?: Record<string, string>,
): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('projects_id', String(projectsId));
  formData.append('import_mode', importMode);
  if (columnMapping) {
    formData.append('column_mapping', JSON.stringify(columnMapping));
  }
  const response = await apiClient.post('/schedule-import/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  });
  return response.data;
}

/** Get import history for a project */
export async function getImportHistory(params: {
  projects_id: number;
}): Promise<ScheduleImport[]> {
  const response = await apiClient.get('/schedule-import/history', { params });
  return response.data;
}

/** Download import template */
export async function downloadTemplate(format: 'xlsx' | 'csv' = 'xlsx'): Promise<Blob> {
  const response = await apiClient.get('/schedule-import/template', {
    params: { format },
    responseType: 'blob',
  });
  return response.data;
}

// ── Schedule Health & Critical Path ──────────────────────────────────────────

/** Get schedule health indicators */
export async function getScheduleHealth(params: {
  projects_id: number;
}): Promise<ScheduleHealthData> {
  const response = await apiClient.get(`${PLANNING_BASE}/schedule-health`, { params });
  return response.data;
}

/** Get critical path */
export async function getCriticalPath(params: {
  projects_id: number;
}): Promise<CriticalPathData> {
  const response = await apiClient.get(`${PLANNING_BASE}/critical-path`, { params });
  return response.data;
}

// ── Rollup ───────────────────────────────────────────────────────────────────

/** Trigger rollup for a specific backlog */
export async function triggerRollup(backlogId: number): Promise<void> {
  await apiClient.post(`${PLANNING_BASE}/rollup/${backlogId}`);
}

/** Trigger rollup for entire project */
export async function triggerProjectRollup(projectsId: number): Promise<void> {
  await apiClient.post(`${PLANNING_BASE}/rollup-project/${projectsId}`);
}
