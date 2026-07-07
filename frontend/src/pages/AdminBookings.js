import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [revenueReport, setRevenueReport] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'revenue'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (!token || role !== 'Admin') { navigate('/login'); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [bookingsRes, reportRes, statsRes] = await Promise.all([
        axios.get('https://localhost:7077/api/Booking/all', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('https://localhost:7077/api/Admin/revenue-report', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('https://localhost:7077/api/Admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setBookings(bookingsRes.data);
      setRevenueReport(reportRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load data.');
    }
  };

  const updateStatus = async (bookingId, newStatus, totalFare) => {
    if (newStatus === 'Cancelled') {
      const confirm = window.confirm(
        `Cancel Booking #BK${bookingId}?\n\n💰 Refund of ₹${totalFare?.toFixed(2)} will be automatically processed to the guest.\n\nProceed?`
      );
      if (!confirm) return;
    }
    try {
      setSuccess(''); setError('');
      await axios.put(`https://localhost:7077/api/Booking/update-status/${bookingId}`,
        `"${newStatus}"`,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      if (newStatus === 'Cancelled') {
        setSuccess(`✅ Booking #BK${bookingId} cancelled — Refund of ₹${totalFare?.toFixed(2)} processed to guest!`);
      } else {
        setSuccess(`Booking #BK${bookingId} marked as ${newStatus}`);
      }
      fetchAll();
    } catch (err) {
      setError('Failed to update booking status.');
    }
  };

  const statusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'confirmed' || s === 'approve') return { bg: '#e8f8f5', color: '#27ae60', label: 'Confirmed' };
    if (s === 'completed') return { bg: '#ebf5fb', color: '#2980b9', label: 'Completed' };
    if (s === 'pending') return { bg: '#fef9e7', color: '#f39c12', label: 'Pending' };
    return { bg: '#fdedec', color: '#e74c3c', label: 'Cancelled' };
  };

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '30px 20px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <div>
            <h2 style={{ margin: 0, color: '#2c3e50' }}>🛡️ Admin — Bookings & Revenue</h2>
            <p style={{ color: '#7f8c8d', margin: '5px 0 0 0' }}>Monitor all bookings and revenue across every hotel on the platform.</p>
          </div>
          <button style={{ padding: '10px 18px', background: 'white', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}
            onClick={() => navigate('/admin-dashboard')}>← Back</button>
        </div>

        {/* Platform-wide Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
          {[
            { label: '💰 Total Platform Revenue', value: `₹${(stats.totalRevenue || 0).toFixed(2)}`, color: '#27ae60' },
            { label: '📅 Total Bookings', value: stats.totalBookings || 0, color: '#3498db' },
            { label: '🏨 Hotels', value: stats.totalHotels || 0, color: '#9b59b6' },
            { label: '👥 Registered Users', value: stats.totalUsers || 0, color: '#f39c12' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderLeft: `4px solid ${s.color}` }}>
              <p style={{ margin: 0, color: '#7f8c8d', fontSize: '12px' }}>{s.label}</p>
              <h2 style={{ margin: '8px 0 0 0', color: s.color, fontSize: '22px' }}>{s.value}</h2>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => setActiveTab('all')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: activeTab === 'all' ? '#3498db' : 'white', color: activeTab === 'all' ? 'white' : '#2c3e50', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            📋 All Bookings
          </button>
          <button onClick={() => setActiveTab('revenue')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: activeTab === 'revenue' ? '#27ae60' : 'white', color: activeTab === 'revenue' ? 'white' : '#2c3e50', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            💰 Revenue by Hotel
          </button>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '15px', padding: '10px', background: '#fdedec', borderRadius: '8px' }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: '15px', padding: '10px', background: '#e8f8f5', borderRadius: '8px' }}>{success}</div>}

        {/* ALL BOOKINGS TAB */}
        {activeTab === 'all' && (
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
            {bookings.length === 0 ? (
              <p style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>No bookings on the platform yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ecf0f1' }}>
                      {['Booking ID', 'Guest', 'Hotel', 'Dates', 'Amount Paid', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '14px 16px', color: '#2c3e50', fontSize: '13px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.bookingId} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '13px 16px', fontWeight: 'bold', color: '#2c3e50' }}>BK{b.bookingId}</td>
                        <td style={{ padding: '13px 16px' }}>{b.guestName}</td>
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ fontWeight: 500 }}>{b.hotelName}</div>
                          <div style={{ fontSize: '12px', color: '#95a5a6' }}>Room {b.roomNumber}</div>
                        </td>
                        <td style={{ padding: '13px 16px', fontSize: '13px' }}>
                          {new Date(b.checkInDate).toLocaleDateString()} – {new Date(b.checkOutDate).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '13px 16px', fontWeight: 'bold', color: '#27ae60' }}>₹{b.totalFare?.toFixed(2)}</td>
                        <td style={{ padding: '13px 16px' }}>
                          {(() => {
                            const today = new Date();
                            today.setHours(0,0,0,0);
                            const checkOut = new Date(b.checkOutDate);
                            checkOut.setHours(0,0,0,0);
                            
                            let displayStatus = b.bookingStatus;
                            if ((b.bookingStatus || '').toLowerCase() === 'confirmed' && today > checkOut) {
                              displayStatus = 'Completed';
                            }

                            return (
                              <>
                                <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: statusColor(displayStatus).bg, color: statusColor(displayStatus).color }}>
                                  {statusColor(displayStatus).label}
                                </span>
                                {displayStatus === 'Cancelled' && (
                                  <span style={{ display: 'block', marginTop: '4px', fontSize: '11px', color: '#27ae60', fontWeight: 'bold' }}>💰 Refund Processed</span>
                                )}
                              </>
                            );
                          })()}
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          {(() => {
                            const today = new Date();
                            today.setHours(0,0,0,0);
                            const checkOut = new Date(b.checkOutDate);
                            checkOut.setHours(0,0,0,0);

                            const statusLower = (b.bookingStatus || '').toLowerCase();
                            
                            if (statusLower === 'pending') {
                              return <button onClick={() => updateStatus(b.bookingId, 'Confirmed', b.totalFare)} style={{ padding: '5px 10px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>✔ Approve</button>;
                            }
                            
                            if ((statusLower === 'confirmed' || statusLower === 'approve') && today <= checkOut) {
                              return (
                                <div style={{ display: 'flex', gap: '5px' }}>
                                  <button onClick={() => updateStatus(b.bookingId, 'Completed', b.totalFare)} style={{ padding: '5px 10px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>✅ Complete</button>
                                  <button onClick={() => updateStatus(b.bookingId, 'Cancelled', b.totalFare)} style={{ padding: '5px 10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>💰 Cancel & Refund</button>
                                </div>
                              );
                            }

                            if (statusLower === 'cancelled') {
                              return <span style={{ fontSize: '12px', color: '#27ae60' }}>✔ Refunded</span>;
                            }

                            return null; // For completed stays, actions are not needed
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* REVENUE BY HOTEL TAB */}
        {activeTab === 'revenue' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {revenueReport.length === 0 ? (
              <p style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d', background: 'white', borderRadius: '12px' }}>No revenue data yet.</p>
            ) : revenueReport.map(hotel => (
              <div key={hotel.hotelId} style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                {/* Hotel Header */}
                <div style={{ padding: '18px 22px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fffe' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#2c3e50' }}>🏨 {hotel.hotelName}</h3>
                    <p style={{ margin: '4px 0 0 0', color: '#7f8c8d', fontSize: '13px' }}>{hotel.totalBookings} bookings from this property</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d' }}>Total Revenue</p>
                    <h2 style={{ margin: '4px 0 0 0', color: '#27ae60' }}>₹{hotel.totalRevenue?.toFixed(2)}</h2>
                  </div>
                </div>
                {/* Hotel Bookings */}
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #eee' }}>
                      {['Booking ID', 'Guest', 'Check In', 'Check Out', 'Amount Paid', 'Status'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', color: '#7f8c8d', fontSize: '12px', fontWeight: '600' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hotel.bookings.map(b => (
                      <tr key={b.bookingId} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <td style={{ padding: '10px 16px', fontWeight: 'bold', color: '#2c3e50' }}>BK{b.bookingId}</td>
                        <td style={{ padding: '10px 16px' }}>{b.guestName}</td>
                        <td style={{ padding: '10px 16px', fontSize: '13px' }}>{new Date(b.checkInDate).toLocaleDateString()}</td>
                        <td style={{ padding: '10px 16px', fontSize: '13px' }}>{new Date(b.checkOutDate).toLocaleDateString()}</td>
                        <td style={{ padding: '10px 16px', fontWeight: 'bold', color: '#27ae60' }}>₹{b.totalFare?.toFixed(2)}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', backgroundColor: statusColor(b.bookingStatus).bg, color: statusColor(b.bookingStatus).color }}>
                            {b.bookingStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminBookings;




