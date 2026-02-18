/** Health Record (ASO - Atestado de Saude Ocupacional) */
export interface HealthRecord {
  id: number;
  users_id: number;
  company_id: number;
  exam_type: 'admissional' | 'periodico' | 'retorno_trabalho' | 'mudanca_funcao' | 'demissional';
  exam_date: string;
  expiry_date?: string;
  result: 'apto' | 'inapto' | 'apto_restricao';
  restriction_description?: string;
  doctor_name?: string;
  crm?: string;
  file_url?: string;
  observation?: string;
  user_name?: string;
  created_at: string;
  updated_at: string;
}
