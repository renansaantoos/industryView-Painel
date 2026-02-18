/** Commissioning System */
export interface CommissioningSystem {
  id: number;
  projects_id: number;
  company_id: number;
  name: string;
  description?: string;
  system_type?: string;
  status: 'pendente' | 'em_andamento' | 'concluido';
  completion_percent?: number;
  created_by: number;
  creator_name?: string;
  created_at: string;
  updated_at: string;
  punch_list_count?: number;
  certificates_count?: number;
}

/** Punch List Item */
export interface PunchListItem {
  id: number;
  commissioning_systems_id: number;
  description: string;
  category?: string;
  priority?: 'baixa' | 'media' | 'alta' | 'critica';
  status: 'aberto' | 'em_andamento' | 'concluido';
  responsible_id?: number;
  responsible_name?: string;
  due_date?: string;
  completed_at?: string;
  observation?: string;
  created_at: string;
  updated_at: string;
}

/** Commissioning Certificate */
export interface CommissioningCertificate {
  id: number;
  commissioning_systems_id: number;
  certificate_type: string;
  description?: string;
  file_url?: string;
  issued_at?: string;
  issued_by?: number;
  issuer_name?: string;
  status: 'pendente' | 'emitido' | 'aprovado';
  created_at: string;
  updated_at: string;
}
