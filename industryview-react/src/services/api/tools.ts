import apiClient from './apiClient';
import type {
  Department,
  ToolCategory,
  Tool,
  ToolMovement,
  ToolAcceptanceTerm,
  ToolKit,
  ToolKitItem,
  ToolsSummary,
  AssignKitResult,
  PaginatedResponse,
} from '../../types';

const BASE = '/tools';

// =============================================================================
// Departments
// =============================================================================

export async function listDepartments(): Promise<Department[]> {
  const response = await apiClient.get(`${BASE}/departments`);
  return response.data;
}

export async function createDepartment(data: { name: string; description?: string }): Promise<Department> {
  const response = await apiClient.post(`${BASE}/departments`, data);
  return response.data;
}

export async function updateDepartment(id: number, data: { name?: string; description?: string }): Promise<Department> {
  const response = await apiClient.patch(`${BASE}/departments/${id}`, data);
  return response.data;
}

export async function deleteDepartment(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/departments/${id}`);
}

// =============================================================================
// Categories
// =============================================================================

export async function listCategories(): Promise<ToolCategory[]> {
  const response = await apiClient.get(`${BASE}/categories`);
  return response.data;
}

export async function createCategory(data: { name: string; description?: string }): Promise<ToolCategory> {
  const response = await apiClient.post(`${BASE}/categories`, data);
  return response.data;
}

export async function updateCategory(id: number, data: { name?: string; description?: string }): Promise<ToolCategory> {
  const response = await apiClient.patch(`${BASE}/categories/${id}`, data);
  return response.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/categories/${id}`);
}

// =============================================================================
// Tools
// =============================================================================

export async function listTools(params?: {
  category_id?: number;
  branch_id?: number;
  department_id?: number;
  project_id?: number;
  control_type?: string;
  condition?: string;
  search?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<Tool>> {
  const response = await apiClient.get(`${BASE}`, { params });
  return response.data;
}

export async function getToolById(id: number): Promise<Tool> {
  const response = await apiClient.get(`${BASE}/${id}`);
  return response.data;
}

export async function createTool(data: {
  name: string;
  control_type: 'patrimonio' | 'quantidade';
  category_id?: number;
  description?: string;
  patrimonio_code?: string;
  quantity_total?: number;
  brand?: string;
  model?: string;
  serial_number?: string;
  condition?: string;
  branch_id?: number;
  department_id?: number;
  project_id?: number;
  notes?: string;
}): Promise<Tool> {
  const response = await apiClient.post(`${BASE}`, data);
  return response.data;
}

export async function updateTool(id: number, data: Record<string, unknown>): Promise<Tool> {
  const response = await apiClient.patch(`${BASE}/${id}`, data);
  return response.data;
}

export async function deleteTool(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}

export async function getToolMovements(id: number): Promise<ToolMovement[]> {
  const response = await apiClient.get(`${BASE}/${id}/movements`);
  return response.data;
}

// =============================================================================
// Movements
// =============================================================================

export async function listMovements(params?: {
  tool_id?: number;
  movement_type?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<ToolMovement>> {
  const response = await apiClient.get(`${BASE}/movements`, { params });
  return response.data;
}

export async function transferTool(data: {
  tool_id: number;
  to_branch_id?: number;
  to_department_id?: number;
  quantity?: number;
  condition?: string;
  notes?: string;
}): Promise<Tool> {
  const response = await apiClient.post(`${BASE}/movements/transfer`, data);
  return response.data;
}

export async function assignEmployee(data: {
  tool_id: number;
  user_id: number;
  quantity?: number;
  notes?: string;
}): Promise<Tool> {
  const response = await apiClient.post(`${BASE}/movements/assign-employee`, data);
  return response.data;
}

export async function assignTeam(data: {
  tool_id: number;
  team_id: number;
  quantity?: number;
  notes?: string;
}): Promise<Tool> {
  const response = await apiClient.post(`${BASE}/movements/assign-team`, data);
  return response.data;
}

export async function assignProject(data: {
  tool_id: number;
  project_id: number;
  quantity?: number;
  notes?: string;
}): Promise<Tool> {
  const response = await apiClient.post(`${BASE}/movements/assign-project`, data);
  return response.data;
}

export async function returnTool(data: {
  tool_id: number;
  condition?: string;
  to_branch_id?: number;
  to_department_id?: number;
  quantity?: number;
  notes?: string;
}): Promise<Tool> {
  const response = await apiClient.post(`${BASE}/movements/return`, data);
  return response.data;
}

export async function assignKit(data: {
  user_id: number;
  kit_id: number;
  notes?: string;
}): Promise<AssignKitResult> {
  const response = await apiClient.post(`${BASE}/movements/assign-kit`, data);
  return response.data;
}

// =============================================================================
// Acceptance Terms
// =============================================================================

export async function listAcceptanceTerms(params?: {
  tool_id?: number;
  received_by_id?: number;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<ToolAcceptanceTerm>> {
  const response = await apiClient.get(`${BASE}/acceptance-terms`, { params });
  return response.data;
}

export async function getAcceptanceTermById(id: number): Promise<ToolAcceptanceTerm> {
  const response = await apiClient.get(`${BASE}/acceptance-terms/${id}`);
  return response.data;
}

export async function createAcceptanceTerm(data: {
  tool_id: number;
  delivered_by_id: number;
  received_by_id: number;
  notes?: string;
}): Promise<ToolAcceptanceTerm> {
  const response = await apiClient.post(`${BASE}/acceptance-terms`, data);
  return response.data;
}

// =============================================================================
// Kits
// =============================================================================

export async function listKits(params?: { cargo?: string }): Promise<ToolKit[]> {
  const response = await apiClient.get(`${BASE}/kits`, { params });
  return response.data;
}

export async function getKitById(id: number): Promise<ToolKit> {
  const response = await apiClient.get(`${BASE}/kits/${id}`);
  return response.data;
}

export async function getKitByCargo(cargo: string): Promise<ToolKit[]> {
  const response = await apiClient.get(`${BASE}/kits/by-cargo/${encodeURIComponent(cargo)}`);
  return response.data;
}

export async function createKit(data: {
  name: string;
  cargo: string;
  description?: string;
}): Promise<ToolKit> {
  const response = await apiClient.post(`${BASE}/kits`, data);
  return response.data;
}

export async function updateKit(id: number, data: { name?: string; cargo?: string; description?: string }): Promise<ToolKit> {
  const response = await apiClient.patch(`${BASE}/kits/${id}`, data);
  return response.data;
}

export async function deleteKit(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/kits/${id}`);
}

export async function addKitItem(kitId: number, data: { category_id: number; quantity?: number }): Promise<ToolKitItem> {
  const response = await apiClient.post(`${BASE}/kits/${kitId}/items`, data);
  return response.data;
}

export async function deleteKitItem(kitId: number, itemId: number): Promise<void> {
  await apiClient.delete(`${BASE}/kits/${kitId}/items/${itemId}`);
}

// =============================================================================
// User Tools & Summary
// =============================================================================

export async function getUserTools(userId: number): Promise<Tool[]> {
  const response = await apiClient.get(`${BASE}/user-tools/${userId}`);
  return response.data;
}

export async function getSummary(): Promise<ToolsSummary> {
  const response = await apiClient.get(`${BASE}/summary`);
  return response.data;
}
