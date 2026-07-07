import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();
  const name = localStorage.getItem('name');
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    if (role === 'HotelOwner') { navigate('/owner-dashboard'); return; }
    if (role === 'Admin') { navigate('/admin-dashboard'); return; }
    fetchBookings();
  }, []);

  const getBookingStatus = (booking) => {
    if (booking.bookingStatus === 'Cancelled') {
      return { 
        text: 'Cancelled', 
        badgeClass: 'cancelled',
        message: '❌ Cancelled & Refund Processed'
      };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkIn = new Date(booking.checkInDate);
    checkIn.setHours(0, 0, 0, 0);
    
    const checkOut = new Date(booking.checkOutDate);
    checkOut.setHours(0, 0, 0, 0);
    
    if (today < checkIn) {
      return { 
        text: 'Upcoming', 
        badgeClass: 'upcoming',
        message: '📅 Upcoming Trip'
      };
    } else if (today >= checkIn && today <= checkOut) {
      return { 
        text: 'Checked-In (Active)', 
        badgeClass: 'checked-in',
        message: '🏨 Staying: Enjoy your stay!'
      };
    } else {
      return { 
        text: 'Completed', 
        badgeClass: 'completed',
        message: '✅ Stay Completed'
      };
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(
        `https://localhost:7077/api/Booking/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Sort so newest are first
      const sorted = res.data.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
      setBookings(sorted);
    } catch (err) {
      console.error('Error fetching bookings', err);
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await axios.put(
        `https://localhost:7077/api/Booking/cancel/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBookings();
    } catch (err) {
      console.error('Error cancelling booking', err);
    }
  };

  const totalSpent = bookings.reduce((sum, b) => sum + (b.bookingStatus === 'Cancelled' ? 0 : b.totalFare || 0), 0);
  const activeStaysCount = bookings.filter(b => b.bookingStatus === 'Confirmed' && getBookingStatus(b).text === 'Checked-In (Active)').length;
  const upcomingStaysCount = bookings.filter(b => b.bookingStatus === 'Confirmed' && getBookingStatus(b).text === 'Upcoming').length;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        
        <div className="dashboard-header">
          <div className="user-info">
            <h2>Welcome back, {name}!</h2>
            <span className="role-badge">Verified {role}</span>
            <p>Manage your trips and reservations below.</p>
          </div>
          <div className="action-buttons">
            <button className="btn btn-outline" style={{backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'white'}} onClick={() => navigate('/hotels')}>
              🔍 Find a Hotel
            </button>
            <button className="btn btn-outline" style={{backgroundColor: 'white', color: '#e74c3c', borderColor: 'white'}} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="dashboard-layout">
          {/* Main Column */}
          <div className="dashboard-main">
            {/* Guest Stats Grid */}
            <div className="guest-stats-row">
              <div className="guest-stat-card" style={{ borderLeft: '4px solid #3498db' }}>
                <h4>{bookings.length}</h4>
                <p>Total Bookings</p>
              </div>
              <div className="guest-stat-card" style={{ borderLeft: '4px solid #2cc36b' }}>
                <h4>{activeStaysCount}</h4>
                <p>Active Stays</p>
              </div>
              <div className="guest-stat-card" style={{ borderLeft: '4px solid #e67e22' }}>
                <h4>{upcomingStaysCount}</h4>
                <p>Upcoming Trips</p>
              </div>
              <div className="guest-stat-card" style={{ borderLeft: '4px solid #9b59b6' }}>
                <h4>₹{Math.round(totalSpent).toLocaleString('en-IN')}</h4>
                <p>Total Spent</p>
              </div>
            </div>

            <div className="dashboard-content" style={{ padding: 0, background: 'none', border: 'none', boxShadow: 'none' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>My Reservations</h3>
              
              <div className="bookings-grid">
                {bookings.length === 0 ? (
                  <div style={{background: 'white', padding: '40px', textAlign: 'center', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'}}>
                    <p style={{fontSize: '18px', color: '#737373', marginBottom: '20px'}}>You have no upcoming trips.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/hotels')}>Start Exploring</button>
                  </div>
                ) : (
                  bookings.map(booking => {
                    const isConfirmed = booking.bookingStatus === 'Confirmed';
                    const statusInfo = getBookingStatus(booking);
                    return (
                      <div key={booking.bookingId} className={`booking-card ${booking.bookingStatus === 'Cancelled' ? 'cancelled' : statusInfo.badgeClass}`}>
                        <div className="booking-details">
                          <div className="booking-id">Booking Ref: #{booking.bookingId} • Booked on {new Date(booking.bookingDate).toLocaleDateString()}</div>
                          <div className="booking-dates">
                            {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                          </div>
                          <div className="booking-stats">
                            <span>🏨 Room ID: {booking.roomId}</span>
                            <span>👥 {booking.noOfAdults} Adults, {booking.noOfChildren} Children</span>
                          </div>
                          <div style={{ marginTop: '10px', fontSize: '14px', fontWeight: 600, color: '#34495e' }}>
                            {statusInfo.message}
                          </div>
                        </div>
                        
                        <div className="booking-price-action">
                          <div className={`status-badge ${statusInfo.badgeClass}`}>
                            {statusInfo.text}
                          </div>
                          {booking.bookingStatus === 'Cancelled' && (
                            <span style={{ display: 'block', marginTop: '8px', fontSize: '13px', color: '#27ae60', fontWeight: 'bold' }}>
                              💰 Refund Processed
                            </span>
                          )}
                          <div className="booking-total">₹{booking.totalFare}</div>
                          
                          {isConfirmed && statusInfo.text === 'Upcoming' && (
                            <button className="btn btn-outline" style={{borderColor: '#e74c3c', color: '#e74c3c', padding: '5px 15px', fontSize: '14px', marginTop: '10px'}} onClick={() => cancelBooking(booking.bookingId)}>
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="dashboard-sidebar">
            {/* Loyalty Card */}
            <div className="loyalty-card">
              <div className="loyalty-title">Cozy Haven Rewards</div>
              <div className="loyalty-status">
                {bookings.length >= 5 ? '👑 Gold Elite Member' : bookings.length >= 2 ? '✨ Silver Explorer' : '🌱 Classic Member'}
              </div>
              <div className="loyalty-points-bar">
                <div className="loyalty-points-fill" style={{ width: `${Math.min((bookings.length / 5) * 100, 100)}%` }}></div>
              </div>
              <div className="loyalty-footer">
                <span>{bookings.length * 250} XP</span>
                <span>{bookings.length >= 5 ? 'Max Level Achieved' : `${5 - bookings.length} stays to Gold`}</span>
              </div>
              <div style={{ marginTop: '18px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '12px', fontSize: '13px' }}>
                <strong style={{ color: '#fff', display: 'block', marginBottom: '6px' }}>Your Current Perks:</strong>
                {bookings.length >= 5 ? (
                  <ul style={{ margin: 0, paddingLeft: '16px', color: '#e0e6ed', lineHeight: '1.5', listStyleType: 'disc' }}>
                    <li>🔥 15% Platform-Wide Discount</li>
                    <li>🕒 Free Late Checkout (until 3:00 PM)</li>
                    <li>🍳 Free Gourmet Breakfast Buffet</li>
                    <li>🏊 Free Pool & Health Club Access</li>
                  </ul>
                ) : bookings.length >= 2 ? (
                  <ul style={{ margin: 0, paddingLeft: '16px', color: '#e0e6ed', lineHeight: '1.5', listStyleType: 'disc' }}>
                    <li>✨ 10% Platform-Wide Discount</li>
                    <li>📶 Free High-Speed WiFi Upgrade</li>
                    <li>🍹 Complimentary Welcome Drink</li>
                  </ul>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: '16px', color: '#bdc3c7', lineHeight: '1.5', listStyleType: 'disc' }}>
                    <li>🌱 Earn 250 XP per stay</li>
                    <li>🔒 Lock: 10% discount (reaches at 2 stays)</li>
                  </ul>
                )}
              </div>
            </div>

            {/* Helpline Card */}
            <div className="sidebar-box">
              <h4>📞 Customer Support</h4>
              <div className="support-item">
                <span>🛡️</span> 24/7 Helpline: <strong>+1-800-COZY-STAY</strong>
              </div>
              <div className="support-item">
                <span>✉️</span> Support: <strong>help@cozyhaven.com</strong>
              </div>
              <div className="support-item" style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '10px' }}>
                Need special arrangements or assistance with checkout? Call our customer desk!
              </div>
            </div>

            {/* Travel Guidelines */}
            <div className="sidebar-box">
              <h4>💡 Travel Guidelines</h4>
              <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: '#555', lineVerticalAlign: 'middle', lineHeight: '1.6' }}>
                <li style={{ marginBottom: '8px' }}>Standard check-in starts at 12:00 PM local time.</li>
                <li style={{ marginBottom: '8px' }}>Please keep your photo ID ready at the reception counter.</li>
                <li>Free cancellations are valid up to 24 hours prior to check-in.</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;



