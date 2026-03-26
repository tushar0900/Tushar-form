import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import EmployeeForm from "./EmployeeForm";
import EmployeeTable from "./list";
import SalaryMaster from "./SalaryMaster";
import SalaryList from "./SalaryList";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import UserManagement from "./pages/UserManagement";
import { useAuth } from "./context/useAuth";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/employees" replace />} />
            <Route path="/employees" element={<EmployeeTable />} />
            <Route path="/employees/new" element={<EmployeeForm />} />
            <Route path="/salary" element={<SalaryMaster />} />
            <Route path="/salary-list" element={<SalaryList />} />

            <Route element={<ProtectedRoute allowedRoles={["super_admin"]} />}>
              <Route path="/users" element={<UserManagement />} />
            </Route>
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated ? "/employees" : "/login"}
              replace
            />
          }
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
