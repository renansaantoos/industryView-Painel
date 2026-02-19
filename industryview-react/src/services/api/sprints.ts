import apiClient from './apiClient';
import type { Sprint, SprintStatus, SprintTask, SprintTaskStatus, SprintPanelResponse, SprintListResponse, PaginatedResponse } from '../../types';
import type { NonExecutionReason } from '../../types/task';

const SPRINTS_BASE = '/sprints';

// === Sprints CRUD ===

export async function queryAllSprints(params: {
  projects_id: number;
  page?: number;
  per_page?: number;
}): Promise<SprintListResponse> {
  const response = await apiClient.get(SPRINTS_BASE, { params });
  return response.data;
}

export async function getSprint(sprintId: number): Promise<Sprint> {
  const response = await apiClient.get(`${SPRINTS_BASE}/${sprintId}`);
  return response.data;
}

export async function addSprint(data: {
  title: string;
  start_date: string;
  end_date: string;
  projects_id: number;
  sprints_statuses_id?: number;
}): Promise<Sprint> {
  const response = await apiClient.post(SPRINTS_BASE, {
    ...data,
    start_date: data.start_date.includes('T') ? data.start_date : `${data.start_date}T00:00:00.000Z`,
    end_date: data.end_date.includes('T') ? data.end_date : `${data.end_date}T00:00:00.000Z`,
  });
  return response.data;
}

export async function editSprint(sprintId: number, data: Partial<{
  name: string;
  start_date: string;
  end_date: string;
  status: number;
}>): Promise<Sprint> {
  const response = await apiClient.patch(`${SPRINTS_BASE}/${sprintId}`, data);
  return response.data;
}

export async function deleteSprint(sprintId: number): Promise<void> {
  await apiClient.delete(`${SPRINTS_BASE}/${sprintId}`);
}

// === Sprint Statuses ===

export async function queryAllSprintStatuses(): Promise<SprintStatus[]> {
  const response = await apiClient.get(`${SPRINTS_BASE}/statuses`);
  return response.data;
}

export async function getSprintStatus(statusId: number): Promise<SprintStatus> {
  const response = await apiClient.get(`${SPRINTS_BASE}/statuses/${statusId}`);
  return response.data;
}

export async function addSprintStatus(data: { status: string }): Promise<SprintStatus> {
  const response = await apiClient.post(`${SPRINTS_BASE}/statuses`, data);
  return response.data;
}

export async function editSprintStatus(statusId: number, data: { status: string }): Promise<SprintStatus> {
  const response = await apiClient.patch(`${SPRINTS_BASE}/statuses/${statusId}`, data);
  return response.data;
}

export async function deleteSprintStatus(statusId: number): Promise<void> {
  await apiClient.delete(`${SPRINTS_BASE}/statuses/${statusId}`);
}

// === Sprint Tasks ===

/** Get sprint tasks panel with 5 categories */
export async function queryAllSprintTasks(params: {
  projects_id: number;
  sprints_id: number;
  equipaments_types_id?: number[];
  teams_id?: number[];
  fields_id?: number;
  rows_id?: number;
  search?: number;
  sections_id?: number;
  scheduled_for?: string;
  pagePen?: number;
  per_pagePen?: number;
  pageAnd?: number;
  per_pageAnd?: number;
  pageConc?: number;
  per_pageConc?: number;
  pageSem?: number;
  per_pageSem?: number;
  pageIns?: number;
  per_pageIns?: number;
}): Promise<SprintPanelResponse> {
  const response = await apiClient.post(`${SPRINTS_BASE}/tasks/panel`, params);
  return response.data;
}

export async function getSprintTask(taskId: number): Promise<SprintTask> {
  const response = await apiClient.get(`${SPRINTS_BASE}/tasks/${taskId}`);
  return response.data;
}

export async function addSprintTask(data: {
  sprints_id: number;
  projects_backlogs_id: number;
  teams_id?: number;
  subtasks_id?: number;
  sprints_tasks_statuses_id?: number;
  scheduled_for?: string;
  quantity_done?: number;
}): Promise<SprintTask> {
  const response = await apiClient.post(`${SPRINTS_BASE}/tasks`, data);
  return response.data;
}

export async function editSprintTask(taskId: number, data: Partial<{
  teams_id: number;
  sprints_tasks_statuses_id: number;
  scheduled_for: string;
  quantity_done: number;
  end_date: string;
}>): Promise<SprintTask> {
  const response = await apiClient.patch(`${SPRINTS_BASE}/tasks/${taskId}`, data);
  return response.data;
}

/** Update single task status (backend uses PUT /sprints/tasks/status) */
export async function editStatusTask(taskId: number, data: {
  sprints_tasks_statuses_id: number;
  quantity_done?: number;
}): Promise<void> {
  await apiClient.put(`${SPRINTS_BASE}/tasks/status`, { sprints_tasks_id: taskId, ...data });
}

/** Update multiple task statuses (backend uses PUT /sprints/tasks/status/list) */
export async function editStatusTaskList(data: { ids: number[]; status: number }): Promise<void> {
  await apiClient.put(`${SPRINTS_BASE}/tasks/status/list`, data);
}

export async function deleteSprintTask(taskId: number): Promise<void> {
  await apiClient.delete(`${SPRINTS_BASE}/tasks/${taskId}`);
}

// === Non-Execution Reasons ===

export async function getNonExecutionReasons(companyId?: number): Promise<NonExecutionReason[]> {
  const response = await apiClient.get(`${SPRINTS_BASE}/non-execution-reasons`, {
    params: companyId ? { company_id: companyId } : undefined,
  });
  return response.data;
}

// === Sprint Task Statuses ===

export async function queryAllSprintTaskStatuses(): Promise<SprintTaskStatus[]> {
  const response = await apiClient.get(`${SPRINTS_BASE}/tasks/statuses`);
  return response.data;
}

export async function getSprintTaskStatus(statusId: number): Promise<SprintTaskStatus> {
  const response = await apiClient.get(`${SPRINTS_BASE}/tasks/statuses/${statusId}`);
  return response.data;
}

export async function addSprintTaskStatus(data: { name: string }): Promise<SprintTaskStatus> {
  const response = await apiClient.post(`${SPRINTS_BASE}/tasks/statuses`, data);
  return response.data;
}

export async function editSprintTaskStatus(statusId: number, data: { name: string }): Promise<SprintTaskStatus> {
  const response = await apiClient.patch(`${SPRINTS_BASE}/tasks/statuses/${statusId}`, data);
  return response.data;
}

export async function deleteSprintTaskStatus(statusId: number): Promise<void> {
  await apiClient.delete(`${SPRINTS_BASE}/tasks/statuses/${statusId}`);
}

// === Sprint Charts ===

export async function getSprintChartData(params: {
  sprints_id: number;
  teams_ids?: number[];
  date_start?: string;
  date_end?: string;
}): Promise<unknown> {
  const response = await apiClient.get(`${SPRINTS_BASE}/chart`, { params });
  return response.data;
}

/** Get counts of subtasks (backend uses GET /sprints/subtasks/count) */
export async function getCountsSubtasks(sprintId: number): Promise<unknown> {
  const response = await apiClient.get(`${SPRINTS_BASE}/subtasks/count`, { params: { sprints_id: sprintId } });
  return response.data;
}
