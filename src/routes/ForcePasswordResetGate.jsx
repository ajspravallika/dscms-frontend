import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Wraps the entire route tree. If the logged-in user still has
 * mustResetPassword=true (the default for every admin-created account
 * — see backend User.model.js), they are redirected to /reset-password
 * regardless of which URL they tried to visit, until they change it.
 *
 * Does nothing while the session is still being restored, and does
 * nothing for unauthenticated users (ProtectedRoute handles that case).
 */
export default function ForcePasswordResetGate({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return children;

  const isAuthRoute = location.pathname === '/login' || location.pathname === '/reset-password';

  if (user && user.mustResetPassword && !isAuthRoute) {
    return <Navigate to="/reset-password" replace />;
  }

  return children;
}
