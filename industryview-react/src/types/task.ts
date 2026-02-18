/** Task record (maps to tasks_template) */
export interface Task {
  id: number;
  name: string;
  description?: string;
  priority?: number;
  priorityName?: string;
  status?: string;
  weight?: number;
  fixed?: boolean;
  isInspection?: boolean;
  installationMethod?: string;
  checklistTemplatesId?: number;
  checklistTemplateName?: string;
  equipamentsTypesId?: number;
  equipamentsTypeName?: string;
  unityId?: number;
  unityName?: string;
  disciplineId?: number;
  disciplineName?: string;
  companyId?: number;
  createdAt?: string;
  updatedAt?: string;
  active?: boolean;
}

/** Task list item - snake_case matching backend response */
export interface TaskListItem {
  id: number;
  description?: string;
  weight?: number;
  fixed?: boolean;
  is_inspection?: boolean;
  installation_method?: string;
  checklist_templates_id?: number;
  equipaments_types_id?: number;
  unity_id?: number;
  discipline_id?: number;
  company_id?: number;
  // Relations included by backend
  discipline?: { id: number; discipline: string };
  unity?: { id: number; unity: string };
  equipaments_types?: { id: number; type: string };
  checklist_template?: { id: number; name: string };
  // Legacy camelCase aliases (for backwards compat)
  name?: string;
  priority?: number;
  status?: string;
  checked?: boolean;
}

/** Non-execution reason */
export interface NonExecutionReason {
  id: number;
  name: string;
  category: string;
}

/** Task priority */
export interface TaskPriority {
  id: number;
  name: string;
  level: number;
}

/** Unity (measurement unit for tasks) */
export interface Unity {
  id: number;
  unity?: string;
  name?: string;
  abbreviation?: string;
}

/** Discipline (task category) */
export interface Discipline {
  id: number;
  discipline?: string;
  name?: string;
}

/** Task backlog */
export interface TaskBacklog {
  id: number;
  name: string;
  description?: string;
  taskId: number;
  projectId: number;
  sprintId?: number;
  quantity?: number;
  status?: number;
  checked?: boolean;
  subtasks?: Subtask[];
}

/** Subtask */
export interface Subtask {
  id: number;
  name: string;
  description?: string;
  status?: boolean;
  taskBacklogId: number;
}

/** Backlog comment */
export interface BacklogComment {
  id: number;
  text: string;
  userId: number;
  userName?: string;
  createdAt: string;
  backlogId: number;
}

/** Import task data */
export interface ImportTaskData {
  headers: string[];
  rows: Record<string, string>[];
}

/** CSV header mapping (from HeadersStruct) */
export interface HeaderMapping {
  original: string;
  mapped: string;
}
