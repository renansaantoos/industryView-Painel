import apiClient from './apiClient';
import type { ContractMeasurement, ContractClaim, ClaimEvidence, PaginatedResponse } from '../../types';

const BASE = '/contracts';

// Measurements
export async function listMeasurements(params?: {
  projects_id?: number;
  status?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<ContractMeasurement>> {
  const response = await apiClient.get(`${BASE}/measurements`, { params });
  return response.data;
}

export async function getMeasurement(id: number): Promise<ContractMeasurement> {
  const response = await apiClient.get(`${BASE}/measurements/${id}`);
  return response.data;
}

export async function createMeasurement(data: {
  projects_id: number;
  measurement_number: string;
  reference_period: string;
  description?: string;
  total_value?: number;
  items?: { description: string; unit?: string; quantity: number; unit_price: number }[];
}): Promise<ContractMeasurement> {
  const response = await apiClient.post(`${BASE}/measurements`, data);
  return response.data;
}

export async function updateMeasurement(id: number, data: Record<string, unknown>): Promise<ContractMeasurement> {
  const response = await apiClient.patch(`${BASE}/measurements/${id}`, data);
  return response.data;
}

export async function submitMeasurement(id: number): Promise<ContractMeasurement> {
  const response = await apiClient.post(`${BASE}/measurements/${id}/submit`);
  return response.data;
}

export async function approveMeasurement(id: number): Promise<ContractMeasurement> {
  const response = await apiClient.post(`${BASE}/measurements/${id}/approve`);
  return response.data;
}

export async function rejectMeasurement(id: number, data?: { rejection_reason?: string }): Promise<ContractMeasurement> {
  const response = await apiClient.post(`${BASE}/measurements/${id}/reject`, data);
  return response.data;
}

// Claims
export async function listClaims(params?: {
  projects_id?: number;
  status?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<ContractClaim>> {
  const response = await apiClient.get(`${BASE}/claims`, { params });
  return response.data;
}

export async function getClaim(id: number): Promise<ContractClaim> {
  const response = await apiClient.get(`${BASE}/claims/${id}`);
  return response.data;
}

export async function createClaim(data: {
  projects_id: number;
  title: string;
  description: string;
  claim_type?: string;
  estimated_value?: number;
}): Promise<ContractClaim> {
  const response = await apiClient.post(`${BASE}/claims`, data);
  return response.data;
}

export async function updateClaim(id: number, data: Record<string, unknown>): Promise<ContractClaim> {
  const response = await apiClient.patch(`${BASE}/claims/${id}`, data);
  return response.data;
}

export async function closeClaim(id: number): Promise<ContractClaim> {
  const response = await apiClient.post(`${BASE}/claims/${id}/close`);
  return response.data;
}

export async function addClaimEvidence(claimId: number, data: {
  file_url: string;
  file_name?: string;
  file_type?: string;
  description?: string;
}): Promise<ClaimEvidence> {
  const response = await apiClient.post(`${BASE}/claims/${claimId}/evidences`, data);
  return response.data;
}
