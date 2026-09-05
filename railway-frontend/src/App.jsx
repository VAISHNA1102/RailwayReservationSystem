import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import LoginPage from "./components/Login/LoginPage";
import RegisterPage from "./components/Register/RegisterPage";
import UserDashboard from "./components/User/Dashboard/UserDashboard";
import BookTicket from "./components/User/Dashboard/BookTicket";
import PaymentSuccess from "./components/User/Dashboard/PaymentSuccess";
import UserProfile from "./components/User/Profile/UserProfile";
import BookingHistory from "./components/User/BookingHistory/BookingHistory";
import AdminDashboard from "./components/Admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Routes with Navbar/Footer */}
      <Route element={<MainLayout />}>
        <Route index element={<UserDashboard />} />
        <Route path="/" element={<UserDashboard />} />
        <Route path="/dashboard" element={<UserDashboard />} />

        <Route
          path="/book/:trainId"
          element={
            <ProtectedRoute>
              <BookTicket />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-success"
          element={
            <ProtectedRoute>
              <PaymentSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking-history"
          element={
            <ProtectedRoute>
              <BookingHistory />
            </ProtectedRoute>
          }
        />
        
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

export default App;
