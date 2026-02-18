/** User info stored in app state (from VarInfoUserStruct) */
export interface UserInfo {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  url: string;
  usersPermissionsId: number;
  usersSystemAccessId: number;
  usersRolesId: number;
  usersControlSystemId: number;
  sprintIdAtiva: number;
  companyId: number;
  plan: number;
}

/** User from API list queries (from User1Struct) */
export interface UserListItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  url?: string;
}

/** User detail (from User2Struct) */
export interface UserDetail {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  usersPermissionsId: number;
  url?: string;
}

/** User with roles info (from User3Struct) */
export interface UserWithRoles {
  id: number;
  name: string;
  email: string;
  phone?: string;
  rolesId?: number;
  rolesName?: string;
  systemAccessId?: number;
  systemAccessName?: string;
  controlSystemId?: number;
  controlSystemName?: string;
}

/** User full detail (from User4Struct) */
export interface UserFull {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  usersPermissionsId: number;
  url?: string;
  roles?: UserRole;
  roleName?: string;
  systemAccess?: UserSystemAccess;
  controlSystem?: UserControlSystem;
  hr_data?: { cargo?: string } | null;
}

export interface UserRole {
  id: number;
  name: string;
}

export interface UserSystemAccess {
  id: number;
  name: string;
}

export interface UserControlSystem {
  id: number;
  name: string;
}

/** User leader (from UserLider1Struct) */
export interface UserLeader {
  id: number;
  name: string;
}

/** Login request */
export interface LoginRequest {
  email: string;
  password_hash: string;
}

/** Login response */
export interface LoginResponse {
  authToken: string;
  message?: string;
}

/** Signup request */
export interface SignupRequest {
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  env_from_create?: number;
  user_system_access?: number;
  user_control_system?: number;
  user_role_type?: number;
}

/** Signup response */
export interface SignupResponse {
  authToken: string;
  message?: string;
}

/** /auth/me response */
export interface AuthMeResponse {
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    company_id: number;
    users_permissions_id: number;
    users_permissions?: {
      users_system_access_id: number;
      users_roles_id: number;
      users_control_system_id: number;
    };
    profile_picture?: {
      url: string;
    };
    company?: {
      status_payment_id: number;
    };
  };
  result1?: {
    sprints_of_projects_of_sprints_statuses?: {
      id: number;
    };
  };
}

export interface ListPermissions {
  id: number;
  name: string;
}

export interface ListRoles {
  id: number;
  name: string;
}

export interface ListTypeAccess {
  id: number;
  name: string;
}

export interface ListControlSystem {
  id: number;
  name: string;
}
