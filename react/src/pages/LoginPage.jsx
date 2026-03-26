import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/employees" replace />;
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
      const nextPath =
        location.state?.from?.pathname ||
        (user.role === "super_admin" ? "/users" : "/employees");

      navigate(nextPath, { replace: true });
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
          <h1>HRMS Admin Login</h1>
          <p>
            Use an admin or super admin account to manage employees, salaries,
            and access permissions.
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
          <strong>First run default super admin</strong>
          <p>Email: superadmin@hrms.local</p>
          <p>Password: SuperAdmin@123</p>
          <p>Set `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` to override.</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
