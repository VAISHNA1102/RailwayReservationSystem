


import { Navigate, useLocation } from "react-router-dom";
import jwtDecode from "jwt-decode"; // ✅ correct import

function ProtectedRoute({ children, requiredRole = null, adminOnly = false }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  if (!token) {
    localStorage.setItem("postLoginRedirect", location.pathname);
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;

    if (decoded.exp && decoded.exp < now) {
      localStorage.clear();
      return <Navigate to="/login" replace />;
    }

    // Check role-based access
    if (requiredRole && role !== requiredRole) {
      return <Navigate to={role === "ADMIN" ? "/admin" : "/dashboard"} replace />;
    }
    
    if (adminOnly && role !== "ADMIN") {
      return <Navigate to="/dashboard" replace />;
    }
  } catch (err) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
