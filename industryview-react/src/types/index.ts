export type * from './user';
export type * from './project';
export type * from './tracker';
export type * from './task';
export type * from './sprint';
export type * from './report';
export type * from './inventory';
export type * from './company';
export type * from './safety';
export type * from './quality';
export type * from './planning';
export type * from './daily-report';
export type * from './work-permit';
export type * from './workforce';
export type * from './ppe';
export type * from './notification';
export type * from './contract';
export type * from './commissioning';
export type * from './environmental';
export type * from './health';
export type * from './material-requisition';
export type * from './audit';
export type * from './employee';

/** Generic API response wrapper */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

/** Paginated response */
export interface PaginatedResponse<T> {
  items: T[];
  pageTotal: number;
  curPage: number;
  nextPage: number | null;
  prevPage: number | null;
  itemsReceived: number;
  itemsTotal: number;
}

/** Manufacturer (from ManufacturersStruct / Manufacturers1Struct / Manufacturers2Struct) */
export interface Manufacturer {
  id: number;
  name: string;
  type?: string;
}

/** Filter struct (generic filter state) */
export interface FilterState {
  ids: number[];
  names: string[];
  active: boolean;
}

/** Drop select option (from DropSelect1Struct) */
export interface DropSelectOption {
  id: number;
  name: string;
}

/** Drop select with description (from DropSelect2Struct) */
export interface DropSelectOption2 {
  id: number;
  name: string;
  description?: string;
}

/** Items struct (generic id/name) */
export interface ItemOption {
  id: number;
  name: string;
}

/** Agent struct */
export interface Agent {
  id: number;
  name: string;
  type?: string;
}

/** Team record */
export interface Team {
  id: number;
  name: string;
  projectsId: number;
  createdAt?: string;
  updatedAt?: string;
  leaderId?: number;
  leaderName?: string;
  membersCount?: number;
}

/** Team member */
export interface TeamMember {
  id: number;
  teamsId: number;
  usersId: number;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  roleId?: number;
  roleName?: string;
}

/** Team leader */
export interface TeamLeader {
  id: number;
  teamsId: number;
  usersId: number;
  userName?: string;
  userEmail?: string;
}

/** Company */
export interface Company {
  id: number;
  name: string;
  cnpj?: string;
  statusPaymentId?: number;
}

/** CEP (Brazilian postal code) response */
export interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
}

/** Stripe session */
export interface StripeSession {
  url: string;
  sessionId: string;
}

/** Stripe price */
export interface StripePrice {
  id: string;
  name: string;
  amount: number;
  currency: string;
  interval: string;
}

/** Team-Project junction (active link) */
export interface TeamProject {
  id: number;
  teams_id: number;
  projects_id: number;
  start_at: string;
  end_at?: string | null;
  created_at: string;
  teams?: { id: number; name: string };
  projects?: { id: number; name: string };
}

/** Team conflict check response */
export interface TeamConflictResponse {
  teams_id: number;
  active_projects: {
    projects_id: number;
    project_name: string;
    start_at: string;
  }[];
  has_conflicts: boolean;
}

/** Member snapshot entry in history */
export interface MemberSnapshotEntry {
  user_id: number;
  name: string;
  email: string;
  role: 'leader' | 'member';
}

/** Team members history record (add/remove member or leader) */
export interface TeamMembersHistory {
  id: number;
  teams_id: number;
  users_id: number;
  action: 'ADICIONADO' | 'REMOVIDO';
  member_type: 'member' | 'leader';
  team_name?: string;
  user_name?: string;
  user_email?: string;
  performed_by_id?: number;
  performed_by_name?: string;
  performed_by_email?: string;
  created_at: string;
}

/** Team-Project history record */
export interface TeamProjectHistory {
  id: number;
  teams_id: number;
  projects_id: number;
  action: 'VINCULADO' | 'DESVINCULADO';
  team_name?: string;
  project_name?: string;
  performed_by_id?: number;
  performed_by_name?: string;
  performed_by_email?: string;
  members_snapshot?: MemberSnapshotEntry[];
  start_at?: string;
  end_at?: string;
  created_at: string;
}
