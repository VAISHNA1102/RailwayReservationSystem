import { Outlet } from "react-router-dom";
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer/Footer";

export default function MainLayout() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ 
        paddingTop: "5px", 
        paddingBottom: "80px", /* Space for fixed footer */
        flex: "1",
        minHeight: "calc(100vh - 140px)" /* Account for navbar and footer */
      }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
