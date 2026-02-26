import apiClient from './apiClient';
import type { EmployeeWorkSchedule } from '../../types';

const BASE = '/work-schedule';

export async function getWorkSchedule(usersId: number): Promise<EmployeeWorkSchedule> {
  const response = await apiClient.get(`${BASE}/${usersId}`);
  return response.data;
}

export async function upsertWorkSchedule(
  usersId: number,
  data: Partial<EmployeeWorkSchedule>,
): Promise<EmployeeWorkSchedule> {
  const response = await apiClient.put(`${BASE}/${usersId}`, data);
  return response.data;
}
