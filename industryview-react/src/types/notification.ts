/** Notification */
export interface Notification {
  id: number;
  users_id: number;
  company_id: number;
  type: string;
  title: string;
  message: string;
  reference_table?: string;
  reference_id?: number;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

/** Unread count response */
export interface UnreadCountResponse {
  count: number;
}
