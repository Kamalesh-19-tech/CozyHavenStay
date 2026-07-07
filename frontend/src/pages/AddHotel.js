import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddHotel() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    hotelName: '', location: '', description: '',
    starRating: 3, hasWifi: false, hasParking: false,
    hasDining: false, hasPool: false, hasGym: false,
    hasRoomService: false
  });

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async () => {
    if (!form.hotelName || !form.location || !form.description) {
      setError('Please fill all required fields!');
      return;
    }
    try {
      await axios.post('https://localhost:7077/api/Hotel',
        { ...form, ownerId: parseInt(userId), starRating: parseInt(form.starRating) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Hotel added successfully! 🎉');
      setTimeout(() => navigate('/owner-dashboard'), 2000);
    } catch (err) {
      setError('Failed to add hotel. Try again!');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        {/* Header */}
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate('/owner-dashboard')}>← Back</button>
          <h2 style={styles.title}>🏨 Add New Hotel</h2>
        </div>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        {/* Basic Info */}
        <h4 style={styles.section}>Basic Information</h4>
        <label style={styles.label}>Hotel Name *</label>
        <input style={styles.input} name="hotelName"
          placeholder="e.g. Grand Chennai Palace"
          onChange={handleChange} />

        <label style={styles.label}>Location *</label>
        <input style={styles.input} name="location"
          placeholder="e.g. Chennai"
          onChange={handleChange} />

        <label style={styles.label}>Description *</label>
        <textarea style={styles.textarea} name="description"
          placeholder="Describe your hotel..."
          onChange={handleChange} rows={3} />

        <label style={styles.label}>Star Rating</label>
        <select style={styles.input} name="starRating" onChange={handleChange}>
          <option value={1}>⭐ 1 Star</option>
          <option value={2}>⭐⭐ 2 Stars</option>
          <option value={3} selected>⭐⭐⭐ 3 Stars</option>
          <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
          <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
        </select>

        {/* Amenities */}
        <h4 style={styles.section}>Amenities</h4>
        <div style={styles.checkGrid}>
          {[
            { name: 'hasWifi', label: '📶 WiFi' },
            { name: 'hasParking', label: '🚗 Parking' },
            { name: 'hasDining', label: '🍽️ Dining' },
            { name: 'hasPool', label: '🏊 Pool' },
            { name: 'hasGym', label: '💪 Gym' },
            { name: 'hasRoomService', label: '🛎️ Room Service' },
          ].map(item => (
            <label key={item.name} style={styles.checkLabel}>
              <input type="checkbox" name={item.name}
                onChange={handleChange} style={{ marginRight: '8px' }} />
              {item.label}
            </label>
          ))}
        </div>

        <button style={styles.submitBtn} onClick={handleSubmit}>
          ✅ Add Hotel
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', padding: '30px', backgroundColor: '#f0f4f8', minHeight: '100vh' },
  box: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '500px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  header: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' },
  backBtn: { padding: '8px 16px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  title: { margin: 0, color: '#2c3e50' },
  section: { color: '#2c3e50', borderBottom: '2px solid #f0f4f8', paddingBottom: '8px', marginTop: '20px' },
  label: { display: 'block', marginBottom: '5px', color: '#555', fontWeight: 'bold', fontSize: '14px' },
  input: { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' },
  checkGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' },
  checkLabel: { display: 'flex', alignItems: 'center', fontSize: '14px', color: '#555', cursor: 'pointer' },
  submitBtn: { width: '100%', padding: '14px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  error: { color: 'red', textAlign: 'center', marginBottom: '10px' },
  success: { color: 'green', textAlign: 'center', marginBottom: '10px' },
};

export default AddHotel;




