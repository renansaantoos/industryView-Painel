/** Daily report record */
export interface DailyReport {
  id: number;
  projectsId: number;
  date: string;
  createdAt: string;
  updatedAt?: string;
  scheduleIds?: number[];
  status?: string;
  weather?: string;
  description?: string;
  observations?: string;
}

/** Daily report list response */
export interface DailyReportListResponse {
  result1: {
    items: DailyReport[];
    pageTotal: number;
    itemsTotal: number;
  };
  daily_report_pending: number;
}

/** Dashboard data */
export interface DashboardData {
  totalProjects?: number;
  activeProjects?: number;
  completedTasks?: number;
  pendingTasks?: number;
  teamMembers?: number;
  sprintProgress?: number;
  burndownData?: BurndownDataPoint[];
  recentActivity?: ActivityItem[];
}

/** Burndown chart data point */
export interface BurndownDataPoint {
  date: string;
  ideal: number;
  actual: number;
}

/** Schedule/timeline item */
export interface ScheduleItem {
  id: number;
  name: string;
  date: string;
  status?: string;
}

/** Activity item for dashboard */
export interface ActivityItem {
  id: number;
  type: string;
  description: string;
  userId: number;
  userName?: string;
  createdAt: string;
}

/** Daily production report data */
export interface DailyProductionReport {
  date: string;
  production: number;
  teams: ProductionTeamData[];
}

/** Production team data */
export interface ProductionTeamData {
  teamId: number;
  teamName: string;
  production: number;
  target: number;
}

/** Report PDF data */
export interface ReportPdfData {
  title: string;
  date: string;
  projectName: string;
  items: ReportPdfItem[];
}

export interface ReportPdfItem {
  name: string;
  value: string | number;
  unit?: string;
}
