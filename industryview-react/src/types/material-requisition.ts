/** Material Requisition */
export interface MaterialRequisition {
  id: number;
  projects_id: number;
  company_id: number;
  requisition_number?: string;
  description?: string;
  status: 'rascunho' | 'submetida' | 'aprovada' | 'rejeitada';
  priority?: 'baixa' | 'media' | 'alta' | 'urgente';
  requested_by: number;
  requester_name?: string;
  submitted_at?: string;
  approved_by?: number;
  approved_at?: string;
  rejected_by?: number;
  rejected_at?: string;
  rejection_reason?: string;
  project_name?: string;
  created_at: string;
  updated_at: string;
  items?: MaterialRequisitionItem[];
}

/** Material Requisition Item */
export interface MaterialRequisitionItem {
  id: number;
  material_requisitions_id: number;
  description: string;
  unit?: string;
  quantity: number;
  estimated_cost?: number;
  observation?: string;
}
