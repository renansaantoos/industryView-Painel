import apiClient from './apiClient';
import type { PaginatedResponse } from '../../types';

const CLIENTS_BASE = '/clients';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Client {
  id: number;
  units?: ClientUnit[];
  // Section 1: Dados Cadastrais e Fiscais
  legal_name: string;
  trade_name?: string | null;
  cnpj?: string | null;
  state_registration?: string | null;
  state_registration_type?: string | null;
  main_cnae?: string | null;
  // Section 2: Localização - Faturamento
  billing_address?: string | null;
  billing_number?: string | null;
  billing_complement?: string | null;
  billing_neighborhood?: string | null;
  billing_city?: string | null;
  billing_state?: string | null;
  billing_cep?: string | null;
  // Section 2: Localização - Entrega
  delivery_same_as_billing?: boolean;
  delivery_address?: string | null;
  delivery_number?: string | null;
  delivery_complement?: string | null;
  delivery_neighborhood?: string | null;
  delivery_city?: string | null;
  delivery_state?: string | null;
  delivery_cep?: string | null;
  receiving_hours?: string | null;
  vehicle_restrictions?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  // Section 3: Contatos Operacionais
  purchasing_contact_name?: string | null;
  purchasing_contact_email?: string | null;
  purchasing_contact_phone?: string | null;
  financial_contact_name?: string | null;
  financial_contact_email?: string | null;
  financial_contact_phone?: string | null;
  warehouse_contact_name?: string | null;
  warehouse_contact_email?: string | null;
  warehouse_contact_phone?: string | null;
  // Section 4: Parâmetros de Negócio
  industry_segment?: string | null;
  purchase_potential?: string | null;
  default_payment_terms?: string | null;
  responsible_salesperson?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ClientUnit {
  id: number;
  client_id: number;
  unit_type: 'MATRIZ' | 'FILIAL';
  label?: string | null;
  cnpj?: string | null;
  address?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  cep?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ClientUnitPayload {
  unit_type: 'MATRIZ' | 'FILIAL';
  label?: string;
  cnpj?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
}

export interface ClientPayload {
  // Section 1: Dados Cadastrais e Fiscais
  legal_name: string;
  trade_name?: string;
  cnpj?: string;
  state_registration?: string;
  state_registration_type?: string;
  main_cnae?: string;
  // Section 2: Localização - Faturamento
  billing_address?: string;
  billing_number?: string;
  billing_complement?: string;
  billing_neighborhood?: string;
  billing_city?: string;
  billing_state?: string;
  billing_cep?: string;
  // Section 2: Localização - Entrega
  delivery_same_as_billing?: boolean;
  delivery_address?: string;
  delivery_number?: string;
  delivery_complement?: string;
  delivery_neighborhood?: string;
  delivery_city?: string;
  delivery_state?: string;
  delivery_cep?: string;
  receiving_hours?: string;
  vehicle_restrictions?: string;
  latitude?: number;
  longitude?: number;
  // Section 3: Contatos Operacionais
  purchasing_contact_name?: string;
  purchasing_contact_email?: string;
  purchasing_contact_phone?: string;
  financial_contact_name?: string;
  financial_contact_email?: string;
  financial_contact_phone?: string;
  warehouse_contact_name?: string;
  warehouse_contact_email?: string;
  warehouse_contact_phone?: string;
  // Section 4: Parâmetros de Negócio
  industry_segment?: string;
  purchase_potential?: string;
  default_payment_terms?: string;
  responsible_salesperson?: string;
  notes?: string;
}

// ── API Functions ──────────────────────────────────────────────────────────────

export async function listClients(params?: {
  page?: number;
  per_page?: number;
  search?: string;
}): Promise<PaginatedResponse<Client>> {
  const response = await apiClient.get(CLIENTS_BASE, { params });
  return response.data;
}

export async function getClient(id: number): Promise<Client> {
  const response = await apiClient.get(`${CLIENTS_BASE}/${id}`);
  return response.data;
}

export async function createClient(data: ClientPayload): Promise<Client> {
  const response = await apiClient.post(CLIENTS_BASE, data);
  return response.data;
}

export async function updateClient(id: number, data: Partial<ClientPayload>): Promise<Client> {
  const response = await apiClient.patch(`${CLIENTS_BASE}/${id}`, data);
  return response.data;
}

export async function deleteClient(id: number): Promise<void> {
  await apiClient.delete(`${CLIENTS_BASE}/${id}`);
}

export async function listClientUnits(clientId: number): Promise<ClientUnit[]> {
  const response = await apiClient.get(`${CLIENTS_BASE}/${clientId}/units`);
  return response.data;
}

export async function createClientUnit(clientId: number, data: ClientUnitPayload): Promise<ClientUnit> {
  const response = await apiClient.post(`${CLIENTS_BASE}/${clientId}/units`, data);
  return response.data;
}

export async function updateClientUnit(clientId: number, unitId: number, data: Partial<ClientUnitPayload>): Promise<ClientUnit> {
  const response = await apiClient.patch(`${CLIENTS_BASE}/${clientId}/units/${unitId}`, data);
  return response.data;
}

export async function deleteClientUnit(clientId: number, unitId: number): Promise<void> {
  await apiClient.delete(`${CLIENTS_BASE}/${clientId}/units/${unitId}`);
}
