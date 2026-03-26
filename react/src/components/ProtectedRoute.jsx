import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getHomePathForRole } from "../lib/homePath";

function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, isBootstrapping, user } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div className="screen-state">
        <p>Checking your session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={getHomePathForRole(user.role)} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
