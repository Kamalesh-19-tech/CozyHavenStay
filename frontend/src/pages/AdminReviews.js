import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token || localStorage.getItem('role') !== 'Admin') { navigate('/login'); return; }
    fetchReviews();
  }, []);

  useEffect(() => {
    let data = [...reviews];
    if (filterRating !== 'all') data = data.filter(r => r.rating === parseInt(filterRating));
    if (search) data = data.filter(r =>
      r.hotelName?.toLowerCase().includes(search.toLowerCase()) ||
      r.guestName?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(data);
  }, [reviews, search, filterRating]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get('https://localhost:7077/api/Admin/reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(res.data);
    } catch (err) { setError('Failed to load reviews.'); }
  };

  const deleteReview = async (reviewId, guestName) => {
    if (!window.confirm(`Delete review by "${guestName}"?`)) return;
    try {
      setError(''); setSuccess('');
      await axios.delete(`https://localhost:7077/api/Admin/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Review deleted successfully!');
      fetchReviews();
    } catch (err) { setError('Failed to delete review.'); }
  };

  const starColor = (rating) => {
    if (rating >= 4) return { bg: '#e8f8f5', color: '#27ae60', label: 'Excellent' };
    if (rating === 3) return { bg: '#fef9e7', color: '#f39c12', label: 'Average' };
    return { bg: '#fdedec', color: '#e74c3c', label: 'Poor' };
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '30px 20px' }}>
      <div style={{ maxWidth: '1050px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <div>
            <h2 style={{ margin: 0, color: '#2c3e50' }}>⭐ All Platform Reviews</h2>
            <p style={{ color: '#7f8c8d', margin: '5px 0 0' }}>Monitor guest reviews across every hotel on the platform.</p>
          </div>
          <button onClick={() => navigate('/admin-dashboard')}
            style={{ padding: '10px 18px', background: 'white', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
            ← Back
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '15px', marginBottom: '25px' }}>
          {[
            { label: '📝 Total Reviews', value: reviews.length, color: '#3498db' },
            { label: '⭐ Avg Rating', value: avgRating > 0 ? `${avgRating}/5` : '—', color: '#f39c12' },
            { label: '✅ Good (4-5 ⭐)', value: reviews.filter(r => r.rating >= 4).length, color: '#27ae60' },
            { label: '⚠️ Poor (1-2 ⭐)', value: reviews.filter(r => r.rating <= 2).length, color: '#e74c3c' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '10px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${s.color}` }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d' }}>{s.label}</p>
              <h2 style={{ margin: '6px 0 0', color: s.color, fontSize: '22px' }}>{s.value}</h2>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            placeholder="🔍 Search by hotel, guest, or comment..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', minWidth: '200px' }}
          />
          <select value={filterRating} onChange={e => setFilterRating(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', background: 'white' }}>
            <option value="all">All Ratings</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 stars)</option>
            <option value="4">⭐⭐⭐⭐ (4 stars)</option>
            <option value="3">⭐⭐⭐ (3 stars)</option>
            <option value="2">⭐⭐ (2 stars)</option>
            <option value="1">⭐ (1 star)</option>
          </select>
        </div>

        {error && <div style={{ padding: '12px', background: '#fdedec', color: '#e74c3c', borderRadius: '8px', marginBottom: '15px' }}>{error}</div>}
        {success && <div style={{ padding: '12px', background: '#e8f8f5', color: '#27ae60', borderRadius: '8px', marginBottom: '15px' }}>{success}</div>}

        {/* Reviews List */}
        {filtered.length === 0 ? (
          <div style={{ background: 'white', padding: '60px', textAlign: 'center', borderRadius: '12px', color: '#7f8c8d' }}>
            <p style={{ fontSize: '18px' }}>No reviews found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filtered.map((r, i) => (
              <div key={r.reviewId || i} style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderLeft: `5px solid ${starColor(r.rating).color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    {/* Hotel badge */}
                    <span style={{ fontSize: '12px', background: '#ebf5fb', color: '#2980b9', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold', display: 'inline-block', marginBottom: '8px' }}>
                      🏨 {r.hotelName}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '15px' }}>👤 {r.guestName}</span>
                      <span style={{ color: '#7f8c8d', fontSize: '13px' }}>{r.guestEmail}</span>
                      <div style={{ color: '#f39c12', fontSize: '18px' }}>
                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      </div>
                      <span style={{ padding: '2px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', background: starColor(r.rating).bg, color: starColor(r.rating).color }}>
                        {r.rating}/5 — {starColor(r.rating).label}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={{ color: '#95a5a6', fontSize: '12px' }}>
                      {new Date(r.reviewDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    <button onClick={() => deleteReview(r.reviewId, r.guestName)}
                      style={{ padding: '5px 12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                      🗑️ Remove
                    </button>
                  </div>
                </div>
                <p style={{ margin: '12px 0 0', color: '#555', lineHeight: '1.6', fontSize: '14px' }}>
                  💬 "{r.comment}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminReviews;




