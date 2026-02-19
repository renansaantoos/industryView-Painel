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

/** User PPE Status */
export interface UserPpeStatus {
  users_id: number;
  user_name?: string;
  ppe_items: {
    ppe_type_id: number;
    ppe_type_name: string;
    last_delivery_date?: string;
    expiry_date?: string;
    status: 'ok' | 'vencendo' | 'vencido' | 'pendente';
  }[];
}
