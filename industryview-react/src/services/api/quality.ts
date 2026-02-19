import apiClient from './apiClient';
import type {
  NonConformance,
  NonConformanceStatistics,
  Document,
  DocumentAcknowledgment,
  TaskDocument,
  ChecklistTemplate,
  ChecklistResponse,
  GoldenRule,
  TaskGoldenRule,
  TaskChecklist,
  PaginatedResponse,
} from '../../types';

const QUALITY_BASE = '/quality';

// ── Non-Conformances ──────────────────────────────────────────────────────────

/** List non-conformances with optional filters */
export async function listNonConformances(params?: {
  projects_id?: number;
  status?: string;
  severity?: string;
  category?: string;
  origin?: string;
  responsible_id?: number;
  responsible_user_id?: number;
  initial_date?: string;
  final_date?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<NonConformance>> {
  const response = await apiClient.get(`${QUALITY_BASE}/non-conformances`, { params });
  return response.data;
}

/** Get non-conformance statistics */
export async function getNcStatistics(params?: {
  projects_id?: number;
  company_id?: number;
}): Promise<NonConformanceStatistics> {
  const response = await apiClient.get(`${QUALITY_BASE}/non-conformances/statistics`, { params });
  return response.data;
}

/** Get a single non-conformance by ID */
export async function getNonConformance(id: number): Promise<NonConformance> {
  const response = await apiClient.get(`${QUALITY_BASE}/non-conformances/${id}`);
  return response.data;
}

/** Create a new non-conformance */
export async function createNonConformance(data: Record<string, unknown>): Promise<NonConformance> {
  const response = await apiClient.post(`${QUALITY_BASE}/non-conformances`, data);
  return response.data;
}

/** Partially update a non-conformance */
export async function updateNonConformance(
  id: number,
  data: Record<string, unknown>,
): Promise<NonConformance> {
  const response = await apiClient.patch(`${QUALITY_BASE}/non-conformances/${id}`, data);
  return response.data;
}

/** Close a non-conformance */
export async function closeNonConformance(
  id: number,
  data: Record<string, unknown>,
): Promise<NonConformance> {
  const response = await apiClient.post(`${QUALITY_BASE}/non-conformances/${id}/close`, data);
  return response.data;
}

/** Add an attachment to a non-conformance */
export async function addNcAttachment(
  ncId: number,
  data: { file_url: string; file_name?: string; file_type?: string },
): Promise<void> {
  await apiClient.post(`${QUALITY_BASE}/non-conformances/${ncId}/attachments`, data);
}

// ── Documents (GED) ───────────────────────────────────────────────────────────

/** List documents with optional filters */
export async function listDocuments(params?: {
  company_id?: number;
  projects_id?: number;
  document_type?: string;
  status?: string;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<Document>> {
  const response = await apiClient.get(`${QUALITY_BASE}/documents`, { params });
  return response.data;
}

/** Get documents pending acknowledgment for a user */
export async function getPendingAcknowledgments(params?: {
  users_id?: number;
}): Promise<DocumentAcknowledgment[]> {
  const response = await apiClient.get(`${QUALITY_BASE}/documents/pending-acknowledgments`, {
    params,
  });
  return response.data;
}

/** Get a single document by ID */
export async function getDocument(id: number): Promise<Document> {
  const response = await apiClient.get(`${QUALITY_BASE}/documents/${id}`);
  return response.data;
}

/** Create a new document */
export async function createDocument(data: Record<string, unknown>): Promise<Document> {
  const response = await apiClient.post(`${QUALITY_BASE}/documents`, data);
  return response.data;
}

/** Partially update a document */
export async function updateDocument(
  id: number,
  data: Record<string, unknown>,
): Promise<Document> {
  const response = await apiClient.patch(`${QUALITY_BASE}/documents/${id}`, data);
  return response.data;
}

/** Approve a document */
export async function approveDocument(id: number): Promise<Document> {
  const response = await apiClient.post(`${QUALITY_BASE}/documents/${id}/approve`, {});
  return response.data;
}

/** Acknowledge a document (current user confirms they have read it) */
export async function acknowledgeDocument(id: number): Promise<void> {
  await apiClient.post(`${QUALITY_BASE}/documents/${id}/acknowledge`, {});
}

// ── Task Documents ─────────────────────────────────────────────────────────────

/** List documents linked to a task template */
export async function listTaskDocuments(params?: {
  task_templates_id?: number;
}): Promise<TaskDocument[]> {
  const response = await apiClient.get(`${QUALITY_BASE}/task-documents`, { params });
  return response.data;
}

/** Link a document to a task template */
export async function createTaskDocument(data: Record<string, unknown>): Promise<TaskDocument> {
  const response = await apiClient.post(`${QUALITY_BASE}/task-documents`, data);
  return response.data;
}

/** Remove a task document link */
export async function deleteTaskDocument(id: number): Promise<void> {
  await apiClient.delete(`${QUALITY_BASE}/task-documents/${id}`);
}

// ── Checklist Templates ────────────────────────────────────────────────────────

/** List checklist templates with optional filters */
export async function listChecklistTemplates(params?: {
  company_id?: number;
  category?: string;
}): Promise<ChecklistTemplate[]> {
  const response = await apiClient.get(`${QUALITY_BASE}/checklist-templates`, { params });
  return response.data;
}

/** Create a new checklist template */
export async function createChecklistTemplate(
  data: Record<string, unknown>,
): Promise<ChecklistTemplate> {
  const response = await apiClient.post(`${QUALITY_BASE}/checklist-templates`, data);
  return response.data;
}

/** Partially update a checklist template */
export async function updateChecklistTemplate(
  id: number,
  data: Record<string, unknown>,
): Promise<ChecklistTemplate> {
  const response = await apiClient.patch(`${QUALITY_BASE}/checklist-templates/${id}`, data);
  return response.data;
}

/** Delete a checklist template */
export async function deleteChecklistTemplate(id: number): Promise<void> {
  await apiClient.delete(`${QUALITY_BASE}/checklist-templates/${id}`);
}

// ── Checklist Responses ────────────────────────────────────────────────────────

/** List completed checklist responses with optional filters */
export async function listChecklistResponses(params?: {
  checklist_templates_id?: number;
  projects_id?: number;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<ChecklistResponse>> {
  const response = await apiClient.get(`${QUALITY_BASE}/checklist-responses`, { params });
  return response.data;
}

/** Get a single checklist response by ID */
export async function getChecklistResponse(id: number): Promise<ChecklistResponse> {
  const response = await apiClient.get(`${QUALITY_BASE}/checklist-responses/${id}`);
  return response.data;
}

/** Submit a completed checklist response */
export async function createChecklistResponse(
  data: Record<string, unknown>,
): Promise<ChecklistResponse> {
  const response = await apiClient.post(`${QUALITY_BASE}/checklist-responses`, data);
  return response.data;
}

// ── Golden Rules ───────────────────────────────────────────────────────────────

/** List golden rules with optional filters */
export async function listGoldenRules(params?: { company_id?: number }): Promise<GoldenRule[]> {
  const response = await apiClient.get(`${QUALITY_BASE}/golden-rules`, { params });
  return response.data;
}

/** Create a new golden rule */
export async function createGoldenRule(data: Record<string, unknown>): Promise<GoldenRule> {
  const response = await apiClient.post(`${QUALITY_BASE}/golden-rules`, data);
  return response.data;
}

/** Partially update a golden rule */
export async function updateGoldenRule(
  id: number,
  data: Record<string, unknown>,
): Promise<GoldenRule> {
  const response = await apiClient.patch(`${QUALITY_BASE}/golden-rules/${id}`, data);
  return response.data;
}

/** Delete a golden rule */
export async function deleteGoldenRule(id: number): Promise<void> {
  await apiClient.delete(`${QUALITY_BASE}/golden-rules/${id}`);
}

// ── Task Golden Rules ──────────────────────────────────────────────────────────

/** List golden rules linked to a task template */
export async function listTaskGoldenRules(params?: {
  task_templates_id?: number;
}): Promise<TaskGoldenRule[]> {
  const response = await apiClient.get(`${QUALITY_BASE}/task-golden-rules`, {
    params: params?.task_templates_id ? { tasks_id: params.task_templates_id } : {},
  });
  return response.data;
}

/** Link a golden rule to a task template */
export async function createTaskGoldenRule(data: Record<string, unknown>): Promise<TaskGoldenRule> {
  const response = await apiClient.post(`${QUALITY_BASE}/task-golden-rules`, data);
  return response.data;
}

/** Remove a task golden rule link */
export async function deleteTaskGoldenRule(id: number): Promise<void> {
  await apiClient.delete(`${QUALITY_BASE}/task-golden-rules/${id}`);
}

// ── Task Checklists (pivot) ──────────────────────────────────────────────────

/** List checklists linked to a task template */
export async function listTaskChecklists(params?: {
  tasks_id?: number;
}): Promise<TaskChecklist[]> {
  const response = await apiClient.get(`${QUALITY_BASE}/task-checklists`, { params });
  return response.data;
}

/** Link a checklist template to a task template */
export async function createTaskChecklist(data: {
  tasks_template_id: number;
  checklist_templates_id: number;
}): Promise<TaskChecklist> {
  const response = await apiClient.post(`${QUALITY_BASE}/task-checklists`, data);
  return response.data;
}

/** Remove a task-checklist link */
export async function deleteTaskChecklist(id: number): Promise<void> {
  await apiClient.delete(`${QUALITY_BASE}/task-checklists/${id}`);
}
