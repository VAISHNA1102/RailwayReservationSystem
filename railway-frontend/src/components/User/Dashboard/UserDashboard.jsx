

import React, { useState } from "react";
import { Button, TextField, Tabs, Tab, Box } from "@mui/material";
import {
  MdTrain,
  MdReceipt,
  MdEventSeat,
  MdDownload,
  MdErrorOutline,
  MdAccessTime,
} from "react-icons/md";
import api from "../../../api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import TrainSearch from "./TrainSearch";
import HeroSection from "./HeroSection";
import BookingHistory from "../BookingHistory/BookingHistory";
import "./CommonCssForUserDashboard.css";

function UserDashboard() {
  const [tab, setTab] = useState("trains");
  const [pnr, setPnr] = useState("");
  const [reservation, setReservation] = useState(null);
  const [trainTime, setTrainTime] = useState({ departureTime: "-", arrivalTime: "-" });
  const [paymentStatus, setPaymentStatus] = useState("-");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchReservation = async () => {
    if (!pnr.trim()) {
      setError("Please enter a PNR number.");
      return;
    }
    setLoading(true);
    setError("");
    setReservation(null);
    setPaymentStatus("-");
    setTrainTime({ departureTime: "-", arrivalTime: "-" });

    try {
      const response = await api.get(`/api/v1/reservations/getReservationByPNR/${pnr}`);
      const res = response.data;
      setReservation(res);

      if (res.reservationId) {
        try {
          const payRes = await api.get(`/api/v1/payments/count`);
          const payment = Array.isArray(payRes.data)
            ? payRes.data.find((p) => p.reservationId === res.reservationId)
            : null;
          setPaymentStatus(payment ? payment.paymentStatus : "PENDING");
        } catch {
          setPaymentStatus("-");
        }
      }

      if (!res.departureTime || !res.arrivalTime) {
        try {
          const trainRes = await api.get(`/api/v1/trains/getTrainByNumber/${res.trainNumber}`);
          setTrainTime({
            departureTime: trainRes.data.departureTime?.slice(0, 5) || "-",
            arrivalTime: trainRes.data.arrivalTime?.slice(0, 5) || "-",
          });
        } catch {
          setTrainTime({ departureTime: "-", arrivalTime: "-" });
        }
      } else {
        setTrainTime({
          departureTime: res.departureTime?.slice(0, 5) || "-",
          arrivalTime: res.arrivalTime?.slice(0, 5) || "-",
        });
      }
    } catch (err) {
      setError("Invalid PNR or no reservation found.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!reservation) return;
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("RAILWAY TICKET", 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 150, 0);
    doc.text("CONFIRMED - BOOKING SUCCESSFUL", 14, 30);
    
    // Reservation Details
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text("Reservation Details:", 14, 45);
    
    autoTable(doc, {
      startY: 50,
      head: [["Field", "Value"]],
      body: [
        ["PNR Number", reservation.pnrNumber || "-"],
        ["Train Number", reservation.trainNumber || "-"],
        ["Train Name", reservation.trainName || "-"],
        ["Journey Date", reservation.journeyDate || "-"],
        ["Class Type", reservation.classType || "-"],
        ["Seats Booked", (reservation.numberOfSeats || "-").toString()],
        ["Passenger Name", reservation.username || "-"],
        ["Booking Status", reservation.reservationStatus || "-"],
        ["Total Fare", reservation.totalFare ? `₹${reservation.totalFare.toFixed(2)}` : "-"],
        ["Reservation Time", reservation.reservationTime ? new Date(reservation.reservationTime).toLocaleString() : "-"]
      ],
      theme: 'grid',
      headStyles: { fillColor: [127, 90, 240] },
      styles: { fontSize: 10 }
    });

    // Passenger Details
    doc.setFontSize(14);
    doc.text("Passenger Details:", 14, doc.lastAutoTable.finalY + 15);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Name", "Age", "Gender", "Address", "Quota", "Window Seat"]],
      body: (reservation.passengers || []).map(p => [
        p.name || "-",
        (p.age || "-").toString(),
        p.gender || "-",
        p.address || "-",
        p.quota || "-",
        p.windowSeatPreferred ? "Yes" : "No"
      ]),
      theme: 'grid',
      headStyles: { fillColor: [155, 89, 182] },
      styles: { fontSize: 9 }
    });
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Thank you for choosing our railway service!", 14, doc.lastAutoTable.finalY + 15);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, doc.lastAutoTable.finalY + 25);

    doc.save(`Railway_Ticket_${reservation.pnrNumber || "PNR"}.pdf`);
  };

  return (
    <>
      <HeroSection />
      <div className="container mt-4">
        <Box sx={{ borderBottom: 1, borderColor: "#5a3ac7" }}>
          <Tabs
            value={tab}
            onChange={(e, val) => setTab(val)}
            aria-label="dashboard tabs"
            textColor="inherit"
            TabIndicatorProps={{ style: { background: "#5a3ac7" } }}
          >
            <Tab
              icon={<MdTrain style={{ color: "#5a3ac7" }} />}
              label="Available Trains"
              value="trains"
              sx={{ fontWeight: 600, color: "#5a3ac7", "&.Mui-selected": { color: "#7f5af0" } }}
            />
            <Tab
              icon={<MdReceipt style={{ color: "#5a3ac7" }} />}
              label="View Ticket"
              value="ticket"
              sx={{ fontWeight: 600, color: "#5a3ac7", "&.Mui-selected": { color: "#7f5af0" } }}
            />
            <Tab
              icon={<MdEventSeat style={{ color: "#5a3ac7" }} />}
              label="View Bookings"
              value="bookings"
              sx={{ fontWeight: 600, color: "#5a3ac7", "&.Mui-selected": { color: "#7f5af0" } }}
            />
          </Tabs>
        </Box>

        {tab === "trains" && (
          <Box mt={4}>
            <h2 className="text-center mb-4" style={{ color: "#5a3ac7" }}>
              <MdTrain className="me-2" /> Available Trains
            </h2>
            <TrainSearch />
          </Box>
        )}

        {tab === "ticket" && (
          <Box mt={4}>
            <div className="user-card" style={{ background: "linear-gradient(120deg, #f7f3fd 60%, #e9e3fa 100%)" }}>
              <h3 className="card-title"><i className="fas fa-search"></i> View Ticket</h3>
              <div className="row g-3 mb-3">
                <div className="col-md-8">
                  <input
                    type="text"
                    className="user-form-control"
                    placeholder="Enter PNR Number"
                    value={pnr}
                    onChange={(e) => setPnr(e.target.value)}
                    disabled={loading}
                    style={{ width: "100%" }}
                  />
                </div>
                <div className="col-md-4">
                  <button
                    className="user-btn"
                    onClick={fetchReservation}
                    disabled={loading}
                    style={{ width: "100%" }}
                  >
                    <i className="fas fa-ticket-alt"></i> {loading ? "Loading..." : "View Ticket"}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{
                  background: "linear-gradient(135deg, #e74c3c, #c0392b)",
                  color: "white",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  marginTop: "15px",
                  fontWeight: "500"
                }}>
                  <i className="fas fa-exclamation-triangle"></i> {error}
                </div>
              )}

            </div>
            
            {reservation && (
              <div className="user-card" style={{
                border: "3px dashed #7f5af0",
                background: "rgba(255, 255, 255, 0.95)",
                marginTop: "20px"
              }}>
                <h4 className="card-title" style={{ textAlign: "center", fontSize: "1.8rem", marginBottom: 25 }}>
                  <i className="fas fa-ticket-alt"></i> RAILWAY TICKET
                </h4>
                
                {/* Status Banner */}
                <div className="user-status-confirmed" style={{
                  padding: 15,
                  borderRadius: 12,
                  textAlign: "center",
                  marginBottom: 25,
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  boxShadow: "0 4px 12px rgba(127, 90, 240, 0.2)"
                }}>
                  <i className="fas fa-check-circle"></i> BOOKING CONFIRMED
                </div>

                {/* Journey Details */}
                <div style={{ marginBottom: 25 }}>
                  <h5 className="card-title" style={{ borderBottom: "2px solid #e0dfff", paddingBottom: 8, marginBottom: 15 }}>
                    <i className="fas fa-train"></i> Journey Details
                  </h5>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 15 }}>
                    <div><strong>PNR Number:</strong> <span style={{ color: "#7f5af0", fontSize: "1.1rem", fontWeight: "bold" }}>{reservation.pnrNumber}</span></div>
                    <div><strong>Train:</strong> {reservation.trainName} ({reservation.trainNumber})</div>
                    <div><strong>Journey Date:</strong> {reservation.journeyDate}</div>
                    <div><strong>Class:</strong> {reservation.classType}</div>
                    <div><strong>Seats Booked:</strong> {reservation.numberOfSeats}</div>
                    <div><strong>Booking Status:</strong> <span className="user-status-confirmed" style={{ padding: "4px 8px", borderRadius: "8px", fontSize: "0.9rem" }}>{reservation.reservationStatus}</span></div>
                    <div><strong>Passenger Name:</strong> {reservation.username}</div>
                    <div><strong>Total Fare:</strong> ₹{reservation.totalFare?.toFixed(2) || "-"}</div>
                    <div><strong>Booked On:</strong> {new Date(reservation.reservationTime).toLocaleString()}</div>
                  </div>
                </div>

                {/* Passenger Details */}
                <div style={{ marginBottom: 25 }}>
                  <h5 className="card-title" style={{ borderBottom: "2px solid #e0dfff", paddingBottom: 8, marginBottom: 15 }}>
                    <i className="fas fa-users"></i> Passenger Details
                  </h5>
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
                        {(reservation.passengers || []).map((p, idx) => (
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Download Button */}
                <div style={{ textAlign: "center" }}>
                  <button
                    className="user-btn"
                    onClick={handleDownload}
                    style={{ padding: "14px 28px", fontSize: "1.1rem", maxWidth: "280px" }}
                  >
                    <i className="fas fa-download"></i> Download Ticket PDF
                  </button>
                </div>
              </div>
            )}
          </Box>
        )}

        {tab === "bookings" && (
          <Box mt={4}>
            <BookingHistory />
          </Box>
        )}
      </div>
    </>
  );
}

export default UserDashboard;
