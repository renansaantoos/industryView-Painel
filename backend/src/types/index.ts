// =============================================================================
// INDUSTRYVIEW BACKEND - Type Definitions
// Tipos TypeScript baseados no schema do banco de dados
// =============================================================================

import { Request } from 'express';

// -----------------------------------------------------------------------------
// Authentication Types
// -----------------------------------------------------------------------------

export interface JwtPayload {
  id: number;
  email: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  auth?: JwtPayload;
  user?: UserWithPermissions;
}

// -----------------------------------------------------------------------------
// Pagination Types
// -----------------------------------------------------------------------------

export interface PaginationParams {
  page: number;
  perPage: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  curPage: number;
  perPage: number;
  itemsReceived: number;
  itemsTotal: number;
  pageTotal: number;
}

// -----------------------------------------------------------------------------
// User Types
// -----------------------------------------------------------------------------

export interface User {
  id: number;
  name: string | null;
  nameNormalized: string | null;
  email: string | null;
  phone: string | null;
  passwordHash: string | null;
  profilePicture: string | null;
  forgetPasswordCode: number | null;
  usersPermissionsId: number | null;
  companyId: number | null;
  firstLogin: boolean | null;
  qrcode: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface UserPermissions {
  id: number;
  userId: number | null;
  usersSystemAccessId: number | null;
  usersRolesId: number | null;
  usersControlSystemId: number | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export interface UsersRole {
  id: number;
  role: string;
  roleNormalized: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export interface UsersSystemAccess {
  id: number;
  env: string;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export interface UsersControlSystem {
  id: number;
  accessLevel: string;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export interface UserWithPermissions extends User {
  usersPermissions?: UserPermissions & {
    usersSystemAccess?: UsersSystemAccess;
    usersRoles?: UsersRole;
    usersControlSystem?: UsersControlSystem;
  };
  company?: Company;
}

// -----------------------------------------------------------------------------
// Company Types
// -----------------------------------------------------------------------------

export interface Company {
  id: number;
  brandName: string | null;
  legalName: string | null;
  cnpj: string | null;
  phone: string | null;
  email: string | null;
  cep: string | null;
  numero: string | null;
  addressLine: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  statusPaymentId: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// -----------------------------------------------------------------------------
// Project Types
// -----------------------------------------------------------------------------

export interface Project {
  id: number;
  registrationNumber: string | null;
  name: string | null;
  nameNormalized: string | null;
  projectCreationDate: Date | null;
  originRegistration: string | null;
  art: string | null;
  rrt: string | null;
  cib: string | null;
  realStateRegistration: string | null;
  startDate: Date | null;
  permitNumber: string | null;
  cnae: string | null;
  situationDate: Date | null;
  responsible: string | null;
  cep: string | null;
  city: string | null;
  number: string | null;
  state: string | null;
  country: string | null;
  street: string | null;
  neighbourhood: string | null;
  complement: string | null;
  cnpj: string | null;
  completionPercentage: number | null;
  category: string | null;
  destination: string | null;
  projectWorkType: string | null;
  resultingWorkArea: string | null;
  cnoFile: string | null;
  projectsStatusesId: number | null;
  projectsWorksSituationsId: number | null;
  companyId: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ProjectStatus {
  id: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// -----------------------------------------------------------------------------
// Sprint Types
// -----------------------------------------------------------------------------

export interface Sprint {
  id: number;
  title: string;
  objective: string;
  startDate: Date | null;
  endDate: Date | null;
  progressPercentage: number | null;
  projectsId: number | null;
  sprintsStatusesId: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface SprintStatus {
  id: number;
  status: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface SprintTask {
  id: number;
  projectsBacklogsId: number | null;
  subtasksId: number | null;
  sprintsId: number | null;
  teamsId: number | null;
  sprintsTasksStatusesId: number | null;
  scheduledFor: Date | null;
  executedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// -----------------------------------------------------------------------------
// Task/Backlog Types
// -----------------------------------------------------------------------------

export interface ProjectBacklog {
  id: number;
  projectsId: number;
  tasksTemplateId: number | null;
  projectsBacklogsStatusesId: number | null;
  fieldsId: number | null;
  sectionsId: number | null;
  rowsId: number | null;
  trackersId: number | null;
  rowsTrackersId: number | null;
  rowsStakesId: number | null;
  disciplineId: number | null;
  equipamentsTypesId: number | null;
  unityId: number | null;
  qualityStatusId: number | null;
  projectsBacklogsId: number | null;
  subtasksId: number | null;
  description: string | null;
  descriptionNormalized: string | null;
  weight: number | null;
  quantity: number | null;
  quantityDone: number | null;
  sprintAdded: boolean | null;
  isInspection: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Subtask {
  id: number;
  projectsBacklogsId: number | null;
  description: string | null;
  descriptionNormalized: string | null;
  weight: number | null;
  fixed: boolean | null;
  isInspection: boolean | null;
  unityId: number | null;
  quantity: number | null;
  quantityDone: number | null;
  subtasksStatusesId: number | null;
  qualityStatusId: number | null;
  sprintAdded: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// -----------------------------------------------------------------------------
// Team Types
// -----------------------------------------------------------------------------

export interface Team {
  id: number;
  name: string | null;
  projectsId: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// -----------------------------------------------------------------------------
// Tracker Types
// -----------------------------------------------------------------------------

export interface Tracker {
  id: number;
  stakeQuantity: number;
  maxModules: number;
  trackersTypesId: number | null;
  manufacturersId: number | null;
  companyId: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface TrackerType {
  id: number;
  type: string;
  typeNormalized: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// -----------------------------------------------------------------------------
// Map Structure Types (Fields, Sections, Rows)
// -----------------------------------------------------------------------------

export interface Field {
  id: number;
  name: string;
  sectionQuantity: number | null;
  rowsPerSection: number | null;
  mapTexts: Record<string, unknown> | null;
  projectsId: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Section {
  id: number;
  sectionNumber: number | null;
  fieldsId: number | null;
  x: number | null;
  y: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Row {
  id: number;
  rowNumber: number | null;
  sectionsId: number | null;
  x: number | null;
  y: number | null;
  groupOffsetX: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// -----------------------------------------------------------------------------
// Inventory Types
// -----------------------------------------------------------------------------

export interface ProductInventory {
  id: number;
  code: string | null;
  product: string | null;
  productNormalized: string | null;
  specifications: string | null;
  inventoryQuantity: number | null;
  minQuantity: number | null;
  sequentialPerCategory: number | null;
  unityId: number | null;
  statusInventoryId: number | null;
  equipamentsTypesId: number | null;
  manufacturersId: number | null;
  projectsId: number | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export interface InventoryLog {
  id: number;
  code: string | null;
  quantity: number | null;
  type: boolean | null; // true = entry, false = exit
  observations: string | null;
  responsibleUsersId: number | null;
  receivedUser: number | null;
  productInventoryId: number | null;
  projectsId: number | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

// -----------------------------------------------------------------------------
// AI Agent Types
// -----------------------------------------------------------------------------

export interface AgentLogDashboard {
  id: string;
  userId: number;
  question: string;
  response: string;
  intentData: string | null;
  objectAnswer: Record<string, unknown> | null;
  createdAt: Date;
}

export interface InterpretingAgentResult {
  isAboutProjects: boolean;
  isAboutDelayedTasks: boolean;
  isAboutStructure: boolean;
  requestedInfo: string | null;
  query: {
    field?: string;
    operator?: string;
    value?: string;
    projectId?: string;
    projectName?: string;
    projectNumber?: string;
  } | null;
  error: string | null;
}

// -----------------------------------------------------------------------------
// Subscription/Payment Types
// -----------------------------------------------------------------------------

export interface Subscription {
  id: number;
  companyId: number | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: string | null;
  trialEnd: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean | null;
  lastInvoiceId: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface AuthResponse {
  authToken: string;
  user?: UserWithPermissions;
}
