import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { UserInfo } from '../types';
import { authApi } from '../services';

interface AuthContextValue {
  /** Whether auth state is still loading */
  loading: boolean;
  /** Whether the user is logged in */
  isLoggedIn: boolean;
  /** Auth token */
  token: string;
  /** Current user info */
  user: UserInfo | null;
  /** Login with email and password */
  login: (email: string, password: string) => Promise<void>;
  /** Signup with user data */
  signup: (name: string, email: string, phone: string, password: string) => Promise<void>;
  /** Logout and clear all auth data */
  logout: () => void;
  /** Refresh user info from /auth/me */
  refreshUser: () => Promise<void>;
  /** Update local user info */
  updateUser: (updates: Partial<UserInfo>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string>(() => localStorage.getItem('ff_token') || '');
  const [user, setUser] = useState<UserInfo | null>(() => {
    const stored = localStorage.getItem('ff_infoUser');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const isLoggedIn = Boolean(token && user);

  /** Persist token to localStorage */
  const persistToken = useCallback((newToken: string) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('ff_token', newToken);
    } else {
      localStorage.removeItem('ff_token');
    }
  }, []);

  /** Persist user to localStorage */
  const persistUser = useCallback((newUser: UserInfo | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('ff_infoUser', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('ff_infoUser');
    }
  }, []);

  /** Fetch user info from /auth/me */
  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const data = await authApi.getMe(token);
      const userInfo: UserInfo = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || '',
        createdAt: '',
        updatedAt: '',
        deletedAt: null,
        url: data.user.profile_picture?.url || '',
        usersPermissionsId: data.user.users_permissions_id || 0,
        usersSystemAccessId: data.user.users_permissions?.users_system_access_id || 0,
        usersRolesId: data.user.users_permissions?.users_roles_id || 0,
        usersControlSystemId: data.user.users_permissions?.users_control_system_id || 0,
        sprintIdAtiva: data.result1?.sprints_of_projects_of_sprints_statuses?.id || 0,
        companyId: data.user.company_id || 0,
        plan: data.user.company?.status_payment_id || 0,
      };
      persistUser(userInfo);
    } catch (err) {
      console.error('Failed to refresh user:', err);
      // If token is invalid, logout
      persistToken('');
      persistUser(null);
    }
  }, [token, persistToken, persistUser]);

  /** Login */
  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login({ email, password_hash: password });
    if (result.authToken) {
      persistToken(result.authToken);
      // Fetch user info with the new token
      const data = await authApi.getMe(result.authToken);
      console.log('[DEBUG] company_id from API:', data.user.company_id, '| company:', data.user.company);
      const userInfo: UserInfo = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || '',
        createdAt: '',
        updatedAt: '',
        deletedAt: null,
        url: data.user.profile_picture?.url || '',
        usersPermissionsId: data.user.users_permissions_id || 0,
        usersSystemAccessId: data.user.users_permissions?.users_system_access_id || 0,
        usersRolesId: data.user.users_permissions?.users_roles_id || 0,
        usersControlSystemId: data.user.users_permissions?.users_control_system_id || 0,
        sprintIdAtiva: data.result1?.sprints_of_projects_of_sprints_statuses?.id || 0,
        companyId: data.user.company_id || 0,
        plan: data.user.company?.status_payment_id || 0,
      };
      persistUser(userInfo);
    } else {
      throw new Error(result.message || 'Login failed');
    }
  }, [persistToken, persistUser]);

  /** Signup */
  const signup = useCallback(async (name: string, email: string, phone: string, password: string) => {
    const result = await authApi.signup({
      name,
      email,
      phone,
      password_hash: password,
    });
    if (result.authToken) {
      persistToken(result.authToken);
      const data = await authApi.getMe(result.authToken);
      const userInfo: UserInfo = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || '',
        createdAt: '',
        updatedAt: '',
        deletedAt: null,
        url: data.user.profile_picture?.url || '',
        usersPermissionsId: data.user.users_permissions_id || 0,
        usersSystemAccessId: data.user.users_permissions?.users_system_access_id || 0,
        usersRolesId: data.user.users_permissions?.users_roles_id || 0,
        usersControlSystemId: data.user.users_permissions?.users_control_system_id || 0,
        sprintIdAtiva: data.result1?.sprints_of_projects_of_sprints_statuses?.id || 0,
        companyId: data.user.company_id || 0,
        plan: data.user.company?.status_payment_id || 0,
      };
      persistUser(userInfo);
    } else {
      throw new Error(result.message || 'Signup failed');
    }
  }, [persistToken, persistUser]);

  /** Logout */
  const logout = useCallback(() => {
    persistToken('');
    persistUser(null);
    localStorage.removeItem('ff_projectsInfo');
    localStorage.removeItem('ff_teamId');
    localStorage.removeItem('ff_navBarSelection');
  }, [persistToken, persistUser]);

  /** Update local user info */
  const updateUser = useCallback((updates: Partial<UserInfo>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('ff_infoUser', JSON.stringify(updated));
      return updated;
    });
  }, []);

  /** Initialize: check if stored token is still valid */
  useEffect(() => {
    const init = async () => {
      if (token) {
        try {
          await refreshUser();
        } catch {
          // Token invalid, clear it
          persistToken('');
          persistUser(null);
        }
      }
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        loading,
        isLoggedIn,
        token,
        user,
        login,
        signup,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
