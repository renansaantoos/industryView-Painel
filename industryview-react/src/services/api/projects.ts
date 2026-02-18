import apiClient from './apiClient';
import type {
  ProjectInfo,
  ProjectStatus,
  ProjectWorkSituation,
  ProjectBacklog,
  ProjectUser,
  EquipmentType,
  CreateProjectRequest,
  PaginatedResponse,
  Team,
  TeamMember,
  TeamLeader,
  TeamProject,
  TeamConflictResponse,
  TeamProjectHistory,
  TeamMembersHistory,
} from '../../types';

const PROJECTS_BASE = '/projects';

// === Projects CRUD ===

export async function queryAllProjects(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  sort_field?: string;
  sort_direction?: 'asc' | 'desc';
}): Promise<PaginatedResponse<ProjectInfo>> {
  const response = await apiClient.get(`${PROJECTS_BASE}/projects`, { params });
  return response.data;
}

export async function getProject(projectId: number): Promise<ProjectInfo> {
  const response = await apiClient.get(`${PROJECTS_BASE}/${projectId}`);
  return response.data;
}

export async function addProject(data: CreateProjectRequest): Promise<ProjectInfo> {
  const response = await apiClient.post(PROJECTS_BASE, data);
  return response.data;
}

export async function editProject(projectId: number, data: Partial<CreateProjectRequest>): Promise<ProjectInfo> {
  const response = await apiClient.patch(`${PROJECTS_BASE}/${projectId}`, data);
  return response.data;
}

export async function deleteProject(projectId: number): Promise<void> {
  await apiClient.delete(`${PROJECTS_BASE}/${projectId}`);
}

// === Project Statuses ===

export async function queryAllProjectStatuses(): Promise<ProjectStatus[]> {
  const response = await apiClient.get(`${PROJECTS_BASE}/statuses`);
  return response.data;
}

export async function getProjectStatus(statusId: number): Promise<ProjectStatus> {
  const response = await apiClient.get(`${PROJECTS_BASE}/statuses/${statusId}`);
  return response.data;
}

export async function addProjectStatus(data: { name: string }): Promise<ProjectStatus> {
  const response = await apiClient.post(`${PROJECTS_BASE}/statuses`, data);
  return response.data;
}

export async function editProjectStatus(statusId: number, data: { name: string }): Promise<ProjectStatus> {
  const response = await apiClient.patch(`${PROJECTS_BASE}/statuses/${statusId}`, data);
  return response.data;
}

export async function deleteProjectStatus(statusId: number): Promise<void> {
  await apiClient.delete(`${PROJECTS_BASE}/statuses/${statusId}`);
}

// === Project Work Situations ===

export async function queryAllWorkSituations(): Promise<ProjectWorkSituation[]> {
  const response = await apiClient.get(`${PROJECTS_BASE}/works-situations`);
  return response.data;
}

export async function getWorkSituation(id: number): Promise<ProjectWorkSituation> {
  const response = await apiClient.get(`${PROJECTS_BASE}/works-situations/${id}`);
  return response.data;
}

export async function addWorkSituation(data: { name: string }): Promise<ProjectWorkSituation> {
  const response = await apiClient.post(`${PROJECTS_BASE}/works-situations`, data);
  return response.data;
}

export async function editWorkSituation(id: number, data: { name: string }): Promise<ProjectWorkSituation> {
  const response = await apiClient.patch(`${PROJECTS_BASE}/works-situations/${id}`, data);
  return response.data;
}

export async function deleteWorkSituation(id: number): Promise<void> {
  await apiClient.delete(`${PROJECTS_BASE}/works-situations/${id}`);
}

// === Project Backlogs ===

export async function getProjectBacklog(backlogId: number): Promise<ProjectBacklog> {
  const response = await apiClient.get(`${PROJECTS_BASE}/backlogs/${backlogId}`);
  return response.data;
}

export async function getAllProjectBacklogs(projectId: number): Promise<ProjectBacklog[]> {
  const response = await apiClient.post(`${PROJECTS_BASE}/projects_backlogs_list/${projectId}`, {});
  return response.data;
}

