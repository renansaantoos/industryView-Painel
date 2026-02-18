import apiClient from './apiClient';
import type { CommissioningSystem, PunchListItem, CommissioningCertificate, PaginatedResponse } from '../../types';

const BASE = '/commissioning';

// Systems
export async function listSystems(params?: {
  projects_id?: number;
  status?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<CommissioningSystem>> {
  const response = await apiClient.get(`${BASE}/systems`, { params });
  return response.data;
}

export async function getSystem(id: number): Promise<CommissioningSystem> {
  const response = await apiClient.get(`${BASE}/systems/${id}`);
  return response.data;
}

export async function createSystem(data: {
  projects_id: number;
  name: string;
  description?: string;
  system_type?: string;
}): Promise<CommissioningSystem> {
  const response = await apiClient.post(`${BASE}/systems`, data);
  return response.data;
}

export async function updateSystem(id: number, data: Record<string, unknown>): Promise<CommissioningSystem> {
  const response = await apiClient.patch(`${BASE}/systems/${id}`, data);
  return response.data;
}

export async function deleteSystem(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/systems/${id}`);
}

// Punch List
export async function getPunchList(systemId: number): Promise<PunchListItem[]> {
  const response = await apiClient.get(`${BASE}/systems/${systemId}/punch-list`);
  return response.data;
}

export async function createPunchListItem(systemId: number, data: {
  description: string;
  category?: string;
  priority?: string;
  responsible_id?: number;
  due_date?: string;
}): Promise<PunchListItem> {
  const response = await apiClient.post(`${BASE}/systems/${systemId}/punch-list`, data);
  return response.data;
}

export async function updatePunchListItem(id: number, data: Record<string, unknown>): Promise<PunchListItem> {
  const response = await apiClient.patch(`${BASE}/punch-list/${id}`, data);
  return response.data;
}

// Certificates
export async function getCertificates(systemId: number): Promise<CommissioningCertificate[]> {
  const response = await apiClient.get(`${BASE}/systems/${systemId}/certificates`);
  return response.data;
}

export async function createCertificate(systemId: number, data: {
  certificate_type: string;
  description?: string;
  file_url?: string;
}): Promise<CommissioningCertificate> {
  const response = await apiClient.post(`${BASE}/systems/${systemId}/certificates`, data);
  return response.data;
}

export async function updateCertificate(id: number, data: Record<string, unknown>): Promise<CommissioningCertificate> {
  const response = await apiClient.patch(`${BASE}/certificates/${id}`, data);
  return response.data;
}
