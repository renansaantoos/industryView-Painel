import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard that redirects to /login if user is not authenticated,
 * and to /empresa if user has no company associated.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.companyId || user.companyId <= 0) {
    return <Navigate to="/empresa" replace />;
  }

  return <>{children}</>;
}
