import apiClient from './apiClient';
import type { UserFull, UserListItem, UserLeader, PaginatedResponse } from '../../types';

const USERS_BASE = '/users';

/** Get a single user */
export async function getUser(userId: number): Promise<UserFull> {
  const response = await apiClient.get(`${USERS_BASE}/${userId}`);
  return response.data;
}

/** Query all users with pagination and search (backend uses POST /users/list) */
export async function queryAllUsers(params: {
  page?: number;
  per_page?: number;
  search?: string;
  ids_cargo?: number[];
  team_id?: number;
  sort_field?: string;
  sort_direction?: 'asc' | 'desc';
}): Promise<PaginatedResponse<UserFull>> {
  const response = await apiClient.post(`${USERS_BASE}/list`, params);
  return response.data;
}

/** Add a new user (backend uses POST /users/users) */
export async function addUser(data: {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  users_roles_id?: number;
  users_system_access_id?: number;
  users_control_system_id?: number;
}): Promise<UserFull> {
  const response = await apiClient.post(`${USERS_BASE}/users`, data);
  return response.data;
}

/** Edit (patch) a user */
export async function patchUser(userId: number, data: Partial<{
  name: string;
  email: string;
  phone: string;
  url: string;
}>): Promise<UserFull> {
  const response = await apiClient.patch(`${USERS_BASE}/${userId}`, data);
  return response.data;
}

/** Delete a user */
export async function deleteUser(userId: number): Promise<void> {
  await apiClient.delete(`${USERS_BASE}/${userId}`);
}

/** Get users who can be team leaders (backend uses POST /users/users_leaders_0) */
export async function getTeamLeaderCandidates(params?: {
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<UserLeader>> {
  const response = await apiClient.post(`${USERS_BASE}/users_leaders_0`, params || {});
  return response.data;
}

/** Get all users for dropdown (backend uses GET /users/query_all_users) */
export async function getAllUsersDropdown(): Promise<UserListItem[]> {
  const response = await apiClient.get(`${USERS_BASE}/query_all_users`);
  return response.data;
}

/** Search users for team assignment - paginated, prioritizes users without team */
export async function searchUsersForTeam(params: {
  search?: string;
  page?: number;
  per_page?: number;
  teams_id?: number;
}): Promise<PaginatedResponse<UserListItem & { hasTeam?: boolean; isMemberOfCurrentTeam?: boolean }>> {
  const response = await apiClient.get(`${USERS_BASE}/search-for-team`, { params });
  return response.data;
}

/** Export users */
export async function exportUsers(params?: {
  ids_cargo?: number[];
}): Promise<Blob> {
  const response = await apiClient.get(`${USERS_BASE}/export`, {
    params,
    responseType: 'blob',
  });
  return response.data;
}

/** Import users from CSV */
export async function importUsersCsv(file: File): Promise<{ message: string; count: number }> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post(`${USERS_BASE}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

// === Permissions ===

export async function getUserPermissions(permissionsId: number) {
  const response = await apiClient.get(`${USERS_BASE}/permissions/${permissionsId}`);
  return response.data;
}

export async function editUserPermissions(permissionsId: number, data: Record<string, unknown>) {
  const response = await apiClient.patch(`${USERS_BASE}/permissions/${permissionsId}`, data);
  return response.data;
}

export async function addUserPermissions(data: Record<string, unknown>) {
  const response = await apiClient.post(`${USERS_BASE}/permissions`, data);
  return response.data;
}

export async function deleteUserPermissions(permissionsId: number) {
  await apiClient.delete(`${USERS_BASE}/permissions/${permissionsId}`);
}

export async function queryAllPermissions() {
  const response = await apiClient.get(`${USERS_BASE}/permissions`);
  return response.data;
}

// === Roles ===

export async function getUserRoles(rolesId: number) {
  const response = await apiClient.get(`${USERS_BASE}/roles/${rolesId}`);
  return response.data;
}

export async function editUserRoles(rolesId: number, data: Record<string, unknown>) {
  const response = await apiClient.patch(`${USERS_BASE}/roles/${rolesId}`, data);
  return response.data;
}

export async function addUserRoles(data: Record<string, unknown>) {
  const response = await apiClient.post(`${USERS_BASE}/roles`, data);
  return response.data;
}

export async function deleteUserRoles(rolesId: number) {
  await apiClient.delete(`${USERS_BASE}/roles/${rolesId}`);
}

export async function queryAllRoles() {
  const response = await apiClient.get(`${USERS_BASE}/users_roles`);
  return response.data;
}

// === System Access ===

export async function getUserSystemAccess(accessId: number) {
  const response = await apiClient.get(`${USERS_BASE}/system-access/${accessId}`);
  return response.data;
}

export async function editUserSystemAccess(accessId: number, data: Record<string, unknown>) {
  const response = await apiClient.patch(`${USERS_BASE}/system-access/${accessId}`, data);
  return response.data;
}

export async function addUserSystemAccess(data: Record<string, unknown>) {
  const response = await apiClient.post(`${USERS_BASE}/system-access`, data);
  return response.data;
}

export async function deleteUserSystemAccess(accessId: number) {
  await apiClient.delete(`${USERS_BASE}/system-access/${accessId}`);
}

export async function queryAllSystemAccess() {
  const response = await apiClient.get(`${USERS_BASE}/users_system_access`);
  return response.data;
}

// === Control System ===

export async function getUserControlSystem(controlId: number) {
  const response = await apiClient.get(`${USERS_BASE}/control-system/${controlId}`);
  return response.data;
}

export async function editUserControlSystem(controlId: number, data: Record<string, unknown>) {
  const response = await apiClient.patch(`${USERS_BASE}/control-system/${controlId}`, data);
  return response.data;
}

export async function addUserControlSystem(data: Record<string, unknown>) {
  const response = await apiClient.post(`${USERS_BASE}/control-system`, data);
  return response.data;
}

export async function deleteUserControlSystem(controlId: number) {
  await apiClient.delete(`${USERS_BASE}/control-system/${controlId}`);
}

export async function queryAllControlSystem() {
  const response = await apiClient.get(`${USERS_BASE}/users_control_system`);
  return response.data;
}

// === Company ===

export async function createCompany(data: {
  name: string;
  legal_name?: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  cep?: string;
  numero?: string;
  address_line?: string;
  bairro?: string;
  complemento?: string;
  city?: string;
  state?: string;
}): Promise<{ id: number }> {
  const response = await apiClient.post(`${USERS_BASE}/company`, {
    brand_name: data.name,
    legal_name: data.legal_name,
    cnpj: data.cnpj,
    phone: data.phone,
    email: data.email,
    cep: data.cep,
    numero: data.numero,
    address_line: data.address_line,
    bairro: data.bairro,
    complemento: data.complemento,
    city: data.city,
    state: data.state,
  });
  return response.data;
}

export async function editCompany(companyId: number, data: Record<string, unknown>) {
  const response = await apiClient.patch(`${USERS_BASE}/company/${companyId}`, data);
  return response.data;
}

export async function getCompany(companyId: number) {
  const response = await apiClient.get(`${USERS_BASE}/company/${companyId}`);
  return response.data;
}
