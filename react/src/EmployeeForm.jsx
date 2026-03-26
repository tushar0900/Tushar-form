import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./lib/api";

const initialFormState = {
  employeeName: "",
  employeeEmail: "",
  employeeNumber: "",
  dob: "",
  joiningDate: "",
};

const isAdultAtJoining = (dob, joiningDate) => {
  const dobDate = new Date(dob);
  const joiningDateValue = new Date(joiningDate);

  if (Number.isNaN(dobDate.getTime()) || Number.isNaN(joiningDateValue.getTime())) {
    return false;
  }

  const minJoiningDate = new Date(dobDate);
  minJoiningDate.setFullYear(minJoiningDate.getFullYear() + 18);

  return joiningDateValue >= minJoiningDate;
};

function EmployeeForm() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState(initialFormState);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createdEmployee, setCreatedEmployee] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [employeeCodePreview, setEmployeeCodePreview] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(true);

  const loadEmployeeCodePreview = async () => {
    setLoadingPreview(true);

    try {
      const response = await api.get("/employees/next-code");
      setEmployeeCodePreview(String(response.data.employeeCode || ""));
    } catch {
      setEmployeeCodePreview("");
    } finally {
      setLoadingPreview(false);
    }
  };

  useEffect(() => {
    void loadEmployeeCodePreview();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormState((currentState) => ({
      ...currentState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    if (!isAdultAtJoining(formState.dob, formState.joiningDate)) {
      setError("Employee must be at least 18 years old at the time of joining.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await api.post("/employees", {
        ...formState,
        employeeCode: employeeCodePreview || undefined,
      });
      setCreatedEmployee(response.data);
      setFormState(initialFormState);
      setSuccessMessage("Employee created successfully.");
      void loadEmployeeCodePreview();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Failed to save employee"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <span className="eyebrow">Employee Onboarding</span>
          <h1>Create Employee</h1>
          <p>Add a new employee record and receive the server-generated employee code.</p>
        </div>
        <div className="button-row">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/employees")}
          >
            View Employee List
          </button>
        </div>
      </div>

      <div className="two-column-layout">
        <section className="page-panel">
          <div className="panel-heading">
            <div>
              <h2>Personal Details</h2>
              <p>Use the employee's official contact details and joining date.</p>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="employeeCode">Employee Code</label>
              <input
                id="employeeCode"
                name="employeeCode"
                type="text"
                value={employeeCodePreview}
                placeholder={loadingPreview ? "Generating..." : "Generated on save"}
                readOnly
              />
            </div>

            <div className="field">
              <label htmlFor="employeeName">Employee Name</label>
              <input
                id="employeeName"
                name="employeeName"
                type="text"
                value={formState.employeeName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="employeeEmail">Employee Email</label>
              <input
                id="employeeEmail"
                name="employeeEmail"
                type="email"
                value={formState.employeeEmail}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="employeeNumber">Employee Number</label>
              <input
                id="employeeNumber"
                name="employeeNumber"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength="10"
                value={formState.employeeNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="dob">Date of Birth</label>
              <input
                id="dob"
                name="dob"
                type="date"
                value={formState.dob}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="joiningDate">Joining Date</label>
              <input
                id="joiningDate"
                name="joiningDate"
                type="date"
                value={formState.joiningDate}
                onChange={handleChange}
                required
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
                {submitting ? "Saving..." : "Create Employee"}
              </button>
            </div>
          </form>
        </section>

        <aside className="page-panel page-panel-accent">
          <div className="panel-heading">
            <div>
              <h2>Generated Record</h2>
              <p>The backend issues the actual employee code after save.</p>
            </div>
          </div>

          {createdEmployee ? (
            <div className="summary-card">
              <span className="summary-label">Employee Code</span>
              <strong>{createdEmployee.employeeCode}</strong>
              <p>{createdEmployee.employeeName}</p>
              <p>{createdEmployee.employeeEmail}</p>
            </div>
          ) : (
            <div className="empty-state-card">
              <p>No employee created in this session yet.</p>
            </div>
          )}

          <ul className="bullet-list">
            <li>Employee code is generated automatically.</li>
            <li>Joining date must be at least 18 years after date of birth.</li>
            <li>Email and phone values must be unique.</li>
            <li>Delete access is reserved for super admins.</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}

export default EmployeeForm;
