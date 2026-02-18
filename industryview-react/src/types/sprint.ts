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
  sprints_ativa: SprintPaginatedCategory;
  sprints_futura: SprintPaginatedCategory;
  sprints_concluida: SprintPaginatedCategory;
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
  name: string;
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
  quantityDone?: number;
  createdAt?: string;
  updatedAt?: string;
  // Nested relations from panel
  teams?: { id: number; name: string };
  assignedUser?: { id: number; name: string; email?: string };
  nonExecutionReason?: { id: number; name: string; category: string };
  projectsBacklogs?: SprintTaskBacklog;
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

/** Backlog nested inside sprint task */
export interface SprintTaskBacklog {
  id: number;
  description?: string;
  weight?: number;
  quantity?: number;
  quantityDone?: number;
  tasksTemplate?: {
    id: number;
    description?: string;
    weight?: number;
    fixed?: boolean;
  };
  discipline?: { id: number; name: string };
  unity?: { id: number; name: string; abbreviation?: string };
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
