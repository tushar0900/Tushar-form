import { HashRouter as Router, Routes, Route } from "react-router-dom";
import EmployeeForm from "./EmployeeForm";
import EmployeeTable from "./list";
import SalaryMaster from "./SalaryMaster";
import SalaryList from "./SalaryList";

function App() {
  return (
    <Router>
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <Routes>
          <Route path="/" element={<EmployeeForm />} />
          <Route path="/list" element={<EmployeeTable />} />
          <Route path="/salary" element={<SalaryMaster />} />
          <Route path="/salary-list" element={<SalaryList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