export async function queryAllProjectBacklogIds(params: {
  projects_id: number;
  sprints_id?: number;
  search?: string;
  page?: number;
  per_page?: number;
  filter_backlog?: number;
  sort_field?: string;
  sort_direction?: 'asc' | 'desc';
}): Promise<PaginatedResponse<ProjectBacklog>> {
  const response = await apiClient.get(`${PROJECTS_BASE}/backlogs`, { params });
  return response.data;
}

export async function addProjectBacklog(data: {
  projects_id: number;
  tasks_id: number;
  quantity?: number;
  unity_id?: number;
}): Promise<ProjectBacklog> {
  const response = await apiClient.post(`${PROJECTS_BASE}/backlogs`, data);
  return response.data;
}

export async function editProjectBacklog(backlogId: number, data: Partial<{
  description: string;
  quantity: number;
  unity_id: number;
  discipline_id: number;
  weight: number;
  planned_start_date: string;
  planned_end_date: string;
  actual_start_date: string;
  actual_end_date: string;
  planned_duration_days: number;
  planned_cost: number;
  actual_cost: number;
  percent_complete: number;
  wbs_code: string;
  sort_order: number;
  level: number;
  checked: boolean;
}>): Promise<ProjectBacklog> {
  const response = await apiClient.put(`${PROJECTS_BASE}/backlogs/${backlogId}`, data);
  return response.data;
}

export async function deleteProjectBacklog(backlogId: number): Promise<void> {
  await apiClient.delete(`${PROJECTS_BASE}/backlogs/${backlogId}`);
}

export async function projectsBacklogsBulk(data: {
  projects_id: number;
  tasks_ids: number[];
}): Promise<void> {
  await apiClient.post(`${PROJECTS_BASE}/backlogs/bulk`, data);
}

export async function addTasksBacklogManual(data: {
  projects_id: number;
  name: string;
  quantity?: number;
  unity_id?: number;
  discipline_id?: number;
}): Promise<ProjectBacklog> {
  const response = await apiClient.post(`${PROJECTS_BASE}/projects_backlogs_manual`, data);
  return response.data;
}

export async function checkTaskBacklog(backlogId: number, data: {
  checked: boolean;
}): Promise<void> {
  await apiClient.put(`${PROJECTS_BASE}/backlogs/${backlogId}`, data);
}

export async function editTaskBacklog(backlogId: number, data: Record<string, unknown>): Promise<void> {
  await apiClient.put(`${PROJECTS_BASE}/backlogs/${backlogId}`, data);
}

// === Subtasks ===

export async function addSubtask(data: {
  backlog_id: number;
  name: string;
  description?: string;
}): Promise<{ id: number }> {
  const response = await apiClient.post(`${PROJECTS_BASE}/subtasks`, data);
  return response.data;
}

export async function editSubtask(subtaskId: number, data: Record<string, unknown>): Promise<void> {
  await apiClient.put(`${PROJECTS_BASE}/subtasks/${subtaskId}`, data);
}

export async function getSubtasks(backlogId: number): Promise<{ items: unknown[] }> {
  const response = await apiClient.get(`${PROJECTS_BASE}/subtasks`, { params: { backlog_id: backlogId } });
  return response.data;
}

// === Project Users ===

export async function queryAllProjectUsers(projectId: number): Promise<ProjectUser[]> {
  const response = await apiClient.get(`${PROJECTS_BASE}/users`, { params: { projects_id: projectId } });
  return response.data;
}

export async function addProjectUser(data: {
  projects_id: number;
  users_id: number;
}): Promise<ProjectUser> {
  const response = await apiClient.post(`${PROJECTS_BASE}/users`, data);
  return response.data;
}

export async function editProjectUser(id: number, data: Record<string, unknown>): Promise<void> {
  await apiClient.patch(`${PROJECTS_BASE}/users/${id}`, data);
}

export async function deleteProjectUser(id: number): Promise<void> {
  await apiClient.delete(`${PROJECTS_BASE}/users/${id}`);
}

export async function getProjectUser(id: number): Promise<ProjectUser> {
  const response = await apiClient.get(`${PROJECTS_BASE}/users/${id}`);
  return response.data;
}

// === Equipment Types ===

export async function getEquipmentTypes(): Promise<EquipmentType[]> {
  const response = await apiClient.get(`${PROJECTS_BASE}/equipaments_types`);
  return response.data;
}

// === Fields/Sections Filter ===

