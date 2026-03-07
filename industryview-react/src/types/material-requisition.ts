/** Material Requisition */
export interface MaterialRequisition {
  id: number;
  projects_id: number;
  requisition_number?: string;
  description?: string;
  status: 'rascunho' | 'submetida' | 'aprovada' | 'rejeitada';
  priority?: string;
  needed_by_date?: string;
  created_by_user_id?: number;
  approved_by_user_id?: number;
  approved_at?: string;
  rejection_reason?: string;
  rejected_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  projects?: { id: number; name: string };
  created_by?: { id: number; name: string };
  approved_by?: { id: number; name: string };
  items?: MaterialRequisitionItem[];
}

/** Material Requisition Item */
export interface MaterialRequisitionItem {
  id: number;
  material_requisitions_id: number;
  product_description: string;
  quantity_requested: number;
  quantity_approved?: number;
  quantity_delivered?: number;
  unit_price_estimate?: number;
  unity?: string;
  observations?: string;
  created_at?: string;
}
