import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function ManageRooms() {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [rooms, setRooms] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    roomNumber: '', bedType: 'Single', roomSize: '',
    maxOccupancy: 2, baseFare: '', isAC: true, isAvailable: true
  });

  useEffect(() => {
    fetchHotel();
    fetchRooms();
  }, []);

  const fetchHotel = async () => {
    const res = await axios.get(`https://localhost:7077/api/Hotel/${hotelId}`);
    setHotel(res.data);
  };

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`https://localhost:7077/api/Room/hotel/${hotelId}`);
      setRooms(res.data);
    } catch { setRooms([]); }
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleAddRoom = async () => {
    if (!form.roomNumber || !form.baseFare) {
      setError('Room number and base fare are required!');
      return;
    }
    try {
      await axios.post('https://localhost:7077/api/Room',
        { ...form, hotelId: parseInt(hotelId), baseFare: parseFloat(form.baseFare), maxOccupancy: parseInt(form.maxOccupancy) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Room added! ✅');
      setError('');
      setShowForm(false);
      setForm({ roomNumber: '', bedType: 'Single', roomSize: '', maxOccupancy: 2, baseFare: '', isAC: true, isAvailable: true });
      fetchRooms();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err.response);
      const data = err.response?.data;
      const backendError = data?.errors ? JSON.stringify(data.errors) : (data?.title || data || err.message);
      setError(`Failed to add room! Details: ${typeof backendError === 'object' ? JSON.stringify(backendError) : backendError}`);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await axios.delete(`https://localhost:7077/api/Room/${roomId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRooms();
    } catch { setError('Failed to delete room!'); }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/owner-dashboard')}>← Back</button>
        <div>
          <h2 style={styles.title}>🛏️ Manage Rooms</h2>
          <p style={styles.subtext}>{hotel?.hotelName} — {hotel?.location}</p>
        </div>
      </div>

      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}

      {/* Add Room Button */}
      <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
        {showForm ? '✖ Cancel' : '+ Add New Room'}
      </button>

      {/* Add Room Form */}
      {showForm && (
        <div style={styles.formBox}>
          <h4 style={styles.formTitle}>New Room Details</h4>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>Room Number *</label>
              <input style={styles.input} name="roomNumber"
                placeholder="e.g. 101" onChange={handleChange} value={form.roomNumber} />
            </div>
            <div>
              <label style={styles.label}>Bed Type</label>
              <select style={styles.input} name="bedType" onChange={handleChange}>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="King">King</option>
                <option value="Queen">Queen</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Room Size (sqft)</label>
              <input style={styles.input} name="roomSize"
                placeholder="e.g. 300" onChange={handleChange} value={form.roomSize} />
            </div>
            <div>
              <label style={styles.label}>Max Occupancy</label>
              <input style={styles.input} type="number" name="maxOccupancy"
                value={form.maxOccupancy} onChange={handleChange} />
            </div>
            <div>
              <label style={styles.label}>Base Fare (₹/night) *</label>
              <input style={styles.input} type="number" name="baseFare"
                placeholder="e.g. 2500" onChange={handleChange} value={form.baseFare} />
            </div>
            <div style={styles.checkRow}>
              <label style={styles.checkLabel}>
                <input type="checkbox" name="isAC" checked={form.isAC} onChange={handleChange} />
                &nbsp;❄️ AC Room
              </label>
              <label style={styles.checkLabel}>
                <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleChange} />
                &nbsp;✅ Available
              </label>
            </div>
          </div>
          <button style={styles.submitBtn} onClick={handleAddRoom}>✅ Add Room</button>
        </div>
      )}

      {/* Rooms List */}
      <h3 style={styles.sectionTitle}>Rooms ({rooms.length})</h3>
      {rooms.length === 0 ? (
        <div style={styles.emptyBox}>
          <p>No rooms yet! Click "Add New Room" to add rooms.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {rooms.map(room => (
            <div key={room.roomId} style={styles.card}>
              <div style={styles.cardTop}>
                <h4 style={styles.roomNum}>Room {room.roomNumber}</h4>
                <span style={{ ...styles.statusBadge, backgroundColor: room.isAvailable ? '#27ae60' : '#e74c3c' }}>
                  {room.isAvailable ? 'Available' : 'Booked'}
                </span>
              </div>
              <p style={styles.info}>🛏️ {room.bedType} Bed</p>
              {room.roomSize && <p style={styles.info}>📐 {room.roomSize} sqft</p>}
              <p style={styles.info}>👥 Max {room.maxOccupancy} people</p>
              <p style={styles.fare}>₹{room.baseFare}/night</p>
              <p style={styles.info}>{room.isAC ? '❄️ AC' : '🌀 Non-AC'}</p>
              <button style={styles.deleteBtn} onClick={() => handleDeleteRoom(room.roomId)}>
                🗑️ Delete Room
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '30px', backgroundColor: '#f0f4f8', minHeight: '100vh' },
  header: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px', backgroundColor: '#2c3e50', padding: '20px 25px', borderRadius: '12px', color: 'white' },
  backBtn: { padding: '8px 16px', backgroundColor: '#7f8c8d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  title: { margin: 0, fontSize: '22px' },
  subtext: { margin: '4px 0 0 0', color: '#bdc3c7', fontSize: '13px' },
  addBtn: { padding: '12px 25px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' },
  formBox: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' },
  formTitle: { margin: '0 0 15px 0', color: '#2c3e50' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', color: '#555', fontWeight: 'bold', fontSize: '13px' },
  input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  checkRow: { display: 'flex', gap: '20px', alignItems: 'center', paddingTop: '20px' },
  checkLabel: { display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' },
  submitBtn: { width: '100%', padding: '12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', cursor: 'pointer', fontWeight: 'bold' },
  sectionTitle: { color: '#2c3e50', marginBottom: '15px' },
  emptyBox: { backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#7f8c8d' },
  grid: { display: 'flex', flexWrap: 'wrap', gap: '20px' },
  card: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', width: '220px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  roomNum: { margin: 0, color: '#2c3e50', fontSize: '16px' },
  statusBadge: { padding: '4px 10px', borderRadius: '20px', color: 'white', fontSize: '11px', fontWeight: 'bold' },
  info: { margin: '4px 0', color: '#555', fontSize: '13px' },
  fare: { margin: '8px 0', color: '#27ae60', fontWeight: 'bold', fontSize: '16px' },
  deleteBtn: { width: '100%', padding: '8px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px', fontSize: '13px' },
  error: { color: 'red', marginBottom: '10px' },
  success: { color: 'green', marginBottom: '10px', fontWeight: 'bold' },
};

export default ManageRooms;




