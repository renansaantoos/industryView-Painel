import apiClient from './apiClient';
import type { Notification, UnreadCountResponse, PaginatedResponse } from '../../types';

const BASE = '/notifications';

export async function listNotifications(params?: {
  type?: string;
  is_read?: boolean;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<Notification>> {
  const response = await apiClient.get(BASE, { params });
  return response.data;
}

export async function getUnreadCount(): Promise<UnreadCountResponse> {
  const response = await apiClient.get(`${BASE}/unread-count`);
  return response.data;
}

export async function markAsRead(id: number): Promise<void> {
  await apiClient.patch(`${BASE}/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await apiClient.put(`${BASE}/read-all`);
}

export async function deleteNotification(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}
