import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? "https://tushar-form.onrender.com" : "http://localhost:5000");

function SalaryList() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [apiConfigError, setApiConfigError] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!API_BASE_URL || API_BASE_URL === "undefined") {
      setApiConfigError(
        "⚠️ Backend API URL is not configured. Please set VITE_API_BASE_URL environment variable."
      );
      setLoading(false);
    } else {
      fetchSalaries();
    }
  }, [page]);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/salary-master`, {
        params: { page, limit: 5 },
      });
      setSalaries(response.data.data || []);
      setError("");
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch salaries";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (salaryId) => {
    if (!window.confirm("Are you sure you want to delete this salary record?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/salary-master/${salaryId}`);
      fetchSalaries();
      setError("");
    } catch (err) {
      setError("Failed to delete salary: " + err.message);
    }
  };

  const handleViewDetails = (salary) => {
    setSelectedSalary(salary);
  };

  const handleCloseDetails = () => {
    setSelectedSalary(null);
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Salary List</h1>
      <button
        onClick={() => navigate("/")}
        style={{
          backgroundColor: "#4CAF50",
          color: "white",
          padding: "8px 16px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          width: "auto",
          marginRight: "10px",
        }}
      >
        Back
      </button>

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

      <table border="1" cellPadding="8" style={{ width: "100%" }}>
        <thead>
          <tr style={{ backgroundColor: "#667eea", color: "white" }}>
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
                <td>{salary.employeeCode}</td>
                <td>₹{salary.basic.toFixed(2)}</td>
                <td>₹{salary.hra.toFixed(2)}</td>
                <td>₹{salary.grossSalary.toFixed(2)}</td>
                <td>₹{salary.netSalary.toFixed(2)}</td>
                <td>₹{salary.ctc.toFixed(2)}</td>
                <td style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => handleViewDetails(salary)}
                    style={{
                      backgroundColor: "#2196F3",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      width: "auto",
                      fontSize: "12px",
                    }}
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(salary._id)}
                    style={{
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      width: "auto",
                      fontSize: "12px",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No salary records found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ marginTop: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          style={{
            backgroundColor: page === 1 ? "#ccc" : "#2196F3",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: page === 1 ? "not-allowed" : "pointer",
            width: "auto",
          }}
        >
          Previous
        </button>
        <span style={{ fontSize: "14px", fontWeight: "bold" }}>Page {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          style={{
            backgroundColor: "#2196F3",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            width: "auto",
          }}
        >
          Next
        </button>
      </div>

      {selectedSalary && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "10px",
              maxWidth: "600px",
              width: "90%",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h2 style={{ marginTop: 0, color: "#333", fontSize: "24px", fontWeight: "bold" }}>
              Salary Details
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div style={{ color: "#333", fontSize: "14px" }}>
                <strong style={{ color: "#000" }}>Employee Code:</strong>
                <p style={{ margin: "5px 0", color: "#555" }}>{selectedSalary.employeeCode}</p>
              </div>
              <div style={{ color: "#333", fontSize: "14px" }}>
                <strong style={{ color: "#000" }}>Created Date:</strong>
                <p style={{ margin: "5px 0", color: "#555" }}>
                  {new Date(selectedSalary.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <h3 style={{ color: "#667eea", marginTop: "20px", marginBottom: "10px" }}>Earnings</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
              <div style={{ color: "#333", fontSize: "14px" }}>
                <strong style={{ color: "#000" }}>Basic:</strong>
                <p style={{ margin: "5px 0", color: "#555" }}>₹{selectedSalary.basic.toFixed(2)}</p>
              </div>
              <div style={{ color: "#333", fontSize: "14px" }}>
                <strong style={{ color: "#000" }}>HRA:</strong>
                <p style={{ margin: "5px 0", color: "#555" }}>₹{selectedSalary.hra.toFixed(2)}</p>
              </div>
              <div style={{ color: "#333", fontSize: "14px" }}>
                <strong style={{ color: "#000" }}>Conveyance:</strong>
                <p style={{ margin: "5px 0", color: "#555" }}>₹{selectedSalary.conveyance.toFixed(2)}</p>
              </div>
              <div style={{ color: "#333", fontSize: "14px" }}>
                <strong style={{ color: "#000" }}>Other Allowance:</strong>
                <p style={{ margin: "5px 0", color: "#555" }}>₹{(selectedSalary.otherAllowance || 0).toFixed(2)}</p>
              </div>
            </div>

            <h3 style={{ color: "#667eea", marginTop: "20px", marginBottom: "10px" }}>Deductions & Contributions</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
              <div style={{ color: "#333", fontSize: "14px" }}>
                <strong style={{ color: "#000" }}>Employee PF (12%):</strong>
                <p style={{ margin: "5px 0", color: "#555" }}>₹{selectedSalary.employeePF.toFixed(2)}</p>
              </div>
              <div style={{ color: "#333", fontSize: "14px" }}>
                <strong style={{ color: "#000" }}>Employer PF (12%):</strong>
                <p style={{ margin: "5px 0", color: "#555" }}>₹{selectedSalary.employerPF.toFixed(2)}</p>
              </div>
              <div style={{ color: "#333", fontSize: "14px" }}>
                <strong style={{ color: "#000" }}>Employee ESIC:</strong>
                <p style={{ margin: "5px 0", color: "#555" }}>₹{selectedSalary.employeeESIC.toFixed(2)}</p>
              </div>
              <div style={{ color: "#333", fontSize: "14px" }}>
                <strong style={{ color: "#000" }}>Employer ESIC:</strong>
                <p style={{ margin: "5px 0", color: "#555" }}>₹{selectedSalary.employerESIC.toFixed(2)}</p>
              </div>
            </div>

            <h3 style={{ color: "#667eea", marginTop: "20px", marginBottom: "10px" }}>Summary</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
              <div style={{ color: "#333", fontSize: "14px" }}>
                <strong style={{ color: "#000" }}>Gross Salary:</strong>
                <p style={{ margin: "5px 0", color: "#555", fontSize: "16px", fontWeight: "bold" }}>
                  ₹{selectedSalary.grossSalary.toFixed(2)}
                </p>
              </div>
              <div style={{ color: "#333", fontSize: "14px" }}>
                <strong style={{ color: "#000" }}>Total Deductions:</strong>
                <p style={{ margin: "5px 0", color: "#555", fontSize: "16px", fontWeight: "bold" }}>
                  ₹{(selectedSalary.employeePF + selectedSalary.employeeESIC).toFixed(2)}
                </p>
              </div>
              <div style={{ color: "#333", fontSize: "14px", gridColumn: "1/2" }}>
                <strong style={{ color: "#000" }}>Net Salary (Take Home):</strong>
                <p style={{ margin: "5px 0", color: "#28a745", fontSize: "16px", fontWeight: "bold" }}>
                  ₹{selectedSalary.netSalary.toFixed(2)}
                </p>
              </div>
              <div style={{ color: "#333", fontSize: "14px", gridColumn: "2/3" }}>
                <strong style={{ color: "#000" }}>CTC (Cost to Company):</strong>
                <p style={{ margin: "5px 0", color: "#2196F3", fontSize: "16px", fontWeight: "bold" }}>
                  ₹{selectedSalary.ctc.toFixed(2)}
                </p>
              </div>
            </div>

            <button
              onClick={handleCloseDetails}
              style={{
                backgroundColor: "#2196F3",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                width: "100%",
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

export default SalaryList;
