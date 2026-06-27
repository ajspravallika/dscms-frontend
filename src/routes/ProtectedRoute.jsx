import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';

/**
 * Guards any route tree that requires authentication. While the
 * AuthContext is restoring a session from localStorage (isLoading),
 * shows a loader instead of flashing a redirect. Once resolved, sends
 * unauthenticated users to /login, preserving where they came from.
 */
export default function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader label="Checking your session..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
