import apiClient from './apiClient';
import type { Task, TaskPriority, Unity, Discipline, PaginatedResponse } from '../../types';

const TASKS_BASE = '/tasks';

// === Tasks CRUD ===

/** List tasks with pagination (backend uses POST /tasks/list) */
export async function queryAllTasks(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  discipline_id?: number;
  sort_field?: string;
  sort_direction?: 'asc' | 'desc';
}): Promise<PaginatedResponse<Task>> {
  const response = await apiClient.post(`${TASKS_BASE}/list`, params || {});
  return response.data;
}

/** Get all task templates (backend uses GET /tasks/all_tasks_template) */
export async function queryAllTaskIds(params?: {
  page?: number;
  per_page?: number;
  search?: string;
}): Promise<PaginatedResponse<{ id: number; name: string }>> {
  const response = await apiClient.get(`${TASKS_BASE}/all_tasks_template`, { params });
  return response.data;
}

export async function getTask(taskId: number): Promise<Task> {
  const response = await apiClient.get(`${TASKS_BASE}/${taskId}`);
  return response.data;
}

export async function addTask(data: {
  description: string;
  weight?: number;
  amount?: number;
  unity_id?: number;
  company_id?: number;
  discipline_id?: number;
  equipaments_types_id?: number;
  fixed?: boolean;
  is_inspection?: boolean;
  installation_method?: string;
  checklist_templates_id?: number;
}): Promise<Task> {
  const response = await apiClient.post(TASKS_BASE, data);
  return response.data;
}

export async function editTask(taskId: number, data: Partial<{
  description: string;
  weight: number;
  amount: number;
  unity_id: number;
  company_id: number;
  discipline_id: number;
  equipaments_types_id: number;
  fixed: boolean;
  is_inspection: boolean;
  installation_method: string;
  checklist_templates_id: number;
}>): Promise<Task> {
  const response = await apiClient.patch(`${TASKS_BASE}/${taskId}`, data);
  return response.data;
}

export async function deactivateTask(taskId: number): Promise<void> {
  await apiClient.delete(`${TASKS_BASE}/${taskId}`);
}

export async function deleteTask(taskId: number): Promise<void> {
  await apiClient.delete(`${TASKS_BASE}/${taskId}`);
}

/** Get all tasks without pagination (backend uses GET /tasks/all_tasks_template) */
export async function queryAllTasksNoPagination(params?: {
  search?: string;
  discipline_id?: number;
}): Promise<Task[]> {
  const response = await apiClient.get(`${TASKS_BASE}/all_tasks_template`, { params });
  return response.data;
}

// === Task Priorities ===

export async function queryAllTaskPriorities(): Promise<TaskPriority[]> {
  const response = await apiClient.get(`${TASKS_BASE}/priorities`);
  return response.data;
}

export async function getTaskPriority(priorityId: number): Promise<TaskPriority> {
  const response = await apiClient.get(`${TASKS_BASE}/priorities/${priorityId}`);
  return response.data;
}

export async function addTaskPriority(data: { name: string; level: number }): Promise<TaskPriority> {
  const response = await apiClient.post(`${TASKS_BASE}/priorities`, data);
  return response.data;
}

export async function editTaskPriority(priorityId: number, data: { name: string; level: number }): Promise<TaskPriority> {
  const response = await apiClient.patch(`${TASKS_BASE}/priorities/${priorityId}`, data);
  return response.data;
}

export async function deleteTaskPriority(priorityId: number): Promise<void> {
  await apiClient.delete(`${TASKS_BASE}/priorities/${priorityId}`);
}

// === Unity ===

export async function getUnity(): Promise<Unity[]> {
  const response = await apiClient.get(`${TASKS_BASE}/unity`);
  return response.data;
}

export async function addUnity(data: { name: string; abbreviation?: string }): Promise<Unity> {
  const response = await apiClient.post(`${TASKS_BASE}/unity`, data);
  return response.data;
}

export async function editUnity(unityId: number, data: { name: string; abbreviation?: string }): Promise<Unity> {
  const response = await apiClient.patch(`${TASKS_BASE}/unity/${unityId}`, data);
  return response.data;
}

export async function deleteUnity(unityId: number): Promise<void> {
  await apiClient.delete(`${TASKS_BASE}/unity/${unityId}`);
}

// === Discipline ===

export async function getDisciplines(): Promise<Discipline[]> {
  const response = await apiClient.get(`${TASKS_BASE}/discipline`);
  return response.data;
}

export async function addDiscipline(data: { name: string }): Promise<Discipline> {
  const response = await apiClient.post(`${TASKS_BASE}/discipline`, data);
  return response.data;
}

export async function editDiscipline(disciplineId: number, data: { name: string }): Promise<Discipline> {
  const response = await apiClient.put(`${TASKS_BASE}/discipline/${disciplineId}`, data);
  return response.data;
}

export async function deleteDiscipline(disciplineId: number): Promise<void> {
  await apiClient.delete(`${TASKS_BASE}/discipline/${disciplineId}`);
}

// === Backlog Comments ===

export async function queryAllBacklogComments(backlogId: number) {
  const response = await apiClient.get(`${TASKS_BASE}/comments/backlogs`, { params: { backlog_id: backlogId } });
  return response.data;
}

export async function queryAllSubtaskComments(subtaskId: number) {
  const response = await apiClient.get(`${TASKS_BASE}/comments/subtasks`, { params: { subtask_id: subtaskId } });
  return response.data;
}

// === Import ===

export async function importCronograma(data: FormData): Promise<{ message: string }> {
  const response = await apiClient.post(`${TASKS_BASE}/import`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}
