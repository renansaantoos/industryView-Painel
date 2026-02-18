/** Non-Conformance */
export interface NonConformance {
  id: number;
  projects_id?: number;
  company_id: number;
  title: string;
  description: string;
  origin?: string;
  severity: 'baixa' | 'media' | 'alta' | 'critica';
  category?: string;
  status: 'aberta' | 'em_analise' | 'em_tratamento' | 'verificacao' | 'encerrada';
  responsible_id?: number;
  responsible_name?: string;
  root_cause?: string;
  corrective_action?: string;
  preventive_action?: string;
  deadline?: string;
  closed_by?: number;
  closed_at?: string;
  created_by: number;
  creator_name?: string;
  created_at: string;
  updated_at: string;
  attachments?: NonConformanceAttachment[];
}

/** NC Attachment */
export interface NonConformanceAttachment {
  id: number;
  non_conformances_id: number;
  file_url: string;
  file_name?: string;
  file_type?: string;
  uploaded_by: number;
  uploader_name?: string;
  created_at: string;
}

/** NC Statistics */
export interface NonConformanceStatistics {
  total: number;
  by_status: Record<string, number>;
  by_severity: Record<string, number>;
  by_category: Record<string, number>;
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
  revision?: string;
  file_url?: string;
  status: 'rascunho' | 'em_revisao' | 'aprovado' | 'obsoleto';
  approved_by?: number;
  approved_at?: string;
  validity_date?: string;
  created_by: number;
  creator_name?: string;
  approver_name?: string;
  created_at: string;
  updated_at: string;
}

/** Document Acknowledgment */
export interface DocumentAcknowledgment {
  id: number;
  documents_id: number;
  users_id: number;
  acknowledged_at?: string;
  user_name?: string;
  document_title?: string;
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
