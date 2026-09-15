import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import RoleRedirect from "./pages/RoleRedirect";
import Overview from "./pages/Overview";
import Patients from "./pages/Patients";
import Wards from "./pages/Wards";
import Admissions from "./pages/Admissions";
import Admit from "./pages/Admit";
import Discharge from "./pages/Discharge";
import Payments from "./pages/Payments";
import Housekeeping from "./pages/Housekeeping";
import Reports from "./pages/Reports";
import Staff from "./pages/Staff";

import "./styles/app.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/redirect" element={<RoleRedirect />} />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="patients" element={<Patients />} />
            <Route path="wards" element={<Wards />} />
            <Route path="admissions" element={<Admissions />} />
            <Route path="payments" element={<Payments />} />
            <Route path="housekeeping" element={<Housekeeping />} />
            <Route path="reports" element={<Reports />} />
            <Route path="staff" element={<Staff />} />
          </Route>

          {/* Receptionist routes */}
          <Route
            path="/receptionist"
            element={
              <ProtectedRoute allowedRoles={["receptionist", "admin"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="patients" element={<Patients />} />
            <Route path="wards" element={<Wards />} />
            <Route path="admissions" element={<Admissions />} />
            <Route path="admit" element={<Admit />} />
            <Route path="discharge" element={<Discharge />} />
            <Route path="payments" element={<Payments />} />
            <Route path="housekeeping" element={<Housekeeping />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
