import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div className="page-loading">Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const fallback = role === "admin" ? "/admin" : "/receptionist";
    return <Navigate to={fallback} replace />;
  }

  return children;
}
