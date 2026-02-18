/** Daily Report (RDO) */
export interface DailyReport {
  id: number;
  projects_id: number;
  report_date: string;
  shift?: string;
  weather?: string;
  temperature_min?: number;
  temperature_max?: number;
  observations?: string;
  status: 'rascunho' | 'finalizado' | 'aprovado' | 'rejeitado';
  created_by: number;
  finalized_by?: number;
  finalized_at?: string;
  approved_by?: number;
  approved_at?: string;
  rejected_by?: number;
  rejected_at?: string;
  rejection_reason?: string;
  creator_name?: string;
  project_name?: string;
  created_at: string;
  updated_at: string;
  workforce?: DailyReportWorkforce[];
  activities?: DailyReportActivity[];
  occurrences?: DailyReportOccurrence[];
  equipment?: DailyReportEquipment[];
}

/** RDO Workforce entry */
export interface DailyReportWorkforce {
  id: number;
  daily_reports_id: number;
  category: string;
  planned_count: number;
  present_count: number;
  absent_count: number;
  observation?: string;
}

/** RDO Activity entry */
export interface DailyReportActivity {
  id: number;
  daily_reports_id: number;
  backlog_id?: number;
  backlog_name?: string;
  description: string;
  quantity?: number;
  unit?: string;
  team?: string;
  observation?: string;
}

/** RDO Occurrence entry */
export interface DailyReportOccurrence {
  id: number;
  daily_reports_id: number;
  occurrence_type: string;
  description: string;
  start_time?: string;
  end_time?: string;
  impact?: string;
}

/** RDO Equipment entry */
export interface DailyReportEquipment {
  id: number;
  daily_reports_id: number;
  equipment_type: string;
  description?: string;
  quantity: number;
  operating_hours?: number;
  idle_hours?: number;
  observation?: string;
}
