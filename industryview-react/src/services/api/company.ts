import apiClient from './apiClient';
import type { CompanyFull, CompanyBranch, CompanyUpdatePayload, BranchPayload } from '../../types/company';

const COMPANY_BASE = '/company';

/** Get company with its branches */
export async function getCompany(companyId: number): Promise<CompanyFull> {
  const response = await apiClient.get(`${COMPANY_BASE}/${companyId}`);
  return response.data;
}

/** Update company data */
export async function updateCompany(
  companyId: number,
  data: CompanyUpdatePayload
): Promise<CompanyFull> {
  const response = await apiClient.patch(`${COMPANY_BASE}/${companyId}`, data);
  return response.data;
}

/** List all branches of a company */
export async function getBranches(companyId: number): Promise<CompanyBranch[]> {
  const response = await apiClient.get(`${COMPANY_BASE}/${companyId}/branches`);
  const data = response.data;
  return Array.isArray(data) ? data : data.items || [];
}

/** Create a new branch */
export async function createBranch(
  companyId: number,
  data: BranchPayload
): Promise<CompanyBranch> {
  const response = await apiClient.post(`${COMPANY_BASE}/${companyId}/branches`, data);
  return response.data;
}

/** Update an existing branch */
export async function updateBranch(
  companyId: number,
  branchId: number,
  data: Partial<BranchPayload>
): Promise<CompanyBranch> {
  const response = await apiClient.patch(
    `${COMPANY_BASE}/${companyId}/branches/${branchId}`,
    data
  );
  return response.data;
}

/** Delete a branch */
export async function deleteBranch(companyId: number, branchId: number): Promise<void> {
  await apiClient.delete(`${COMPANY_BASE}/${companyId}/branches/${branchId}`);
}
