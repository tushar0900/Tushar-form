import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getHomePathForRole } from "../lib/homePath";

const initialFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function ChangePasswordPage() {
  const { isAuthenticated, user, changePassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formState, setFormState] = useState(initialFormState);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user?.mustChangePassword) {
    return <Navigate to={getHomePathForRole(user?.role)} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormState((currentState) => ({
      ...currentState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    if (formState.newPassword !== formState.confirmPassword) {
      setError("New password and confirm password must match.");
      setSubmitting(false);
      return;
    }

    try {
      const updatedUser = await changePassword(
        formState.currentPassword,
        formState.newPassword
      );
      const nextPath =
        location.state?.from?.pathname || getHomePathForRole(updatedUser.role);

      navigate(nextPath, { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to change password right now"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-intro">
          <span className="auth-kicker">Security Check</span>
          <h1>Change Password</h1>
          <p>
            New admin and super admin accounts must change their password before
            entering HRMS.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={formState.currentPassword}
              onChange={handleChange}
              placeholder="Enter your current password"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={formState.newPassword}
              onChange={handleChange}
              placeholder="Create a new password"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formState.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter the new password"
              required
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Updating..." : "Update Password"}
          </button>
        </form>

        <div className="auth-help">
          <strong>Before you continue</strong>
          <p>Use the temporary password you signed in with as the current password.</p>
          <p>After the update, we will send you straight into the HRMS workspace.</p>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordPage;
