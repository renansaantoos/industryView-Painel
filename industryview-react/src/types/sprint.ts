/** Sprint record (matches API response) */
export interface Sprint {
  id: number;
  title: string;
  objective?: string;
  start_date: number;
  end_date: number;
  progress_percentage: number;
  projects_id: number;
  sprints_statuses_id: number;
  created_at?: number;
  updated_at?: number;
  deleted_at?: number | null;
}

/** Sprint list response (3 categories) */
export interface SprintListResponse {
  sprints_ativa?: SprintPaginatedCategory;
  sprints_futura?: SprintPaginatedCategory;
  sprints_concluida?: SprintPaginatedCategory;
  /** Flat list (when API returns items directly) */
  items?: Sprint[];
}

/** Single paginated category in sprint list */
export interface SprintPaginatedCategory {
  items: Sprint[];
  curPage: number;
  perPage: number;
  itemsReceived: number;
  itemsTotal: number;
  pageTotal: number;
}

/** Sprint status */
export interface SprintStatus {
  id: number;
  status: string;
}

/** Golden rule nested inside tasks_template */
export interface TaskGoldenRuleEntry {
  id: number;
  golden_rule: {
    id: number;
    title: string;
    description?: string;
    severity?: string;
    is_active?: boolean;
  };
}

/** Tasks template with full relations */
export interface TasksTemplateDetail {
  id: number;
  description?: string;
  weight?: number;
  fixed?: boolean;
  is_inspection?: boolean;
  installation_method?: string;
  checklist_templates_id?: number;
  checklist_template?: { id: number; name: string; checklist_type: string };
  task_golden_rules?: TaskGoldenRuleEntry[];
  discipline?: { id: number; discipline?: string; name?: string };
  unity?: { id: number; unity?: string; name?: string };
  equipaments_types?: { id: number; type?: string };
}

/** Sprint task record (full, from panel endpoint) */
export interface SprintTask {
  id: number;
  sprintsId: number;
  projectsBacklogsId: number;
  subtasksId?: number;
  teamsId?: number;
  sprintsTasksStatusesId?: number;
  scheduledFor?: string;
  executedAt?: string;
  assignedUserId?: number;
  nonExecutionReasonId?: number;
  nonExecutionObservations?: string;
  criticality?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  quantityAssigned?: number;
  quantityDone?: number;
  createdAt?: string;
  updatedAt?: string;
  // Nested relations from panel
  teams?: { id: number; name: string };
  assignedUser?: { id: number; name: string; email?: string };
  nonExecutionReason?: { id: number; name: string; category: string };
  projectsBacklogs?: SprintTaskBacklog;
  subtasks?: SprintSubtask;
  sprints_tasks_statuses?: { id: number; name: string };
  // Legacy compat
  quantity?: number;
  status?: number;
  statusName?: string;
  taskName?: string;
  description?: string;
  done?: number;
  total?: number;
}

/** Subtask nested inside sprint task */
export interface SprintSubtask {
  id: number;
  description?: string;
  quantity?: number;
  quantity_done?: number;
  weight?: number;
  is_inspection?: boolean;
  unity?: { id: number; unity?: string; name?: string };
}

/** Backlog nested inside sprint task */
export interface SprintTaskBacklog {
  id: number;
  description?: string;
  weight?: number;
  quantity?: number;
  quantityDone?: number;
  is_inspection?: boolean;
  wbs_code?: string;
  percent_complete?: number;
  planned_start_date?: string;
  planned_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  tasksTemplate?: TasksTemplateDetail;
  discipline?: { id: number; discipline?: string; name?: string };
  unity?: { id: number; unity?: string; name?: string; abbreviation?: string };
  equipaments_types?: { id: number; type?: string };
  sections?: { id: number; section_number?: number };
  rows?: { id: number; row_number?: number };
  fields?: { id: number; name?: string };
  trackers?: { id: number; trackers_types?: { id: number; type?: string }; manufacturers?: { id: number; name?: string } };
}

/** Sprint panel response (5 categories) */
export interface SprintPanelResponse {
  sprints_tasks_pendentes: SprintPanelCategory;
  sprints_tasks_em_andamento: SprintPanelCategory;
  sprints_tasks_concluidas: SprintPanelCategory;
  sprints_tasks_sem_sucesso: SprintPanelCategory;
  sprints_tasks_inspecao: SprintPanelCategory;
  has_team_created: boolean;
}

/** Single category in sprint panel */
export interface SprintPanelCategory {
  items: SprintTask[];
  curPage: number;
  perPage: number;
  itemsReceived: number;
  itemsTotal: number;
  pageTotal: number;
}

/** Sprint task status */
export interface SprintTaskStatus {
  id: number;
  name: string;
  color?: string;
}

/** Sprint future (from SprintFuturaStruct) */
export interface SprintFuture {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
}

/** Sprint chart/filter data */
export interface SprintChartData {
  date: string;
  planned: number;
  actual: number;
}

/** Sprint backlog view */
export interface SprintBacklogItem {
  id: number;
  taskName: string;
  quantity: number;
  status: number;
  statusName: string;
  priority?: number;
  done?: number;
  total?: number;
  subtasksCount?: number;
}
