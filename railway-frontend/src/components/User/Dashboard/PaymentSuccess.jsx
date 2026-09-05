import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import { formatDate, formatDateTime } from "../../../utils/dateFormatter";
import "./CommonCssForUserDashboard.css";

function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState(null);
  const [payment, setPayment] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get("session_id");
    const pnrFromUrl = params.get("pnr");
    const paymentMethodFromUrl = params.get("payment_method") || localStorage.getItem("paymentMethod") || "UPI";

    if (!sessionId && !pnrFromUrl) {
      setMessage("❌ No payment session found.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchPaymentAndReservation = async () => {
      try {
        console.log("📤 Confirming payment with backend...");
        if (sessionId) {
          await axios.get(
            `http://localhost:8765/api/v1/payments/success?session_id=${sessionId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          await axios.post(
            `http://localhost:8765/api/v1/payments/confirm/${pnrFromUrl}?paymentMethod=${encodeURIComponent(paymentMethodFromUrl)}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }

        setMessage("✅ Payment Successful!");

        const storedPnr = pnrFromUrl || localStorage.getItem("latestPnr");
        if (!storedPnr) {
          setMessage("❌ No PNR found. Cannot fetch reservation details.");
          setLoading(false);
          return;
        }

        console.log("📤 Fetching reservation details for PNR:", storedPnr);
        const reservationRes = await axios.get(
          `http://localhost:8765/api/v1/reservations/getReservationByPNR/${storedPnr}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setReservation(reservationRes.data);
        
        // Fetch payment details
        try {
          const paymentsRes = await axios.get(
            `http://localhost:8765/api/v1/payments/count`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          // Set payment info based on successful payment
          setPayment({
            paymentStatus: "SUCCESS",
            paymentMethod: paymentMethodFromUrl,
            amount: reservationRes.data.totalFare,
            paymentDateTime: new Date().toISOString()
          });
        } catch (paymentErr) {
          console.log("Payment details fetch failed, using default");
          setPayment({
            paymentStatus: "SUCCESS",
            paymentMethod: paymentMethodFromUrl,
            amount: reservationRes.data.totalFare,
            paymentDateTime: new Date().toISOString()
          });
        }
        
        localStorage.removeItem("latestPnr");
        localStorage.removeItem("paymentMethod");
      } catch (err) {
        console.error("❌ Error confirming payment or fetching reservation:", err);
        setMessage("❌ Error fetching reservation details");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentAndReservation();
  }, [location, navigate]);

  const downloadPDF = () => {
    if (!reservation || !payment) {
      toast.error("No reservation or payment details to generate ticket.");
      return;
    }

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("RAILWAY TICKET", 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 150, 0);
    doc.text("CONFIRMED - PAYMENT SUCCESSFUL", 14, 30);
    
    // Reservation Details
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text("Reservation Details:", 14, 45);
    
    autoTable(doc, {
      startY: 50,
      head: [["Field", "Value"]],
      body: [
        ["PNR Number", reservation.pnrNumber],
        ["Train Number", reservation.trainNumber],
        ["Train Name", reservation.trainName],
        ["Journey Date", reservation.journeyDate],
        ["Class Type", reservation.classType],
        ["Seats Booked", reservation.numberOfSeats.toString()],
        ["Passenger Name", reservation.username],
        ["Booking Status", reservation.reservationStatus],
        ["Reservation Time", formatDateTime(reservation.reservationTime)]
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 }
    });

    // Payment Details
    doc.setFontSize(14);
    doc.text("Payment Details:", 14, doc.lastAutoTable.finalY + 15);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Field", "Value"]],
      body: [
        ["Payment Status", payment.paymentStatus],
        ["Payment Method", payment.paymentMethod],
        ["Total Amount", `₹${payment.amount.toFixed(2)}`],
        ["Payment Date", formatDateTime(payment.paymentDateTime)]
      ],
      theme: 'grid',
      headStyles: { fillColor: [39, 174, 96] },
      styles: { fontSize: 10 }
    });

    // Passenger Details
    doc.setFontSize(14);
    doc.text("Passenger Details:", 14, doc.lastAutoTable.finalY + 15);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Name", "Age", "Gender", "Address", "Quota", "Window Seat"]],
      body: reservation.passengers?.map(p => [
        p.name,
        p.age.toString(),
        p.gender,
        p.address,
        p.quota,
        p.windowSeatPreferred ? "Yes" : "No"
      ]) || [],
      theme: 'grid',
      headStyles: { fillColor: [155, 89, 182] },
      styles: { fontSize: 9 }
    });
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Thank you for choosing our railway service!", 14, doc.lastAutoTable.finalY + 15);
    doc.text(`Generated on: ${formatDateTime(new Date())}`, 14, doc.lastAutoTable.finalY + 25);

    doc.save(`Railway_Ticket_${reservation.pnrNumber}.pdf`);
    toast.success("Ticket downloaded successfully!");
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 1000 }}>
      <div className="user-card" style={{ background: "linear-gradient(120deg, #f7f3fd 60%, #e9e3fa 100%)", padding: 30 }}>
        
        {/* Success Header */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h1 className="card-title" style={{ fontSize: "2.5rem", marginBottom: 10, color: "#27ae60" }}><i className="fas fa-check-circle"></i> Payment Successful!</h1>
          <p style={{ fontSize: "1.2rem", color: "#555", fontWeight: 500 }}>Your train ticket has been booked successfully</p>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: 40 }}>
            <p style={{ fontSize: "1.1rem" }}>Loading ticket details...</p>
          </div>
        )}

        {!loading && !reservation && (
          <div style={{ textAlign: "center", padding: 40 }}>
            <p style={{ fontSize: "1.1rem", color: "#dc3545" }}>{message}</p>
          </div>
        )}

        {reservation && payment && (
          <>
            {/* Ticket Container */}
            <div className="user-card" style={{
              border: "3px dashed #7f5af0",
              padding: 25,
              marginBottom: 25,
              background: "rgba(255, 255, 255, 0.95)"
            }}>
              <h2 className="card-title" style={{ textAlign: "center", fontSize: "1.8rem", marginBottom: 25 }}><i className="fas fa-ticket-alt"></i> RAILWAY TICKET</h2>
              
              {/* Payment Status Banner */}
              <div className="user-status-confirmed" style={{
                padding: 15,
                borderRadius: 12,
                textAlign: "center",
                marginBottom: 25,
                fontSize: "1.1rem",
                fontWeight: "bold",
                boxShadow: "0 4px 12px rgba(127, 90, 240, 0.2)"
              }}>
                <i className="fas fa-credit-card"></i> PAYMENT CONFIRMED - ₹{payment.amount.toFixed(2)}
              </div>

              {/* Reservation Details */}
              <div style={{ marginBottom: 25 }}>
                <h4 className="card-title" style={{ borderBottom: "2px solid #e0dfff", paddingBottom: 8, marginBottom: 15 }}><i className="fas fa-train"></i> Journey Details</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 15 }}>
                  <div><strong>PNR Number:</strong> <span style={{ color: "#7f5af0", fontSize: "1.1rem", fontWeight: "bold" }}>{reservation.pnrNumber}</span></div>
                  <div><strong>Train:</strong> {reservation.trainName} ({reservation.trainNumber})</div>
                  <div><strong>Journey Date:</strong> {formatDate(reservation.journeyDate)}</div>
                  <div><strong>Class:</strong> {reservation.classType}</div>
                  <div><strong>Seats Booked:</strong> {reservation.numberOfSeats}</div>
                  <div><strong>Booking Status:</strong> <span className="user-status-confirmed" style={{ padding: "4px 8px", borderRadius: "8px", fontSize: "0.9rem" }}>{reservation.reservationStatus}</span></div>
                  <div><strong>Passenger Name:</strong> {reservation.username}</div>
                  <div><strong>Total Fare:</strong> ₹{reservation.totalFare.toFixed(2)}</div>
                  <div><strong>Booked On:</strong> {formatDateTime(reservation.reservationTime)}</div>
                </div>
              </div>

              {/* Payment Details */}
              <div style={{ marginBottom: 25 }}>
                <h4 className="card-title" style={{ borderBottom: "2px solid #e0dfff", paddingBottom: 8, marginBottom: 15 }}><i className="fas fa-credit-card"></i> Payment Details</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 15 }}>
                  <div><strong>Payment Status:</strong> <span className="user-status-confirmed" style={{ padding: "4px 8px", borderRadius: "8px", fontSize: "0.9rem" }}>{payment.paymentStatus}</span></div>
                  <div><strong>Payment Method:</strong> {payment.paymentMethod}</div>
                  <div><strong>Amount Paid:</strong> ₹{payment.amount.toFixed(2)}</div>
                  <div><strong>Payment Date:</strong> {formatDateTime(payment.paymentDateTime)}</div>
                </div>
              </div>

              {/* Passenger Details */}
              <div>
                <h4 className="card-title" style={{ borderBottom: "2px solid #e0dfff", paddingBottom: 8, marginBottom: 15 }}><i className="fas fa-users"></i> Passenger Details</h4>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
                    <thead>
                      <tr style={{ background: "#f7f5ff" }}>
                        <th style={{ border: "1px solid #e0dfff", padding: 12, textAlign: "left", color: "#5a3ac7", fontWeight: "600" }}>Name</th>
                        <th style={{ border: "1px solid #e0dfff", padding: 12, textAlign: "left", color: "#5a3ac7", fontWeight: "600" }}>Age</th>
                        <th style={{ border: "1px solid #e0dfff", padding: 12, textAlign: "left", color: "#5a3ac7", fontWeight: "600" }}>Gender</th>
                        <th style={{ border: "1px solid #e0dfff", padding: 12, textAlign: "left", color: "#5a3ac7", fontWeight: "600" }}>Address</th>
                        <th style={{ border: "1px solid #e0dfff", padding: 12, textAlign: "left", color: "#5a3ac7", fontWeight: "600" }}>Quota</th>
                        <th style={{ border: "1px solid #e0dfff", padding: 12, textAlign: "left", color: "#5a3ac7", fontWeight: "600" }}>Window Seat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservation.passengers?.map((p, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? "#ffffff" : "#faf8ff" }}>
                          <td style={{ border: "1px solid #e0dfff", padding: 12, color: "#5a3ac7" }}>{p.name}</td>
                          <td style={{ border: "1px solid #e0dfff", padding: 12, color: "#5a3ac7" }}>{p.age}</td>
                          <td style={{ border: "1px solid #e0dfff", padding: 12, color: "#5a3ac7" }}>{p.gender}</td>
                          <td style={{ border: "1px solid #e0dfff", padding: 12, color: "#5a3ac7" }}>{p.address}</td>
                          <td style={{ border: "1px solid #e0dfff", padding: 12, color: "#5a3ac7" }}>{p.quota}</td>
                          <td style={{ border: "1px solid #e0dfff", padding: 12 }}>
                            <span style={{ color: p.windowSeatPreferred ? "#28a745" : "#6c757d" }}>
                              {p.windowSeatPreferred ? <><i className="fas fa-check"></i> Yes</> : <><i className="fas fa-times"></i> No</>}
                            </span>
                          </td>
                        </tr>
                      )) || []}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ textAlign: "center", display: "flex", gap: 15, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                className="user-btn"
                style={{ 
                  padding: "14px 28px", 
                  fontSize: "1.1rem",
                  maxWidth: "280px",
                  flex: "1"
                }}
                onClick={downloadPDF}
              >
                <i className="fas fa-download"></i> Download Ticket PDF
              </button>
              
              <button
                className="book-btn"
                style={{ 
                  padding: "14px 28px", 
                  fontSize: "1.1rem",
                  maxWidth: "280px",
                  flex: "1"
                }}
                onClick={() => navigate('/dashboard')}
              >
                <i className="fas fa-home"></i> Back to Dashboard
              </button>
            </div>

            {/* Important Notes */}
            <div className="user-card" style={{
              background: "linear-gradient(135deg, #f7f5ff, #ede6fa)",
              border: "1px solid #e0dfff",
              padding: 20,
              marginTop: 25
            }}>
              <h5 className="card-title" style={{ marginBottom: 15 }}><i className="fas fa-info-circle"></i> Important Notes:</h5>
              <ul style={{ color: "#5a3ac7", margin: 0, paddingLeft: 20, fontWeight: "500" }}>
                <li>Please carry a valid ID proof during your journey</li>
                <li>Arrive at the station at least 30 minutes before departure</li>
                <li>Keep this ticket handy for verification</li>
                <li>For any queries, contact railway customer support</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentSuccess;
