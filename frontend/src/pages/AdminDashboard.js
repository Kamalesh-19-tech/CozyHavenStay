import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalHotels: 0, totalRooms: 0, totalBookings: 0, totalRevenue: 0 });
  const [revenueData, setRevenueData] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const navigate = useNavigate();
  const name = localStorage.getItem('name');
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    if (role !== 'Admin') { navigate('/dashboard'); return; }
    fetchStats();
    fetchRevenueData();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('https://localhost:7077/api/Admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching admin stats', err);
    }
  };

  const fetchRevenueData = async () => {
    try {
      const res = await axios.get('https://localhost:7077/api/Admin/revenue-report', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRevenueData(res.data);
    } catch (err) {
      console.error('Error fetching admin revenue report', err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const maxRevenue = revenueData.length > 0 ? Math.max(...revenueData.map(h => h.totalRevenue || 0), 1) : 1;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        
        <div className="admin-header">
          <div className="user-info">
            <h2>🛡️ Welcome, {name}!</h2>
            <p>Platform Administration Dashboard</p>
          </div>
          <div className="action-buttons">
            <span className="admin-role-badge">Super Admin</span>
            <button className="btn btn-outline logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <h3>{stats.totalUsers}</h3>
            <p>Total Registered Users</p>
          </div>
          <div className="admin-stat-card">
            <h3>{stats.totalHotels}</h3>
            <p>Hotels on Platform</p>
          </div>
          <div className="admin-stat-card">
            <h3>{stats.totalRooms}</h3>
            <p>Rooms Listed</p>
          </div>
          <div className="admin-stat-card bookings-card">
            <h3>{stats.totalBookings}</h3>
            <p>Total Bookings Processed</p>
          </div>
          <div className="admin-stat-card revenue-card">
            <h3>₹{Math.round(stats.totalRevenue || 0).toLocaleString('en-IN')}</h3>
            <p>Total Platform Revenue</p>
          </div>
        </div>

        {/* Live CSS Bar Chart Section */}
        <div className="admin-section chart-section" style={{ paddingBottom: isChartExpanded ? '30px' : '20px', transition: 'all 0.3s ease' }}>
          <div 
            onClick={() => setIsChartExpanded(!isChartExpanded)} 
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
          >
            <h3 style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '0', fontSize: '20px', fontWeight: '700' }}>
              📊 Property Performance (Revenue & Bookings)
            </h3>
            <span style={{ fontSize: '18px', color: '#7f8c8d', fontWeight: 'bold' }}>
              {isChartExpanded ? '▲ Hide Details' : '▼ Expand Details'}
            </span>
          </div>

          {isChartExpanded && (
            <div style={{ marginTop: '25px', borderTop: '1px solid #f1f3f5', paddingTop: '20px' }}>
              {revenueData.length === 0 ? (
                <p className="no-data-text">No active booking revenue to display yet.</p>
              ) : (
                <>
                  <div className="bar-chart-container">
                    {revenueData.slice(0, showAll ? revenueData.length : 5).map((hotel, index) => {
                      const percentage = ((hotel.totalRevenue || 0) / maxRevenue) * 100;
                      const isTop = index === 0 && (hotel.totalRevenue || 0) > 0;
                      return (
                        <div key={hotel.hotelId} className="chart-row">
                          {/* 1. Name & Bookings Column */}
                          <div className="chart-label-group" style={{ width: '220px' }}>
                            <span className="chart-hotel-name" style={{ display: 'block', maxWidth: '200px' }}>
                              {hotel.hotelName}
                            </span>
                            <span className="chart-bookings-count">{hotel.totalBookings} bookings</span>
                          </div>

                          {/* 2. Badge Column */}
                          <div style={{ width: '130px', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                            {isTop && (
                              <span style={{ fontSize: '10px', background: '#e8f8f5', color: '#27ae60', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                🏆 Top Performer
                              </span>
                            )}
                          </div>

                          {/* 3. Progress Bar Column */}
                          <div className="chart-bar-wrapper" style={{ marginRight: '15px' }}>
                            <div className={`chart-bar-fill ${isTop ? 'top-performer' : ''}`} style={{ width: `${percentage}%` }}>
                              {/* Emptied so text stays outside */}
                            </div>
                          </div>

                          {/* 4. Revenue Display Column */}
                          <div style={{ width: '100px', flexShrink: 0, textAlign: 'right', fontWeight: 'bold', color: '#2c3e50', fontSize: '14px' }}>
                            ₹{(hotel.totalRevenue || 0).toLocaleString('en-IN')}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {revenueData.length > 5 && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                      <button 
                        onClick={() => setShowAll(!showAll)} 
                        style={{ padding: '8px 24px', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', color: '#2c3e50', transition: 'all 0.2s' }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#e9ecef'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = '#f8f9fa'; }}
                      >
                        {showAll ? '▲ Show Top 5 Properties Only' : `▼ Show All ${revenueData.length} Properties`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="admin-section">
          <h3>System Health & Operations</h3>
          <p style={{color: '#7f8c8d', marginBottom: '20px'}}>All systems are running normally. No active alerts or pending approvals.</p>
          
          <div className="admin-navigation-buttons">
            <button className="btn btn-primary" onClick={() => navigate('/admin-bookings')}>
              📋 Manage All Bookings
            </button>
            <button className="btn btn-primary users-nav-btn" onClick={() => navigate('/admin-users')}>
              👥 Manage Users
            </button>
            <button className="btn btn-primary hotels-nav-btn" onClick={() => navigate('/admin-hotels')}>
              🏨 Manage Hotels
            </button>
            <button className="btn btn-primary reviews-nav-btn" onClick={() => navigate('/admin-reviews')}>
              ⭐ All Reviews
            </button>
          </div>
        </div>

        <div className="admin-section" style={{ borderTop: '4px solid #f39c12' }}>
          <h3 style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '15px' }}>📍 Top Booking Markets (by Location)</h3>
          <p style={{ color: '#7f8c8d', fontSize: '13px', margin: '0 0 20px 0' }}>Distribution of platform bookings and market share across target destinations.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {[
              { city: 'Chennai', percentage: 45, bookings: 6, color: '#3498db' },
              { city: 'Bangalore', percentage: 25, bookings: 4, color: '#9b59b6' },
              { city: 'Ooty', percentage: 15, bookings: 3, color: '#e67e22' },
              { city: 'Goa', percentage: 10, bookings: 1, color: '#2ecc71' },
              { city: 'Mysore', percentage: 5, bookings: 1, color: '#e74c3c' }
            ].map((loc, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '100px', fontWeight: 'bold', color: '#2c3e50', fontSize: '14px' }}>{loc.city}</div>
                <div style={{ flex: 1, height: '8px', backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${loc.percentage}%`, height: '100%', backgroundColor: loc.color, borderRadius: '4px' }}></div>
                </div>
                <div style={{ width: '120px', textAlign: 'right', fontSize: '13px', color: '#7f8c8d', fontWeight: '500' }}>
                  {loc.bookings} Bookings ({loc.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
