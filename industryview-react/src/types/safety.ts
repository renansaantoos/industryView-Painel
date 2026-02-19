/** Safety Incident */
export interface SafetyIncident {
  id: number;
  projects_id: number;
  incident_number: string;
  incident_date: string;
  severity: 'quase_acidente' | 'primeiros_socorros' | 'sem_afastamento' | 'com_afastamento' | 'fatal';
  classification: 'tipico' | 'trajeto' | 'doenca_ocupacional';
  category: string;
  description: string;
  immediate_cause?: string;
  root_cause?: string;
  corrective_actions?: string;
  location_description?: string;
  body_part_affected?: string;
  days_lost: number;
  status: 'registrado' | 'em_investigacao' | 'investigado' | 'encerrado';
  reported_by_user_id: number;
  investigated_by_user_id?: number;
  closed_by_user_id?: number;
  involved_user_id?: number;
  closed_at?: string;
  created_at: string;
  updated_at: string;
  reporter_name?: string;
  investigator_name?: string;
  witnesses?: SafetyIncidentWitness[];
  attachments?: SafetyIncidentAttachment[];
}

/** Incident Witness */
export interface SafetyIncidentWitness {
  id: number;
  safety_incidents_id: number;
  users_id?: number;
  witness_name: string;
  witness_statement?: string;
  witness_role?: string;
  created_at: string;
}

/** Incident Attachment */
export interface SafetyIncidentAttachment {
  id: number;
  safety_incidents_id: number;
  file_url: string;
  file_type?: string;
  description?: string;
  uploaded_by_user_id: number;
  created_at: string;
}

/** Incident Statistics (Bird Pyramid) */
export interface SafetyIncidentStatistics {
  total_incidents: number;
  total_lost_days: number;
  by_severity: Record<string, number>;
  by_status: Record<string, number>;
  bird_pyramid?: Record<string, unknown>;
}

/** Training Type */
export interface TrainingType {
  id: number;
  company_id: number;
  name: string;
  nr_reference?: string;
  validity_months?: number;
  workload_hours?: number;
  description?: string;
  is_mandatory_for_admission?: boolean;
  created_at: string;
  updated_at: string;
}

/** Worker Training */
export interface WorkerTraining {
  id: number;
  users_id: number;
  training_types_id: number;
  training_date: string;
  expiry_date?: string;
  instructor?: string;
  certificate_url?: string;
  company_id: number;
  user_name?: string;
  training_type_name?: string;
  status?: 'valido' | 'vencendo' | 'vencido';
  created_at: string;
  updated_at: string;
}

/** Task Required Training */
export interface TaskRequiredTraining {
  id: number;
  task_templates_id: number;
  training_types_id: number;
  training_type_name?: string;
  created_at: string;
}

/** DDS Record */
export interface DdsRecord {
  id: number;
  projects_id?: number;
  company_id: number;
  conducted_by: number;
  topic: string;
  description?: string;
  team?: string;
  dds_date: string;
  conductor_name?: string;
  participants_count?: number;
  created_at: string;
  updated_at: string;
  participants?: DdsParticipant[];
}

/** DDS Participant */
export interface DdsParticipant {
  id: number;
  dds_records_id: number;
  users_id: number;
  signed: boolean;
  signed_at?: string;
  user_name?: string;
  created_at: string;
}

/** DDS Statistics */
export interface DdsStatistics {
  total: number;
  this_month: number;
  avg_participants: number;
  by_month?: Record<string, number>;
}
