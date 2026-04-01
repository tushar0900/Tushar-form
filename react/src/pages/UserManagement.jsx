import { useEffect, useState } from "react";
import api from "../lib/api";
import { formatDate } from "../lib/formatters";
import { useAuth } from "../context/useAuth";

const initialUserForm = {
  name: "",
  email: "",
  password: "",
  role: "admin",
  employeeCode: "",
  status: "active",
};

const buildDrafts = (users) =>
  Object.fromEntries(
    users.map((user) => [
      user.id,
      {
        role: user.role,
        employeeCode: user.employeeCode ? String(user.employeeCode) : "",
        status: user.status,
        password: "",
      },
    ])
  );

async function fetchUsers() {
  const response = await api.get("/users");
  return response.data.data || [];
}

async function fetchEmployees() {
  const response = await api.get("/employees", {
    params: { dropdown: true },
  });

  return response.data || [];
}

function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [formState, setFormState] = useState(initialUserForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadUsers = async (successMessage = "") => {
    const [nextUsers, nextEmployees] = await Promise.all([
      fetchUsers(),
      fetchEmployees(),
    ]);
    setUsers(nextUsers);
    setEmployees(nextEmployees);
    setDrafts(buildDrafts(nextUsers));

    if (successMessage) {
      setFeedback({ type: "success", message: successMessage });
    }
  };

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        await loadUsers();
        setFeedback(null);
      } catch (error) {
        if (isMounted) {
          setFeedback({
            type: "error",
            message:
              error.response?.data?.message || "Failed to load user management data",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateChange = (event) => {
    const { name, value } = event.target;

    if (name === "employeeCode") {
      const selectedEmployee = employees.find(
        (employee) => String(employee.employeeCode) === value
      );

      setFormState((currentState) => ({
        ...currentState,
        employeeCode: value,
        name: selectedEmployee?.employeeName || currentState.name,
        email: selectedEmployee?.employeeEmail || currentState.email,
      }));
      return;
    }

    setFormState((currentState) => ({
      ...currentState,
      [name]: value,
      ...(name === "role" && value !== "employee" ? { employeeCode: "" } : {}),
    }));
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    if (formState.role === "employee" && !formState.employeeCode) {
      setFeedback({
        type: "error",
        message: "Select an employee before creating an employee login",
      });
      setSubmitting(false);
      return;
    }

    try {
      await api.post("/users", formState);
      setFormState(initialUserForm);
      await loadUsers("User created successfully");
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "Failed to create user",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDraftChange = (userId, field, value) => {
    setDrafts((currentState) => ({
      ...currentState,
      [userId]: {
        ...currentState[userId],
        [field]: value,
        ...(field === "role" && value !== "employee" ? { employeeCode: "" } : {}),
      },
    }));
  };

  const handleUpdateUser = async (userId) => {
    const targetUser = users.find((user) => user.id === userId);
    const draft = drafts[userId];

    if (!targetUser || !draft) {
      return;
    }

    if (draft.role === "employee" && !draft.employeeCode) {
      setFeedback({
        type: "error",
        message: "Employee users must be linked to an employee record",
      });
      return;
    }

    const payload = {};
    const currentEmployeeCode = targetUser.employeeCode
      ? String(targetUser.employeeCode)
      : "";

    if (draft.role !== targetUser.role) {
      payload.role = draft.role;
    }

    if (draft.role === "employee" && draft.employeeCode !== currentEmployeeCode) {
      payload.employeeCode = draft.employeeCode;
    }

    if (draft.role !== "employee" && targetUser.employeeCode) {
      payload.employeeCode = null;
    }

    if (draft.status !== targetUser.status) {
      payload.status = draft.status;
    }

    if (draft.password.trim()) {
      payload.password = draft.password.trim();
    }

    if (Object.keys(payload).length === 0) {
      setFeedback({
        type: "error",
        message: "No changes to save for this user",
      });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      await api.patch(`/users/${userId}`, payload);
      await loadUsers("User updated successfully");
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "Failed to update user",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    const targetUser = users.find((user) => user.id === userId);

    if (!targetUser) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${targetUser.name} (${targetUser.email})? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      await api.delete(`/users/${userId}`);
      await loadUsers("User deleted successfully");
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "Failed to delete user",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="screen-state">
        <p>Loading user management...</p>
      </div>
    );
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow">Super Admin</span>
          <h1>User Management</h1>
          <p>Create staff accounts, promote trusted users, and control access.</p>
        </div>
      </div>

      {feedback && (
        <div
          className={`alert ${
            feedback.type === "error" ? "alert-error" : "alert-success"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="two-column-layout">
        <section className="page-panel">
          <div className="panel-heading">
            <div>
              <h2>Create User</h2>
              <p>Add an admin, super admin, or employee salary-view account.</p>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleCreateUser}>
            <div className="field">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formState.name}
                onChange={handleCreateChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formState.email}
                onChange={handleCreateChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formState.password}
                onChange={handleCreateChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={formState.role}
                onChange={handleCreateChange}
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
                <option value="employee">Employee</option>
              </select>
            </div>

            {formState.role === "employee" && (
              <div className="field">
                <label htmlFor="employeeCode">Linked Employee</label>
                <select
                  id="employeeCode"
                  name="employeeCode"
                  value={formState.employeeCode}
                  onChange={handleCreateChange}
                  required
                >
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option
                      key={employee.employeeCode}
                      value={employee.employeeCode}
                    >
                      {employee.employeeName} ({employee.employeeCode})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="field">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formState.status}
                onChange={handleCreateChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="button-row">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Create User"}
              </button>
            </div>
          </form>
        </section>

        <aside className="page-panel page-panel-accent">
          <div className="panel-heading">
            <div>
              <h2>Access Rules</h2>
              <p>Current session and role boundaries.</p>
            </div>
          </div>

          <div className="stat-grid">
            <div className="stat-card">
              <span>Signed in as</span>
              <strong>{currentUser?.name}</strong>
              <p>{currentUser?.email}</p>
            </div>
            <div className="stat-card">
              <span>Role</span>
              <strong>{currentUser?.role?.replace("_", " ")}</strong>
              <p>Only super admins can access this screen.</p>
            </div>
          </div>

          <ul className="bullet-list">
            <li>Admins can manage employees and salaries.</li>
            <li>New admin and super admin accounts must change password on first login.</li>
            <li>Employees can only sign in and view their own salary.</li>
            <li>Only super admins can create, disable, or promote users.</li>
            <li>At least one active super admin must always remain.</li>
          </ul>
        </aside>
      </div>

      <section className="page-panel">
        <div className="panel-heading">
          <div>
            <h2>Existing Users</h2>
            <p>Update role, linked employee, status, or reset a password inline.</p>
          </div>
        </div>

        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Linked Employee</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Reset Password</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td data-label="Name">
                    <strong>{user.name}</strong>
                    <span className="table-meta">Created {formatDate(user.createdAt)}</span>
                  </td>
                  <td data-label="Email">{user.email}</td>
                  <td data-label="Role">
                    <select
                      value={drafts[user.id]?.role || user.role}
                      onChange={(event) =>
                        handleDraftChange(user.id, "role", event.target.value)
                      }
                    >
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                      <option value="employee">Employee</option>
                    </select>
                  </td>
                  <td data-label="Linked Employee">
                    {(drafts[user.id]?.role || user.role) === "employee" ? (
                      <select
                        value={drafts[user.id]?.employeeCode || ""}
                        onChange={(event) =>
                          handleDraftChange(user.id, "employeeCode", event.target.value)
                        }
                      >
                        <option value="">Select employee</option>
                        {employees.map((employee) => (
                          <option
                            key={employee.employeeCode}
                            value={employee.employeeCode}
                          >
                            {employee.employeeName} ({employee.employeeCode})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span>{user.employeeCode || "-"}</span>
                    )}
                  </td>
                  <td data-label="Status">
                    <select
                      value={drafts[user.id]?.status || user.status}
                      onChange={(event) =>
                        handleDraftChange(user.id, "status", event.target.value)
                      }
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td data-label="Last Login">
                    <span>{formatDate(user.lastLoginAt)}</span>
                    {user.mustChangePassword ? (
                      <span className="table-meta">Password change required</span>
                    ) : null}
                  </td>
                  <td data-label="Reset Password">
                    <input
                      type="password"
                      value={drafts[user.id]?.password || ""}
                      onChange={(event) =>
                        handleDraftChange(user.id, "password", event.target.value)
                      }
                      placeholder="Optional"
                    />
                  </td>
                  <td data-label="Actions">
                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleUpdateUser(user.id)}
                        disabled={submitting}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={submitting || user.id === currentUser?.id}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

export default UserManagement;
