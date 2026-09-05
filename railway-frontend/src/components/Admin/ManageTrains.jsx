import React, { useEffect, useState } from 'react';
import api from '../../api';
import { MdTrain, MdAdd, MdEdit, MdDelete, MdRefresh, MdSchedule, MdLocationOn } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CommonCssForAdminDashboard.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const CLASS_TYPES = ['AC', 'Sleeper'];
const QUOTAS = ['General', 'Ladies'];

function ManageTrains() {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTrain, setEditingTrain] = useState(null);
  const [form, setForm] = useState({
    trainNumber: '',
    trainName: '',
    trainType: '',
    source: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    runningDays: [],
    availability: true,
    trainClasses: [{ classType: '', capacity: '', price: '', quota: '' }]
  });
  const [validationErrors, setValidationErrors] = useState({});

  const fetchTrains = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/v1/trains/allTrains');
      setTrains(res.data || []);
    } catch (err) {
      setError('Failed to load trains');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrains();
  }, []);

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
  };

  const handleDayToggle = (day) => {
    const days = form.runningDays.includes(day) 
      ? form.runningDays.filter(d => d !== day)
      : [...form.runningDays, day];
    setForm({ ...form, runningDays: days });
  };

  const handleClassInput = (index, field, value) => {
    const updated = [...form.trainClasses];
    updated[index][field] = ['capacity', 'price'].includes(field) ? Number(value) : value;
    setForm({ ...form, trainClasses: updated });
  };

  const addClass = () => {
    setForm({
      ...form,
      trainClasses: [...form.trainClasses, { classType: '', capacity: '', price: '', quota: '' }]
    });
  };

  const removeClass = (index) => {
    if (form.trainClasses.length > 1) {
      const updated = form.trainClasses.filter((_, i) => i !== index);
      setForm({ ...form, trainClasses: updated });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.trainNumber || !/^[0-9]{5}$/.test(form.trainNumber)) {
      errors.trainNumber = 'Train number must be exactly 5 digits';
    }
    if (!form.trainName || !/^[a-zA-Z ]+$/.test(form.trainName)) {
      errors.trainName = 'Train name must contain only letters and spaces';
    }
    if (!form.source || !/^[a-zA-Z ]+$/.test(form.source)) {
      errors.source = 'Source must contain only letters and spaces';
    }
    if (!form.destination || !/^[a-zA-Z ]+$/.test(form.destination)) {
      errors.destination = 'Destination must contain only letters and spaces';
    }
    if (!form.departureTime) errors.departureTime = 'Departure time is required';
    if (!form.arrivalTime) errors.arrivalTime = 'Arrival time is required';
    if (form.runningDays.length === 0) errors.runningDays = 'Select at least one running day';
    
    form.trainClasses.forEach((cls, idx) => {
      if (!cls.classType) errors[`class_${idx}_type`] = 'Class type required';
      if (!cls.capacity || cls.capacity < 1) errors[`class_${idx}_capacity`] = 'Capacity must be at least 1';
      if (!cls.price || cls.price < 1) errors[`class_${idx}_price`] = 'Price must be positive';
      if (!cls.quota) errors[`class_${idx}_quota`] = 'Quota required';
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getErrorMessage = (err) => {
    if (err.response?.status === 400) {
      const message = err.response?.data?.message || '';
      
      if (message.includes('Train number must contain exactly 5 digits')) {
        return '❌ Train number must be exactly 5 digits (e.g., 12345)';
      }
      if (message.includes('Train number') && message.includes('already exists')) {
        return '❌ This train number already exists. Please use a different number.';
      }
      if (message.includes('Train name must contain only letters')) {
        return '❌ Train name can only contain letters and spaces (e.g., "Express Train")';
      }
      if (message.includes('Source name must contain only letters')) {
        return '❌ Source station name can only contain letters and spaces (e.g., "New Delhi")';
      }
      if (message.includes('Destination name must contain only letters')) {
        return '❌ Destination station name can only contain letters and spaces (e.g., "Mumbai Central")';
      }
      if (message.includes('Arrival time must be after departure time')) {
        return '❌ Arrival time must be later than departure time. Please check your timings.';
      }
      if (message.includes('Running days must not be empty')) {
        return '❌ Please select at least one running day for the train.';
      }
      if (message.includes('Train classes must be provided')) {
        return '❌ Please add at least one train class with complete details.';
      }
      if (message.includes('At least one train class is required')) {
        return '❌ Please add at least one train class (AC/Sleeper) with capacity and price.';
      }
      
      return `❌ ${message}`;
    }
    
    if (err.response?.status === 409) {
      return '❌ Train with this number already exists. Please use a different train number.';
    }
    
    if (err.response?.status === 500) {
      return '❌ Server error occurred. Please try again later or contact support.';
    }
    
    return '❌ Failed to save train. Please check all fields and try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const dto = {
        ...form,
        departureTime: `2024-01-01T${form.departureTime}:00`,
        arrivalTime: `2024-01-01T${form.arrivalTime}:00`
      };

      if (editingTrain) {
        await api.put(`/api/v1/trains/updateTrain/${editingTrain.trainNumber}`, dto);
        toast.success(<> Train updated successfully!</>);
      } else {
        await api.post('/api/v1/trains/addTrain', dto);
        toast.success(<> Train added successfully!</>);
      }

      resetForm();
      fetchTrains();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    }
  };

  const handleEdit = (train) => {
    const extractTime = (dateTimeString) => {
      if (!dateTimeString) return '';
      const date = new Date(dateTimeString);
      return date.toTimeString().slice(0, 5);
    };

    setForm({
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      trainType: train.trainType,
      source: train.source,
      destination: train.destination,
      departureTime: extractTime(train.departureTime),
      arrivalTime: extractTime(train.arrivalTime),
      runningDays: train.runningDays || [],
      availability: train.availability,
      trainClasses: train.trainClasses?.map(c => ({
        classType: c.classType,
        capacity: c.capacity,
        price: c.price,
        quota: c.quota
      })) || [{ classType: '', capacity: '', price: '', quota: '' }]
    });
    setEditingTrain(train);
    setShowForm(true);
  };

  const handleDelete = async (trainNumber) => {
    try {
      // Check if train has any bookings
      const reservationsRes = await api.get('/api/v1/reservations/allReservations');
      const hasBookings = reservationsRes.data.some(reservation => 
        reservation.trainNumber === trainNumber
      );
      
      if (hasBookings) {
        toast.error('❌ Cannot delete train. This train has active bookings.');
        return;
      }
      
      if (window.confirm('Are you sure you want to delete this train?')) {
        await api.delete('/api/v1/trains/deleteTrainByNumber', { data: trainNumber });
        toast.success(<><MdDelete /> Train deleted successfully!</>);
        fetchTrains();
      }
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error('❌ Train not found. It may have been already deleted.');
      } else if (err.response?.status === 409) {
        toast.error('❌ Cannot delete train. It has active reservations.');
      } else {
        toast.error('❌ Failed to delete train. Please try again later.');
      }
    }
  };

  const resetForm = () => {
    setForm({
      trainNumber: '',
      trainName: '',
      trainType: '',
      source: '',
      destination: '',
      departureTime: '',
      arrivalTime: '',
      runningDays: [],
      availability: true,
      trainClasses: [{ classType: '', capacity: '', price: '', quota: '' }]
    });
    setEditingTrain(null);
    setShowForm(false);
    setValidationErrors({});
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div  style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 24, boxShadow: '0 4px 32px 0 rgba(127,90,240,0.13)', padding: '2.5rem 2rem 2rem 2rem', margin: '2rem 0', backdropFilter: 'blur(8px)', border: '1.5px solid #e0dfff', position: 'relative' , width: '100%'}}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <h2 style={{ 
          fontWeight: 800, 
          color: '#5a3ac7', 
          letterSpacing: 1, 
          margin: 0, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12, 
          fontSize: 32
        }}>
          <MdTrain size={32} /> Manage Trains
          <span style={{
            background: 'linear-gradient(90deg,#7f5af0,#5a3ac7)',
            color: '#fff',
            borderRadius: 16,
            fontWeight: 700,
            fontSize: 16,
            padding: '4px 18px',
            marginLeft: 10,
            boxShadow: '0 2px 8px #7f5af033',
            letterSpacing: 0.5
          }}>{trains.length}</span>
        </h2>
        <div style={{ display: 'flex', gap: 16 }}>
          <button 
            onClick={() => setShowForm(!showForm)}
            style={{
              background: 'linear-gradient(90deg, #7f5af0, #5a3ac7)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '10px 24px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 16,
              boxShadow: '0 2px 12px #7f5af033'
            }}
          >
            <MdAdd size={16} /> {showForm ? 'Cancel' : 'Add Train'}
          </button>
          <button 
            onClick={fetchTrains}
            disabled={loading}
            style={{
              background: '#fff',
              color: '#666',
              border: '1px solid #ddd',
              borderRadius: 6,
              padding: '12px 20px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              opacity: loading ? 0.7 : 1,
              fontSize: 14
            }}
          >
            <MdRefresh size={16} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: error.includes('successfully') ? '#d4edda' : '#f8d7da',
          color: error.includes('successfully') ? '#155724' : '#721c24',
          padding: 16,
          borderRadius: 6,
          marginBottom: 30,
          border: `1px solid ${error.includes('successfully') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{
          background: '#fff',
          borderRadius: 8,
          padding: 40,
          marginBottom: 40,
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ color: '#333', fontWeight: 600, marginBottom: 30, fontSize: 20 }}>
            {editingTrain ? 'Edit Train' : 'Add New Train'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 30 }}>
              <div>
                <input
                  name="trainNumber"
                  placeholder="Train Number (5 digits)"
                  value={form.trainNumber}
                  onChange={handleInput}
                  disabled={editingTrain}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 6,
                    border: validationErrors.trainNumber ? '2px solid #dc3545' : '1px solid #ddd',
                    background: '#fff',
                    fontSize: 14
                  }}
                />
                {validationErrors.trainNumber && <div style={{ color: '#dc3545', fontSize: 12, marginTop: 6 }}>{validationErrors.trainNumber}</div>}
              </div>
              <div>
                <input
                  name="trainName"
                  placeholder="Train Name"
                  value={form.trainName}
                  onChange={handleInput}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: validationErrors.trainName ? '2px solid #e74c3c' : '1px solid #e0dfff',
                    background: '#f7f5ff',
                    fontSize: 16
                  }}
                />
                {validationErrors.trainName && <div style={{ color: '#e74c3c', fontSize: 14, marginTop: 4 }}>{validationErrors.trainName}</div>}
              </div>
              <div>
                <input
                  name="trainType"
                  placeholder="Enter Train Type"
                  value={form.trainType}
                  onChange={handleInput}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1px solid #e0dfff',
                    background: '#f7f5ff',
                    fontSize: 16
                  }}
                />
              </div>
              <div>
                <input
                  name="source"
                  placeholder="Source Station"
                  value={form.source}
                  onChange={handleInput}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: validationErrors.source ? '2px solid #e74c3c' : '1px solid #e0dfff',
                    background: '#f7f5ff',
                    fontSize: 16
                  }}
                />
                {validationErrors.source && <div style={{ color: '#e74c3c', fontSize: 14, marginTop: 4 }}>{validationErrors.source}</div>}
              </div>
              <div>
                <input
                  name="destination"
                  placeholder="Destination Station"
                  value={form.destination}
                  onChange={handleInput}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: validationErrors.destination ? '2px solid #e74c3c' : '1px solid #e0dfff',
                    background: '#f7f5ff',
                    fontSize: 16
                  }}
                />
                {validationErrors.destination && <div style={{ color: '#e74c3c', fontSize: 14, marginTop: 4 }}>{validationErrors.destination}</div>}
              </div>
              <div>
                <input
                  type="time"
                  name="departureTime"
                  placeholder="Select Departure Time"
                  value={form.departureTime}
                  onChange={handleInput}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: validationErrors.departureTime ? '2px solid #e74c3c' : '1px solid #e0dfff',
                    background: '#f7f5ff',
                    fontSize: 16,
                    accentColor: '#7f5af0'
                  }}
                />
                {validationErrors.departureTime && <div style={{ color: '#e74c3c', fontSize: 14, marginTop: 4 }}>{validationErrors.departureTime}</div>}
              </div>
              <div>
                <input
                  type="time"
                  name="arrivalTime"
                  placeholder="Select Arrival Time (after departure)"
                  value={form.arrivalTime}
                  onChange={handleInput}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: validationErrors.arrivalTime ? '2px solid #e74c3c' : '1px solid #e0dfff',
                    background: '#f7f5ff',
                    fontSize: 16,
                    accentColor: '#7f5af0'
                  }}
                />
                {validationErrors.arrivalTime && <div style={{ color: '#e74c3c', fontSize: 14, marginTop: 4 }}>{validationErrors.arrivalTime}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ fontWeight: 600, color: '#5a3ac7' }}>Available:</label>
                <input
                  type="checkbox"
                  name="availability"
                  checked={form.availability}
                  onChange={handleInput}
                  style={{ width: 20, height: 20, accentColor: '#7f5af0' }}
                />
              </div>
            </div>

            {/* Running Days */}
            <div style={{ marginBottom: 30 }}>
              <h4 style={{ color: '#333', fontWeight: 500, marginBottom: 16, fontSize: 16 }}>Running Days:</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {DAYS.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 6,
                      border: form.runningDays.includes(day) ? '2px solid #7f5af0' : '1px solid #ddd',
                      background: form.runningDays.includes(day) ? '#7f5af0' : '#fff',
                      color: form.runningDays.includes(day) ? '#fff' : '#666',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontSize: 14
                    }}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
              {validationErrors.runningDays && <div style={{ color: '#dc3545', fontSize: 12, marginTop: 8 }}>{validationErrors.runningDays}</div>}
            </div>

            {/* Train Classes */}
            <div style={{ marginBottom: 30 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h4 style={{ color: '#333', fontWeight: 500, margin: 0, fontSize: 16 }}>Train Classes:</h4>
                <button
                  type="button"
                  onClick={addClass}
                  style={{
                    background: 'linear-gradient(90deg, #7f5af0, #5a3ac7)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '8px 22px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 16,
                    boxShadow: '0 2px 8px #7f5af033'
                  }}
                >
                  <MdAdd size={16} /> Add Class
                </button>
              </div>
              {form.trainClasses.map((cls, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 16, marginBottom: 16, alignItems: 'end', padding: '16px', background: '#f8f9fa', borderRadius: 6 }}>
                  <div>
                    <select
                      value={cls.classType}
                      onChange={e => handleClassInput(idx, 'classType', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 6,
                        border: validationErrors[`class_${idx}_type`] ? '2px solid #dc3545' : '1px solid #ddd',
                        background: '#fff',
                        fontSize: 14
                      }}
                    >
                      <option value="" disabled>Select Class Type (AC/Sleeper)</option>
                      {CLASS_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    {validationErrors[`class_${idx}_type`] && <div style={{ color: '#dc3545', fontSize: 11, marginTop: 4 }}>{validationErrors[`class_${idx}_type`]}</div>}
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Seat Capacity"
                      value={cls.capacity || ''}
                      onChange={e => handleClassInput(idx, 'capacity', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: validationErrors[`class_${idx}_capacity`] ? '2px solid #e74c3c' : '1px solid #e0dfff',
                        background: '#f7f5ff',
                        fontSize: 14
                      }}
                    />
                    {validationErrors[`class_${idx}_capacity`] && <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 2 }}>{validationErrors[`class_${idx}_capacity`]}</div>}
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Price"
                      value={cls.price || ''}
                      onChange={e => handleClassInput(idx, 'price', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: validationErrors[`class_${idx}_price`] ? '2px solid #e74c3c' : '1px solid #e0dfff',
                        background: '#f7f5ff',
                        fontSize: 14
                      }}
                    />
                    {validationErrors[`class_${idx}_price`] && <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 2 }}>{validationErrors[`class_${idx}_price`]}</div>}
                  </div>
                  <div>
                    <select
                      value={cls.quota}
                      onChange={e => handleClassInput(idx, 'quota', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: validationErrors[`class_${idx}_quota`] ? '2px solid #e74c3c' : '1px solid #e0dfff',
                        background: '#f7f5ff',
                        fontSize: 14
                      }}
                    >
                      <option value="" disabled>Select Quota (General/Ladies)</option>
                      {QUOTAS.map(quota => <option key={quota} value={quota}>{quota}</option>)}
                    </select>
                    {validationErrors[`class_${idx}_quota`] && <div style={{ color: '#e74c3c', fontSize: 12, marginTop: 2 }}>{validationErrors[`class_${idx}_quota`]}</div>}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeClass(idx)}
                    disabled={form.trainClasses.length === 1}
                    style={{
                      background: form.trainClasses.length === 1 ? '#ccc' : '#dc3545',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '10px 12px',
                      cursor: form.trainClasses.length === 1 ? 'not-allowed' : 'pointer',
                      fontSize: 14
                    }}
                  >
                    <MdDelete size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 16, paddingTop: 20, borderTop: '1px solid #e0e0e0' }}>
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(90deg, #7f5af0, #5a3ac7)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 32px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 16,
                  boxShadow: '0 2px 12px #7f5af033'
                }}
              >
                {editingTrain ? 'Update Train' : 'Save Train'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  background: '#fff',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  padding: '12px 24px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trains List */}
      <div>
        <h3 style={{ color: '#5a3ac7', fontWeight: 700, marginBottom: 24 }}>All Trains</h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#999', fontSize: 16 }}>Loading trains...</div>
        ) : trains.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#999', fontSize: 16 }}>No trains found</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
              background: 'rgba(247,245,255,0.85)',
              borderRadius: 18,
              boxShadow: '0 1px 12px #7f5af022',
              minWidth: 1000,
              fontSize: 16
            }}>
              <thead>
                <tr style={{ background: 'linear-gradient(90deg,#e9e3fa 60%,#f7f5ff 100%)', color: '#5a3ac7', fontWeight: 800, fontSize: 17 }}>
                  <th style={{ padding: 16, textAlign: 'center', borderTopLeftRadius: 18 }}>Train Number</th>
                  <th style={{ padding: 16, textAlign: 'center' }}>Name</th>
                  <th style={{ padding: 16, textAlign: 'center' }}>Type</th>
                  <th style={{ padding: 16, textAlign: 'center' }}>Route</th>
                  <th style={{ padding: 16, textAlign: 'center' }}>Timing</th>
                  <th style={{ padding: 16, textAlign: 'center' }}>Days</th>
                  <th style={{ padding: 16, textAlign: 'center' }}>Classes</th>
                  <th style={{ padding: 16, textAlign: 'center' }}>Status</th>
                  <th style={{ padding: 16, textAlign: 'center', borderTopRightRadius: 18 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trains.map((train, idx) => (
                  <tr key={train.trainId} style={{
                    fontSize: 16,
                    background: idx % 2 === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(239,235,255,0.85)',
                    transition: 'background 0.3s',
                    boxShadow: '0 1px 6px #7f5af011'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e9e3fa'}
                  onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(239,235,255,0.85)'}
                  >
                    <td style={{ padding: 16, fontWeight: 700, color: '#4421b4', textAlign: 'center', verticalAlign: 'middle' }}>{train.trainNumber}</td>
                    <td style={{ padding: 16, fontWeight: 700, color: '#4421b4', textAlign: 'center', verticalAlign: 'middle' }}>{train.trainName}</td>
                    <td style={{ padding: 16 }}>
                      <span style={{
                        background: '#f8f9fa',
                        color: '#666',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 500,
                        border: '1px solid #e0e0e0'
                      }}>
                        {train.trainType}
                      </span>
                    </td>
                    <td style={{ padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MdLocationOn size={16} color="#666" />
                        {train.source} → {train.destination}
                      </div>
                    </td>
                    <td style={{ padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MdSchedule size={16} color="#666" />
                        {formatTime(train.departureTime)} - {formatTime(train.arrivalTime)}
                      </div>
                    </td>
                    <td style={{ padding: 16 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {train.runningDays?.map(day => (
                          <span key={day} style={{
                            background: '#f8f9fa',
                            color: '#333',
                            padding: '2px 6px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 500,
                            border: '1px solid #e0e0e0'
                          }}>
                            {day.slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: 16 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {train.trainClasses?.map(cls => (
                          <div key={cls.classId} style={{
                            background: '#f8f9fa',
                            color: '#333',
                            padding: '2px 6px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 500,
                            textAlign: 'center',
                            border: '1px solid #e0e0e0'
                          }}>
                            {cls.classType}: ₹{cls.price}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: 16 }}>
                      <span style={{
                        background: train.availability ? '#28a745' : '#dc3545',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 500
                      }}>
                        {train.availability ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: 16, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEdit(train)}
                          style={{
                            background: '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            padding: '6px 10px',
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 500
                          }}
                        >
                          <MdEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(train.trainNumber)}
                          style={{
                            background: '#dc3545',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            padding: '6px 10px',
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 500
                          }}
                        >
                          <MdDelete size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default ManageTrains;
