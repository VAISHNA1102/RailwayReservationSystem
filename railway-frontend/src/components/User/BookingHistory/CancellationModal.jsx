import React, { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { formatDate } from "../../../utils/dateFormatter";

function CancellationModal({ booking, isOpen, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    console.log('Starting cancellation for PNR:', booking.pnrNumber, 'with reason:', reason || 'No reason provided');
    setLoading(true);
    try {
      console.log('Calling onConfirm function...');
      await onConfirm(booking.pnrNumber, reason || 'No reason provided');
      console.log('Cancellation successful');
      setReason("");
      onClose();
    } catch (error) {
      console.error("Cancellation failed:", error);
      toast.error(error.response?.data?.message || "Failed to cancel ticket");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1050
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "24px",
        maxWidth: "500px",
        width: "90%",
        maxHeight: "80vh",
        overflowY: "auto"
      }}>
        <h4 style={{ marginBottom: "20px", color: "#7f5af0" }}>
          <i className="fas fa-times-circle"></i> Cancel Ticket
        </h4>
        
        <div style={{ marginBottom: "20px", padding: "16px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
          <h6>Ticket Details:</h6>
          <p><strong>PNR:</strong> {booking.pnrNumber}</p>
          <p><strong>Train:</strong> {booking.trainNumber} - {booking.trainName}</p>
          <p><strong>Journey Date:</strong> {formatDate(booking.journeyDate)}</p>
          <p><strong>Refund Amount:</strong> ₹{booking.totalFare} (100%)</p>
        </div>

        <div style={{ marginBottom: "20px", padding: "12px", backgroundColor: "#d4edda", borderRadius: "8px", border: "1px solid #c3e6cb" }}>
          <small style={{ color: "#155724" }}>
            <i className="fas fa-info-circle"></i> 
            <strong> Cancellation Policy:</strong> 100% refund for cancellations made more than 24 hours before journey.
          </small>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
            Reason for Cancellation:
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional: Provide a reason for cancellation..."
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              resize: "vertical",
              minHeight: "80px"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "10px 20px",
              border: "1px solid #ddd",
              backgroundColor: "white",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              padding: "10px 20px",
              border: "none",
              backgroundColor: loading ? "#ccc" : "#dc3545",
              color: "white",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Processing..." : "Confirm Cancellation"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default CancellationModal;