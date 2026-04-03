# React Component Examples - Redux Integration

## 1. Update main.jsx (Add Redux Provider)

```javascript
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import store from "./redux/store.js";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
      </Routes>
    </BrowserRouter>
  </Provider>
);
```

---

## 2. Updated list.jsx with Redux

```javascript
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchEmployees,
  deleteEmployee,
  updateEmployee,
  clearError,
  clearSuccess,
} from "../redux/slices/employeeSlice";

function EmployeeTable() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const {
    data: employees,
    loading,
    error,
    success,
    currentPage,
    totalPages,
  } = useSelector((state) => state.employees);

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    dispatch(fetchEmployees({ page: 1, limit: 5 }));
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleAddClick = () => {
    navigate("/");
  };

  const handleEditClick = (emp) => {
    setEditingId(emp._id);
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

  const handleSave = (empId) => {
    dispatch(updateEmployee({ id: empId, data: editData }));
    setEditingId(null);
    setEditData({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = (empId) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }
    dispatch(deleteEmployee(empId));
  };

  const handlePageChange = (newPage) => {
    dispatch(fetchEmployees({ page: newPage, limit: 5 }));
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={handleAddClick}>Add Employee</button>

      {error && <p style={{ color: "red", fontWeight: "bold" }}>❌ {error}</p>}
      {success && <p style={{ color: "green", fontWeight: "bold" }}>✓ {success}</p>}

      <hr />

      <table border="1" cellPadding="8" style={{ width: "100%" }}>
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
              <tr key={emp._id}>
                <td>{emp.employeeCode}</td>
                {editingId === emp._id ? (
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
                    <td>
                      <button
                        onClick={() => handleSave(emp._id)}
                        className="btn-small btn-edit"
                      >
                        Save
                      </button>
                      <button onClick={handleCancel} className="btn-small btn-edit">
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
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(emp._id)}
                        className="btn-small btn-delete"
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

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span style={{ margin: "0 20px" }}>Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default EmployeeTable;
```

---

## 3. Updated Form Component with Redux

```javascript
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  createEmployee,
  clearError,
  clearSuccess,
} from "../redux/slices/employeeSlice";

function Form() {
  const generateEmployeeCode = () =>
    Math.floor(1000 + Math.random() * 9000);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, success } = useSelector(
    (state) => state.employees
  );

  const [employeeCode, setEmployeeCode] = useState("");
  const [dob, setDob] = useState("");
  const [joiningDate, setJoiningDate] = useState("");

  useEffect(() => {
    setEmployeeCode(generateEmployeeCode());
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
        navigate("/list");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch, navigate]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const employeeName = e.target.employeeName.value;
    const employeeEmail = e.target.employeeEmail.value;
    const employeeNumber = e.target.employeeNumber.value;

    const employeeData = {
      employeeName,
      employeeEmail,
      employeeNumber,
      dob,
      joiningDate,
    };

    dispatch(createEmployee(employeeData));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Joining Form</h1>

      <strong>
        <label htmlFor="employeeName">Employee Name:</label>
      </strong>
      <input name="employeeName" placeholder="Enter your Name" required />

      <strong>
        <label htmlFor="employeeEmail">Employee Email:</label>
      </strong>
      <input
        name="employeeEmail"
        placeholder="Enter valid Email"
        pattern="^[^@]+@gmail\.com$"
        type="email"
        required
      />

      <strong>
        <label htmlFor="employeeNumber">Employee Number:</label>
      </strong>
      <input
        name="employeeNumber"
        pattern="[0-9]{10}"
        maxLength="10"
        placeholder="Enter Valid number"
        required
      />

      <strong>
        <label>Date of Birth:</label>
      </strong>
      <input
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        required
      />

      <label>Joining Date:</label>
      <input
        type="date"
        value={joiningDate}
        onChange={(e) => setJoiningDate(e.target.value)}
        required
      />

      <label>Employee Code:</label>
      <input value={employeeCode} readOnly />

      {error && <p style={{ color: "red", fontWeight: "bold" }}>❌ {error}</p>}
      {success && (
        <p style={{ color: "green", fontWeight: "bold" }}>
          ✓ {success}. Redirecting...
        </p>
      )}

      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>

      <br />
      <br />

      <Link to="/list">
        <button type="button">View Employee List</button>
      </Link>
    </form>
  );
}

export default Form;
```

---

## 4. Updated App.jsx with Router

```javascript
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import EmployeeForm from "./main";
import EmployeeTable from "./list";
import SalaryMaster from "./SalaryMaster";

function App() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>📊 Employee Payroll System</h1>

      <nav style={{ marginBottom: "20px" }}>
        <Link to="/" style={{ marginRight: "20px" }}>
          Employee Form
        </Link>
        <Link to="/list" style={{ marginRight: "20px" }}>
          Employee List
        </Link>
        <Link to="/salary">Salary Master</Link>
      </nav>

      <Routes>
        <Route path="/" element={<EmployeeForm />} />
        <Route path="/list" element={<EmployeeTable />} />
        <Route path="/salary" element={<SalaryMaster />} />
      </Routes>
    </div>
  );
}

export default App;
```

---

## 5. Redux DevTools Usage

Install Chrome Extension: **Redux DevTools**

Then access:
- **DevTools → Redux** tab
- Watch real-time state changes
- Time-travel through actions
- Inspect previous states

Example of what you'll see:
```json
{
  "employees": {
    "data": [...employees],
    "loading": false,
    "error": null,
    "currentPage": 1,
    "totalPages": 5,
    "totalEmployees": 24
  }
}
```

---

## Common Redux Patterns

### Pattern 1: Loading State
```javascript
if (loading) return <Spinner />;
```

### Pattern 2: Error Handling
```javascript
{error && <ErrorAlert message={error} />}
```

### Pattern 3: Success Message
```javascript
{success && <SuccessAlert message={success} />}
```

### Pattern 4: Pagination
```javascript
dispatch(fetchEmployees({ page: newPage, limit: 5 }));
```

### Pattern 5: Update & Refetch
```javascript
dispatch(updateEmployee({ id, data }));
// Redux thunk automatically refetches
```

---

**Copy-paste these examples to update your React components!**
