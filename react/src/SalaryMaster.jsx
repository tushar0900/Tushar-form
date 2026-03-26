import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./lib/api";
import { formatCurrency } from "./lib/formatters";

const initialFormState = {
  employeeCode: "",
  basic: "",
  hra: "",
  conveyance: "",
  otherAllowance: "",
};

const calculatePreview = (formState) => {
  const basic = Number(formState.basic || 0);
  const hra = Number(formState.hra || 0);
  const conveyance = Number(formState.conveyance || 0);
  const otherAllowance = Number(formState.otherAllowance || 0);
  const gross = basic + hra + conveyance + otherAllowance;
  const employeePF = basic * 0.12;
  const employerPF = basic * 0.12;
  const eps = basic * 0.0833;
  const employerEPF = employerPF - eps;
  const employeeESIC = gross <= 21000 ? gross * 0.0075 : 0;
  const employerESIC = gross <= 21000 ? gross * 0.0325 : 0;
  const netSalary = gross - employeePF - employeeESIC;
  const ctc = gross + employerPF + employerESIC;

  return {
    gross,
    employeePF,
    employerPF,
    eps,
    employerEPF,
    employeeESIC,
    employerESIC,
    netSalary,
    ctc,
  };
};

async function fetchEmployeeOptions() {
  const response = await api.get("/employees", {
    params: { dropdown: true },
  });

  return response.data || [];
}

function SalaryMaster() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState(initialFormState);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        const employeeOptions = await fetchEmployeeOptions();

        if (isMounted) {
          setEmployees(employeeOptions);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.response?.data?.message || "Failed to load employees"
          );
        }
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, []);

  const preview = calculatePreview(formState);
  const selectedEmployee = employees.find(
    (employee) => String(employee.employeeCode) === formState.employeeCode
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormState((currentState) => ({
      ...currentState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setSubmitting(true);

    if (!formState.employeeCode) {
      setError("Select an employee before saving salary details.");
      setSubmitting(false);
      return;
    }

    try {
      await api.post("/salary-master", {
        employeeCode: Number(formState.employeeCode),
        basic: Number(formState.basic || 0),
        hra: Number(formState.hra || 0),
        conveyance: Number(formState.conveyance || 0),
        otherAllowance: Number(formState.otherAllowance || 0),
      });

      setSuccessMessage("Salary master saved successfully.");
      setFormState(initialFormState);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Failed to save salary master"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow">Compensation Setup</span>
          <h1>Salary Master</h1>
          <p>Select an existing employee and store validated salary components.</p>
        </div>
        <div className="button-row">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/salary-list")}
          >
            View Salary List
          </button>
        </div>
      </div>

      <div className="two-column-layout">
        <section className="page-panel">
          <div className="panel-heading">
            <div>
              <h2>Salary Inputs</h2>
              <p>Gross, PF, ESIC, net salary, and CTC are calculated automatically.</p>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field field-full">
              <label htmlFor="employeeCode">Employee</label>
              <select
                id="employeeCode"
                name="employeeCode"
                value={formState.employeeCode}
                onChange={handleChange}
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

            <div className="field">
              <label htmlFor="basic">Basic</label>
              <input
                id="basic"
                name="basic"
                type="number"
                min="0"
                value={formState.basic}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="hra">HRA</label>
              <input
                id="hra"
                name="hra"
                type="number"
                min="0"
                value={formState.hra}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="conveyance">Conveyance</label>
              <input
                id="conveyance"
                name="conveyance"
                type="number"
                min="0"
                value={formState.conveyance}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="otherAllowance">Other Allowance</label>
              <input
                id="otherAllowance"
                name="otherAllowance"
                type="number"
                min="0"
                value={formState.otherAllowance}
                onChange={handleChange}
              />
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {successMessage && (
              <div className="alert alert-success">{successMessage}</div>
            )}

            <div className="button-row">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save Salary Master"}
              </button>
            </div>
          </form>
        </section>

        <aside className="page-panel page-panel-accent">
          <div className="panel-heading">
            <div>
              <h2>Live Preview</h2>
              <p>
                {selectedEmployee
                  ? selectedEmployee.employeeName
                  : "Select an employee to preview the record."}
              </p>
            </div>
          </div>

          <div className="metric-grid">
            <div className="metric-card">
              <span>Gross Salary</span>
              <strong>{formatCurrency(preview.gross)}</strong>
            </div>
            <div className="metric-card">
              <span>Net Salary</span>
              <strong>{formatCurrency(preview.netSalary)}</strong>
            </div>
            <div className="metric-card">
              <span>Employee PF</span>
              <strong>{formatCurrency(preview.employeePF)}</strong>
            </div>
            <div className="metric-card">
              <span>CTC</span>
              <strong>{formatCurrency(preview.ctc)}</strong>
            </div>
          </div>

          <ul className="bullet-list">
            <li>Employee and employer PF are both 12 percent of basic salary.</li>
            <li>ESIC is applied only when gross salary is 21000 or below.</li>
            <li>The backend re-validates calculations before saving.</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}

export default SalaryMaster;
