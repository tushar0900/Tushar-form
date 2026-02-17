import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? "https://tushar-form.onrender.com" : "http://localhost:5000");

function EmployeeTable() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [apiConfigError, setApiConfigError] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!API_BASE_URL || API_BASE_URL === "undefined") {
      setApiConfigError(
        "⚠️ Backend API URL is not configured. Please set VITE_API_BASE_URL environment variable."
      );
      setLoading(false);
    } else {
      fetchEmployees();
    }
  }, [page]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      console.log("Fetching employees from", API_BASE_URL);
      const response = await axios.get(`${API_BASE_URL}/employees`, {
        params: { page, limit: 5 },
      });
      console.log("Response data:", response.data);
      setEmployees(response.data.data || []);
      setError("");
    } catch (err) {
      console.error("Full error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Unknown error";
      setError(`Failed to fetch employees: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    navigate("/");
  };

  const handleViewDetails = (emp) => {
    setSelectedEmployee(emp);
  };

  const handleCloseDetails = () => {
    setSelectedEmployee(null);
  };

  const handleEditClick = (emp) => {
    setEditingId(emp._id || emp.employeeCode);
    setEditData({
      employeeName: emp.employeeName,
      employeeEmail: emp.employeeEmail,
      employeeNumber: emp.employeeNumber,
      dob: emp.dob ? emp.dob.split("T")[0] : "",
      joiningDate: emp.joiningDate ? emp.joiningDate.split("T")[0] : "",
    });
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (empId) => {
    try {
      console.log("Saving employee:", empId, editData);
      await axios.put(`${API_BASE_URL}/employees/${empId}`, editData);
      setEditingId(null);
      setEditData({});
      fetchEmployees();
      setError("");
    } catch (err) {
      setError("Failed to update employee: " + err.message);
      console.error("Error details:", err.response?.status, err.response?.data);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (empId) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      console.log("Deleting employee:", empId);
      await axios.delete(`${API_BASE_URL}/employees/${empId}`);
      fetchEmployees();
      setError("");
    } catch (err) {
      setError("Failed to delete employee: " + err.message);
      console.error("Error details:", err.response?.status, err.response?.data);
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Employee List</h1>
      <button onClick={handleAddClick} style={{ backgroundColor: "#4CAF50", color: "white", padding: "8px 16px", border: "none", borderRadius: "4px", cursor: "pointer", width: "auto" }}>Add Employee</button>

      {apiConfigError && (
        <div style={{
          backgroundColor: "#f8d7da",
          border: "1px solid #f5c6cb",
          color: "#721c24",
          padding: "12px",
          marginBottom: "15px",
          marginTop: "15px",
          borderRadius: "4px"
        }}>
          {apiConfigError}
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <hr />

      <table border="1" cellPadding="8">
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
            employees.map((emp) => (
              <tr key={emp._id || emp.employeeCode}>
                <td>{emp.employeeCode}</td>
                {editingId === (emp._id || emp.employeeCode) ? (
                  <>
                    <td>
                      <input
                        type="text"
                        value={editData.employeeName}
                        onChange={(e) =>
                          handleEditChange("employeeName", e.target.value)
                        }
                        style={{ width: "100%" }}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={editData.dob}
                        onChange={(e) => handleEditChange("dob", e.target.value)}
                        style={{ width: "100%" }}
                      />
                    </td>
                    <td>
                      <input
                        type="email"
                        value={editData.employeeEmail}
                        onChange={(e) =>
                          handleEditChange("employeeEmail", e.target.value)
                        }
                        style={{ width: "100%" }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editData.employeeNumber}
                        onChange={(e) =>
                          handleEditChange("employeeNumber", e.target.value)
                        }
                        style={{ width: "100%" }}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={editData.joiningDate}
                        onChange={(e) =>
                          handleEditChange("joiningDate", e.target.value)
                        }
                        style={{ width: "100%" }}
                      />
                    </td>
                    <td style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                      <button
                        onClick={() => handleSave(emp._id)}
                        style={{ backgroundColor: "#2196F3", color: "white", padding: "6px 12px", border: "none", borderRadius: "4px", cursor: "pointer", width: "auto", fontSize: "12px" }}
                      >
                        Save
                      </button>
                      <button onClick={handleCancel} style={{ backgroundColor: "#ff9800", color: "white", padding: "6px 12px", border: "none", borderRadius: "4px", cursor: "pointer", width: "auto", fontSize: "12px" }}>
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{emp.employeeName}</td>
                    <td>{new Date(emp.dob).toLocaleDateString()}</td>
                    <td>{emp.employeeEmail}</td>
                    <td>{emp.employeeNumber}</td>
                    <td>{new Date(emp.joiningDate).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleEditClick(emp)}
                        className="btn-small btn-edit"
                        style={{ backgroundColor: "#2196F3", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", width: "auto", fontSize: "12px" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleViewDetails(emp)}
                        className="btn-small btn-view"
                        style={{ marginLeft: "5px", backgroundColor: "#4CAF50", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", width: "auto", fontSize: "12px" }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(emp._id)}
                        className="btn-small btn-delete"
                        style={{ marginLeft: "5px", backgroundColor: "#f44336", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", width: "auto", fontSize: "12px" }}
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No employees found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ marginTop: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
        <button onClick={() => setPage(page - 1)} disabled={page === 1} style={{ backgroundColor: page === 1 ? "#ccc" : "#2196F3", color: "white", padding: "8px 16px", border: "none", borderRadius: "4px", cursor: page === 1 ? "not-allowed" : "pointer", width: "auto" }}>
          Previous
        </button>
        <span style={{ fontSize: "14px", fontWeight: "bold" }}>Page {page}</span>
        <button onClick={() => setPage(page + 1)} style={{ backgroundColor: "#2196F3", color: "white", padding: "8px 16px", border: "none", borderRadius: "4px", cursor: "pointer", width: "auto" }}>Next</button>
      </div>

      {selectedEmployee && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "10px",
            maxWidth: "500px",
            width: "90%",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
          }}>
            <h2 style={{ marginTop: 0, color: "#333", fontSize: "24px", fontWeight: "bold" }}>Employee Details</h2>
            <div style={{ marginBottom: "15px", color: "#333", fontSize: "16px" }}>
              <strong style={{ color: "#000" }}>Employee Code:</strong> {selectedEmployee.employeeCode}
            </div>
            <div style={{ marginBottom: "15px", color: "#333", fontSize: "16px" }}>
              <strong style={{ color: "#000" }}>Name:</strong> {selectedEmployee.employeeName}
            </div>
            <div style={{ marginBottom: "15px", color: "#333", fontSize: "16px" }}>
              <strong style={{ color: "#000" }}>Email:</strong> {selectedEmployee.employeeEmail}
            </div>
            <div style={{ marginBottom: "15px", color: "#333", fontSize: "16px" }}>
              <strong style={{ color: "#000" }}>Phone:</strong> {selectedEmployee.employeeNumber}
            </div>
            <div style={{ marginBottom: "15px", color: "#333", fontSize: "16px" }}>
              <strong style={{ color: "#000" }}>Date of Birth:</strong> {new Date(selectedEmployee.dob).toLocaleDateString()}
            </div>
            <div style={{ marginBottom: "15px", color: "#333", fontSize: "16px" }}>
              <strong style={{ color: "#000" }}>Joining Date:</strong> {new Date(selectedEmployee.joiningDate).toLocaleDateString()}
            </div>
            {selectedEmployee.createdAt && (
              <div style={{ marginBottom: "15px", color: "#333", fontSize: "16px" }}>
                <strong style={{ color: "#000" }}>Created At:</strong> {new Date(selectedEmployee.createdAt).toLocaleDateString()}
              </div>
            )}
            <button
              onClick={handleCloseDetails}
              style={{
                backgroundColor: "#2196F3",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                width: "100%"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeTable;
