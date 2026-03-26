import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function AppLayout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navigationItems = [
    { to: "/employees", label: "Employees" },
    { to: "/employees/new", label: "Add Employee" },
    { to: "/salary", label: "Salary Master" },
    { to: "/salary-list", label: "Salary List" },
  ];

  if (user?.role === "super_admin") {
    navigationItems.push({ to: "/users", label: "User Management" });
  }

  return (
    <div className="app-shell">
      <div
        className={`app-overlay ${menuOpen ? "is-visible" : ""}`}
        onClick={() => setMenuOpen(false)}
      />

      <aside className={`app-sidebar ${menuOpen ? "is-open" : ""}`}>
        <div className="brand-block">
          <span className="brand-kicker">HRMS</span>
          <h1>Control Center</h1>
          <p>Employees, salaries, and role-based access in one place.</p>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `nav-link ${isActive ? "is-active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user-card">
          <span className="role-badge">{user?.role?.replace("_", " ")}</span>
          <strong>{user?.name}</strong>
          <span>{user?.email}</span>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="icon-button nav-toggle"
              onClick={() => setMenuOpen((currentState) => !currentState)}
            >
              Menu
            </button>
            <div>
              <p className="topbar-label">Signed in</p>
              <h2>{user?.name}</h2>
            </div>
          </div>

          <div className="topbar-actions">
            <span className="status-pill">{user?.status}</span>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
