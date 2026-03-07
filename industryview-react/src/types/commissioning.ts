/** Commissioning System - aligned with backend Prisma model */
export interface CommissioningSystem {
  id: number;
  projects_id: number;
  system_name: string;
  system_code: string;
  description?: string;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'reprovado';
  planned_date?: string;
  actual_date?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  projects?: { id: number; name: string };
  _count?: { punch_list: number; certificates: number };
  punch_list?: PunchListItem[];
  certificates?: CommissioningCertificate[];
}

/** Punch List Item - aligned with backend Prisma model */
export interface PunchListItem {
  id: number;
  commissioning_systems_id: number;
  item_number: number;
  description: string;
  priority: 'A' | 'B' | 'C';
  responsible?: string;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'reprovado';
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

/** Commissioning Certificate - aligned with backend Prisma model */
export interface CommissioningCertificate {
  id: number;
  commissioning_systems_id: number;
  certificate_type: string;
  certificate_number?: string;
  issued_date?: string;
  file_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}
