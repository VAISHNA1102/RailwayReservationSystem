// src/pages/Admin/AdminDashboard.jsx
import React, { useState } from 'react';
import Summary from './Summary';
import ManageUsers from './ManageUsers';
import ManageTrains from './ManageTrains';
import ManageReservations from './ManageReservations';
import ManagePayments from './ManagePayments';
import { MdDashboard, MdPeople, MdTrain, MdBookOnline, MdPayment, MdSettings } from 'react-icons/md';
import './CommonCssForAdminDashboard.css';
import './AdminDashboard.css';

function AdminDashboard() {
  const [tab, setTab] = useState('summary');

  return (
    <>
      {/* <div className="admin-container" style={{ width: '100%', padding: '0 20px' }}>
        <div className="admin-card" style={{ background: '#fff', borderRadius: 18, padding: 32, marginBottom: 32, width: '100%' }}> */}
        <div style={{ background: '#fff', borderRadius: 18, padding: 32, marginBottom: 32, width: '100%' }}>

          <h2 className="admin-header" style={{ fontWeight: 700, color: '#5a3ac7', letterSpacing: 1, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
            <MdSettings size={32} /> Admin Dashboard
          </h2>
          <div className="admin-dashboard-tabs">
            <button
              className={`admin-dashboard-tab-btn ${tab === 'summary' ? 'active' : ''}`}
              onClick={() => setTab('summary')}
            ><MdDashboard size={18} style={{ marginRight: 8 }} />Summary</button>
            <button
              className={`admin-dashboard-tab-btn ${tab === 'users' ? 'active' : ''}`}
              onClick={() => setTab('users')}
            ><MdPeople size={18} style={{ marginRight: 8 }} />Users</button>
            <button
              className={`admin-dashboard-tab-btn ${tab === 'trains' ? 'active' : ''}`}
              onClick={() => setTab('trains')}
            ><MdTrain size={18} style={{ marginRight: 8 }} />Trains</button>
            <button
              className={`admin-dashboard-tab-btn ${tab === 'reserv' ? 'active' : ''}`}
              onClick={() => setTab('reserv')}
            ><MdBookOnline size={18} style={{ marginRight: 8 }} />Reservations</button>
            <button
              className={`admin-dashboard-tab-btn ${tab === 'payments' ? 'active' : ''}`}
              onClick={() => setTab('payments')}
            ><MdPayment size={18} style={{ marginRight: 8 }} />Payments</button>
          </div>
          <div>
            {tab === 'summary' && <Summary />}
            {tab === 'users' && <ManageUsers />}
            {tab === 'trains' && <ManageTrains />}
            {tab === 'reserv' && <ManageReservations />}
            {tab === 'payments' && <ManagePayments />}
          </div>
        </div>
        {/* </div>
      </div> */}
    </>
  );
}

export default AdminDashboard;
