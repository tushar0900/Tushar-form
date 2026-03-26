import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./lib/api";
import { formatCurrency, formatDate } from "./lib/formatters";
import { useAuth } from "./context/useAuth";

async function fetchSalaries(page) {
  const response = await api.get("/salary-master", {
    params: { page, limit: 5 },
  });

  return response.data;
}

function SalaryList() {
  const { user } = useAuth();
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        const result = await fetchSalaries(page);

        if (!isMounted) {
          return;
        }

        setSalaries(result.data || []);
        setTotalPages(result.totalPages || 1);
        setError("");
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.response?.data?.message || "Failed to fetch salaries"
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
  }, [page]);

  const refreshSalaries = async () => {
    setLoading(true);

    try {
      const result = await fetchSalaries(page);
      setSalaries(result.data || []);
      setTotalPages(result.totalPages || 1);
      setError("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Failed to fetch salaries"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (salaryId) => {
    if (!window.confirm("Are you sure you want to delete this salary record?")) {
      return;
    }

    try {
      await api.delete(`/salary-master/${salaryId}`);
      await refreshSalaries();
      setError("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Failed to delete salary"
      );
    }
  };

  const handleViewDetails = (salary) => {
    setSelectedSalary(salary);
  };

  const handleCloseDetails = () => {
    setSelectedSalary(null);
  };

  if (loading) {
    return (
      <div className="screen-state">
        <p>Loading salary records...</p>
      </div>
    );
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow">Salary Records</span>
          <h1>Salary Directory</h1>
          <p>Review salary masters, open full breakdowns, and manage records by role.</p>
        </div>
        <div className="button-row">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/salary")}
          >
            Back to Salary Master
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="page-panel">
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee Code</th>
                <th>Basic</th>
                <th>HRA</th>
                <th>Gross</th>
                <th>Net Salary</th>
                <th>CTC</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {salaries.length > 0 ? (
                salaries.map((salary) => (
                  <tr key={salary._id}>
                    <td data-label="Employee Code">{salary.employeeCode}</td>
                    <td data-label="Basic">{formatCurrency(salary.basic)}</td>
                    <td data-label="HRA">{formatCurrency(salary.hra)}</td>
                    <td data-label="Gross">{formatCurrency(salary.grossSalary)}</td>
                    <td data-label="Net Salary">{formatCurrency(salary.netSalary)}</td>
                    <td data-label="CTC">{formatCurrency(salary.ctc)}</td>
                    <td data-label="Actions">
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => handleViewDetails(salary)}
                        >
                          View
                        </button>
                        {user?.role === "super_admin" && (
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => handleDelete(salary._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-cell">
                    No salary records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setPage((currentPage) => currentPage - 1)}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setPage((currentPage) => currentPage + 1)}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </section>

      {selectedSalary && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="panel-heading">
              <div>
                <h2>Salary Details</h2>
                <p>Full compensation snapshot for employee code {selectedSalary.employeeCode}.</p>
              </div>
            </div>

            <div className="details-grid">
              <div>
                <span>Employee Code</span>
                <strong>{selectedSalary.employeeCode}</strong>
              </div>
              <div>
                <span>Created Date</span>
                <strong>{formatDate(selectedSalary.createdAt)}</strong>
              </div>
              <div>
                <span>Basic</span>
                <strong>{formatCurrency(selectedSalary.basic)}</strong>
              </div>
              <div>
                <span>HRA</span>
                <strong>{formatCurrency(selectedSalary.hra)}</strong>
              </div>
              <div>
                <span>Conveyance</span>
                <strong>{formatCurrency(selectedSalary.conveyance)}</strong>
              </div>
              <div>
                <span>Other Allowance</span>
                <strong>{formatCurrency(selectedSalary.otherAllowance)}</strong>
              </div>
              <div>
                <span>Employee PF</span>
                <strong>{formatCurrency(selectedSalary.employeePF)}</strong>
              </div>
              <div>
                <span>Employer PF</span>
                <strong>{formatCurrency(selectedSalary.employerPF)}</strong>
              </div>
              <div>
                <span>Employee ESIC</span>
                <strong>{formatCurrency(selectedSalary.employeeESIC)}</strong>
              </div>
              <div>
                <span>Employer ESIC</span>
                <strong>{formatCurrency(selectedSalary.employerESIC)}</strong>
              </div>
              <div>
                <span>Net Salary</span>
                <strong>{formatCurrency(selectedSalary.netSalary)}</strong>
              </div>
              <div>
                <span>CTC</span>
                <strong>{formatCurrency(selectedSalary.ctc)}</strong>
              </div>
            </div>

            <div className="button-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCloseDetails}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default SalaryList;
