import apiClient from './apiClient';
import type { Unity } from '../../types';

export async function queryAllUnity(): Promise<Unity[]> {
  const response = await apiClient.get('/unity');
  return response.data;
}
