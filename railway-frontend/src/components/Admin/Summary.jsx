import React, { useEffect, useState } from 'react';
import api from '../../api';
import { MdPeople, MdTrain, MdBookOnline, MdPayment, MdTrendingUp, MdRefresh, MdBarChart, MdWarning } from 'react-icons/md';
import './CommonCssForAdminDashboard.css';

// Admin Summary Dashboard - Shows system statistics
function Summary() {
  const [stats, setStats] = useState({
    users: 0,
    trains: 0,
    reservations: 0,
    cancelledReservations: 0,
    successfulPayments: 0,
    refundedPayments: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh every 10 seconds for more responsive updates
    const interval = setInterval(fetchStats, 10000);
    
    // Also refresh when window gains focus (user switches back to tab)
    const handleFocus = () => fetchStats();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Fetch all statistics from backend
  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching stats from backend...');
      const [usersRes, trainsRes, confirmedRes, cancelledRes, successfulPaymentsRes, refundedPaymentsRes, revenueRes] = await Promise.all([
        api.get('/api/v1/users/count'),
        api.get('/api/v1/trains/count'),
        api.get('/api/v1/reservations/count/confirmed'),
        api.get('/api/v1/reservations/count/cancelled'),
        api.get('/api/v1/payments/count/successful'),
        api.get('/api/v1/payments/count/refunded'),
        api.get('/api/v1/payments/revenue')
      ]);
      
      console.log('API Responses:', {
        users: usersRes.data,
        trains: trainsRes.data,
        confirmed: confirmedRes.data,
        cancelled: cancelledRes.data,
        successful: successfulPaymentsRes.data,
        refunded: refundedPaymentsRes.data,
        revenue: revenueRes.data
      });
      
      // Revenue now comes directly from backend (excludes refunded payments)
      const totalRevenue = revenueRes.data || 0;
      
      setStats({
        users: usersRes.data || 0,
        trains: trainsRes.data || 0,
        reservations: confirmedRes.data || 0,
        cancelledReservations: cancelledRes.data || 0,
        successfulPayments: successfulPaymentsRes.data || 0,
        refundedPayments: refundedPaymentsRes.data || 0,
        totalRevenue
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  // Animated statistics card component
  const StatCard = ({ icon, title, value, color, bgColor }) => (
    <div style={{
      background: `linear-gradient(135deg, ${bgColor}15, ${bgColor}08)`,
      border: `2px solid ${bgColor}20`,
      borderRadius: 20,
      padding: 24,
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: `0 8px 32px ${bgColor}15`,
      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = `0 12px 40px ${bgColor}25`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = `0 8px 32px ${bgColor}15`;
    }}>
      <div style={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 80,
        height: 80,
        background: `${bgColor}10`,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {React.cloneElement(icon, { size: 32, color: bgColor })}
      </div>
      <div style={{ color: bgColor, fontSize: 48, fontWeight: 800, marginBottom: 8 }}>
        {loading ? '...' : value.toLocaleString()}
      </div>
      <div style={{ color: '#666', fontSize: 16, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
        {title}
      </div>
    </div>
  );

  // Progress bar component for activity breakdown
  const ProgressBar = ({ label, value, total, color }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 600, color: '#333' }}>{label}</span>
          <span style={{ fontWeight: 700, color }}>{value}</span>
        </div>
        <div style={{
          background: '#f0f0f0',
          borderRadius: 10,
          height: 12,
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
            height: '100%',
            width: `${percentage}%`,
            borderRadius: 10,
            transition: 'width 1s ease-in-out',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'shimmer 2s infinite'
            }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <h2 style={{ 
          fontSize: 32, 
          fontWeight: 800, 
          color: '#5a3ac7', 
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <MdTrendingUp size={36} /> System Overview
        </h2>
        <button 
          onClick={fetchStats}
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #7f5af0, #5a3ac7)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '12px 24px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 16px rgba(127, 90, 240, 0.3)',
            opacity: loading ? 0.7 : 1
          }}
        >
          <MdRefresh size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div style={{
          background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
          color: '#fff',
          padding: 16,
          borderRadius: 12,
          marginBottom: 24,
          fontWeight: 600
        }}>
          {error}
        </div>
      )}



      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 40
      }}>
        <StatCard 
          icon={<MdPeople />}
          title="Total Users"
          value={stats.users}
          color="#3498db"
          bgColor="#3498db"
        />
        <StatCard 
          icon={<MdTrain />}
          title="Active Trains"
          value={stats.trains}
          color="#27ae60"
          bgColor="#27ae60"
        />
        <StatCard 
          icon={<MdBookOnline />}
          title="Confirmed Reservations"
          value={stats.reservations}
          color="#f39c12"
          bgColor="#f39c12"
        />
        <StatCard 
          icon={<MdWarning />}
          title="Cancelled Reservations"
          value={stats.cancelledReservations}
          color="#e74c3c"
          bgColor="#e74c3c"
        />
        <StatCard 
          icon={<MdPayment />}
          title="Successful Payments"
          value={stats.successfulPayments}
          color="#27ae60"
          bgColor="#27ae60"
        />
        <StatCard 
          icon={<MdPayment />}
          title="Refunded Payments"
          value={stats.refundedPayments}
          color="#e74c3c"
          bgColor="#e74c3c"
        />
      </div>

      {/* Activity Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: 24
      }}>
        {/* Activity Breakdown */}
        <div style={{
          background: 'linear-gradient(135deg, #fff, #f8f9fa)',
          borderRadius: 20,
          padding: 32,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ 
            fontSize: 24, 
            fontWeight: 700, 
            color: '#5a3ac7', 
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <MdBarChart size={28} /> Activity Breakdown
          </h3>
          
          <ProgressBar 
            label="User Registrations"
            value={stats.users}
            total={stats.users}
            color="#3498db"
          />
          <ProgressBar 
            label="Train Operations"
            value={stats.trains}
            total={stats.users}
            color="#2ecc71"
          />
          <ProgressBar 
            label="Booking Activity"
            value={stats.reservations}
            total={stats.users}
            color="#f39c12"
          />
          <ProgressBar 
            label="Successful Payments"
            value={stats.successfulPayments}
            total={stats.users}
            color="#9b59b6"
          />
          <ProgressBar 
            label="Refunded Payments"
            value={stats.refundedPayments}
            total={stats.users}
            color="#e74c3c"
          />
        </div>

        {/* Total Revenue */}
        <div style={{
          background: 'linear-gradient(135deg, #fff, #f8f9fa)',
          borderRadius: 20,
          padding: 32,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid #e9ecef',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            fontSize: 24, 
            fontWeight: 700, 
            color: '#5a3ac7', 
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}>
            <MdPayment size={28} /> Total Revenue
          </h3>
          
          <div style={{
            background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
            color: '#fff',
            padding: 32,
            borderRadius: 20,
            boxShadow: '0 8px 24px rgba(39, 174, 96, 0.3)'
          }}>
            <div style={{
              fontSize: 48,
              fontWeight: 800,
              marginBottom: 8
            }}>
              ₹{loading ? '...' : stats.totalRevenue.toLocaleString()}
            </div>
            <div style={{
              fontSize: 16,
              opacity: 0.9,
              fontWeight: 500
            }}>
              From confirmed bookings (excluding refunds)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Summary; 