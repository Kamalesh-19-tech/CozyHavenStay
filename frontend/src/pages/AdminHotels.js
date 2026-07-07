import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminHotels() {
  const [hotels, setHotels] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token || localStorage.getItem('role') !== 'Admin') { navigate('/login'); return; }
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const res = await axios.get('https://localhost:7077/api/Admin/hotels', { headers: { Authorization: `Bearer ${token}` } });
      setHotels(res.data);
    } catch (err) { setError('Failed to load hotels.'); }
  };

  const deleteHotel = async (hotelId, name) => {
    if (!window.confirm(`Delete "${name}"? All its rooms will also be deleted!`)) return;
    try {
      setError(''); setSuccess('');
      await axios.delete(`https://localhost:7077/api/Admin/hotels/${hotelId}`, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess(`Hotel "${name}" deleted!`);
      fetchHotels();
    } catch (err) {
      setError(err.response?.data || 'Failed to delete hotel.');
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '30px 20px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <div>
            <h2 style={{ margin: 0, color: '#2c3e50' }}>🏨 Manage Hotel Listings</h2>
            <p style={{ color: '#7f8c8d', margin: '5px 0 0' }}>View and manage all hotels registered on the platform.</p>
          </div>
          <button onClick={() => navigate('/admin-dashboard')} style={{ padding: '10px 18px', background: 'white', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>← Back</button>
        </div>

        {error && <div style={{ padding: '12px', background: '#fdedec', color: '#e74c3c', borderRadius: '8px', marginBottom: '15px' }}>{error}</div>}
        {success && <div style={{ padding: '12px', background: '#e8f8f5', color: '#27ae60', borderRadius: '8px', marginBottom: '15px' }}>{success}</div>}

        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          {hotels.length === 0 ? (
            <p style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>No hotels found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ecf0f1' }}>
                  {['ID', 'Hotel Name', 'Location', 'Stars', 'Owner', 'Rooms', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', color: '#2c3e50', textAlign: 'left', fontSize: '13px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hotels.map((h, index) => (
                  <tr key={h.hotelId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '13px 16px', color: '#95a5a6', fontSize: '13px' }}>#{index + 1}</td>
                    <td style={{ padding: '13px 16px', fontWeight: 600, color: '#2c3e50' }}>{h.hotelName}</td>
                    <td style={{ padding: '13px 16px', color: '#7f8c8d' }}>📍 {h.location}</td>
                    <td style={{ padding: '13px 16px' }}>{'⭐'.repeat(h.starRating || 0)}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{h.ownerName}</div>
                      <div style={{ fontSize: '12px', color: '#95a5a6' }}>{h.ownerEmail}</div>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', background: '#e8f4fd', color: '#2980b9' }}>
                        {h.roomCount} rooms
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <button onClick={() => deleteHotel(h.hotelId, h.hotelName)}
                        style={{ padding: '6px 14px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminHotels;




