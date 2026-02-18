import apiClient from './apiClient';
import type { Manufacturer, PaginatedResponse } from '../../types';

const MANUFACTURERS_BASE = '/manufacturers';

export async function queryAllManufacturers(params?: {
  page?: number;
  per_page?: number;
  search?: string;
}): Promise<PaginatedResponse<Manufacturer>> {
  const response = await apiClient.get(MANUFACTURERS_BASE, { params });
  return response.data;
}

export async function getManufacturer(manufacturerId: number): Promise<Manufacturer> {
  const response = await apiClient.get(`${MANUFACTURERS_BASE}/${manufacturerId}`);
  return response.data;
}

export async function addManufacturer(data: {
  name: string;
  type?: string;
}): Promise<Manufacturer> {
  const response = await apiClient.post(MANUFACTURERS_BASE, data);
  return response.data;
}

export async function editManufacturer(manufacturerId: number, data: {
  name?: string;
  type?: string;
}): Promise<Manufacturer> {
  const response = await apiClient.patch(`${MANUFACTURERS_BASE}/${manufacturerId}`, data);
  return response.data;
}

export async function deleteManufacturer(manufacturerId: number): Promise<void> {
  await apiClient.delete(`${MANUFACTURERS_BASE}/${manufacturerId}`);
}
