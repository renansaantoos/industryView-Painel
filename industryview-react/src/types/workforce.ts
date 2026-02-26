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
  check_in?: string | null;
  saida_intervalo?: string | null;
  entrada_intervalo?: string | null;
  check_out?: string | null;
  team?: string;
  status?: 'presente' | 'ausente' | 'meio_periodo';
  observation?: string;
  user_name?: string;
  hours_normal?: number;
  hours_overtime?: number;
  hours_he_100?: number;
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
