import React, { useState, useEffect } from 'react';
import { MdBookmark, MdRefresh, MdSearch } from 'react-icons/md';
import api from '../../api';
import './CommonCssForAdminDashboard.css';

function ManageReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/reservations/allReservations');
      setReservations(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch reservations: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const filteredReservations = reservations.filter(reservation =>
    reservation.pnrNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.trainNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const statusClass = status === 'CONFIRMED' ? 'bg-success' : 
                      status === 'PENDING' ? 'bg-warning' : 'bg-danger';
    return <span className={`badge ${statusClass}`}>{status}</span>;
  };

  return (
    <div>
      <div className="admin-card" style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 24, boxShadow: '0 4px 32px 0 rgba(127,90,240,0.13)', padding: '2.5rem 2rem 2rem 2rem', margin: '2rem 0', backdropFilter: 'blur(8px)', border: '1.5px solid #e0dfff', position: 'relative' }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontWeight: 800, color: "#5a3ac7", letterSpacing: 1, margin: 0, display: 'flex', alignItems: 'center', gap: 12, fontSize: 32 }}>
              <MdBookmark size={32} /> Manage Reservations
              <span style={{
                background: 'linear-gradient(90deg,#7f5af0,#5a3ac7)',
                color: '#fff',
                borderRadius: 16,
                fontWeight: 700,
                fontSize: 16,
                padding: '4px 18px',
                marginLeft: 10,
                boxShadow: '0 2px 8px #7f5af033',
                letterSpacing: 0.5,
              }}>{filteredReservations.length}</span>
            </h2>
            <button type="button" onClick={fetchReservations} disabled={loading} style={{ background: "#fff", color: "#7f5af0", border: "2px solid #7f5af0", borderRadius: 10, fontWeight: 700, fontSize: 16, padding: "10px 24px", boxShadow: "0 2px 8px #7f5af033", cursor: "pointer", transition: 'background 0.2s, color 0.2s' }}>⟳ Refresh</button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 8 }}>
            <input
              type="text"
              placeholder="Search by PNR, Username, or Train Number..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ borderRadius: 10, border: "1.5px solid #e0dfff", padding: "10px 18px", fontSize: 16, flex: 1, minWidth: 200, maxWidth: 400, background: '#f7f5ff', fontWeight: 500 }}
            />
          </div>
        </div>
        {error && (
          <div style={{ background: "#ffeaea", color: "#c0392b", borderRadius: 10, padding: "16px 22px", marginBottom: 18, fontWeight: 600, fontSize: 17 }}>{error}</div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", color: "#888", padding: 40, fontWeight: 600, fontSize: 20 }}>Loading reservations...</div>
        ) : filteredReservations.length === 0 ? (
          <div style={{ background: "#ffeaea", color: "#c0392b", borderRadius: 10, padding: "22px 22px", marginTop: 18, fontWeight: 600, textAlign: 'center', fontSize: 18 }}>No reservations found.</div>
        ) : (
          <div style={{ overflowX: "auto", marginTop: 24 }}>
            <table className="glass-table" style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, background: "rgba(247,245,255,0.85)", borderRadius: 18, boxShadow: "0 1px 12px #7f5af022", minWidth: 700, fontSize: 16 }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                <tr style={{ background: "linear-gradient(90deg,#e9e3fa 60%,#f7f5ff 100%)", color: "#5a3ac7", fontWeight: 800, fontSize: 17 }}>
                  <th style={{ padding: 16, minWidth: 120, textAlign: 'center', borderTopLeftRadius: 18 }}>PNR</th>
                  <th style={{ minWidth: 140, textAlign: 'center' }}>Username</th>
                  <th style={{ minWidth: 200, textAlign: 'center' }}>Train</th>
                  <th style={{ minWidth: 90, textAlign: 'center' }}>Class</th>
                  <th style={{ minWidth: 140, textAlign: 'center' }}>Journey Date</th>
                  <th style={{ minWidth: 100, textAlign: 'center' }}>Passengers</th>
                  <th style={{ minWidth: 120, textAlign: 'center' }}>Total Fare</th>
                  <th style={{ minWidth: 100, textAlign: 'center' }}>Status</th>
                  <th style={{ minWidth: 160, textAlign: 'center', borderTopRightRadius: 18 }}>Booking Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((reservation, idx) => (
                  <tr
                    key={reservation.reservationId}
                    style={{
                      fontSize: 16,
                      background: idx % 2 === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(239,235,255,0.85)',
                      transition: 'background 0.3s',
                      boxShadow: '0 1px 6px #7f5af011',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#e9e3fa'}
                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(239,235,255,0.85)'}
                  >
                    <td style={{ padding: 12, textAlign: 'center', verticalAlign: 'middle', fontWeight: 700, color: "#4421b4" }}>{reservation.pnrNumber || 'N/A'}</td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 500 }}>{reservation.username || 'N/A'}</td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 500 }}>{reservation.trainName || 'N/A'} ({reservation.trainNumber || 'N/A'})</td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 500 }}>{reservation.classType || 'N/A'}</td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 500 }}>{reservation.journeyDate ? new Date(reservation.journeyDate).toLocaleDateString() : 'N/A'}</td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 500 }}>{reservation.numberOfSeats || 0}</td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 600, color: "#4421b4" }}>₹{reservation.totalFare || 0}</td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: 'center',
                        gap: 6,
                        padding: "5px 16px",
                        borderRadius: 14,
                        fontWeight: 700,
                        fontSize: 15,
                        color: reservation.reservationStatus === "CONFIRMED" ? "#fff" : "#5a3ac7",
                        background: reservation.reservationStatus === "CONFIRMED" ? "linear-gradient(90deg,#28a745,#20c997)" : "#f7f5ff",
                        boxShadow: reservation.reservationStatus === "CONFIRMED" ? '0 2px 8px #28a74533' : 'none',
                        letterSpacing: 0.5,
                      }}>{reservation.reservationStatus || 'UNKNOWN'}</span>
                    </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 500 }}>{reservation.reservationTime ? new Date(reservation.reservationTime).toLocaleString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageReservations;