


import { useState } from "react";
import jwtDecode from "jwt-decode"; // ✅ fixed import
import { useNavigate, Link } from "react-router-dom";
import api from "../../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../Register/RegisterForm.css";

import LoginIcon from "@mui/icons-material/Login";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function LoginForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validateField = (name, value) => {
    let err = "";
    if (name === "email") {
      if (!value.trim()) err = "Please enter your email address";
    }
    if (name === "password") {
      if (!value.trim()) err = "Please enter your password";
    }
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const getErrorMessage = (err) => {
    const status = err?.response?.status;
    const message = err?.response?.data?.message || '';
    
    // Handle authentication errors (wrong email/password)
    if (status === 401 || status === 403) {
      return 'Incorrect email or password. Please try again';
    }
    
    // Handle validation errors
    if (status === 400) {
      if (message.includes('Username must be alphanumeric')) {
        return 'Please enter a correct username';
      }
      if (message.includes('Invalid email format')) {
        return 'Please enter a correct email address';
      }
      if (message.includes('Password must be')) {
        return 'Please enter a correct password';
      }
      return 'Please check your information and try again';
    }
    
    // Handle user not found
    if (status === 404) {
      return 'Account not found. Please check your email or register for a new account';
    }
    
    // Handle server errors
    if (status === 500) {
      return 'Something went wrong. Please try again in a few minutes';
    }
    
    // Handle network errors or other issues
    if (!status) {
      return 'Unable to connect. Please check your internet connection and try again';
    }
    
    // Default fallback for any other errors
    return 'Login failed. Please check your email and password and try again';
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const nextErrors = {};
    if (!formData.email.trim()) nextErrors.email = "Please enter your email address";
    if (!formData.password.trim()) nextErrors.password = "Please enter your password";

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("❌ Please fill in all required fields correctly");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post("/api/v1/auth/login", formData);
      const token = res.data?.data;
      if (!token) throw new Error("No token returned");

      const decoded = jwtDecode(token);

      // Extract role from JWT (check both possible locations)
      const roleFromToken = decoded.role || decoded.authorities?.[0]?.replace("ROLE_", "");
      const usernameFromToken = decoded.username || decoded.sub;

      localStorage.setItem("token", token);
      localStorage.setItem("username", usernameFromToken);
      localStorage.setItem("role", roleFromToken);

      toast.success("✅ Welcome back! Redirecting to dashboard...");

      // Role-based redirect
      const redirectPath = roleFromToken === "ADMIN" ? "/admin" : "/dashboard";
      setTimeout(() => navigate(redirectPath), 500);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h3 className="text-center mb-4 login-heading">
        <LoginIcon style={{ fontSize: "2.5rem", marginRight: "8px" }} />
        Welcome Back
      </h3>

      <form onSubmit={handleLogin} className="register-form login-card">
        <div className="mb-3 login-input-group">
          <label>Email</label>
          <input
            type="text"
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            autoComplete="email"
          />
          {errors.email && (
            <div className="invalid-feedback">{errors.email}</div>
          )}
        </div>

        <div className="mb-3 login-input-group" style={{ position: "relative" }}>
          <label>Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              className="login-eye-btn"
              onClick={() => setShowPassword((v) => !v)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: "#7f5af0",
                fontSize: 20,
              }}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </button>
          </div>
          {errors.password && (
            <div className="invalid-feedback">{errors.password}</div>
          )}
        </div>

        <div className="d-grid">
          <button 
            type="submit" 
            className="login-gradient-btn w-100"
            disabled={submitting}
          >
            {submitting ? "Signing in..." : "Login"}
          </button>
        </div>

        <p className="login-register-link">
          Not registered? <Link to="/register">Register here</Link>
        </p>
      </form>

      <ToastContainer 
        position="top-center" 
        autoClose={3000} 
        hideProgressBar
        closeButton={false}
        pauseOnHover={false}
        draggable={false}
        icon={false}
      />
    </>
  );
}
