import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? "https://tushar-form.onrender.com" : "http://localhost:5000");

function SalaryMaster() {
  const [employeeCode, setEmployeeCode] = useState("");
  const [basic, setBasic] = useState(0);
  const [hra, setHra] = useState(0);
  const [conveyance, setConveyance] = useState(0);
  const [otherAllowance, setOtherAllowance] = useState(0);
  const [error, setError] = useState("");
  const [apiConfigError, setApiConfigError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!API_BASE_URL || API_BASE_URL === "undefined") {
      setApiConfigError(
        "⚠️ Backend API URL is not configured. Please set VITE_API_BASE_URL environment variable."
      );
    }
  }, []);

  const gross =
    Number(basic) +
    Number(hra) +
    Number(conveyance) +
    Number(otherAllowance);

  const employeePF = basic * 0.12;
  const employerPF = basic * 0.12;
  const eps = basic * 0.0833;
  const employerEPF = basic * 0.0367;

  const isESICApplicable = gross <= 21000;
  const employeeESIC = isESICApplicable ? gross * 0.0075 : 0;
  const employerESIC = isESICApplicable ? gross * 0.0325 : 0;

  const totalDeduction = employeePF + employeeESIC;
  const netSalary = gross - totalDeduction;
  const ctc = gross + employerPF + employerESIC;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!API_BASE_URL || API_BASE_URL === "undefined") {
      setError("Cannot submit: Backend API URL is not configured.");
      return;
    }

    if (!employeeCode) {
      setError("Employee Code is required");
      return;
    }

    const salaryData = {
      employeeCode: parseInt(employeeCode),
      basic: Number(basic),
      hra: Number(hra),
      conveyance: Number(conveyance),
      otherAllowance: Number(otherAllowance),
      grossSalary: gross,
      employeePF,
      employerPF,
      eps,
      epf: employerEPF,
      employeeESIC,
      employerESIC,
      netSalary,
      ctc,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/salary-master`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(salaryData),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Failed to save salary master");

      alert("Salary Master Saved Successfully ✅");
      e.target.reset();
      setEmployeeCode("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Salary Master</h1>
      <button
        onClick={() => navigate("/salary-list")}
        style={{
          backgroundColor: "#2196F3",
          color: "white",
          padding: "8px 16px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          width: "auto",
          marginBottom: "20px",
        }}
      >
        View Salary List
      </button>

      <form onSubmit={handleSubmit} style={{ maxWidth: "600px" }}>
        {apiConfigError && (
          <div style={{
            backgroundColor: "#f8d7da",
            border: "1px solid #f5c6cb",
            color: "#721c24",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "4px"
          }}>
            {apiConfigError}
          </div>
        )}

        {error && <p style={{ color: "red", marginBottom: "15px" }}>{error}</p>}

        <fieldset style={{ marginBottom: "20px", padding: "15px", borderRadius: "5px", border: "1px solid #ddd" }}>
          <legend style={{ fontWeight: "bold", padding: "0 10px" }}>Employee Details</legend>

          <label style={{ display: "block", marginBottom: "10px" }}>
            <strong>Employee Code:</strong> <span style={{ color: "#999", fontSize: "12px" }}>e.g., 3581</span>
          </label>
          <input
            type="number"
            value={employeeCode}
            placeholder="Enter employee code (e.g., 3581)"
            required
            onChange={(e) => setEmployeeCode(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ddd" }}
          />
        </fieldset>

        <fieldset style={{ marginBottom: "20px", padding: "15px", borderRadius: "5px", border: "1px solid #ddd" }}>
          <legend style={{ fontWeight: "bold", padding: "0 10px" }}>Earnings</legend>

          <label style={{ display: "block", marginBottom: "10px" }}>
            <strong>Basic:</strong> <span style={{ color: "#999", fontSize: "12px" }}>e.g., 50000</span>
          </label>
          <input
            type="number"
            value={basic}
            placeholder="Enter basic salary (e.g., 50000)"
            onChange={(e) => setBasic(+e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ddd" }}
          />

          <label style={{ display: "block", marginBottom: "10px" }}>
            <strong>HRA:</strong> <span style={{ color: "#999", fontSize: "12px" }}>e.g., 10000 (20% of basic)</span>
          </label>
          <input
            type="number"
            value={hra}
            placeholder="Enter HRA (e.g., 10000)"
            onChange={(e) => setHra(+e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ddd" }}
          />

          <label style={{ display: "block", marginBottom: "10px" }}>
            <strong>Conveyance:</strong> <span style={{ color: "#999", fontSize: "12px" }}>e.g., 2000</span>
          </label>
          <input
            type="number"
            value={conveyance}
            placeholder="Enter conveyance allowance (e.g., 2000)"
            onChange={(e) => setConveyance(+e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ddd" }}
          />

          <label style={{ display: "block", marginBottom: "10px" }}>
            <strong>Other Allowance:</strong> <span style={{ color: "#999", fontSize: "12px" }}>e.g., 1000</span>
          </label>
          <input
            type="number"
            value={otherAllowance}
            placeholder="Enter other allowance (e.g., 1000)"
            onChange={(e) => setOtherAllowance(+e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ddd" }}
          />
        </fieldset>

        <fieldset style={{ marginBottom: "20px", padding: "15px", borderRadius: "5px", border: "1px solid #ddd", backgroundColor: "#f9f9f9" }}>
          <legend style={{ fontWeight: "bold", padding: "0 10px", color: "#000" }}>Salary Breakdown</legend>

          <div style={{ margin: "10px 0", padding: "8px", backgroundColor: "white", borderRadius: "4px", color: "#000" }}>
            <strong>Gross Salary: </strong>₹{gross.toFixed(2)}
          </div>

          <h4 style={{ marginTop: "15px", marginBottom: "10px", color: "#000" }}>Provident Fund & Contributions:</h4>
          <div style={{ margin: "8px 0", color: "#000" }}>Employee PF (12%): ₹{employeePF.toFixed(2)}</div>
          <div style={{ margin: "8px 0", color: "#000" }}>Employer PF (12%): ₹{employerPF.toFixed(2)}</div>
          <div style={{ margin: "8px 0", color: "#000" }}>EPS (8.33%): ₹{eps.toFixed(2)}</div>
          <div style={{ margin: "8px 0", color: "#000" }}>Employer EPF (3.67%): ₹{employerEPF.toFixed(2)}</div>

          <h4 style={{ marginTop: "15px", marginBottom: "10px", color: "#000" }}>ESIC</h4>
          <div style={{ margin: "8px 0", color: "#000" }}>
            ESIC Applicable: <strong>{isESICApplicable ? "Yes" : "No"}</strong>
          </div>
          <div style={{ margin: "8px 0", color: "#000" }}>Employee ESIC: ₹{employeeESIC.toFixed(2)}</div>
          <div style={{ margin: "8px 0", color: "#000" }}>Employer ESIC: ₹{employerESIC.toFixed(2)}</div>

          <h4 style={{ marginTop: "15px", marginBottom: "10px", color: "#000" }}>Final Calculation</h4>
          <div style={{ margin: "8px 0", padding: "10px", backgroundColor: "#e8f5e9", borderRadius: "4px" }}>
            <strong style={{ color: "#28a745" }}>Net Salary (Take Home): ₹{netSalary.toFixed(2)}</strong>
          </div>
          <div style={{ margin: "8px 0", padding: "10px", backgroundColor: "#e3f2fd", borderRadius: "4px" }}>
            <strong style={{ color: "#2196F3" }}>CTC (Cost to Company): ₹{ctc.toFixed(2)}</strong>
          </div>
        </fieldset>

        <button
          type="submit"
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "12px 24px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            width: "100%",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          Save Salary Master
        </button>
      </form>
    </div>
  );
}

export default SalaryMaster;
