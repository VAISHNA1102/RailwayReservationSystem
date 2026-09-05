import React, { useState, useEffect } from 'react';
import { MdPayment, MdRefresh, MdSearch } from 'react-icons/md';
import api from '../../api';
import './CommonCssForAdminDashboard.css';

function ManagePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/payments/allPayments');
      setPayments(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch payments: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    
    // Auto-refresh every 10 seconds for more responsive updates
    const interval = setInterval(fetchPayments, 10000);
    
    // Also refresh when window gains focus
    const handleFocus = () => fetchPayments();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const filteredPayments = payments.filter(payment =>
    payment.reservationId?.toString().includes(searchTerm) ||
    payment.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.amount?.toString().includes(searchTerm) ||
    payment.paymentStatus?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusBadge = (status) => {
    const statusClass = status === 'SUCCESS' ? 'bg-success' : 
                      status === 'PENDING' ? 'bg-warning' : 'bg-danger';
    return <span className={`badge ${statusClass}`}>{status}</span>;
  };

  return (
    <div >
      <div className="admin-card" style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 24, boxShadow: '0 4px 32px 0 rgba(127,90,240,0.13)', padding: '2.5rem 2rem 2rem 2rem', margin: '2rem 0', backdropFilter: 'blur(8px)', border: '1.5px solid #e0dfff', position: 'relative' }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontWeight: 800, color: "#5a3ac7", letterSpacing: 1, margin: 0, display: 'flex', alignItems: 'center', gap: 12, fontSize: 32 }}>
              <MdPayment size={32} /> Manage Payments
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
              }}>{filteredPayments.length}</span>
            </h2>
            <button type="button" onClick={fetchPayments} disabled={loading} style={{ background: "#fff", color: "#7f5af0", border: "2px solid #7f5af0", borderRadius: 10, fontWeight: 700, fontSize: 16, padding: "10px 24px", boxShadow: "0 2px 8px #7f5af033", cursor: "pointer", transition: 'background 0.2s, color 0.2s' }}>⟳ Refresh</button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 8 }}>
            <input
              type="text"
              placeholder="Search by Reservation ID, Amount, or Payment Method..."
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
          <div style={{ textAlign: "center", color: "#888", padding: 40, fontWeight: 600, fontSize: 20 }}>Loading payments...</div>
        ) : filteredPayments.length === 0 ? (
          <div style={{ background: "#ffeaea", color: "#c0392b", borderRadius: 10, padding: "22px 22px", marginTop: 18, fontWeight: 600, textAlign: 'center', fontSize: 18 }}>No payments found.</div>
        ) : (
          <div style={{ overflowX: "auto", marginTop: 24 }}>
            <table className="glass-table" style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, background: "rgba(247,245,255,0.85)", borderRadius: 18, boxShadow: "0 1px 12px #7f5af022", minWidth: 900, fontSize: 16 }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                <tr style={{ background: "linear-gradient(90deg,#e9e3fa 60%,#f7f5ff 100%)", color: "#5a3ac7", fontWeight: 800, fontSize: 17 }}>
                  <th style={{ padding: 16, minWidth: 120, textAlign: 'center', borderTopLeftRadius: 18 }}>Payment ID</th>
                  <th style={{ minWidth: 140, textAlign: 'center' }}>Reservation ID</th>
                  <th style={{ minWidth: 120, textAlign: 'center' }}>Amount</th>
                  <th style={{ minWidth: 140, textAlign: 'center' }}>Payment Method</th>
                  <th style={{ minWidth: 100, textAlign: 'center' }}>Status</th>
                  <th style={{ minWidth: 160, textAlign: 'center' }}>Payment Date</th>
                  <th style={{ minWidth: 120, textAlign: 'center' }}>Refund Amount</th>
                  <th style={{ minWidth: 160, textAlign: 'center', borderTopRightRadius: 18 }}>Refund Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment, idx) => (
                  <tr
                    key={payment.paymentId}
                    style={{
                      fontSize: 16,
                      background: idx % 2 === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(239,235,255,0.85)',
                      transition: 'background 0.3s',
                      boxShadow: '0 1px 6px #7f5af011',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#e9e3fa'}
                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(239,235,255,0.85)'}
                  >
                    <td style={{ padding: 12, textAlign: 'center', verticalAlign: 'middle', fontWeight: 700, color: "#4421b4" }}>{payment.paymentId || 'N/A'}</td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 500 }}>{payment.reservationId || 'N/A'}</td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 600, color: "#4421b4" }}>₹{payment.amount || 0}</td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 500 }}>{payment.paymentMethod || 'N/A'}</td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: 'center',
                        gap: 6,
                        padding: "5px 16px",
                        borderRadius: 14,
                        fontWeight: 700,
                        fontSize: 15,
                        color: payment.paymentStatus === "SUCCESS" ? "#fff" : payment.paymentStatus === "REFUNDED" ? "#fff" : "#5a3ac7",
                        background: payment.paymentStatus === "SUCCESS" ? "linear-gradient(90deg,#28a745,#20c997)" : payment.paymentStatus === "REFUNDED" ? "linear-gradient(90deg,#e74c3c,#c0392b)" : "#f7f5ff",
                        boxShadow: payment.paymentStatus === "SUCCESS" ? '0 2px 8px #28a74533' : payment.paymentStatus === "REFUNDED" ? '0 2px 8px #e74c3c33' : 'none',
                        letterSpacing: 0.5,
                      }}>{payment.paymentStatus || 'UNKNOWN'}</span>
                    </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 500 }}>{formatDate(payment.paymentDateTime)}</td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 600, color: payment.refundAmount > 0 ? "#e74c3c" : "#666" }}>₹{payment.refundAmount || 0}</td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 500 }}>{formatDate(payment.refundDateTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      <div className="row mt-4 g-3">
        <div className="col-md-3">
          <div className="card text-center h-100" style={{
            background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
            border: 'none',
            borderRadius: 15,
            boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)',
            color: 'white'
          }}>
            <div className="card-body">
              <h5 className="card-title mb-3" style={{ fontWeight: 600, color: 'white' }}>Total Revenue</h5>
              <h3 style={{ fontWeight: 700, fontSize: '2rem', color: 'white' }}>
                ₹{payments.filter(p => p.paymentStatus === 'SUCCESS').reduce((sum, p) => sum + p.amount, 0)}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center h-100" style={{
            background: 'linear-gradient(135deg, #7f5af0, #5a3ac7)',
            border: 'none',
            borderRadius: 15,
            boxShadow: '0 4px 15px rgba(127, 90, 240, 0.3)',
            color: 'white'
          }}>
            <div className="card-body">
              <h5 className="card-title mb-3" style={{ fontWeight: 600, color: 'white' }}>Successful Payments</h5>
              <h3 style={{ fontWeight: 700, fontSize: '2rem', color: 'white' }}>
                {payments.filter(p => p.paymentStatus === 'SUCCESS').length}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center h-100" style={{
            background: 'linear-gradient(135deg, #7f5af0, #5a3ac7)',
            border: 'none',
            borderRadius: 15,
            boxShadow: '0 4px 15px rgba(127, 90, 240, 0.3)',
            color: 'white'
          }}>
            <div className="card-body">
              <h5 className="card-title mb-3" style={{ fontWeight: 600, color: 'white' }}>Pending Payments</h5>
              <h3 style={{ fontWeight: 700, fontSize: '2rem', color: 'white' }}>
                {payments.filter(p => p.paymentStatus === 'PENDING').length}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center h-100" style={{
            background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
            border: 'none',
            borderRadius: 15,
            boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)',
            color: 'white'
          }}>
            <div className="card-body">
              <h5 className="card-title mb-3" style={{ fontWeight: 600, color: 'white' }}>Refunded Payments</h5>
              <h3 style={{ fontWeight: 700, fontSize: '2rem', color: 'white' }}>
                {payments.filter(p => p.paymentStatus === 'REFUNDED').length}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center h-100" style={{
            background: 'linear-gradient(135deg, #f39c12, #e67e22)',
            border: 'none',
            borderRadius: 15,
            boxShadow: '0 4px 15px rgba(243, 156, 18, 0.3)',
            color: 'white'
          }}>
            <div className="card-body">
              <h5 className="card-title mb-3" style={{ fontWeight: 600, color: 'white' }}>Total Refunds</h5>
              <h3 style={{ fontWeight: 700, fontSize: '2rem', color: 'white' }}>
                ₹{payments.filter(p => p.paymentStatus === 'REFUNDED').reduce((sum, p) => sum + (p.refundAmount || 0), 0)}
              </h3>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default ManagePayments;