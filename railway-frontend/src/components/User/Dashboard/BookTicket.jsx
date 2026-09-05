import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jwtDecode from "jwt-decode";
import { MdTrain, MdEventSeat, MdSchedule, MdPerson, MdWarning, MdAdd, MdDelete } from "react-icons/md";
import { formatDate } from "../../../utils/dateFormatter";
import './CommonCssForUserDashboard.css';
import './BookTicket.css';

function BookTicket() {
  const { trainId } = useParams();
  const navigate = useNavigate();

  const [train, setTrain] = useState(null);
  const [journeyDate, setJourneyDate] = useState(null);
  const [selectedClass, setSelectedClass] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [dateSpecificAvailability, setDateSpecificAvailability] = useState({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [passengers, setPassengers] = useState([{
    name: "",
    age: "",
    gender: "Male",
    address: "",
    windowSeatPreferred: false,
    quota: "General"
  }]);
  const [message, setMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    (async () => {
      try {
        const res = await api.get(`/api/v1/trains/getTrainById/${trainId}`);
        setTrain(res.data);
      } catch (err) {
        setMessage("Failed to load train details: " + (err.response?.data?.message || err.message));
      }
    })();
  }, [trainId, navigate]);

  const dayMap = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
  const isDateSelectable = (date) => {
    if (!train?.runningDays || train.runningDays.length === 0) return false;
    
    const now = new Date();
    const dayNum = date.getDay();
    const runningDaysNums = train.runningDays.map(d => dayMap[d]);
    
    // Check if date is in the future or today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    // If date is in the past, not selectable
    if (selectedDate < today) return false;
    
    // If date is today, check if train has already departed
    if (selectedDate.getTime() === today.getTime()) {
      if (train.departureTime) {
        const trainDepartureTime = new Date(train.departureTime);
        const todayDepartureTime = new Date();
        todayDepartureTime.setHours(trainDepartureTime.getHours(), trainDepartureTime.getMinutes(), 0, 0);
        
        // If current time is past departure time, not selectable
        if (now >= todayDepartureTime) {
          return false;
        }
      }
    }
    
    return runningDaysNums.includes(dayNum);
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };



  const fetchDateSpecificAvailability = async (selectedDate) => {
    if (!selectedDate || !train) return;
    
    setLoadingAvailability(true);
    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      console.log(`Fetching availability for train ${train.trainId} on date ${dateStr}`);
      const response = await api.get(`/api/v1/reservations/availability/${train.trainId}/${dateStr}`);
      console.log('Availability response:', response.data);
      setDateSpecificAvailability(response.data);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
      setDateSpecificAvailability({});
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Fetch availability when journey date changes
  useEffect(() => {
    if (journeyDate && train) {
      fetchDateSpecificAvailability(journeyDate);
    }
  }, [journeyDate, train]);

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    if (field === "age") {
      updated[index][field] = value === "" ? "" : Number(value);
    } else {
      updated[index][field] = value;
    }
    setPassengers(updated);
    setValidationErrors({});
  };

  const addPassenger = () => {
    if (passengers.length >= 6) {
      setMessage("Maximum 6 passengers allowed per booking");
      return;
    }
    setPassengers([...passengers, {
      name: "",
      age: "",
      gender: "Male",
      address: "",
      windowSeatPreferred: false,
      quota: "General"
    }]);
  };

  const removePassenger = (index) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    }
  };

  const validateBooking = () => {
    const errors = {};
    
    if (!journeyDate) {
      setMessage("Please select journey date");
      return false;
    }
    
    // Additional validation for train departure time
    if (journeyDate && train?.departureTime) {
      const now = new Date();
      const selectedDate = new Date(journeyDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate.getTime() === today.getTime()) {
        const trainDepartureTime = new Date(train.departureTime);
        const todayDepartureTime = new Date();
        todayDepartureTime.setHours(trainDepartureTime.getHours(), trainDepartureTime.getMinutes(), 0, 0);
        
        if (now >= todayDepartureTime) {
          setMessage(`Cannot book ticket. Train has already departed at ${formatTime(train.departureTime)}`);
          return false;
        }
        
        // Check if booking is too close to departure (30 minutes buffer)
        const cutoffTime = new Date(todayDepartureTime.getTime() - 30 * 60 * 1000);
        if (now >= cutoffTime) {
          setMessage(`Booking closed. Tickets must be booked at least 30 minutes before departure (${formatTime(train.departureTime)})`);
          return false;
        }
      }
    }
    
    if (!selectedClass) {
      setMessage("Please select a class");
      return false;
    }

    passengers.forEach((p, index) => {
      if (!p.name.trim()) {
        errors[`passenger_${index}_name`] = "Name is required";
      }
      if (!p.age || p.age < 1) {
        errors[`passenger_${index}_age`] = "Valid age is required";
      }
      if (!p.address.trim()) {
        errors[`passenger_${index}_address`] = "Address is required";
      }
      if (p.quota === "Ladies" && p.gender !== "Female") {
        errors[`passenger_${index}_gender`] = "Ladies quota requires Female gender";
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateBooking()) {
      setMessage("Please fix the validation errors");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Authentication error: Please login again");
      return;
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      setMessage("Invalid token: Please login again");
      return;
    }

    const username = decoded.username || decoded.sub;

    try {
      setMessage("Processing booking...");
      
      // Fix date conversion to ensure correct date is sent
      const year = journeyDate.getFullYear();
      const month = String(journeyDate.getMonth() + 1).padStart(2, '0');
      const day = String(journeyDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      const request = {
        userName: username,
        trainNumber: train.trainNumber,
        trainType: train.trainType,
        classType: selectedClass,
        journeyDate: dateString,
        passengers: passengers
      };
      
      console.log('DEBUG: Booking request:', {
        originalSelectedDate: journeyDate,
        correctedJourneyDate: request.journeyDate,
        passengersCount: passengers.length,
        passengers: passengers.map(p => p.name)
      });

      const res = await api.post("/api/v1/reservations/addReservation", request);
      
      setMessage(`Booking successful! PNR: ${res.data.pnrNumber}. Redirecting to payment...`);
      
      const paymentRes = await api.post(
        `/api/v1/payments/initiate/${res.data.pnrNumber}?paymentMethod=${encodeURIComponent(paymentMethod)}`,
        {}
      );

      if (paymentRes.data?.sessionUrl) {
        localStorage.setItem("latestPnr", res.data.pnrNumber);
        localStorage.setItem("totalBookingAmount", res.data.totalFare);
        localStorage.setItem("paymentMethod", paymentMethod);
        window.location.href = paymentRes.data.sessionUrl;
      } else {
        setMessage("Payment initiation failed");
      }
    } catch (err) {
      console.error('Booking error:', err);
      const errorMessage = err.response?.data?.message || err.response?.data || err.message || 'Unknown error occurred';
      setMessage("Booking failed: " + errorMessage);
    }
  };

  const getSelectedClassPrice = () => {
    const classInfo = train?.trainClasses?.find(cls => cls.classType === selectedClass);
    return classInfo?.price || 0;
  };

  const getTotalAmount = () => {
    return passengers.length * getSelectedClassPrice();
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 1000 }}>
      {/* Train Details */}
      <div className="user-card mb-4">
        <h3 className="card-title mb-3">
          <MdTrain size={28} className="me-2 text-gradient" />
          Book Ticket
        </h3>
        
        {train ? (
          <>
            <div className="row mb-3">
              <div className="col-12">
                <h5 className="mb-2">
                  {train.trainName} <span className="text-muted">({train.trainNumber})</span>
                </h5>
                <p className="mb-2">
                  <strong>Route:</strong> {train.source} → {train.destination}
                </p>
                <p className="mb-2">
                  <MdSchedule className="me-1" />
                  <strong>Timing:</strong> Departs {formatTime(train.departureTime)} | Arrives {formatTime(train.arrivalTime)}
                  {(() => {
                    const now = new Date();
                    const trainDepartureTime = new Date(train.departureTime);
                    const todayDepartureTime = new Date();
                    todayDepartureTime.setHours(trainDepartureTime.getHours(), trainDepartureTime.getMinutes(), 0, 0);
                    
                    if (now >= todayDepartureTime) {
                      return (
                        <span className="badge bg-danger ms-2">
                          Departed Today
                        </span>
                      );
                    }
                    
                    const cutoffTime = new Date(todayDepartureTime.getTime() - 30 * 60 * 1000);
                    if (now >= cutoffTime && now < todayDepartureTime) {
                      return (
                        <span className="badge bg-warning ms-2">
                          Booking Closed for Today
                        </span>
                      );
                    }
                    
                    return null;
                  })()}
                </p>
                <p className="mb-0">
                  <strong>Running Days:</strong> {train.runningDays?.join(", ") || "Not specified"}
                </p>
              </div>
            </div>

            {/* Journey Date */}
            <div className="row g-3 mb-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label fw-semibold">Journey Date *</label>
              </div>
              <div className="col-md-3">
                <DatePicker
                  selected={journeyDate}
                  onChange={setJourneyDate}
                  filterDate={isDateSelectable}
                  minDate={new Date()}
                  className="user-form-control"
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select journey date"
                />
              </div>
            </div>
            
            {/* Class Selection */}
            <div className="row g-3 mb-2 align-items-end">
              <div className="col-md-3">
                <label className="form-label fw-semibold">Select Class *</label>
              </div>
              <div className="col-md-3">
                <select
                  className="user-form-control"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">Choose class</option>
                  {train.trainClasses?.map((cls) => {
                    const dateSpecificSeats = dateSpecificAvailability[cls.classType];
                    const availableSeats = dateSpecificSeats !== undefined ? dateSpecificSeats : cls.availableSeats;
                    const isLoading = loadingAvailability && journeyDate;
                    
                    return (
                      <option key={cls.classId} value={cls.classType}>
                        {cls.classType} - ₹{cls.price} 
                        {isLoading ? ' (Loading...)' : ` (${availableSeats} seats available${journeyDate ? ' on selected date' : ''})`}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            {journeyDate && Object.keys(dateSpecificAvailability).length > 0 && (
              <div className="row mb-4">
                <div className="col-md-6 offset-md-3">
                  <small className="text-muted">
                    ✓ Showing availability for {formatDate(journeyDate)}
                  </small>
                </div>
              </div>
            )}
            
            {/* Date-specific availability info */}
            {journeyDate && Object.keys(dateSpecificAvailability).length > 0 && (
              <div className="alert alert-info">
                <h6 className="mb-2">📅 Seat Availability for {formatDate(journeyDate)}:</h6>
                <div className="row">
                  {Object.entries(dateSpecificAvailability).map(([classType, seats]) => (
                    <div key={classType} className="col-md-4 mb-2">
                      <strong>{classType}:</strong> {seats} seats available
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="row g-3 mb-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label fw-semibold">Payment Method *</label>
              </div>
              <div className="col-md-3">
                <select
                  className="user-form-control"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="UPI">UPI</option>
                  <option value="CARD">Card</option>
                  <option value="NET_BANKING">Net Banking</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>
            </div>
          </>
        ) : (
          <p>{message || "Loading train details..."}</p>
        )}
      </div>

      {/* Passenger Details */}
      {selectedClass && (
        <div className="user-card mb-4">
          <h5 className="card-title mb-4">
            <MdPerson size={24} className="me-2 text-gradient" />
            Passenger Details ({passengers.length} passengers)
          </h5>
          
          {passengers.map((passenger, index) => (
            <div key={index} className="border rounded p-3 mb-3" style={{ backgroundColor: '#f8f9fa' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Passenger {index + 1}</h6>
                {passengers.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removePassenger(index)}
                  >
                    <MdDelete size={16} /> Remove
                  </button>
                )}
              </div>
              
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    className={`user-form-control ${validationErrors[`passenger_${index}_name`] ? 'is-invalid' : ''}`}
                    placeholder="Enter full name"
                    value={passenger.name}
                    onChange={(e) => handlePassengerChange(index, "name", e.target.value)}
                  />
                  {validationErrors[`passenger_${index}_name`] && (
                    <div className="invalid-feedback">{validationErrors[`passenger_${index}_name`]}</div>
                  )}
                </div>
                
                <div className="col-md-3">
                  <label className="form-label">Age *</label>
                  <input
                    type="number"
                    className={`user-form-control ${validationErrors[`passenger_${index}_age`] ? 'is-invalid' : ''}`}
                    placeholder="Age"
                    min="1"
                    max="120"
                    value={passenger.age}
                    onChange={(e) => handlePassengerChange(index, "age", e.target.value)}
                  />
                  {validationErrors[`passenger_${index}_age`] && (
                    <div className="invalid-feedback">{validationErrors[`passenger_${index}_age`]}</div>
                  )}
                </div>
                
                <div className="col-md-3">
                  <label className="form-label">Gender *</label>
                  <select
                    className={`user-form-control ${validationErrors[`passenger_${index}_gender`] ? 'is-invalid' : ''}`}
                    value={passenger.gender}
                    onChange={(e) => handlePassengerChange(index, "gender", e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {validationErrors[`passenger_${index}_gender`] && (
                    <div className="invalid-feedback">{validationErrors[`passenger_${index}_gender`]}</div>
                  )}
                </div>
                
                <div className="col-md-8">
                  <label className="form-label">Address *</label>
                  <input
                    type="text"
                    className={`user-form-control ${validationErrors[`passenger_${index}_address`] ? 'is-invalid' : ''}`}
                    placeholder="Enter complete address"
                    value={passenger.address}
                    onChange={(e) => handlePassengerChange(index, "address", e.target.value)}
                  />
                  {validationErrors[`passenger_${index}_address`] && (
                    <div className="invalid-feedback">{validationErrors[`passenger_${index}_address`]}</div>
                  )}
                </div>
                
                <div className="col-md-4">
                  <label className="form-label">Quota *</label>
                  <select
                    className="user-form-control"
                    value={passenger.quota}
                    onChange={(e) => handlePassengerChange(index, "quota", e.target.value)}
                  >
                    <option value="General">General</option>
                    <option value="Ladies">Ladies</option>
                  </select>
                </div>
                
                <div className="col-12">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`window_${index}`}
                      checked={passenger.windowSeatPreferred}
                      onChange={(e) => handlePassengerChange(index, "windowSeatPreferred", e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor={`window_${index}`}>
                      Prefer window seat (subject to availability)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            className="btn btn-outline-primary mb-3"
            onClick={addPassenger}
            disabled={passengers.length >= 6}
          >
            <MdAdd className="me-1" /> Add Passenger
          </button>

          <div className="border-top pt-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6>Booking Summary:</h6>
                <p className="mb-0">
                  {selectedClass} Class: {passengers.length} × ₹{getSelectedClassPrice()} = ₹{getTotalAmount()}
                </p>
              </div>
              
              <div className="text-end">
                <div className="mb-2">
                  <strong>Total Amount: ₹{getTotalAmount()}</strong>
                  <br />
                  <small className="text-muted">{passengers.length} passengers</small>
                </div>
                <button
                  type="button"
                  className="btn btn-success btn-lg"
                  onClick={handleSubmit}
                  disabled={!journeyDate || !selectedClass || passengers.length === 0}
                >
                  <MdEventSeat className="me-2" />
                  Book Tickets
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {message && (
        <div className={`alert ${message.includes('successful') ? 'alert-success' : message.includes('failed') || message.includes('error') ? 'alert-danger' : 'alert-info'}`}>
          {message.includes('error') || message.includes('failed') ? (
            <MdWarning className="me-2" />
          ) : null}
          {message}
        </div>
      )}
    </div>
  );
}

export default BookTicket;
