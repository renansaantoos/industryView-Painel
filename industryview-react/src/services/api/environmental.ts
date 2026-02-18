import apiClient from './apiClient';
import type { EnvironmentalLicense, EnvironmentalCondition, PaginatedResponse } from '../../types';

const BASE = '/environmental';

// Licenses
export async function listLicenses(params?: {
  projects_id?: number;
  company_id?: number;
  status?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<EnvironmentalLicense>> {
  const response = await apiClient.get(`${BASE}/licenses`, { params });
  return response.data;
}

export async function getExpiringLicenses(params?: {
  company_id?: number;
  days_ahead?: number;
}): Promise<EnvironmentalLicense[]> {
  const response = await apiClient.get(`${BASE}/licenses/expiring`, { params });
  return response.data;
}

export async function getLicense(id: number): Promise<EnvironmentalLicense> {
  const response = await apiClient.get(`${BASE}/licenses/${id}`);
  return response.data;
}

export async function createLicense(data: {
  projects_id?: number;
  license_number: string;
  license_type: string;
  issuing_agency: string;
  issue_date: string;
  expiry_date: string;
  file_url?: string;
  observation?: string;
}): Promise<EnvironmentalLicense> {
  const response = await apiClient.post(`${BASE}/licenses`, data);
  return response.data;
}

export async function updateLicense(id: number, data: Record<string, unknown>): Promise<EnvironmentalLicense> {
  const response = await apiClient.patch(`${BASE}/licenses/${id}`, data);
  return response.data;
}

export async function deleteLicense(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/licenses/${id}`);
}

// Conditions
export async function getConditions(licenseId: number): Promise<EnvironmentalCondition[]> {
  const response = await apiClient.get(`${BASE}/licenses/${licenseId}/conditions`);
  return response.data;
}

export async function createCondition(licenseId: number, data: {
  description: string;
  deadline?: string;
  responsible_id?: number;
  observation?: string;
}): Promise<EnvironmentalCondition> {
  const response = await apiClient.post(`${BASE}/licenses/${licenseId}/conditions`, data);
  return response.data;
}

export async function updateCondition(id: number, data: Record<string, unknown>): Promise<EnvironmentalCondition> {
  const response = await apiClient.patch(`${BASE}/conditions/${id}`, data);
  return response.data;
}
