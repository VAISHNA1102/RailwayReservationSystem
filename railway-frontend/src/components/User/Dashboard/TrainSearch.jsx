
// 📁 src/components/User/Dashboard/TrainSearch.jsx

import React, { useState, useEffect } from "react";
import {
  MdTrain,
  MdRefresh,
  MdSearch,
  MdList,
} from "react-icons/md"; // Material Icons
import "./CommonCssForUserDashboard.css";
import TrainCard from "./TrainCard";
import {
  getAllTrains,
  getTrainByNumber,
  getAllTrainsByName,
  searchBySourceAndDestination,
} from "../../../services/trainService";

function TrainSearch() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [trainType, setTrainType] = useState("");
  const [trainNumber, setTrainNumber] = useState("");
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllTrains = async () => {
    setLoading(true);
    try {
      const data = await getAllTrains();
      setTrains(data);
    } catch (error) {
      console.error("Failed to fetch trains", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainByNumber = async () => {
    if (!trainNumber.trim()) return;
    setLoading(true);
    try {
      const data = await getTrainByNumber(trainNumber.trim());
      setTrains(data ? [data] : []);
    } catch (error) {
      console.error("Train not found", error);
      setTrains([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainByName = async (searchTerm = trainType) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      // Get all trains and filter by partial name match
      const allTrains = await getAllTrains();
      const filteredTrains = allTrains.filter(train => 
        train.trainName.toLowerCase().includes(searchTerm.toLowerCase().trim())
      );
      setTrains(filteredTrains);
    } catch (error) {
      console.error("Train search failed", error);
      setTrains([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBySourceDestination = async () => {
    if (!source.trim() || !destination.trim()) return;
    setLoading(true);
    try {
      const data = await searchBySourceAndDestination(source, destination);
      setTrains(data);
    } catch (error) {
      console.error("Search failed", error);
      setTrains([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCombinedSearch = async () => {
    if (trainNumber.trim()) {
      await fetchTrainByNumber();
    } else if (trainType.trim()) {
      await fetchTrainByName();
    }
  };

  // Dynamic search as user types
  const handleTrainNameChange = (e) => {
    const value = e.target.value;
    setTrainType(value);
    
    // Debounce search - only search if user has typed at least 2 characters
    if (value.trim().length >= 2) {
      // Clear previous timeout
      if (window.trainSearchTimeout) {
        clearTimeout(window.trainSearchTimeout);
      }
      
      // Set new timeout for dynamic search
      window.trainSearchTimeout = setTimeout(() => {
        fetchTrainByName(value);
      }, 500); // 500ms delay
    } else if (value.trim().length === 0) {
      // If input is cleared, show all trains
      fetchAllTrains();
    }
  };

  useEffect(() => {
    if (localStorage.getItem("bookingJustCompleted") === "true") {
      fetchAllTrains();
      localStorage.removeItem("bookingJustCompleted");
    } else {
      fetchAllTrains();
    }
  }, []);

  const filteredTrains = trains;

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="user-card mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <h3 className="card-title mb-0">
            <MdTrain size={28} className="me-2 text-gradient" />
            Search Trains
          </h3>
          <button
            onClick={fetchAllTrains}
            className="refresh-btn"
            style={{ width: "auto", padding: "8px 16px" }}
          >
            <MdRefresh size={20} className="me-1" />
            Refresh
          </button>
        </div>
      </div>

      {/* Search Filters */}
      <div className="user-card mb-4">
        <h5 className="card-title mb-4">
          <MdSearch size={20} className="me-2 text-gradient" />
          Search Filters
        </h5>

        {/* Source / Destination */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <label className="form-label fw-semibold text-muted mb-1">
              Source Station
            </label>
            <input
              type="text"
              className="user-form-control"
              placeholder="Enter source station"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold text-muted mb-1">
              Destination Station
            </label>
            <input
              type="text"
              className="user-form-control"
              placeholder="Enter destination station"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <button
              onClick={fetchBySourceDestination}
              className="find-btn w-100"
              disabled={!source.trim() || !destination.trim()}
            >
              <MdSearch size={18} className="me-1" /> Search
            </button>
          </div>
        </div>

        {/* Search By Train Number and Name */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <label className="form-label fw-semibold text-muted mb-1">
              Search By Train Number
            </label>
            <input
              type="text"
              className="user-form-control"
              placeholder="Enter train number"
              value={trainNumber}
              onChange={(e) => setTrainNumber(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold text-muted mb-1">
              Search By Train Name
            </label>
            <input
              type="text"
              className="user-form-control"
              placeholder="Enter train name"
              value={trainType}
              onChange={handleTrainNameChange}
            />
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <button
              onClick={handleCombinedSearch}
              className="find-btn w-100"
              disabled={!trainNumber.trim() && !trainType.trim()}
            >
              <MdSearch size={18} className="me-1" /> Search
            </button>
          </div>
        </div>

        {/* Show All */}
        <div className="row">
          <div className="col-12 text-center">
            <button onClick={fetchAllTrains} className="refresh-btn">
              <MdRefresh size={18} className="me-1" /> Show All Trains
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="user-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">
            <MdList size={20} className="me-2 text-gradient" />
            Search Results
            {filteredTrains.length > 0 && (
              <span
                className="badge bg-primary ms-2"
                style={{
                  background:
                    "linear-gradient(135deg, #7f5af0, #5a3ac7) !important",
                }}
              >
                {filteredTrains.length} train
                {filteredTrains.length !== 1 ? "s" : ""} found
              </span>
            )}
          </h5>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border"
              role="status"
              style={{ color: "#7f5af0" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading trains...</p>
          </div>
        ) : filteredTrains.length > 0 ? (
          <div className="row">
            {filteredTrains.map((train) => (
              <div key={train.trainId} className="col-12 mb-3">
                <TrainCard train={train} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="mb-3">
              <MdTrain size={60} className="text-gradient" />
            </div>
            <h5 className="text-muted">No trains found</h5>
            <p className="text-muted">
              Try adjusting your search criteria or check the train number.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrainSearch;
