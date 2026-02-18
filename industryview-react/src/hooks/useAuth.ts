import { useAuthContext } from '../contexts/AuthContext';

/**
 * Custom hook for auth - simply re-exports from AuthContext.
 * Provides a clean API for components to use auth functionality.
 */
export function useAuth() {
  return useAuthContext();
}

export default useAuth;
