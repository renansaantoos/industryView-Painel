/** Nested relation returned by Prisma include */
export interface WorkforceRelation {
  id: number;
  name: string;
}

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
  hours_normal?: number;
  hours_overtime?: number;
  // Nested relations from Prisma includes
  worker?: WorkforceRelation | null;
  teams?: WorkforceRelation | null;
  projects?: WorkforceRelation | null;
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
