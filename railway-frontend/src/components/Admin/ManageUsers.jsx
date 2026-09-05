// 📁 src/pages/Admin/ManageUsers.jsx
import React, { useEffect, useState } from 'react';
import api from '../../api';
import { MdPeople, MdAdd, MdRefresh, MdVisibility, MdDelete, MdAdminPanelSettings, MdPerson, MdClose, MdPersonAdd } from 'react-icons/md';
import './CommonCssForAdminDashboard.css';
import './ManageUsers.css';

const ROLE_ICONS = {
  ADMIN: <MdAdminPanelSettings />,
  USER: <MdPerson />,
};

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState("username");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ userName: "", email: "", password: "" });
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [userDetailsData, setUserDetailsData] = useState(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchType === 'username') {
      setFilteredUsers(
        users.filter(u =>
          u.userName && u.userName.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      setFilteredUsers(
        users.filter(u =>
          u.email && u.email.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, searchType, users]);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const [usersRes, countRes] = await Promise.all([
        api.get('/api/v1/users/allUsers'),
        api.get('/api/v1/users/count')
      ]);
      setUsers(usersRes.data || []);
      setFilteredUsers(usersRes.data || []);
      setUserCount(countRes.data || 0);
    } catch (err) {
      setError("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
    setSearch("");
  };

  const openModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const openAdd = () => {
    setAddForm({ userName: "", email: "", password: "" });
    setAddError("");
    setShowAdd(true);
  };
  const closeAdd = () => setShowAdd(false);

  const handleAddChange = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError("");
    try {
      await api.post('/users/register', addForm);
      closeAdd();
    fetchUsers();
    } catch (err) {
      setAddError(err.response?.data?.message || "Failed to add user.");
    } finally {
      setAddLoading(false);
    }
  };

  const deleteUser = async (userName) => {
    if (!window.confirm(`Are you sure you want to delete user: ${userName}?`)) return;
    try {
      await api.delete('/api/v1/users/deleteUserByUserName', { data: userName });
      fetchUsers();
    } catch (err) {
      alert("Failed to delete user: " + (err.response?.data || err.message));
    }
  };

  const getUserById = async (userId) => {
    setUserDetailsLoading(true);
    try {
      const res = await api.get(`/api/v1/users/getUserById/${userId}`);
      setUserDetailsData(res.data);
      setShowUserDetails(true);
    } catch (err) {
      alert("Failed to fetch user details: " + (err.response?.data || err.message));
    } finally {
      setUserDetailsLoading(false);
    }
  };

  return (
    <div>
      <div className="admin-card" style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 24, boxShadow: '0 4px 32px 0 rgba(127,90,240,0.13)', padding: '2.5rem 2rem 2rem 2rem', margin: '2rem 0', backdropFilter: 'blur(8px)', border: '1.5px solid #e0dfff', position: 'relative' }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontWeight: 800, color: "#5a3ac7", letterSpacing: 1, margin: 0, display: 'flex', alignItems: 'center', gap: 12, fontSize: 32 }}>
              <MdPeople size={32} /> Manage Users
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
              }}>{filteredUsers.length}</span>
            </h2>
            <button type="button" onClick={fetchUsers} style={{ background: "#fff", color: "#7f5af0", border: "2px solid #7f5af0", borderRadius: 10, fontWeight: 700, fontSize: 16, padding: "10px 24px", boxShadow: "0 2px 8px #7f5af033", cursor: "pointer", transition: 'background 0.2s, color 0.2s' }}>⟳ Reset</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 8 }}>
            <select value={searchType} onChange={handleSearchTypeChange} style={{ borderRadius: 10, padding: "10px 16px", fontWeight: 600, color: "#5a3ac7", border: "1.5px solid #e0dfff", minWidth: 130, fontSize: 16, background: '#f7f5ff' }}>
              <option value="username">Username</option>
              <option value="email">Email</option>
            </select>
            <input
              type="text"
              placeholder={`Search by ${searchType}`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ borderRadius: 10, border: "1.5px solid #e0dfff", padding: "10px 18px", fontSize: 16, flex: 1, minWidth: 200, maxWidth: 400, background: '#f7f5ff', fontWeight: 500 }}
            />
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", color: "#888", padding: 40, fontWeight: 600, fontSize: 20 }}>Loading users...</div>
        ) : error ? (
          <div style={{ background: "#ffeaea", color: "#c0392b", borderRadius: 10, padding: "16px 22px", marginBottom: 18, fontWeight: 600, fontSize: 17 }}>{error}</div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ background: "#ffeaea", color: "#c0392b", borderRadius: 10, padding: "22px 22px", marginTop: 18, fontWeight: 600, textAlign: 'center', fontSize: 18 }}>No user found.</div>
        ) : (
          <div style={{ overflowX: "auto", marginTop: 24 }}>
            <table className="glass-table" style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, background: "rgba(247,245,255,0.85)", borderRadius: 18, boxShadow: "0 1px 12px #7f5af022", minWidth: 700, fontSize: 16 }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                <tr style={{ background: "linear-gradient(90deg,#e9e3fa 60%,#f7f5ff 100%)", color: "#5a3ac7", fontWeight: 800, fontSize: 17 }}>
                  <th style={{ padding: 16, minWidth: 120, textAlign: 'center', borderTopLeftRadius: 18 }}>ID</th>
                  <th style={{ minWidth: 140, textAlign: 'center' }}>Username</th>
                  <th style={{ minWidth: 200, textAlign: 'center' }}>Email</th>
                  <th style={{ minWidth: 90, textAlign: 'center' }}>Role</th>
                  <th style={{ minWidth: 160, textAlign: 'center' }}>Created At</th>
                  <th style={{ minWidth: 110, textAlign: 'center', borderTopRightRadius: 18 }}>Actions</th>
                </tr>
          </thead>
          <tbody>
                {filteredUsers.map((u, idx) => (
                  <tr
                    key={u.userId}
                    style={{
                      fontSize: 16,
                      background: idx % 2 === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(239,235,255,0.85)',
                      transition: 'background 0.3s',
                      boxShadow: '0 1px 6px #7f5af011',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#e9e3fa'}
                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(239,235,255,0.85)'}
                  >
                    <td style={{ padding: 12, wordBreak: 'break-all', textAlign: 'center', verticalAlign: 'middle', fontWeight: 500 }}>{u.userId}</td>
                    <td style={{ color: "#4421b4", fontWeight: 700, textAlign: 'center', verticalAlign: 'middle', letterSpacing: 0.2 }}>{u.userName}</td>
                    <td style={{ wordBreak: 'break-all', textAlign: 'center', verticalAlign: 'middle', fontWeight: 500 }}>{u.email}</td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: 'center',
                        gap: 6,
                        padding: "5px 16px",
                        borderRadius: 14,
                        fontWeight: 700,
                        fontSize: 15,
                        color: u.role === "ADMIN" ? "#fff" : "#5a3ac7",
                        background: u.role === "ADMIN" ? "linear-gradient(90deg,#7f5af0,#5a3ac7)" : "#f7f5ff",
                        boxShadow: u.role === "ADMIN" ? '0 2px 8px #7f5af033' : 'none',
                        letterSpacing: 0.5,
                      }}>{ROLE_ICONS[u.role] || <MdPerson />} {u.role}</span>
                    </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 500 }}>{u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}</td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <button
                        style={{
                          background: "linear-gradient(90deg,#e74c3c 60%,#ff7675 100%)",
                          color: "#fff",
                          border: "none",
                          borderRadius: 10,
                          fontWeight: 700,
                          fontSize: 15,
                          padding: "8px 22px",
                          margin: '0 auto',
                          display: 'inline-block',
                          cursor: "pointer",
                          boxShadow: '0 2px 8px #e74c3c22',
                          transition: 'background 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#c0392b'; e.currentTarget.style.boxShadow = '0 4px 16px #e74c3c44'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(90deg,#e74c3c 60%,#ff7675 100%)'; e.currentTarget.style.boxShadow = '0 2px 8px #e74c3c22'; }}
                        onClick={() => deleteUser(u.userName)}
                      >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
          </div>
        )}
        <style>{`
          @media (max-width: 1100px) {
            .glass-table th, .glass-table td { font-size: 14px !important; padding: 8px !important; }
          }
          @media (max-width: 900px) {
            .glass-table th, .glass-table td { font-size: 13px !important; padding: 7px !important; }
          }
          @media (max-width: 700px) {
            .glass-table, .glass-table thead, .glass-table tbody, .glass-table th, .glass-table td, .glass-table tr {
              display: block;
            }
            .glass-table thead tr { display: none; }
            .glass-table tr { margin-bottom: 18px; background: #fff; border-radius: 12px; box-shadow: 0 1px 8px #7f5af011; }
            .glass-table td { padding: 12px 16px; text-align: left; position: relative; border-radius: 0 !important; }
            .glass-table td:before {
              content: attr(data-label);
              font-weight: 700;
              color: #5a3ac7;
              display: block;
              margin-bottom: 4px;
            }
          }
        `}</style>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(60,40,120,0.18)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={closeModal}>
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 32px #7f5af033", padding: 36, minWidth: 320, maxWidth: 400, position: "relative" }} onClick={e => e.stopPropagation()}>
            <button onClick={closeModal} style={{ position: "absolute", top: 12, right: 16, background: "none", border: "none", fontSize: 22, color: "#7f5af0", cursor: "pointer" }}>&times;</button>
            <h3 style={{ fontWeight: 700, color: "#5a3ac7", marginBottom: 18 }}>User Details</h3>
            <div style={{ fontSize: 16, lineHeight: 1.7 }}>
              <div><b>ID:</b> {selectedUser.userId}</div>
              <div><b>Username:</b> {selectedUser.userName}</div>
              <div><b>Email:</b> {selectedUser.email}</div>
              <div><b>Role:</b> <span style={{ color: selectedUser.role === "ADMIN" ? "#7f5af0" : "#5a3ac7" }}>{selectedUser.role}</span></div>
              <div><b>Created At:</b> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : "-"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAdd && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(60,40,120,0.18)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={closeAdd}>
          <form onSubmit={handleAddUser} style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 32px #7f5af033", padding: 36, minWidth: 320, maxWidth: 400, position: "relative" }} onClick={e => e.stopPropagation()}>
            <button onClick={closeAdd} type="button" style={{ position: "absolute", top: 12, right: 16, background: "none", border: "none", fontSize: 22, color: "#7f5af0", cursor: "pointer" }}>&times;</button>
            <h3 style={{ fontWeight: 700, color: "#5a3ac7", marginBottom: 18 }}>Add New User</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input
                name="userName"
                type="text"
                placeholder="Username"
                value={addForm.userName}
                onChange={handleAddChange}
                required
                style={{ borderRadius: 8, border: "1.5px solid #e0dfff", padding: "10px 14px", fontSize: 15 }}
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={addForm.email}
                onChange={handleAddChange}
                required
                style={{ borderRadius: 8, border: "1.5px solid #e0dfff", padding: "10px 14px", fontSize: 15 }}
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={addForm.password}
                onChange={handleAddChange}
                required
                style={{ borderRadius: 8, border: "1.5px solid #e0dfff", padding: "10px 14px", fontSize: 15 }}
              />
              {addError && <div style={{ background: "#ffeaea", color: "#c0392b", borderRadius: 8, padding: "10px 16px", fontWeight: 500 }}>{addError}</div>}
              <button type="submit" disabled={addLoading} style={{ background: "linear-gradient(90deg, #7f5af0 60%, #5a3ac7 100%)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 16, padding: "10px 0", boxShadow: "0 2px 12px #7f5af033", cursor: "pointer", marginTop: 8 }}>
                {addLoading ? "Adding..." : "Add User"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
