// import { Link, useNavigate } from "react-router-dom";
// import "./Navbar.css";
// import { useEffect, useState } from "react";
// import TrainRoundedIcon from "@mui/icons-material/TrainRounded";

// function Navbar() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     setIsLoggedIn(!!localStorage.getItem("token"));
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     setIsLoggedIn(false);
//     alert("Logged out");
//     navigate("/login");
//   };

//   return (
//     <nav className="custom-navbar navbar navbar-expand-lg sticky-top glass-navbar shadow-sm">
//       <div className="container-fluid">
//         {/* Brand Logo */}
//         <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
//           <TrainRoundedIcon className="train-icon" />
//           <span className="brand-title">TrainEase</span>
//         </Link>

//         {/* Toggler for mobile */}
//         <button
//           className="navbar-toggler bg-white"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarNav"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>

//         {/* Right side: Profile Dropdown */}
//         <div className="collapse navbar-collapse" id="navbarNav">
//           <div className="ms-auto">
//             <ul className="navbar-nav">
//               <li className="nav-item dropdown">
//                 <a
//                   className="btn profile-btn dropdown-toggle d-flex align-items-center gap-2"
//                   href="#"
//                   role="button"
//                   data-bs-toggle="dropdown"
//                   aria-expanded="false"
//                 >
//                   <i className="bi bi-person-circle profile-icon"></i> Profile
//                 </a>
//                 <ul className="dropdown-menu dropdown-menu-end glass-dropdown">
//                   {!isLoggedIn ? (
//                     <>
//                       <li>
//                         <Link
//                           className="dropdown-item d-flex align-items-center gap-2"
//                           to="/login"
//                         >
//                           <i className="bi bi-box-arrow-in-right"></i> Login
//                         </Link>
//                       </li>
//                       <li>
//                         <Link
//                           className="dropdown-item d-flex align-items-center gap-2"
//                           to="/register"
//                         >
//                           <i className="bi bi-person-plus"></i> Register
//                         </Link>
//                       </li>
//                     </>
//                   ) : (
//                     <>
//                       <li>
//                         <hr className="dropdown-divider" />
//                       </li>
//                       <li>
//                         <button
//                           className="dropdown-item d-flex align-items-center gap-2"
//                           onClick={handleLogout}
//                         >
//                           <i className="bi bi-box-arrow-right"></i> Logout
//                         </button>
//                       </li>
//                     </>
//                   )}
//                 </ul>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// }

// export default Navbar;






import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useEffect, useState } from "react";
import TrainRoundedIcon from "@mui/icons-material/TrainRounded";
import jwtDecode from "jwt-decode";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsLoggedIn(true);
        setUsername(decoded.username || decoded.sub || "User");
      } catch (error) {
        console.error("Invalid token:", error);
        setIsLoggedIn(false);
        setUsername("");
        localStorage.removeItem("token");
      }
    } else {
      setIsLoggedIn(false);
      setUsername("");
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear(); // clears all session data
    setIsLoggedIn(false);
    setUsername("");
    navigate("/login");
  };

  return (
    <nav className="custom-navbar navbar navbar-expand-lg sticky-top glass-navbar shadow-sm">
      <div className="container-fluid">
        {/* Brand Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <TrainRoundedIcon className="train-icon" />
          <span className="brand-title">TrainEase</span>
        </Link>

        {/* Toggler for mobile */}
        <button
          className="navbar-toggler bg-white"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar links and Profile dropdown */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <div className="ms-auto">
            <ul className="navbar-nav">
              <li className="nav-item dropdown">
                <a
                  className="btn profile-btn dropdown-toggle d-flex align-items-center gap-2"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle profile-icon"></i>
                  {isLoggedIn ? username : "Profile"}
                </a>

                <ul className="dropdown-menu dropdown-menu-end glass-dropdown">
                  {!isLoggedIn ? (
                    <>
                      <li>
                        <Link
                          className="dropdown-item d-flex align-items-center gap-2"
                          to="/login"
                        >
                          <i className="bi bi-box-arrow-in-right"></i> Login
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item d-flex align-items-center gap-2"
                          to="/register"
                        >
                          <i className="bi bi-person-plus"></i> Register
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link
                          className="dropdown-item d-flex align-items-center gap-2"
                          to="/profile"
                        >
                          <i className="bi bi-person"></i> View Details
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item d-flex align-items-center gap-2"
                          to="/booking-history"
                        >
                          <i className="bi bi-ticket-perforated"></i> View booking
                        </Link>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <button
                          className="dropdown-item d-flex align-items-center gap-2"
                          onClick={handleLogout}
                        >
                          <i className="bi bi-box-arrow-right"></i> Logout
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
