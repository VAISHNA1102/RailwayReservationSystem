import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import api from "../../../api";
import "../Dashboard/CommonCssForUserDashboard.css";

function UserProfile() {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      fetchUserDetails(decoded.email || decoded.sub);
    } catch (err) {
      console.error("Invalid token:", err);
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserDetails = async (email) => {
    try {
      const response = await api.get(`/api/v1/users/getUserByEmail?email=${email}`);
      setUserDetails(response.data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch user details:", err);
      // Create user data from JWT token for display
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setUserDetails({
            userName: decoded.username || "User",
            email: decoded.email || decoded.sub,
            role: decoded.role || "USER",
            createdAt: null
          });
          setError("");
        } catch (decodeErr) {
          setError("Failed to load user details");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);
    setError("");
    
    try {
      await api.put(`/api/v1/users/${userDetails.userName}/change-password?oldPassword=${passwordData.oldPassword}&newPassword=${passwordData.newPassword}`);
      setSuccessMessage("Password changed successfully!");
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setShowChangePassword(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4" style={{ maxWidth: 1000 }}>
        <div className="user-card" style={{ textAlign: "center", padding: 40 }}>
          <div className="spinner-border" style={{ color: "#7f5af0" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 1000 }}>
      <div className="user-card" style={{ background: "linear-gradient(120deg, #f7f3fd 60%, #e9e3fa 100%)" }}>
        <h3 className="card-title">
          <i className="fas fa-user"></i> User Profile
        </h3>
        
        {error && (
          <div style={{
            background: "linear-gradient(135deg, #e74c3c, #c0392b)",
            color: "white",
            padding: "12px 16px",
            borderRadius: "12px",
            marginBottom: "20px",
            fontWeight: "500"
          }}>
            <i className="fas fa-exclamation-triangle"></i> {error}
          </div>
        )}

        {successMessage && (
          <div style={{
            background: "linear-gradient(135deg, #27ae60, #2ecc71)",
            color: "white",
            padding: "12px 16px",
            borderRadius: "12px",
            marginBottom: "20px",
            fontWeight: "500"
          }}>
            <i className="fas fa-check-circle"></i> {successMessage}
          </div>
        )}

        {userDetails && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20, marginBottom: 25 }}>
              <div><strong>Username:</strong> {userDetails.userName}</div>
              <div><strong>Email:</strong> {userDetails.email}</div>
            </div>
            
            <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
              <button
                className="user-btn"
                onClick={() => setShowChangePassword(!showChangePassword)}
                style={{ width: "auto", padding: "12px 20px" }}
              >
                <i className="fas fa-key"></i> Change Password
              </button>
            </div>
          </>
        )}
      </div>

      {/* Change Password Form */}
      {showChangePassword && (
        <div className="user-card">
          <h4 className="card-title">
            <i className="fas fa-key"></i> Change Password
          </h4>
          
          <form onSubmit={handleChangePassword}>
            <div style={{ display: "grid", gap: 15, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", marginBottom: 5, fontWeight: "600", color: "#5a3ac7" }}>Current Password</label>
                <input
                  type="password"
                  className="user-form-control"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                  required
                  style={{ width: "100%" }}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: 5, fontWeight: "600", color: "#5a3ac7" }}>New Password</label>
                <input
                  type="password"
                  className="user-form-control"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                  minLength={6}
                  style={{ width: "100%" }}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: 5, fontWeight: "600", color: "#5a3ac7" }}>Confirm New Password</label>
                <input
                  type="password"
                  className="user-form-control"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                  minLength={6}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 15 }}>
              <button
                type="submit"
                className="user-btn"
                disabled={passwordLoading}
                style={{ width: "auto", padding: "12px 20px" }}
              >
                <i className="fas fa-save"></i> {passwordLoading ? "Updating..." : "Update Password"}
              </button>
              
              <button
                type="button"
                className="user-btn"
                onClick={() => {
                  setShowChangePassword(false);
                  setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
                  setError("");
                }}
                style={{ 
                  width: "auto", 
                  padding: "12px 20px",
                  background: "linear-gradient(135deg, #6c757d, #495057)"
                }}
              >
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default UserProfile;