export async function filterFields(params: {
  projects_id: number;
  sections_id?: number;
  search?: string;
}): Promise<unknown[]> {
  const response = await apiClient.get(`${PROJECTS_BASE}/fields`, { params });
  return response.data;
}

// === Teams ===

export async function queryAllTeams(params?: {
  projects_id?: number;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<Team>> {
  const response = await apiClient.get('/teams', { params });
  return response.data;
}

export async function getTeam(teamId: number): Promise<Team> {
  const response = await apiClient.get(`/teams/${teamId}`);
  return response.data;
}

export async function addTeam(data: {
  name: string;
  projects_id: number;
  leader_id?: number;
}): Promise<Team> {
  const response = await apiClient.post('/teams', data);
  return response.data;
}

export async function editTeam(teamId: number, data: { name?: string }): Promise<Team> {
  const response = await apiClient.patch(`/teams/${teamId}`, data);
  return response.data;
}

export async function deleteTeam(teamId: number): Promise<void> {
  await apiClient.delete(`/teams/${teamId}`);
}

// === Team Members ===

export async function queryAllTeamMembers(teamId: number): Promise<TeamMember[]> {
  const response = await apiClient.get('/teams/members', { params: { teams_id: teamId } });
  return response.data;
}

export async function getTeamMember(memberId: number): Promise<TeamMember> {
  const response = await apiClient.get(`/teams/members/${memberId}`);
  return response.data;
}

export async function addTeamMember(data: {
  teams_id: number;
  users_id: number;
}): Promise<TeamMember> {
  const response = await apiClient.post('/teams/members', data);
  return response.data;
}

export async function editTeamMember(memberId: number, data: Record<string, unknown>): Promise<void> {
  await apiClient.put('/teams/members/edit', { teams_members_id: memberId, ...data });
}

export async function deleteTeamMember(memberId: number): Promise<void> {
  await apiClient.delete(`/teams/members/${memberId}`);
}

// === Team Leaders ===

export async function queryAllTeamLeaders(teamId: number): Promise<TeamLeader[]> {
  const response = await apiClient.get(`/teams/leaders/all/${teamId}`);
  return response.data;
}

export async function getTeamLeader(leaderId: number): Promise<TeamLeader> {
  const response = await apiClient.get(`/teams/leaders/${leaderId}`);
  return response.data;
}

export async function addTeamLeader(data: {
  teams_id: number;
  users_id: number;
}): Promise<TeamLeader> {
  const response = await apiClient.post('/teams/leaders', data);
  return response.data;
}

export async function editTeamLeader(leaderId: number, data: { users_id: number }): Promise<void> {
  await apiClient.put('/teams/leaders/edit', { teams_leaders_id: leaderId, ...data });
}

export async function deleteTeamLeader(leaderId: number): Promise<void> {
  await apiClient.delete(`/teams/leaders/${leaderId}`);
}

// === Team-Project Links ===

export async function listTeamProjects(params?: {
  teams_id?: number;
  projects_id?: number;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<TeamProject>> {
  const response = await apiClient.get('/teams/projects', { params });
  return response.data;
}

export async function checkTeamConflicts(teamId: number): Promise<TeamConflictResponse> {
  const response = await apiClient.get(`/teams/projects/conflicts/${teamId}`);
  return response.data;
}

export async function linkTeamToProject(data: {
  teams_id: number;
  projects_id: number;
}): Promise<TeamProject> {
  const response = await apiClient.post('/teams/projects/link', data);
  return response.data;
}

export async function unlinkTeamFromProject(data: {
  teams_id: number;
  projects_id: number;
}): Promise<{ message: string }> {
  const response = await apiClient.post('/teams/projects/unlink', data);
  return response.data;
}

export async function getTeamProjectHistory(params?: {
  teams_id?: number;
  projects_id?: number;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<TeamProjectHistory>> {
  const response = await apiClient.get('/teams/projects/history', { params });
  return response.data;
}

// === Team Members History ===

export async function getTeamMembersHistory(params?: {
  teams_id?: number;
  users_id?: number;
  page?: number;
  per_page?: number;
  member_type?: 'member' | 'leader';
}): Promise<PaginatedResponse<TeamMembersHistory>> {
  const response = await apiClient.get('/teams/members/history', { params });
  return response.data;
}

// === CEP Lookup ===

export async function getCep(cep: string) {
  const response = await apiClient.get(`/cep/${cep}`);
  return response.data;
}
