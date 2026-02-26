/** Minimal project for dropdowns/lists (id + name) */
export interface Project {
  id: number;
  name: string;
}

/** Project info stored in app state (from ProjectsInfo1Struct) */
export interface ProjectInfo {
  id: number;
  registrationNumber: string;
  name: string;
  projectCreationDate: number;
  originRegistration: string;
  art: string;
  rrt: string;
  cib: string;
  realStateRegistration: string;
  startDate: string;
  permitNumber: string;
  cnae: string;
  situationDate: string;
  responsible: string;
  cep: string;
  city: string;
  number: string;
  state: string;
  country: string;
  street: string;
  neighborhood: string;
  complement: string;
  projectsStatusesId: number;
  cnpj: string;
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
  projectsWorksSituationsId: number;
  category: string;
  destination: string;
  projectWorkType: string;
  resultingWorkArea: string;
  lastTeamCreated?: LastTeamCreated;
  url: string;
  fileName: string;
  // Schedule/cronograma enrichment fields
  status_name?: string | null;
  work_situation_name?: string | null;
  schedule_total_tasks?: number;
  schedule_completed_tasks?: number;
  schedule_in_progress_tasks?: number;
  schedule_actual_progress?: number;
  /** ID of the client linked to this project (foreign key to clients table) */
  client_id?: number | null;
  /** Client name (trade_name or legal_name, enriched by backend) */
  client_name?: string | null;
}

export interface LastTeamCreated {
  id: number;
  name: string;
}

/** Project status */
export interface ProjectStatus {
  id: number;
  name: string;
}

/** Project work situation */
export interface ProjectWorkSituation {
  id: number;
  name: string;
}

/** Project backlog item */
export interface ProjectBacklog {
  id: number;
  name: string;
  description?: string;
  projectsId: number;
  status?: string;
  priority?: number;
  checked?: boolean;
  taskName?: string;
  quantity?: number;
  quantityDone?: number;
  unityName?: string;
  disciplineName?: string;
  tasksId?: number;
  unityId?: number;
  disciplineId?: number;
  weight?: number;
  sprintAdded?: boolean;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  plannedDurationDays?: number;
  plannedCost?: number;
  actualCost?: number;
  percentComplete?: number;
  wbsCode?: string;
  sortOrder?: number;
  level?: number;
}

/** Project user association */
export interface ProjectUser {
  id: number;
  projectsId: number;
  usersId: number;
  userName?: string;
}

/** Equipment type (from EquipamentsTypeStruct) */
export interface EquipmentType {
  id: number;
  name: string;
}

/** Create project request */
export interface CreateProjectRequest {
  registration_number?: string;
  name: string;
  origin_registration?: string;
  art?: string;
  rrt?: string;
  cib?: string;
  real_state_registration?: string;
  start_date?: string;
  permit_number?: string;
  cnae?: string;
  situation_date?: string;
  responsible?: string;
  cep?: string;
  city?: string;
  number?: string;
  state?: string;
  country?: string;
  street?: string;
  neighbourhood?: string;
  complement?: string;
  projects_statuses_id?: number;
  projects_works_situations_id?: number;
  cnpj?: string;
  category?: string;
  destination?: string;
  project_work_type?: string;
  resulting_work_area?: string;
  /** ID of the associated client (foreign key to clients table) */
  client_id?: number;
}

/** Edit project request */
export interface EditProjectRequest extends Partial<CreateProjectRequest> {
  id: number;
}
