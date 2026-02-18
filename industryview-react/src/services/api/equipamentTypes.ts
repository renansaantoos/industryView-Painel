import apiClient from './apiClient';
import type { EquipamentType } from '../../types';

export async function queryAllEquipamentTypes(): Promise<EquipamentType[]> {
  const response = await apiClient.get('/equipaments_types');
  return response.data;
}
