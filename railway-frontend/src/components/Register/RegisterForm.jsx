
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./RegisterForm.css";

// Material UI Icons
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function RegisterForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let err = "";
    if (name === "userName") {
      if (!value.trim()) err = "Please enter a username";
      else if (!/^[a-zA-Z0-9_]{3,50}$/.test(value))
        err = "Please enter a valid username (3-50 characters, letters, numbers, underscores only)";
    }
    if (name === "email") {
      if (!value.trim()) err = "Please enter your email address";
      else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value))
        err = "Please enter a valid email address";
    }
    if (name === "password") {
      if (!value.trim()) err = "Please enter a password";
      else if (
        !/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%?&]).{6,12}$/.test(value)
      ) {
        err =
          "Password must be 6-12 characters with uppercase, lowercase, number & special character (@$!%?&)";
      }
    }
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const getErrorMessage = (err) => {
    const status = err?.response?.status;
    const message = err?.response?.data?.message || '';
    
    if (status === 400) {
      if (message.includes('Username must be between 3 and 50 characters')) {
        return 'Please enter a username between 3-50 characters';
      }
      if (message.includes('Username must be alphanumeric with no spaces')) {
        return 'Please enter a valid username (letters, numbers, and underscores only)';
      }
      if (message.includes('Invalid email format')) {
        return 'Please enter a correct email address';
      }
      if (message.includes('Password must be 6–12 characters and include uppercase, lowercase, digit, and special character')) {
        return 'Password must be 6-12 characters with uppercase, lowercase, number & special character (@$!%?&)';
      }
      if (message.includes('Username') && message.includes('already exists')) {
        return 'This username is already taken. Please choose a different username.';
      }
      if (message.includes('Email') && message.includes('already exists')) {
        return 'This email is already registered. Please use a different email address.';
      }
      return 'Please check your information and try again';
    }
    
    if (status === 409) {
      return 'Username or email already exists. Please use different information.';
    }
    
    return 'Registration failed. Please check your information and try again.';
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const nextErrors = {};
    Object.entries(form).forEach(([key, val]) => {
      let err = "";
      if (key === "userName") {
        if (!val.trim()) err = "Please enter a username";
        else if (!/^[a-zA-Z0-9_]{3,50}$/.test(val))
          err = "Please enter a valid username (3-50 characters, letters, numbers, underscores only)";
      }
      if (key === "email") {
        if (!val.trim()) err = "Please enter your email address";
        else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(val))
          err = "Please enter a correct email address";
      }
      if (key === "password") {
        if (!val.trim()) err = "Please enter a password";
        else if (
          !/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%?&]).{6,12}$/.test(val)
        )
          err =
            "Password must be 6-12 characters with uppercase, lowercase, number & special character (@$!%?&)";
      }
      if (err) nextErrors[key] = err;
    });

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("❌ Please fill in all required fields correctly");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/api/v1/users/register", form);
      toast.success("✅ Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleRegister} className="register-form register-card">
        <div className="mb-3 register-input-group">
          <label>Username</label>
          <input
            type="text"
            className={`form-control ${errors.userName ? "is-invalid" : ""}`}
            name="userName"
            value={form.userName}
            onChange={handleChange}
            placeholder="Enter a username"
            required
          />
          {errors.userName && (
            <div className="invalid-feedback">{errors.userName}</div>
          )}
        </div>

        <div className="mb-3 register-input-group">
          <label>Email</label>
          <input
            type="email"
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
          {errors.email && (
            <div className="invalid-feedback">{errors.email}</div>
          )}
        </div>

        <div
          className="mb-3 register-input-group"
          style={{ position: "relative" }}
        >
          <label>Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password (e.g., MyPass123!)"
              required
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              className="register-eye-btn"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={0}
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
              {showPassword ? (
                <VisibilityOff />
              ) : (
                <Visibility />
              )}
            </button>
          </div>
          {errors.password && (
            <div className="invalid-feedback">{errors.password}</div>
          )}
        </div>

        <div className="d-grid">
          <button
            type="submit"
            className="register-gradient-btn w-100"
            disabled={submitting}
          >
            {submitting ? "Registering..." : "Register"}
          </button>
        </div>

        <p className="login-register-link">
          Already registered? <Link to="/login">Login here</Link>
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

export default RegisterForm;
