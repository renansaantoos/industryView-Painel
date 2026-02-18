import apiClient from './apiClient';
import type {
  EmployeeHrData,
  EmployeeVacation,
  VacationBalance,
  EmployeeDocument,
  EmployeeDayOff,
  DayOffBalance,
  EmployeeBenefit,
  EmployeeCareerHistory,
  PaginatedResponse,
} from '../../types';

const BASE = '/employees';

// ============================================================
// HR Data
// ============================================================

export async function getHrData(usersId: number): Promise<EmployeeHrData | null> {
  const response = await apiClient.get(`${BASE}/hr-data/${usersId}`);
  return response.data;
}

export async function upsertHrData(usersId: number, data: Partial<EmployeeHrData>): Promise<EmployeeHrData> {
  const response = await apiClient.put(`${BASE}/hr-data/${usersId}`, data);
  return response.data;
}

// ============================================================
// Vacations
// ============================================================

export async function listVacations(params?: {
  users_id?: number;
  status?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<EmployeeVacation>> {
  const response = await apiClient.get(`${BASE}/vacations`, { params });
  return response.data;
}

export async function createVacation(data: {
  users_id: number;
  tipo: string;
  data_inicio: string;
  data_fim: string;
  dias_total: number;
  dias_abono?: number;
  periodo_aquisitivo_inicio?: string;
  periodo_aquisitivo_fim?: string;
  observacoes?: string;
}): Promise<EmployeeVacation> {
  const response = await apiClient.post(`${BASE}/vacations`, data);
  return response.data;
}

export async function updateVacation(id: number, data: Partial<EmployeeVacation>): Promise<EmployeeVacation> {
  const response = await apiClient.patch(`${BASE}/vacations/${id}`, data);
  return response.data;
}

export async function approveVacation(id: number, status: 'aprovado' | 'cancelado'): Promise<EmployeeVacation> {
  const response = await apiClient.post(`${BASE}/vacations/${id}/approve`, { status });
  return response.data;
}

export async function deleteVacation(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/vacations/${id}`);
}

export async function getVacationBalance(usersId: number): Promise<VacationBalance> {
  const response = await apiClient.get(`${BASE}/vacations/balance/${usersId}`);
  return response.data;
}

// ============================================================
// Documents
// ============================================================

export async function listDocuments(params?: {
  users_id?: number;
  tipo?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<EmployeeDocument>> {
  const response = await apiClient.get(`${BASE}/documents`, { params });
  return response.data;
}

export async function createDocument(data: {
  users_id: number;
  tipo: string;
  nome: string;
  descricao?: string;
  numero_documento?: string;
  data_emissao?: string;
  data_validade?: string;
  file_url?: string;
}): Promise<EmployeeDocument> {
  const response = await apiClient.post(`${BASE}/documents`, data);
  return response.data;
}

export async function updateDocument(id: number, data: Partial<EmployeeDocument>): Promise<EmployeeDocument> {
  const response = await apiClient.patch(`${BASE}/documents/${id}`, data);
  return response.data;
}

export async function deleteDocument(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/documents/${id}`);
}

// ============================================================
// Day Offs (Folgas / Banco de Horas)
// ============================================================

export async function listDayOffs(params?: {
  users_id?: number;
  tipo?: string;
  status?: string;
  data_inicio?: string;
  data_fim?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<EmployeeDayOff>> {
  const response = await apiClient.get(`${BASE}/day-offs`, { params });
  return response.data;
}

export async function createDayOff(data: {
  users_id: number;
  tipo: string;
  data: string;
  motivo?: string;
  horas_banco?: number;
  observacoes?: string;
}): Promise<EmployeeDayOff> {
  const response = await apiClient.post(`${BASE}/day-offs`, data);
  return response.data;
}

export async function updateDayOff(id: number, data: Partial<EmployeeDayOff>): Promise<EmployeeDayOff> {
  const response = await apiClient.patch(`${BASE}/day-offs/${id}`, data);
  return response.data;
}

export async function approveDayOff(id: number, status: 'aprovado' | 'rejeitado'): Promise<EmployeeDayOff> {
  const response = await apiClient.post(`${BASE}/day-offs/${id}/approve`, { status });
  return response.data;
}

export async function deleteDayOff(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/day-offs/${id}`);
}

export async function getDayOffBalance(usersId: number): Promise<DayOffBalance> {
  const response = await apiClient.get(`${BASE}/day-offs/balance/${usersId}`);
  return response.data;
}

// ============================================================
// Benefits (Beneficios)
// ============================================================

export async function listBenefits(params?: {
  users_id?: number;
  tipo?: string;
  status?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<EmployeeBenefit>> {
  const response = await apiClient.get(`${BASE}/benefits`, { params });
  return response.data;
}

export async function createBenefit(data: {
  users_id: number;
  tipo: string;
  descricao?: string;
  valor?: number;
  data_inicio: string;
  data_fim?: string;
  observacoes?: string;
}): Promise<EmployeeBenefit> {
  const response = await apiClient.post(`${BASE}/benefits`, data);
  return response.data;
}

export async function updateBenefit(id: number, data: Partial<EmployeeBenefit>): Promise<EmployeeBenefit> {
  const response = await apiClient.patch(`${BASE}/benefits/${id}`, data);
  return response.data;
}

export async function deleteBenefit(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/benefits/${id}`);
}

// ============================================================
// Career History (Historico de Cargos)
// ============================================================

export async function listCareerHistory(params?: {
  users_id?: number;
  tipo?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<EmployeeCareerHistory>> {
  const response = await apiClient.get(`${BASE}/career-history`, { params });
  return response.data;
}

export async function createCareerHistory(data: {
  users_id: number;
  tipo: string;
  cargo_anterior?: string;
  cargo_novo?: string;
  departamento_anterior?: string;
  departamento_novo?: string;
  salario_anterior?: number;
  salario_novo?: number;
  data_efetivacao: string;
  motivo?: string;
  observacoes?: string;
}): Promise<EmployeeCareerHistory> {
  const response = await apiClient.post(`${BASE}/career-history`, data);
  return response.data;
}

export async function updateCareerHistory(id: number, data: Partial<EmployeeCareerHistory>): Promise<EmployeeCareerHistory> {
  const response = await apiClient.patch(`${BASE}/career-history/${id}`, data);
  return response.data;
}

export async function deleteCareerHistory(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/career-history/${id}`);
}
