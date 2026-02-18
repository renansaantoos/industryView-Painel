/** Environmental License */
export interface EnvironmentalLicense {
  id: number;
  projects_id?: number;
  company_id: number;
  license_number: string;
  license_type: string;
  issuing_agency: string;
  issue_date: string;
  expiry_date: string;
  status: 'vigente' | 'vencendo' | 'vencida' | 'renovacao';
  file_url?: string;
  observation?: string;
  created_by: number;
  creator_name?: string;
  created_at: string;
  updated_at: string;
  conditions?: EnvironmentalCondition[];
}

/** Environmental Condition (condicionante) */
export interface EnvironmentalCondition {
  id: number;
  environmental_licenses_id: number;
  description: string;
  deadline?: string;
  status: 'pendente' | 'em_andamento' | 'cumprida' | 'atrasada';
  responsible_id?: number;
  responsible_name?: string;
  evidence_url?: string;
  completed_at?: string;
  observation?: string;
  created_at: string;
  updated_at: string;
}
