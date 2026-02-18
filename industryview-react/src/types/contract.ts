/** Contract Measurement */
export interface ContractMeasurement {
  id: number;
  projects_id: number;
  company_id: number;
  measurement_number: string;
  reference_period: string;
  description?: string;
  total_value?: number;
  status: 'rascunho' | 'submetida' | 'aprovada' | 'rejeitada';
  submitted_by?: number;
  submitted_at?: string;
  approved_by?: number;
  approved_at?: string;
  rejected_by?: number;
  rejected_at?: string;
  rejection_reason?: string;
  created_by: number;
  creator_name?: string;
  project_name?: string;
  created_at: string;
  updated_at: string;
  items?: MeasurementItem[];
}

/** Measurement Item */
export interface MeasurementItem {
  id: number;
  contract_measurements_id: number;
  description: string;
  unit?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

/** Contract Claim */
export interface ContractClaim {
  id: number;
  projects_id: number;
  company_id: number;
  title: string;
  description: string;
  claim_type?: string;
  estimated_value?: number;
  status: 'aberta' | 'em_analise' | 'aceita' | 'rejeitada' | 'encerrada';
  closed_by?: number;
  closed_at?: string;
  created_by: number;
  creator_name?: string;
  project_name?: string;
  created_at: string;
  updated_at: string;
  evidences?: ClaimEvidence[];
}

/** Claim Evidence */
export interface ClaimEvidence {
  id: number;
  contract_claims_id: number;
  file_url: string;
  file_name?: string;
  file_type?: string;
  description?: string;
  uploaded_by: number;
  uploader_name?: string;
  created_at: string;
}
