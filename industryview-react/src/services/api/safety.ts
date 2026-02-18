import apiClient from './apiClient';
import type {
  SafetyIncident,
  SafetyIncidentStatistics,
  TrainingType,
  WorkerTraining,
  TaskRequiredTraining,
  DdsRecord,
  DdsStatistics,
  PaginatedResponse,
} from '../../types';

const SAFETY_BASE = '/safety';

// ── Incidents ────────────────────────────────────────────────────────────────

/** List incidents with optional filters */
export async function listIncidents(params?: {
  projects_id?: number;
  company_id?: number;
  severity?: string;
  status?: string;
  initial_date?: string;
  final_date?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<SafetyIncident>> {
  const response = await apiClient.get(`${SAFETY_BASE}/incidents`, { params });
  return response.data;
}

/** Get incident statistics (Bird Pyramid) */
export async function getIncidentStatistics(params?: {
  projects_id?: number;
  company_id?: number;
}): Promise<SafetyIncidentStatistics> {
  const response = await apiClient.get(`${SAFETY_BASE}/incidents/statistics`, { params });
  return response.data;
}

/** Get a single incident by ID */
export async function getIncident(id: number): Promise<SafetyIncident> {
  const response = await apiClient.get(`${SAFETY_BASE}/incidents/${id}`);
  return response.data;
}

/** Create a new incident */
export async function createIncident(data: {
  reported_by: number;
  incident_date: string;
  description: string;
  location?: string;
  severity: string;
  projects_id?: number;
  company_id?: number;
}): Promise<SafetyIncident> {
  const response = await apiClient.post(`${SAFETY_BASE}/incidents`, data);
  return response.data;
}

/** Partially update an incident */
export async function updateIncident(
  id: number,
  data: Record<string, unknown>,
): Promise<SafetyIncident> {
  const response = await apiClient.patch(`${SAFETY_BASE}/incidents/${id}`, data);
  return response.data;
}

/** Move incident to "em_investigacao" and record initial findings */
export async function investigateIncident(
  id: number,
  data: { root_cause?: string; corrective_actions?: string },
): Promise<SafetyIncident> {
  const response = await apiClient.post(`${SAFETY_BASE}/incidents/${id}/investigate`, data);
  return response.data;
}

/** Close an incident with root cause and corrective actions */
export async function closeIncident(
  id: number,
  data: { root_cause: string; corrective_actions: string },
): Promise<SafetyIncident> {
  const response = await apiClient.post(`${SAFETY_BASE}/incidents/${id}/close`, data);
  return response.data;
}

/** Add a witness to an incident */
export async function addWitness(
  incidentId: number,
  data: { users_id: number; statement?: string },
): Promise<void> {
  await apiClient.post(`${SAFETY_BASE}/incidents/${incidentId}/witnesses`, data);
}

/** Add an attachment to an incident */
export async function addAttachment(
  incidentId: number,
  data: { file_url: string; file_name?: string; file_type?: string },
): Promise<void> {
  await apiClient.post(`${SAFETY_BASE}/incidents/${incidentId}/attachments`, data);
}

// ── Training Types ────────────────────────────────────────────────────────────

/** List all training types */
export async function listTrainingTypes(params?: {
  company_id?: number;
}): Promise<TrainingType[]> {
  const response = await apiClient.get(`${SAFETY_BASE}/training-types`, { params });
  return response.data;
}

/** Create a new training type */
export async function createTrainingType(data: Record<string, unknown>): Promise<TrainingType> {
  const response = await apiClient.post(`${SAFETY_BASE}/training-types`, data);
  return response.data;
}

/** Partially update a training type */
export async function updateTrainingType(
  id: number,
  data: Record<string, unknown>,
): Promise<TrainingType> {
  const response = await apiClient.patch(`${SAFETY_BASE}/training-types/${id}`, data);
  return response.data;
}

/** Delete a training type */
export async function deleteTrainingType(id: number): Promise<void> {
  await apiClient.delete(`${SAFETY_BASE}/training-types/${id}`);
}

// ── Worker Trainings ──────────────────────────────────────────────────────────

/** List worker training records with optional filters */
export async function listWorkerTrainings(params?: {
  users_id?: number;
  training_types_id?: number;
  company_id?: number;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<WorkerTraining>> {
  const response = await apiClient.get(`${SAFETY_BASE}/worker-trainings`, { params });
  return response.data;
}

/** Get worker trainings expiring soon */
export async function getExpiringTrainings(params?: {
  company_id?: number;
  days_ahead?: number;
}): Promise<WorkerTraining[]> {
  const response = await apiClient.get(`${SAFETY_BASE}/worker-trainings/expiring`, { params });
  return response.data;
}

/** Get worker trainings that have already expired */
export async function getExpiredTrainings(params?: {
  company_id?: number;
}): Promise<WorkerTraining[]> {
  const response = await apiClient.get(`${SAFETY_BASE}/worker-trainings/expired`, { params });
  return response.data;
}

/** Create a new worker training record */
export async function createWorkerTraining(data: Record<string, unknown>): Promise<WorkerTraining> {
  const response = await apiClient.post(`${SAFETY_BASE}/worker-trainings`, data);
  return response.data;
}

// ── Task Required Trainings ───────────────────────────────────────────────────

/** List trainings required for a task template */
export async function listTaskRequiredTrainings(params?: {
  task_templates_id?: number;
}): Promise<TaskRequiredTraining[]> {
  const response = await apiClient.get(`${SAFETY_BASE}/task-required-trainings`, { params });
  return response.data;
}

/** Link a training type as required for a task template */
export async function createTaskRequiredTraining(
  data: Record<string, unknown>,
): Promise<TaskRequiredTraining> {
  const response = await apiClient.post(`${SAFETY_BASE}/task-required-trainings`, data);
  return response.data;
}

/** Remove a task required training link */
export async function deleteTaskRequiredTraining(id: number): Promise<void> {
  await apiClient.delete(`${SAFETY_BASE}/task-required-trainings/${id}`);
}

// ── DDS (Diálogo Diário de Segurança) ────────────────────────────────────────

/** List DDS records with optional filters */
export async function listDdsRecords(params?: {
  projects_id?: number;
  company_id?: number;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<DdsRecord>> {
  const response = await apiClient.get(`${SAFETY_BASE}/dds`, { params });
  return response.data;
}

/** Get DDS statistics */
export async function getDdsStatistics(params?: {
  projects_id?: number;
  company_id?: number;
}): Promise<DdsStatistics> {
  const response = await apiClient.get(`${SAFETY_BASE}/dds/statistics`, { params });
  return response.data;
}

/** Get a single DDS record by ID */
export async function getDdsRecord(id: number): Promise<DdsRecord> {
  const response = await apiClient.get(`${SAFETY_BASE}/dds/${id}`);
  return response.data;
}

/** Create a new DDS record */
export async function createDdsRecord(data: Record<string, unknown>): Promise<DdsRecord> {
  const response = await apiClient.post(`${SAFETY_BASE}/dds`, data);
  return response.data;
}

/** Add a participant to a DDS record */
export async function addDdsParticipant(
  ddsId: number,
  data: { users_id: number },
): Promise<void> {
  await apiClient.post(`${SAFETY_BASE}/dds/${ddsId}/participants`, data);
}

/** Record a participant's signature on a DDS record */
export async function signDdsParticipation(
  ddsId: number,
  data: { users_id: number },
): Promise<void> {
  await apiClient.post(`${SAFETY_BASE}/dds/${ddsId}/sign`, data);
}
