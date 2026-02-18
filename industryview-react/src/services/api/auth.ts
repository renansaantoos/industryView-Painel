import apiClient from './apiClient';
import type { LoginRequest, LoginResponse, SignupRequest, SignupResponse, AuthMeResponse } from '../../types';

const AUTH_BASE = '/auth';

/** Login and retrieve an authentication token */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post(`${AUTH_BASE}/login`, data);
  return response.data;
}

/** Signup and retrieve an authentication token */
export async function signup(data: SignupRequest): Promise<SignupResponse> {
  const response = await apiClient.post(`${AUTH_BASE}/signup`, data);
  return response.data;
}

/** Get the record belonging to the authentication token (current user) */
export async function getMe(token?: string): Promise<AuthMeResponse> {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiClient.get(`${AUTH_BASE}/me`, { headers });
  return response.data;
}

/** Send recovery code to email */
export async function sendRecoveryCode(email: string): Promise<{ message: string }> {
  const response = await apiClient.post(`${AUTH_BASE}/sendgrid/send/code`, { email });
  return response.data;
}

/** Validate recovery code */
export async function validateRecoveryCode(email: string, code: string): Promise<{ message: string }> {
  const response = await apiClient.post(`${AUTH_BASE}/sendgrid/validate/code`, { email, code });
  return response.data;
}

/** Reset password with new password */
export async function resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
  const response = await apiClient.patch(`${AUTH_BASE}/sendgrid/reset/pass`, {
    email,
    code,
    new_password: newPassword,
  });
  return response.data;
}

/** Change password (authenticated) */
export async function changePassword(
  token: string,
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  const response = await apiClient.put(
    '/users/change-password',
    { current_password: currentPassword, new_password: newPassword },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}
