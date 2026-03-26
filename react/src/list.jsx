import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./lib/api";
import { formatDate } from "./lib/formatters";
import { useAuth } from "./context/useAuth";

async function fetchEmployees(page) {
  const response = await api.get("/employees", {
    params: { page, limit: 5 },
  });

  return response.data;
}

function EmployeeTable() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        const result = await fetchEmployees(page);

        if (!isMounted) {
          return;
        }

        setEmployees(result.data || []);
        setTotalPages(result.totalPages || 1);
        setError("");
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.response?.data?.message || "Failed to fetch employees"
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

  const refreshEmployees = async () => {
    setLoading(true);

    try {
      const result = await fetchEmployees(page);
      setEmployees(result.data || []);
      setTotalPages(result.totalPages || 1);
      setError("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Failed to fetch employees"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    navigate("/employees/new");
  };

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleCloseDetails = () => {
    setSelectedEmployee(null);
  };

  const handleEditClick = (employee) => {
    setEditingId(employee._id || employee.employeeCode);
    setEditData({
      employeeName: employee.employeeName,
      employeeEmail: employee.employeeEmail,
      employeeNumber: employee.employeeNumber,
      dob: employee.dob ? employee.dob.split("T")[0] : "",
      joiningDate: employee.joiningDate ? employee.joiningDate.split("T")[0] : "",
    });
  };

  const handleEditChange = (field, value) => {
    setEditData((currentState) => ({
      ...currentState,
      [field]: value,
    }));
  };

  const handleSave = async (employeeId) => {
    try {
      await api.put(`/employees/${employeeId}`, editData);
      setEditingId(null);
      setEditData({});
      await refreshEmployees();
      setError("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Failed to update employee"
      );
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (employeeId) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      await api.delete(`/employees/${employeeId}`);
      await refreshEmployees();
      setError("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Failed to delete employee"
      );
    }
  };

  if (loading) {
    return (
      <div className="screen-state">
        <p>Loading employees...</p>
      </div>
    );
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow">Employee Records</span>
          <h1>Employee Directory</h1>
          <p>View, update, and review employee records from one responsive table.</p>
        </div>
        <div className="button-row">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddClick}
          >
            Add Employee
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
                <th>Name</th>
                <th>DOB</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joining Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {employees.length > 0 ? (
                employees.map((employee) => {
                  const employeeId = employee._id || employee.employeeCode;

                  return (
                    <tr key={employeeId}>
                      <td data-label="Employee Code">{employee.employeeCode}</td>
                      {editingId === employeeId ? (
                        <>
                          <td data-label="Name">
                            <input
                              type="text"
                              value={editData.employeeName}
                              onChange={(event) =>
                                handleEditChange("employeeName", event.target.value)
                              }
                            />
                          </td>
                          <td data-label="DOB">
                            <input
                              type="date"
                              value={editData.dob}
                              onChange={(event) =>
                                handleEditChange("dob", event.target.value)
                              }
                            />
                          </td>
                          <td data-label="Email">
                            <input
                              type="email"
                              value={editData.employeeEmail}
                              onChange={(event) =>
                                handleEditChange("employeeEmail", event.target.value)
                              }
                            />
                          </td>
                          <td data-label="Phone">
                            <input
                              type="text"
                              value={editData.employeeNumber}
                              onChange={(event) =>
                                handleEditChange("employeeNumber", event.target.value)
                              }
                            />
                          </td>
                          <td data-label="Joining Date">
                            <input
                              type="date"
                              value={editData.joiningDate}
                              onChange={(event) =>
                                handleEditChange("joiningDate", event.target.value)
                              }
                            />
                          </td>
                          <td data-label="Actions">
                            <div className="table-actions">
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => handleSave(employee._id)}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={handleCancel}
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td data-label="Name">{employee.employeeName}</td>
                          <td data-label="DOB">{formatDate(employee.dob)}</td>
                          <td data-label="Email">{employee.employeeEmail}</td>
                          <td data-label="Phone">{employee.employeeNumber}</td>
                          <td data-label="Joining Date">
                            {formatDate(employee.joiningDate)}
                          </td>
                          <td data-label="Actions">
                            <div className="table-actions">
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => handleEditClick(employee)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => handleViewDetails(employee)}
                              >
                                View
                              </button>
                              {user?.role === "super_admin" && (
                                <button
                                  type="button"
                                  className="btn btn-danger"
                                  onClick={() => handleDelete(employee._id)}
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="empty-cell">
                    No employees found
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

      {selectedEmployee && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="panel-heading">
              <div>
                <h2>Employee Details</h2>
                <p>Full record summary for this employee.</p>
              </div>
            </div>

            <div className="details-grid">
              <div>
                <span>Employee Code</span>
                <strong>{selectedEmployee.employeeCode}</strong>
              </div>
              <div>
                <span>Name</span>
                <strong>{selectedEmployee.employeeName}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{selectedEmployee.employeeEmail}</strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>{selectedEmployee.employeeNumber}</strong>
              </div>
              <div>
                <span>Date of Birth</span>
                <strong>{formatDate(selectedEmployee.dob)}</strong>
              </div>
              <div>
                <span>Joining Date</span>
                <strong>{formatDate(selectedEmployee.joiningDate)}</strong>
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

export default EmployeeTable;
