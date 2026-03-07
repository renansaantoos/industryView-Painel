/** Non-Conformance */
export interface NonConformance {
  id: number;
  nc_number: string;
  projects_id?: number;
  title: string;
  description: string;
  origin: string;
  severity: 'menor' | 'maior' | 'critica';
  category: string;
  status: 'aberta' | 'em_analise' | 'em_tratamento' | 'verificacao' | 'encerrada';
  location_description?: string;
  immediate_action?: string;
  root_cause_analysis?: string;
  corrective_action_plan?: string;
  preventive_action?: string;
  deadline?: string;
  opened_by_user_id: number;
  responsible_user_id?: number;
  closed_by_user_id?: number;
  closed_at?: string;
  created_at: string;
  updated_at: string;
  projects?: { id: number; name: string };
  opened_by?: { id: number; name: string };
  responsible_user?: { id: number; name: string };
  closed_by?: { id: number; name: string };
  attachments?: NonConformanceAttachment[];
}

/** NC Attachment */
export interface NonConformanceAttachment {
  id: number;
  non_conformances_id: number;
  file_url: string;
  description?: string;
  uploaded_by_user_id: number;
  created_at: string;
}

/** NC Statistics - arrays from groupBy */
export interface NonConformanceStatistics {
  total: number;
  by_status: { status: string; count: number }[];
  by_severity: { severity: string; count: number }[];
  by_category: { category: string; count: number }[];
  by_origin: { origin: string; count: number }[];
}

/** Document (GED) */
export interface Document {
  id: number;
  company_id: number;
  projects_id?: number;
  document_number: string;
  title: string;
  document_type?: string;
  category?: string;
  description?: string;
  revision?: string;
  file_url?: string;
  status: 'em_elaboracao' | 'em_revisao' | 'aprovado' | 'obsoleto';
  requires_acknowledgment?: boolean;
  valid_until?: string;
  approved_by_user_id?: number;
  approved_at?: string;
  created_by_user_id: number;
  created_by?: { id: number; name: string };
  approved_by?: { id: number; name: string };
  acknowledgments?: { id: number; users_id: number; acknowledged_at: string }[];
  created_at: string;
  updated_at: string;
}

/** Pending document (from getPendingAcknowledgments - returns Document with relations) */
export interface PendingDocument extends Document {
  // Returned from getPendingAcknowledgments endpoint
}

/** Document Acknowledgment */
export interface DocumentAcknowledgment {
  id: number;
  documents_id: number;
  users_id: number;
  acknowledged_at?: string;
  user?: { id: number; name: string; email?: string };
}

/** Task Document link */
export interface TaskDocument {
  id: number;
  task_templates_id: number;
  documents_id: number;
  document_title?: string;
  created_at: string;
}

/** Checklist Template */
export interface ChecklistTemplate {
  id: number;
  company_id: number;
  name: string;
  description?: string;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  items?: ChecklistTemplateItem[];
}

/** Checklist Template Item */
export interface ChecklistTemplateItem {
  id: number;
  checklist_templates_id: number;
  item_order: number;
  description: string;
  item_type: 'sim_nao' | 'conforme_nao_conforme' | 'texto' | 'numero';
  is_required: boolean;
}

/** Checklist Response */
export interface ChecklistResponse {
  id: number;
  checklist_templates_id: number;
  projects_id?: number;
  filled_by: number;
  filler_name?: string;
  template_name?: string;
  completed_at?: string;
  created_at: string;
  items?: ChecklistResponseItem[];
}

/** Checklist Response Item */
export interface ChecklistResponseItem {
  id: number;
  checklist_responses_id: number;
  checklist_template_items_id: number;
  value: string;
  observation?: string;
  item_description?: string;
}

/** Golden Rule */
export interface GoldenRule {
  id: number;
  company_id: number;
  title: string;
  description: string;
  severity?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Task Golden Rule link */
export interface TaskGoldenRule {
  id: number;
  task_templates_id: number;
  golden_rules_id: number;
  golden_rule_title?: string;
  created_at: string;
}

/** Task Checklist link (pivot) */
export interface TaskChecklist {
  id: number;
  tasks_template_id: number;
  checklist_templates_id: number;
  created_at: string;
  checklist_template?: ChecklistTemplate;
}
