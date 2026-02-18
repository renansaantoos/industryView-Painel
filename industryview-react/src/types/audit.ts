/** Audit Log */
export interface AuditLog {
  id: number;
  company_id: number;
  users_id: number;
  table_name: string;
  record_id: number;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_name?: string;
  user_email?: string;
  created_at: string;
}
