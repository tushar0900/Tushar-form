import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? "https://tushar-form.onrender.com" : "http://localhost:5000");

function EmployeeForm() {
  const navigate = useNavigate();
  const [apiErrorMessage, setApiErrorMessage] = useState("");

  useEffect(() => {
    if (!API_BASE_URL || API_BASE_URL === "undefined") {
      setApiErrorMessage(
        "⚠️ Backend API URL is not configured. Please set VITE_API_BASE_URL environment variable."
      );
    }
  }, []);

  const generateEmployeeCode = () => {
    return Math.floor(1000 + Math.random() * 9000);
  };

  const [employeeCode, setEmployeeCode] = useState("");
  const [dob, setdob] =  useState("");
  const [joiningdate, setjoiningdate] = useState("");
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  useEffect(() => {
    setEmployeeCode(generateEmployeeCode());
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!API_BASE_URL || API_BASE_URL === "undefined") {
      setError("Cannot submit: Backend API URL is not configured.");
      return;
    }

    const dobDate = new Date(dob);
    const minJoiningDate = new Date(dobDate);
    minJoiningDate.setFullYear(minJoiningDate.getFullYear() + 18);

    if (new Date(joiningdate) < minJoiningDate) {
      setError("Employee must be at least 18 years old at the time of joining.");
      return;
    }

    setError("");

    const formData = {
      employeeName: e.target.employeeName.value,
      employeeEmail: e.target.employeeEmail.value,
      employeeNumber: e.target.employeeNumber.value,
      dob: dob,
      joiningDate: joiningdate,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save employee");
      }

      alert("Employee saved successfully...");

      e.target.reset();
      setEmployeeCode(generateEmployeeCode());
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Joining Form</h1>

      {apiErrorMessage && (
        <div style={{ 
          backgroundColor: "#fff3cd", 
          border: "1px solid #ffc107", 
          color: "#856404", 
          padding: "12px", 
          marginBottom: "15px", 
          borderRadius: "4px" 
        }}>
          {apiErrorMessage}
        </div>
      )}

      <fieldset>
        <legend className='border'><strong>Personal Information</strong></legend>

        <strong><label htmlFor="employeeName">Employee Name: </label></strong>
        <input type="text" id="employeeName" name="employeeName" required />
        <br />

        <strong><label htmlFor="employeeEmail">Employee Email: </label></strong>
        <input type="email" pattern="[^@]+@gmail.com" id="employeeEmail" name="employeeEmail" required />
        <br />

        <strong><label htmlFor="employeeNumber">Employee Number: </label></strong>
        <input
          type="tel"
          id="employeeNumber"
          name="employeeNumber"
          inputMode="numeric"
          pattern="[0-9]{10}"
          maxLength="10"
          required
        />
        <br />

        <strong><label htmlFor="dob">Date of Birth: </label></strong>
        <input type="date" id="dob" name="dob" required onChange={(e) => setdob(e.target.value)}/>
        <br />

        <strong><label htmlFor="joiningDate">Joining Date: </label></strong>
        <input type="date" id="joiningDate" name="joiningDate" required onChange={(e) => setjoiningdate(e.target.value)}/>
        <br />

        <strong><label htmlFor="employeeCode">Employee Code: </label></strong>
        <input
          type="text"
          id="employeeCode"
          name="employeeCode"
          value={employeeCode}
          readOnly
        />
        <br />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" >Submit</button>
        <button type="button" onClick={() => navigate('/list')} style={{ marginLeft: "10px" }}>View Employee List</button>
      </fieldset>
    </form>
  );
}

export default EmployeeForm;
