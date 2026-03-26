import { useEffect, useState } from "react";
import api from "../lib/api";
import { formatCurrency, formatDate } from "../lib/formatters";
import { useAuth } from "../context/useAuth";

function EmployeeSalaryPage() {
  const { user } = useAuth();
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        const response = await api.get("/salary-master/my-salary");

        if (!isMounted) {
          return;
        }

        setSalary(response.data);
        setError("");
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.response?.data?.message || "Salary record is not available yet"
          );
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

  if (loading) {
    return (
      <div className="screen-state">
        <p>Loading your salary...</p>
      </div>
    );
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow">Employee Portal</span>
          <h1>My Salary</h1>
          <p>Read-only access to your latest salary record.</p>
        </div>
      </div>

      {error ? (
        <div className="page-panel">
          <div className="alert alert-error">{error}</div>
        </div>
      ) : null}

      <div className="two-column-layout">
        <section className="page-panel">
          <div className="panel-heading">
            <div>
              <h2>Salary Snapshot</h2>
              <p>Employee code {user?.employeeCode || "-"}</p>
            </div>
          </div>

          {salary ? (
            <>
              <div className="metric-grid">
                <div className="metric-card">
                  <span>Gross Salary</span>
                  <strong>{formatCurrency(salary.grossSalary)}</strong>
                </div>
                <div className="metric-card">
                  <span>Net Salary</span>
                  <strong>{formatCurrency(salary.netSalary)}</strong>
                </div>
                <div className="metric-card">
                  <span>Employee PF</span>
                  <strong>{formatCurrency(salary.employeePF)}</strong>
                </div>
                <div className="metric-card">
                  <span>CTC</span>
                  <strong>{formatCurrency(salary.ctc)}</strong>
                </div>
              </div>

              <div className="details-grid">
                <div>
                  <span>Basic</span>
                  <strong>{formatCurrency(salary.basic)}</strong>
                </div>
                <div>
                  <span>HRA</span>
                  <strong>{formatCurrency(salary.hra)}</strong>
                </div>
                <div>
                  <span>Conveyance</span>
                  <strong>{formatCurrency(salary.conveyance)}</strong>
                </div>
                <div>
                  <span>Other Allowance</span>
                  <strong>{formatCurrency(salary.otherAllowance)}</strong>
                </div>
                <div>
                  <span>Employer PF</span>
                  <strong>{formatCurrency(salary.employerPF)}</strong>
                </div>
                <div>
                  <span>Employee ESIC</span>
                  <strong>{formatCurrency(salary.employeeESIC)}</strong>
                </div>
                <div>
                  <span>Employer ESIC</span>
                  <strong>{formatCurrency(salary.employerESIC)}</strong>
                </div>
                <div>
                  <span>Updated</span>
                  <strong>{formatDate(salary.updatedAt || salary.createdAt)}</strong>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state-card">
              <p>No salary record is assigned to this employee yet.</p>
            </div>
          )}
        </section>

        <aside className="page-panel page-panel-accent">
          <div className="panel-heading">
            <div>
              <h2>Access Scope</h2>
              <p>This account is limited to salary viewing only.</p>
            </div>
          </div>

          <div className="stat-grid">
            <div className="stat-card">
              <span>Name</span>
              <strong>{user?.name}</strong>
              <p>{user?.email}</p>
            </div>
            <div className="stat-card">
              <span>Role</span>
              <strong>{user?.role?.replace("_", " ")}</strong>
              <p>Editing, deleting, and admin pages are blocked.</p>
            </div>
          </div>

          <ul className="bullet-list">
            <li>This login can only open the My Salary screen.</li>
            <li>Salary figures are read-only for employee accounts.</li>
            <li>Contact an admin if your record looks incorrect.</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}

export default EmployeeSalaryPage;
