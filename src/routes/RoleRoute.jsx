import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Guards a route tree to a specific set of roles. This is a UX
 * convenience only — the real enforcement is server-side (RBAC
 * middleware on every endpoint). This just prevents a logged-in
 * student from rendering, e.g., the admin shell at all.
 */
export default function RoleRoute({ allowedRoles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return <Outlet />;
}
