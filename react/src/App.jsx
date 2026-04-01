import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import EmployeeForm from "./EmployeeForm";
import EmployeeTable from "./list";
import SalaryMaster from "./SalaryMaster";
import SalaryList from "./SalaryList";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import UserManagement from "./pages/UserManagement";
import EmployeeSalaryPage from "./pages/EmployeeSalaryPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import AuditTrailPage from "./pages/AuditTrailPage";
import { useAuth } from "./context/useAuth";
import { getDefaultPathForUser } from "./lib/homePath";

function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute allowPendingPasswordChange />}>
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route
              index
              element={<Navigate to={getDefaultPathForUser(user)} replace />}
            />

            <Route element={<ProtectedRoute allowedRoles={["admin", "super_admin"]} />}>
              <Route path="/employees" element={<EmployeeTable />} />
              <Route path="/employees/new" element={<EmployeeForm />} />
              <Route path="/salary" element={<SalaryMaster />} />
              <Route path="/salary-list" element={<SalaryList />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["employee"]} />}>
              <Route path="/my-salary" element={<EmployeeSalaryPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["super_admin"]} />}>
              <Route path="/audit-trail" element={<AuditTrailPage />} />
              <Route path="/users" element={<UserManagement />} />
            </Route>
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated ? getDefaultPathForUser(user) : "/login"}
              replace
            />
          }
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
