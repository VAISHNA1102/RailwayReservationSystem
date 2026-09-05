import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import api, { cancelTicket, isCancellable } from "../../../api";
import CancellationModal from "./CancellationModal";
import { formatDate, formatDateTime } from "../../../utils/dateFormatter";
import "../Dashboard/CommonCssForUserDashboard.css";

function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellableTickets, setCancellableTickets] = useState({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      fetchBookingHistory(decoded.username || decoded.sub);
    } catch (err) {
      console.error("Invalid token:", err);
      navigate("/login");
    }
  }, [navigate]);

  const fetchBookingHistory = async (username) => {
    try {
      const response = await api.get(`/api/v1/reservations/user/${username}`);
      setBookings(response.data);
      
      // Check cancellability for confirmed tickets
      const cancellabilityChecks = {};
      for (const booking of response.data) {
        if (booking.reservationStatus === 'CONFIRMED') {
          try {
            const cancellableResponse = await isCancellable(booking.pnrNumber);
            cancellabilityChecks[booking.pnrNumber] = cancellableResponse.data;
          } catch (error) {
            cancellabilityChecks[booking.pnrNumber] = false;
          }
        }
      }
      setCancellableTickets(cancellabilityChecks);
      setError("");
    } catch (err) {
      console.error("Failed to fetch booking history:", err);
      setError("Failed to load booking history");
    } finally {
      setLoading(false);
    }
  };

  const downloadAllPDF = () => {
    const printContent = document.getElementById("booking-table").outerHTML;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Booking History</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #7f5af0; text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #7f5af0; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .status-confirmed { color: #28a745; font-weight: bold; }
            .status-pending { color: #ffc107; font-weight: bold; }
            .status-cancelled { color: #dc3545; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>All Your Booked Tickets</h1>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const downloadTicketPDF = (booking) => {
    if (!booking) {
      toast.error("No booking details to generate ticket.");
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
        ["PNR Number", booking.pnrNumber],
        ["Train Number", booking.trainNumber],
        ["Train Name", booking.trainName],
        ["Journey Date", booking.journeyDate],
        ["Class Type", booking.classType],
        ["Seats Booked", booking.numberOfSeats.toString()],
        ["Passenger Name", booking.username],
        ["Booking Status", booking.reservationStatus],
        ["Reservation Time", formatDateTime(booking.reservationTime)]
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
        ["Payment Status", "SUCCESS"],
        ["Payment Method", "CARD"],
        ["Total Amount", `₹${booking.totalFare.toFixed(2)}`],
        ["Payment Date", formatDateTime(booking.reservationTime)]
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
      body: booking.passengers?.map(p => [
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

    doc.save(`Railway_Ticket_${booking.pnrNumber}.pdf`);
    toast.success("Ticket downloaded successfully!");
  };

  const handleCancelTicket = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const handleConfirmCancellation = async (pnr, reason) => {
    try {
      const response = await cancelTicket(pnr, reason);
      toast.success(response.data.message);
      
      // Refresh booking history
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      fetchBookingHistory(decoded.username || decoded.sub);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to cancel ticket";
      toast.error(errorMessage);
      throw error;
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed": return "status-confirmed";
      case "pending": return "status-pending";
      case "cancelled": return "status-cancelled";
      default: return "";
    }
  };

  if (loading) {
    return (
      <div className="container mt-4" style={{ maxWidth: 1200 }}>
        <div className="user-card" style={{ textAlign: "center", padding: 40 }}>
          <div className="spinner-border" style={{ color: "#7f5af0" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading booking history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 1200 }}>
      <div className="user-card" style={{ background: "linear-gradient(120deg, #f7f3fd 60%, #e9e3fa 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 className="card-title">
            <i className="fas fa-ticket-alt"></i> All Your Booked Tickets
          </h3>
          {bookings.length > 0 && (
            <button
              className="user-btn"
              onClick={downloadAllPDF}
              style={{ width: "auto", padding: "10px 20px" }}
            >
              <i className="fas fa-download"></i> Download All PDF
            </button>
          )}
        </div>
        
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

        {bookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
            <i className="fas fa-ticket-alt" style={{ fontSize: 48, marginBottom: 20, color: "#ccc" }}></i>
            <p style={{ fontSize: 18, marginBottom: 10 }}>No bookings found</p>
            <p>You haven't made any reservations yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table id="booking-table" style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
              <thead>
                <tr style={{ backgroundColor: "#7f5af0", color: "white" }}>
                  <th style={{ padding: "12px", border: "1px solid #ddd" }}>PNR</th>
                  <th style={{ padding: "12px", border: "1px solid #ddd" }}>Train</th>
                  <th style={{ padding: "12px", border: "1px solid #ddd" }}>Class</th>
                  <th style={{ padding: "12px", border: "1px solid #ddd" }}>Journey Date</th>
                  <th style={{ padding: "12px", border: "1px solid #ddd" }}>Seats</th>
                  <th style={{ padding: "12px", border: "1px solid #ddd" }}>Fare</th>
                  <th style={{ padding: "12px", border: "1px solid #ddd" }}>Status</th>
                  <th style={{ padding: "12px", border: "1px solid #ddd" }}>Booked On</th>
                  <th style={{ padding: "12px", border: "1px solid #ddd" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => (
                  <tr key={booking.reservationId} style={{ backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white" }}>
                    <td style={{ padding: "12px", border: "1px solid #ddd", fontWeight: "bold" }}>
                      {booking.pnrNumber}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      {booking.trainNumber} - {booking.trainName}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      {booking.classType}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      {formatDate(booking.journeyDate)}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      {booking.numberOfSeats}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      ₹{booking.totalFare}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      <span className={getStatusClass(booking.reservationStatus)}>
                        {booking.reservationStatus}
                      </span>
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      {formatDate(booking.reservationTime)}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button
                          className="user-btn"
                          onClick={() => downloadTicketPDF(booking)}
                          style={{ 
                            width: "auto", 
                            padding: "6px 10px", 
                            fontSize: "11px",
                            background: "linear-gradient(135deg, #28a745, #20c997)"
                          }}
                        >
                          <i className="fas fa-download"></i> PDF
                        </button>
                        
                        {booking.reservationStatus === 'CONFIRMED' && cancellableTickets[booking.pnrNumber] ? (
                          <button
                            className="user-btn"
                            onClick={() => handleCancelTicket(booking)}
                            style={{ 
                              width: "auto", 
                              padding: "6px 10px", 
                              fontSize: "11px",
                              background: "linear-gradient(135deg, #dc3545, #c82333)"
                            }}
                          >
                            <i className="fas fa-times"></i> Cancel
                          </button>
                        ) : booking.reservationStatus === 'CONFIRMED' ? (
                          <span style={{color: 'red', fontSize: '10px', textAlign: 'center'}}>
                            Cannot Cancel<br/>(Less than 24hrs)
                          </span>
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <CancellationModal
          booking={selectedBooking}
          isOpen={showCancelModal}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedBooking(null);
          }}
          onConfirm={handleConfirmCancellation}
        />
      </div>
    </div>
  );
}

export default BookingHistory;