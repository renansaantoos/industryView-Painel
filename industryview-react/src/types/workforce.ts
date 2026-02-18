/** Workforce Daily Log */
export interface WorkforceDailyLog {
  id: number;
  projects_id?: number;
  company_id: number;
  users_id: number;
  log_date: string;
  check_in?: string;
  check_out?: string;
  team?: string;
  status?: 'presente' | 'ausente' | 'meio_periodo';
  observation?: string;
  user_name?: string;
  created_at: string;
  updated_at: string;
}

/** Workforce Histogram data point */
export interface WorkforceHistogram {
  date: string;
  total_planned: number;
  total_present: number;
  total_absent: number;
  by_team?: Record<string, number>;
}
