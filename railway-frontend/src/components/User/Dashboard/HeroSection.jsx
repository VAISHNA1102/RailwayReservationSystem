import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import jwtDecode from "jwt-decode";
import "./HeroSection.css";

function HeroSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsLoggedIn(true);
        setUsername(decoded.username || decoded.sub || "User");
      } catch (error) {
        setIsLoggedIn(false);
      }
    }
  }, []);

  return (
    <section className="hero-section hero-gradient-bg">
      <div className="hero-container">
        {/* Headline & CTA */}
        <div className="hero-text animated-fadein">
          <h1 className="hero-main-title">🚄 Welcome to <span className="brand-gradient">TrainEase</span>{isLoggedIn ? `, ${username}!` : ""}</h1>
          <p className="hero-subtitle">
            India's most modern, secure, and lightning-fast platform for booking train journeys.<br/>
            <span style={{color: '#7f5af0', fontWeight: 600}}>Book. Pay. Go. — All in one place.</span>
          </p>
          {!isLoggedIn && (
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-lg btn-light hero-cta-btn">Get Started</Link>
              <Link to="/login" className="btn btn-lg btn-outline-primary hero-cta-btn">Login</Link>
            </div>
          )}
        </div>

        {/* Why Choose Us */}
        <div className="benefits-row mt-5">
          <div className="benefit-box benefit-anim">
            <span>📊</span>
            <h5>Live Availability</h5>
            <p>Get real-time train status and seat info.</p>
          </div>
          <div className="benefit-box benefit-anim">
            <span>💳</span>
            <h5>Secure Payments</h5>
            <p>Pay with UPI, Cards or Net Banking safely.</p>
          </div>
          <div className="benefit-box benefit-anim">
            <span>🧾</span>
            <h5>Instant E-Tickets</h5>
            <p>Download ticket and receipt instantly after booking.</p>
          </div>
          {/* <div className="benefit-box benefit-anim">
            <span>🔄</span>
            <h5>Easy Refunds</h5>
            <p>Quick and smooth cancellation with auto refunds.</p>
          </div> */}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
