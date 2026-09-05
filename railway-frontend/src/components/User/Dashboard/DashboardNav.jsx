// 📁 src/components/Navbar/DashboardNav.jsx
import { Link, useNavigate } from "react-router-dom";
import "./DashboardNav.css";

function DashboardNav() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="dashboard-navbar navbar navbar-expand-lg navbar-dark px-4">
      <div className="container-fluid d-flex justify-content-between">
        <span className="navbar-brand fw-bold fs-4">🚆 TrainEase</span>

        <ul className="navbar-nav d-flex flex-row gap-3">
          <li className="nav-item">
 
</li>
          
          <li className="nav-item dropdown">
            <button className="btn btn-outline-light dropdown-toggle" data-bs-toggle="dropdown">
              {username}
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
}

// ✅ This line MUST be present and correct:
export default DashboardNav;
