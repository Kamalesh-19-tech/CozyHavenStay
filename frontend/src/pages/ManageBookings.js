import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './OwnerDashboard.css'; // Reuse dashboard styles

function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchOwnerBookings();
  }, []);

  const fetchOwnerBookings = async () => {
    try {
      const res = await axios.get(
        `https://localhost:7077/api/Booking/owner/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings(res.data);
    } catch (err) {
      console.error('Error fetching owner bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this booking as ${newStatus}?`)) return;
    try {
      // We will call the existing cancel endpoint if the status is Cancelled, otherwise mock the update
      if (newStatus === 'Cancelled' || newStatus === 'Refunded') {
         await axios.put(`https://localhost:7077/api/Booking/cancel/${bookingId}`, {}, {
           headers: { Authorization: `Bearer ${token}` }
         });
      }
      // Re-fetch bookings
      fetchOwnerBookings();
    } catch (err) {
      alert('Failed to update booking status.');
    }
  };

  const getBookingStatusBadge = (booking) => {
    if (booking.bookingStatus === 'Cancelled') {
      return { 
        text: 'Cancelled', 
        bg: '#fdedec', 
        color: '#e74c3c',
        border: '1px solid #fadbd8'
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
        bg: '#eaf2f8', 
        color: '#2980b9',
        border: '1px solid #a9cce3'
      };
    } else if (today >= checkIn && today <= checkOut) {
      return { 
        text: 'Active (Checked-In)', 
        bg: '#eafaf1', 
        color: '#27ae60',
        border: '1px solid #abebc6'
      };
    } else {
      return { 
        text: 'Completed', 
        bg: '#f4f6f7', 
        color: '#7f8c8d',
        border: '1px solid #d5dbdb'
      };
    }
  };

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalFare || 0), 0);
  const confirmedCount = bookings.filter(b => b.bookingStatus === 'Confirmed').length;

  return (
    <div className="owner-dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header" style={{marginBottom: '20px'}}>
          <div className="user-info">
            <button className="btn btn-outline" style={{padding: '5px 10px', marginBottom: '10px'}} onClick={() => navigate('/owner-dashboard')}>
              ← Back to Dashboard
            </button>
            <h2>📋 My Property Bookings & Revenue</h2>
            <p>View all guest bookings, payment amounts, and manage reservations.</p>
          </div>
        </div>

        {/* Revenue Summary Cards */}
        {!loading && bookings.length > 0 && (
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px'}}>
            <div style={{background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', borderLeft: '4px solid #27ae60'}}>
              <p style={{margin: 0, color: '#7f8c8d', fontSize: '13px'}}>💰 Total Revenue Earned</p>
              <h2 style={{margin: '8px 0 0 0', color: '#27ae60'}}>₹{totalRevenue.toFixed(2)}</h2>
            </div>
            <div style={{background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', borderLeft: '4px solid #3498db'}}>
              <p style={{margin: 0, color: '#7f8c8d', fontSize: '13px'}}>📅 Total Bookings</p>
              <h2 style={{margin: '8px 0 0 0', color: '#3498db'}}>{bookings.length}</h2>
            </div>
            <div style={{background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', borderLeft: '4px solid #f39c12'}}>
              <p style={{margin: 0, color: '#7f8c8d', fontSize: '13px'}}>✅ Active Bookings</p>
              <h2 style={{margin: '8px 0 0 0', color: '#f39c12'}}>{confirmedCount}</h2>
            </div>
          </div>
        )}

        <div className="section-title">
          <span>Recent Reservations</span>
        </div>

        {loading ? (
          <p style={{textAlign: 'center', color: '#7f8c8d'}}>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <div style={{background: 'white', padding: '60px', textAlign: 'center', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'}}>
            <p style={{fontSize: '20px', color: '#2c3e50', marginBottom: '10px'}}>No bookings yet</p>
            <p style={{color: '#7f8c8d'}}>When users book your properties, they will appear here.</p>
          </div>
        ) : (
          <div style={{background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', overflow: 'hidden'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
              <thead>
                <tr style={{backgroundColor: '#f8f9fa', borderBottom: '2px solid #ecf0f1'}}>
                  <th style={{padding: '15px 20px', color: '#2c3e50'}}>Booking ID</th>
                  <th style={{padding: '15px 20px', color: '#2c3e50'}}>Guest & Hotel</th>
                  <th style={{padding: '15px 20px', color: '#2c3e50'}}>Dates</th>
                  <th style={{padding: '15px 20px', color: '#2c3e50'}}>Total Paid</th>
                  <th style={{padding: '15px 20px', color: '#2c3e50'}}>Status</th>
                  <th style={{padding: '15px 20px', color: '#2c3e50'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.bookingId} style={{borderBottom: '1px solid #ecf0f1'}}>
                    <td style={{padding: '15px 20px', fontWeight: 'bold', color: '#34495e'}}>#{b.bookingId}</td>
                    <td style={{padding: '15px 20px'}}>
                      <div style={{fontWeight: 500}}>{b.guestName}</div>
                      <div style={{fontSize: '13px', color: '#7f8c8d'}}>{b.hotelName} (Room {b.roomNumber})</div>
                    </td>
                    <td style={{padding: '15px 20px', fontSize: '14px'}}>
                      <div>{new Date(b.checkInDate).toLocaleDateString()}</div>
                      <div style={{color: '#7f8c8d'}}>to {new Date(b.checkOutDate).toLocaleDateString()}</div>
                    </td>
                    <td style={{padding: '15px 20px', fontWeight: 'bold', color: '#27ae60'}}>
                      ₹{b.totalFare.toFixed(2)}
                    </td>
                    <td style={{padding: '15px 20px'}}>
                      {(() => {
                        const badge = getBookingStatusBadge(b);
                        return (
                          <span style={{
                            padding: '6px 12px', 
                            borderRadius: '20px', 
                            fontSize: '12px', 
                            fontWeight: 'bold',
                            backgroundColor: badge.bg,
                            color: badge.color,
                            border: badge.border,
                            display: 'inline-block'
                          }}>
                            {badge.text}
                          </span>
                        );
                      })()}
                    </td>
                    <td style={{padding: '15px 20px'}}>
                      {(() => {
                        const badge = getBookingStatusBadge(b);
                        if (b.bookingStatus === 'Confirmed' && badge.text === 'Upcoming') {
                          return (
                            <button 
                              className="btn btn-outline" 
                              style={{color: '#e74c3c', borderColor: '#e74c3c', padding: '6px 12px', fontSize: '13px'}}
                              onClick={() => handleStatusChange(b.bookingId, 'Refunded')}
                            >
                              Cancel & Refund
                            </button>
                          );
                        } else {
                          return <span style={{color: '#7f8c8d', fontSize: '13px'}}>No actions</span>;
                        }
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageBookings;




