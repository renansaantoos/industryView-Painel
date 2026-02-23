import apiClient from './apiClient';
import type { EquipamentType } from '../../types';

const EQUIPAMENT_TYPES_BASE = '/equipaments_types';

export async function queryAllEquipamentTypes(): Promise<EquipamentType[]> {
  const response = await apiClient.get(EQUIPAMENT_TYPES_BASE);
  return response.data;
}

export async function addEquipamentType(data: { type: string }): Promise<EquipamentType> {
  const response = await apiClient.post(EQUIPAMENT_TYPES_BASE, data);
  return response.data;
}

export async function editEquipamentType(id: number, data: { type: string }): Promise<EquipamentType> {
  const response = await apiClient.patch(`${EQUIPAMENT_TYPES_BASE}/${id}`, data);
  return response.data;
}

export async function deleteEquipamentType(id: number): Promise<void> {
  await apiClient.delete(`${EQUIPAMENT_TYPES_BASE}/${id}`);
}
