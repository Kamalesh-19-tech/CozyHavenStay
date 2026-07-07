import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './OwnerDashboard.css';

function OwnerDashboard() {
  const [hotels, setHotels] = useState([]);
  const [reviews, setReviews] = useState([]); // all reviews for owner's hotels
  const [bookings, setBookings] = useState([]); // bookings for owner's hotels
  const [roomsCount, setRoomsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('properties'); // 'properties' | 'reviews'
  const navigate = useNavigate();
  const name = localStorage.getItem('name');
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchMyHotels();
  }, []);

  const fetchMyHotels = async () => {
    try {
      const res = await axios.get(
        `https://localhost:7077/api/Hotel/owner/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const myHotels = res.data;
      setHotels(myHotels);

      // Fetch reviews & count rooms
      const allReviews = [];
      let totalRooms = 0;
      for (const hotel of myHotels) {
        try {
          const revRes = await axios.get(`https://localhost:7077/api/Review/hotel/${hotel.hotelId}`);
          revRes.data.forEach(r => allReviews.push({ ...r, hotelName: hotel.hotelName }));
        } catch {}

        try {
          const roomsRes = await axios.get(`https://localhost:7077/api/Room/hotel/${hotel.hotelId}`);
          totalRooms += roomsRes.data.length;
        } catch {}
      }
      setRoomsCount(totalRooms);

      // Sort newest first
      allReviews.sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate));
      setReviews(allReviews);

      // Fetch bookings for owner to calculate revenue and active bookings count
      try {
        const bookingsRes = await axios.get(
          `https://localhost:7077/api/Booking/owner/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBookings(bookingsRes.data);
      } catch (err) {
        console.error('Error fetching owner bookings', err);
      }
    } catch (err) {
      console.error('Error fetching hotels', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (hotelId) => {
    if (!window.confirm('Are you sure you want to delete this hotel? This action cannot be undone.')) return;
    try {
      await axios.delete(
        `https://localhost:7077/api/v1/Hotel/${hotelId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMyHotels();
    } catch (err) {
      console.error('Error deleting hotel', err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.bookingStatus === 'Cancelled' ? 0 : b.totalFare || 0), 0);
  const activeBookingsCount = bookings.filter(b => b.bookingStatus === 'Confirmed').length;

  const starColor = (rating) => {
    if (rating >= 4) return '#27ae60';
    if (rating === 3) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <div className="owner-dashboard-page">
      <div className="dashboard-container">

        {/* Header */}
        <div className="dashboard-header">
          <div className="user-info">
            <h2>🏨 Welcome, {name}!</h2>
            <p>Hotel Owner Management Dashboard</p>
          </div>
          <div className="action-buttons">
            <span className="role-badge">Verified Owner</span>
            <button className="btn btn-outline" style={{ backgroundColor: 'white', color: '#e74c3c', borderColor: 'white', padding: '8px 16px' }} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-card" style={{ borderTop: '4px solid #3498db' }}>
            <h3 style={{ color: '#3498db' }}>{hotels.length}</h3>
            <p>Properties Listed</p>
          </div>
          <div className="stat-card" style={{ borderTop: '4px solid #8e44ad' }}>
            <h3 style={{ color: '#8e44ad' }}>{roomsCount}</h3>
            <p>Rooms Managed</p>
          </div>
          <div className="stat-card" style={{ borderTop: '4px solid #e67e22' }}>
            <h3 style={{ color: '#e67e22' }}>{activeBookingsCount}</h3>
            <p>Active Bookings</p>
          </div>
          <div className="stat-card" style={{ borderTop: '4px solid #2cc36b' }}>
            <h3 style={{ color: '#2cc36b' }}>₹{Math.round(totalRevenue).toLocaleString('en-IN')}</h3>
            <p>Total Revenue</p>
          </div>
          <div className="stat-card" style={{ borderTop: '4px solid #f39c12' }}>
            <h3 style={{ color: '#f39c12' }}>{reviews.length > 0 ? `⭐ ${avgRating}` : '—'}</h3>
            <p>Avg Guest Rating ({reviews.length} reviews)</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', margin: '20px 0 5px' }}>
          <button onClick={() => setActiveTab('properties')}
            style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: activeTab === 'properties' ? '#3498db' : 'white', color: activeTab === 'properties' ? 'white' : '#2c3e50', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            🏨 My Properties
          </button>
          <button onClick={() => setActiveTab('reviews')}
            style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: activeTab === 'reviews' ? '#f39c12' : 'white', color: activeTab === 'reviews' ? 'white' : '#2c3e50', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'relative' }}>
            ⭐ Guest Reviews {reviews.length > 0 && <span style={{ background: '#e74c3c', color: 'white', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', marginLeft: '5px' }}>{reviews.length}</span>}
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline" style={{ backgroundColor: 'white', color: '#3498db', borderColor: '#3498db' }} onClick={() => navigate('/manage-bookings')}>
              📋 View All Bookings
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/add-hotel')}>
              + Add New Property
            </button>
          </div>
        </div>

        {/* PROPERTIES TAB */}
        {activeTab === 'properties' && (
          loading ? (
            <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Loading your portfolio...</p>
          ) : hotels.length === 0 ? (
            <div style={{ background: 'white', padding: '60px', textAlign: 'center', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: '20px', color: '#2c3e50', marginBottom: '10px' }}>Your portfolio is empty</p>
              <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>Start by adding your first property to accept bookings.</p>
              <button className="btn btn-primary" onClick={() => navigate('/add-hotel')}>Add Property</button>
            </div>
          ) : (
            <div className="hotels-grid">
              {hotels.map(hotel => (
                <div key={hotel.hotelId} className="hotel-card">
                  <div className="hotel-header">
                    <h3>{hotel.hotelName}</h3>
                    <div className="stars">{'⭐'.repeat(hotel.starRating)}</div>
                  </div>
                  <div className="location">📍 {hotel.location}</div>
                  <div className="hotel-desc">{hotel.description.substring(0, 100)}{hotel.description.length > 100 ? '...' : ''}</div>
                  <div className="amenities-tags">
                    {hotel.hasWifi && <span className="amenity-tag">WiFi</span>}
                    {hotel.hasParking && <span className="amenity-tag">Parking</span>}
                    {hotel.hasDining && <span className="amenity-tag">Dining</span>}
                    {hotel.hasPool && <span className="amenity-tag">Pool</span>}
                    {hotel.hasGym && <span className="amenity-tag">Gym</span>}
                  </div>
                  <div className="hotel-actions">
                    <button className="btn btn-primary" onClick={() => navigate(`/manage-rooms/${hotel.hotelId}`)}>
                      Manage Rooms
                    </button>
                    <button className="btn btn-outline" style={{ color: '#e74c3c', borderColor: '#e74c3c' }} onClick={() => handleDelete(hotel.hotelId)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div style={{ marginTop: '15px' }}>
            {reviews.length === 0 ? (
              <div style={{ background: 'white', padding: '60px', textAlign: 'center', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: '20px', color: '#7f8c8d' }}>No guest reviews yet.</p>
                <p style={{ color: '#95a5a6' }}>Once guests review your hotel, they'll appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {reviews.map((r, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderLeft: `5px solid ${starColor(r.rating)}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        {/* Hotel name badge */}
                        <span style={{ fontSize: '12px', background: '#ebf5fb', color: '#2980b9', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold', marginBottom: '8px', display: 'inline-block' }}>
                          🏨 {r.hotelName}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                          <span style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '15px' }}>{r.guestName}</span>
                          <div style={{ color: '#f39c12', fontSize: '18px' }}>
                            {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                          </div>
                          <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', background: starColor(r.rating) + '22', color: starColor(r.rating) }}>
                            {r.rating}/5 — {r.rating >= 4 ? 'Great' : r.rating === 3 ? 'Average' : 'Needs Improvement'}
                          </span>
                        </div>
                      </div>
                      <span style={{ color: '#95a5a6', fontSize: '12px' }}>
                        {new Date(r.reviewDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p style={{ margin: '12px 0 0', color: '#555', lineHeight: '1.6', fontSize: '14px' }}>
                      💬 "{r.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default OwnerDashboard;




