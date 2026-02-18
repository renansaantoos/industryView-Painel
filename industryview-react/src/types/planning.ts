/** Company Module (feature toggle) */
export interface CompanyModule {
  id: number;
  company_id: number;
  module_name: 'CORE' | 'SSMA' | 'QUALIDADE' | 'PLANEJAMENTO' | 'CONTRATOS';
  is_active: boolean;
  activated_at?: string;
  created_at: string;
  updated_at: string;
}

/** Schedule Baseline */
export interface ScheduleBaseline {
  id: number;
  projects_id: number;
  name: string;
  description?: string;
  snapshot_date: string;
  created_by: number;
  creator_name?: string;
  created_at: string;
}

/** Task Dependency */
export interface TaskDependency {
  id: number;
  projects_id: number;
  predecessor_backlog_id: number;
  successor_backlog_id: number;
  dependency_type: 'FS' | 'FF' | 'SS' | 'SF';
  lag_days?: number;
  predecessor_name?: string;
  successor_name?: string;
  created_at: string;
}

/** Gantt Item */
export interface GanttItem {
  id: number;
  description: string | null;
  wbs_code: string | null;
  level: number | null;
  sort_order: number | null;
  planned_start_date: string | null;
  planned_end_date: string | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  percent_complete: number | null;
  planned_duration_days: number | null;
  planned_cost: number | null;
  actual_cost: number | null;
  is_milestone?: boolean;
  dependencies?: { id: number; predecessor_backlog_id: number; dependency_type: string; lag_days: number }[];
}

/** Curve S Data Point */
export interface CurveSData {
  date: string;
  planned_cumulative: number;
  actual_cumulative: number;
  planned_percent: number;
  actual_percent: number;
}

/** Backlog Planning (bulk update item) */
export interface BacklogPlanningUpdate {
  backlog_id: number;
  planned_start?: string;
  planned_end?: string;
  planned_duration?: number;
  planned_cost?: number;
  wbs_code?: string;
}

/** Schedule Import Record */
export interface ScheduleImport {
  id: number;
  projects_id: number;
  file_name: string;
  file_type: string;
  total_tasks: number;
  imported_tasks: number;
  failed_tasks: number;
  import_mode: string;
  status: string;
  error_log?: { row: number; error: string }[];
  created_by?: number;
  created_by_name?: string;
  created_at: string;
}

/** Import Preview Item (returned from upload) */
export interface ImportPreviewItem {
  import_source_id: string | null;
  description: string;
  wbs_code: string | null;
  level: number;
  planned_start_date: string | null;
  planned_end_date: string | null;
  planned_duration_days: number | null;
  planned_cost: number | null;
  is_milestone: boolean;
  weight: number;
  predecessors: { source_id: string; type: string; lag: number }[];
}

/** Import Result */
export interface ImportResult {
  import_id?: number;
  total_tasks: number;
  imported_tasks: number;
  failed_tasks: number;
  dependencies_created: number;
  errors: { row: number; error: string }[];
}

/** Schedule Health Data */
export interface ScheduleHealthData {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  not_started_tasks: number;
  on_time: number;
  delayed: number;
  ahead: number;
  overall_planned_percent: number;
  overall_actual_percent: number;
  spi: number | null;
  upcoming_milestones: {
    id: number;
    description: string | null;
    planned_date: string;
    wbs_code: string | null;
    is_overdue: boolean;
  }[];
}

/** Critical Path Data */
export interface CriticalPathData {
  critical_tasks: number[];
  total_duration: number;
}

/** Extended Gantt Item (alias for GanttItem, kept for backwards compatibility) */
export type GanttItemDetail = GanttItem;
