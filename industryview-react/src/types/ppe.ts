/** PPE Type */
export interface PpeType {
  id: number;
  company_id: number;
  name: string;
  ca_number?: string;
  validity_months?: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** PPE Delivery */
export interface PpeDelivery {
  id: number;
  company_id: number;
  ppe_types_id: number;
  users_id: number;
  quantity: number;
  delivery_date: string;
  return_date?: string;
  returned: boolean;
  observation?: string;
  user_name?: string;
  ppe_type_name?: string;
  /** Present when delivery comes from the enriched getUserPpeStatus endpoint */
  expiry_date?: string | null;
  user?: { id: number; name: string; email?: string };
  ppe_type?: { id: number; name: string; ca_number?: string; validity_months?: number; description?: string };
  created_at: string;
  updated_at: string;
}

/** Task Required PPE */
export interface TaskRequiredPpe {
  id: number;
  task_templates_id: number;
  ppe_types_id: number;
  ppe_type_name?: string;
  created_at: string;
}

/** User PPE Status — returned by GET /ppe/user-status/:userId */
export interface UserPpeStatus {
  user_id: number;
  total_deliveries: number;
  active: number;
  expired: number;
  returned: number;
  deliveries: (PpeDelivery & {
    is_returned: boolean;
    is_expired: boolean;
    expiry_date: string | null;
    days_until_expiry: number | null;
    computed_status: 'ativo' | 'vencido' | 'devolvido';
  })[];
}
