import "./Footer.css";

function Footer() {
  return (
    <footer className="footer-section modern-footer-bg">
      <div className="footer-container">
        <div className="text-center small text-white pt-2 pb-1 copyright-area">
          <span style={{ opacity: 0.8 }}>
            &copy; {new Date().getFullYear()} Railway Reservation. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
