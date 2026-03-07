/** Contract Measurement - alinhado com Prisma contract_measurements */
export interface ContractMeasurement {
  id: number;
  projects_id: number;
  measurement_number: number;
  measurement_period_start?: string;
  measurement_period_end?: string;
  total_value?: number;
  observations?: string;
  status: 'rascunho' | 'submetida' | 'aprovada' | 'rejeitada';
  created_by_user_id?: number;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  projects?: { id: number; name: string };
  created_by?: { id: number; name: string };
  items?: MeasurementItem[];
}

/** Measurement Item - alinhado com Prisma measurement_items */
export interface MeasurementItem {
  id: number;
  contract_measurements_id: number;
  description: string;
  unity?: string;
  quantity_measured: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

/** Contract Claim - alinhado com Prisma contract_claims */
export interface ContractClaim {
  id: number;
  projects_id: number;
  claim_number: string;
  title: string;
  description: string;
  claim_type?: string;
  claimed_value?: number;
  approved_value?: number;
  status: 'aberta' | 'em_analise' | 'aceita' | 'rejeitada' | 'encerrada';
  submitted_at?: string;
  closed_at?: string;
  created_by_user_id?: number;
  closed_by_user_id?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  projects?: { id: number; name: string };
  created_by?: { id: number; name: string };
  closed_by?: { id: number; name: string };
  evidences?: ClaimEvidence[];
}

/** Claim Evidence - alinhado com Prisma claim_evidences */
export interface ClaimEvidence {
  id: number;
  contract_claims_id: number;
  file_url: string;
  description?: string;
  evidence_type?: string;
  created_at: string;
  updated_at: string;
}
