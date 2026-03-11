/** Daily Report (RDO) */
export interface DailyReport {
  id: number;
  projects_id: number;
  rdo_date: string;
  rdo_number?: number;
  shift?: string;
  weather_morning?: string;
  weather_afternoon?: string;
  weather_night?: string;
  temperature_min?: number;
  temperature_max?: number;
  safety_topic?: string;
  general_observations?: string;
  status: 'rascunho' | 'finalizado' | 'aprovado' | 'rejeitado';
  created_by_user_id: number;
  approved_by_user_id?: number;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  // Joined fields (populated by backend includes)
  creator_name?: string;
  created_by_name?: string;
  created_by_email?: string;
  project_name?: string;
  project_registration_number?: string;
  approved_by_name?: string;
  approved_by_email?: string;
  // Nested relations
  schedule?: DailyReportSchedule[];
  workforce?: DailyReportWorkforce[];
  activities?: DailyReportActivity[];
  occurrences?: DailyReportOccurrence[];
}

/** Schedule linked to RDO (with workers) */
export interface DailyReportSchedule {
  id: number;
  date?: string;
  teams_id?: number;
  team_name?: string;
  workers?: DailyReportScheduleWorker[];
}

/** Worker from schedule */
export interface DailyReportScheduleWorker {
  id: number;
  name?: string;
  cpf?: string;
  cargo?: string;
}

/** RDO Workforce entry */
export interface DailyReportWorkforce {
  id: number;
  daily_report_id: number;
  role_category: string;
  quantity_planned: number;
  quantity_present: number;
  quantity_absent: number;
  absence_reason?: string;
  created_at?: string;
  updated_at?: string;
}

/** RDO Activity entry */
export interface DailyReportActivity {
  id: number;
  daily_report_id: number;
  projects_backlogs_id?: number;
  description: string;
  quantity_done?: number;
  unity_id?: number;
  teams_id?: number;
  location_description?: string;
  created_at?: string;
  updated_at?: string;
  // Joined fields
  backlog_description?: string;
  team_name?: string;
  unity_name?: string;
}

/** RDO Occurrence entry */
export interface DailyReportOccurrence {
  id: number;
  daily_report_id: number;
  occurrence_type: string;
  description: string;
  start_time?: string;
  end_time?: string;
  duration_hours?: number;
  impact_description?: string;
  created_at?: string;
  updated_at?: string;
}
