import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getDefaultPathForUser, getHomePathForRole } from "../lib/homePath";

function LoginPage() {
  const { isAuthenticated, login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isProduction = import.meta.env.PROD;
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to={getDefaultPathForUser(user)} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((currentState) => ({
      ...currentState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const user = await login(credentials.email, credentials.password);
      const nextPath = location.state?.from?.pathname || getHomePathForRole(user.role);

      navigate(user.mustChangePassword ? getDefaultPathForUser(user) : nextPath, {
        replace: true,
        state: user.mustChangePassword ? { from: location.state?.from } : undefined,
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to sign in right now"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-intro">
          <span className="auth-kicker">Secure Access</span>
          <h1>Employee Payroll System Login</h1>
          <p>
            Admins manage employees and salaries. Employee accounts can only view
            their own salary record.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="name@company.com"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-help">
          {isProduction ? (
            <>
              <strong>Server sign-in</strong>
              <p>This deployment uses the accounts stored in the server database.</p>
              <p>
                Users created on localhost will not work here unless both
                environments share the same `MONGO_URI`.
              </p>
            </>
          ) : (
            <>
              <strong>Local first run</strong>
              <p>A brand-new local database bootstraps one super admin account.</p>
              <p>
                The bootstrap email and password come from `SUPER_ADMIN_EMAIL`
                and `SUPER_ADMIN_PASSWORD`.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
