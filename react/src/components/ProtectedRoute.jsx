import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getDefaultPathForUser } from "../lib/homePath";

function ProtectedRoute({ allowedRoles = [], allowPendingPasswordChange = false }) {
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

  if (user.mustChangePassword && !allowPendingPasswordChange) {
    return <Navigate to="/change-password" replace state={{ from: location }} />;
  }

  if (!user.mustChangePassword && allowPendingPasswordChange) {
    return <Navigate to={getDefaultPathForUser(user)} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultPathForUser(user)} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
