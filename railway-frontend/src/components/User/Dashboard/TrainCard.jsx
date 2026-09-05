import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MdTrain,
  MdEventSeat,
  MdSchedule,
  MdAttachMoney,
  MdWarning,
  MdAirlineSeatReclineNormal,
} from "react-icons/md";
import "./CommonCssForUserDashboard.css";

function TrainCard({ train }) {
  const navigate = useNavigate();

  const formatTime = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const hasClasses = train.trainClasses && train.trainClasses.length > 0;

  const handleBook = () => {
    if (!hasClasses) return;

    const token = localStorage.getItem("token");
    if (!token) {
      const proceed = confirm(
        "You must register/login to book a ticket.\n\nPress OK to go to Login."
      );
      if (proceed) {
        localStorage.setItem("postLoginRedirect", "/book/" + train.trainId);
        navigate("/login");
      }
      return;
    }
    navigate(`/book/${train.trainId}`);
  };

  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        {/* Header */}
        <h5 className="card-title">
          <MdTrain size={24} className="me-2 text-gradient" />
          {train.trainName} ({train.trainNumber})
        </h5>

        {/* Details */}
        <p className="card-text">
          <strong>From:</strong> {train.source} → <strong>To:</strong>{" "}
          {train.destination} <br />
          <MdSchedule className="me-1" /> <strong>Departs:</strong>{" "}
          {formatTime(train.departureTime)} | <strong>Arrives:</strong>{" "}
          {formatTime(train.arrivalTime)} <br />
          <strong>Days:</strong>{" "}
          {train.runningDays && train.runningDays.length > 0
            ? train.runningDays.join(", ")
            : "Not specified"}{" "}
          | <strong>Type:</strong> {train.trainType} <br />
          <strong>Availability:</strong>{" "}
          {train.availability ? (
            <span style={{ color: "green" }}>Available</span>
          ) : (
            <span style={{ color: "red" }}>Not Available</span>
          )}
        </p>

        {/* Classes */}
        {train.trainClasses && train.trainClasses.length > 0 && (
          <div className="mb-3">
            <strong>
              <MdEventSeat className="me-1" /> Available Classes:
            </strong>
            <ul className="mb-2">
              {train.trainClasses.map((cls) => (
                <li key={cls.classId}>
                  <MdAirlineSeatReclineNormal className="me-1" />
                  <strong>{cls.classType}</strong> — ₹{cls.price} — Quota:{" "}
                  {cls.quota}
                </li>
              ))}
            </ul>
            <small className="text-muted">
              <i className="fas fa-info-circle me-1"></i>
              Seat availability will be shown when you select your travel date
            </small>
          </div>
        )}

        {/* Book Button */}
        <button
          className="btn btn-success w-100"
          onClick={handleBook}
          disabled={!hasClasses || !train.availability}
        >
          <MdEventSeat className="me-1" size={20} />
          Check Availability & Book
        </button>

        {!hasClasses && (
          <div className="text-danger mt-2 text-center fw-bold">
            <MdWarning className="me-1" /> No classes configured for this train
          </div>
        )}
      </div>
    </div>
  );
}

export default TrainCard;
