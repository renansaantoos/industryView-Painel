/** Work Permit (PT) */
export interface WorkPermit {
  id: number;
  projects_id?: number;
  company_id: number;
  permit_type: 'geral' | 'quente' | 'altura' | 'confinado' | 'eletrica';
  location: string;
  risk_description: string;
  control_measures: string;
  status: 'solicitada' | 'aprovada' | 'ativa' | 'encerrada' | 'cancelada';
  valid_from?: string;
  valid_until?: string;
  requested_by: number;
  approved_by?: number;
  approved_at?: string;
  closed_by?: number;
  closed_at?: string;
  cancelled_by?: number;
  cancelled_at?: string;
  cancellation_reason?: string;
  requester_name?: string;
  approver_name?: string;
  created_at: string;
  updated_at: string;
  signatures?: WorkPermitSignature[];
}

/** Work Permit Signature */
export interface WorkPermitSignature {
  id: number;
  work_permits_id: number;
  users_id: number;
  role?: string;
  signed_at: string;
  user_name?: string;
}
