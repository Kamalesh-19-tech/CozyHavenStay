import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './HotelDetail.css';

// SVG Icons for Amenities
const WifiIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="amenity-icon">
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);

const ParkingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="amenity-icon">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 17V7h5a3 3 0 0 1 0 6H9" />
  </svg>
);

const DiningIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="amenity-icon">
    <path d="M18 8A6 6 0 0 0 6 8c0 7 3 9 3 13h6c0-4 3-6 3-13z" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="12" y1="8" x2="12" y2="21" />
  </svg>
);

const PoolIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="amenity-icon">
    <path d="M2 12a5 5 0 0 0 5 5 8 8 0 0 0 5-2 8 8 0 0 0 5 2 5 5 0 0 0 5-5" />
    <path d="M2 16a5 5 0 0 0 5 5 8 8 0 0 0 5-2 8 8 0 0 0 5 2 5 5 0 0 0 5-5" />
    <path d="M2 8a5 5 0 0 0 5 5 8 8 0 0 0 5-2 8 8 0 0 0 5 2 5 5 0 0 0 5-5" />
  </svg>
);

const GymIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="amenity-icon">
    <path d="M18 12h-4" />
    <path d="M10 12H6" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const RoomServiceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="amenity-icon">
    <path d="M2 22h20" />
    <path d="M12 2v3" />
    <path d="M5 22a7 7 0 0 1 14 0" />
  </svg>
);

function HotelDetail() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');

  useEffect(() => {
    fetchHotel();
    fetchRooms();
    fetchReviews();
  }, []);

  const fetchHotel = async () => {
    try {
      const res = await axios.get(`https://localhost:7077/api/Hotel/${id}`);
      setHotel(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`https://localhost:7077/api/Room/hotel/${id}`);
      setRooms(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`https://localhost:7077/api/Review/hotel/${id}`);
      setReviews(res.data);
    } catch (err) { console.error(err); }
  };

  const submitReview = async () => {
    if (!token) { setReviewError('Please login to leave a review!'); return; }
    if (!newComment.trim()) { setReviewError('Please write a comment!'); return; }
    try {
      setReviewError(''); setReviewSuccess('');
      await axios.post('https://localhost:7077/api/Review',
        { userId: parseInt(userId), hotelId: parseInt(id), rating: newRating, comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviewSuccess('✅ Review submitted! Thank you.');
      setNewComment('');
      setNewRating(5);
      fetchReviews();
    } catch (err) {
      setReviewError(err.response?.data || 'Failed to submit review.');
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const getAspectScores = () => {
    if (!avgRating) return null;
    const base = parseFloat(avgRating);
    return [
      { name: 'Cleanliness', score: Math.min(5, Math.max(1, base + 0.1)).toFixed(1) },
      { name: 'Location', score: Math.min(5, Math.max(1, base + 0.3)).toFixed(1) },
      { name: 'Service', score: Math.min(5, Math.max(1, base - 0.2)).toFixed(1) },
      { name: 'Value for money', score: Math.min(5, Math.max(1, base - 0.1)).toFixed(1) }
    ];
  };

  const aspectScores = getAspectScores();

  if (!hotel) return <div className="loading-container">Loading property details...</div>;

  return (
    <div className="hotel-detail-page">
      <div className="hotel-header">
        <div className="nav-links">
          <Link to="/hotels" className="back-link">← Back to search results</Link>
        </div>
      </div>

      <div className="detail-container">
        {/* Images Grid */}
        <div className="images-grid">
          <div className="main-image"></div>
          <div className="sub-image-1"></div>
          <div className="sub-image-2"></div>
          <div className="sub-image-3"></div>
          <div className="sub-image-4"></div>
        </div>

        {/* Hotel Overview */}
        <div className="hotel-overview">
          <h1 className="detail-title">{hotel.hotelName}</h1>
          <div className="overview-badges">
            <div className="detail-stars">{'★'.repeat(hotel.starRating)}{'☆'.repeat(5 - hotel.starRating)}</div>
            {avgRating && (
              <span className="rating-badge">
                ★ {avgRating} ({reviews.length} reviews)
              </span>
            )}
          </div>
          <div className="detail-location">📍 {hotel.location}</div>
          <p className="detail-desc">{hotel.description}</p>

          <div className="amenities-section">
            <h3>Top Amenities</h3>
            <div className="amenities-list">
              {hotel.hasWifi && <span className="amenity-item"><WifiIcon /> Free WiFi</span>}
              {hotel.hasParking && <span className="amenity-item"><ParkingIcon /> Parking Available</span>}
              {hotel.hasDining && <span className="amenity-item"><DiningIcon /> Restaurant</span>}
              {hotel.hasPool && <span className="amenity-item"><PoolIcon /> Swimming Pool</span>}
              {hotel.hasGym && <span className="amenity-item"><GymIcon /> Fitness Center</span>}
              {hotel.hasRoomService && <span className="amenity-item"><RoomServiceIcon /> Room Service</span>}
            </div>
          </div>
        </div>

        {/* Available Rooms */}
        <div className="rooms-section">
          <h3>Available Rooms</h3>
          {rooms.length === 0 ? (
            <p className="no-rooms-message">No rooms available for this property currently.</p>
          ) : (
            rooms.map(room => (
              <div key={room.roomId} className="room-card">
                <div className="room-info">
                  <h4 className="room-title">Room {room.roomNumber} — {room.bedType} Bed</h4>
                  <div className="room-features">
                    <span className="room-feature">📐 {room.roomSize} sq.ft</span>
                    <span className="room-feature">👥 Max {room.maxOccupancy} Guests</span>
                    <span className="room-feature">{room.isAC ? '❄️ Air Conditioning' : '🌀 Fan Only'}</span>
                    <span className="room-feature">Smoking Allowed: No</span>
                    <span className="room-feature">🚿 Private Bathroom</span>
                    <span className="room-feature">📺 Flat-screen TV</span>
                  </div>
                </div>
                <div className="room-price-book">
                  <div className="room-price">₹{room.baseFare || room.BaseFare}</div>
                  <div className="price-label">per night (+ taxes & fees)</div>
                  {room.isAvailable ? (
                    <button className="btn btn-primary book-btn"
                      onClick={() => navigate(`/booking/${room.roomId}`)}>
                      Book Now
                    </button>
                  ) : (
                    <button className="btn btn-outline sold-out-btn" disabled>
                      Sold Out
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ===== REVIEWS & RATINGS SECTION ===== */}
        <div className="reviews-section-container">
          <h3 className="reviews-main-title">
            ⭐ Guest Reviews {reviews.length > 0 && <span className="reviews-count-badge">({reviews.length} reviews · Avg: {avgRating}/5)</span>}
          </h3>

          {/* Aspect Progress Bars */}
          {aspectScores && (
            <div className="aspect-scores-grid">
              {aspectScores.map((aspect, idx) => {
                const percentage = (parseFloat(aspect.score) / 5) * 100;
                return (
                  <div key={idx} className="aspect-row">
                    <div className="aspect-info">
                      <span className="aspect-name">{aspect.name}</span>
                      <span className="aspect-val">{aspect.score}</span>
                    </div>
                    <div className="aspect-bar-bg">
                      <div className="aspect-bar-fill" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Write a Review */}
          {token && role === 'Guest' && (
            <div className="write-review-card">
              <h4>✍️ Write a Review</h4>

              {/* Star Rating Selector */}
              <div className="star-selector-container">
                <label className="star-selector-label">Your Rating</label>
                <div className="star-row">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star}
                      onClick={() => setNewRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="star-clickable"
                      style={{ color: star <= (hoveredStar || newRating) ? '#f39c12' : '#ddd' }}>
                      ★
                    </span>
                  ))}
                  <span className="rating-desc-text">
                    {newRating === 5 ? 'Excellent' : newRating === 4 ? 'Very Good' : newRating === 3 ? 'Good' : newRating === 2 ? 'Fair' : 'Poor'}
                  </span>
                </div>
              </div>

              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Share your experience at this hotel..."
                rows={3}
                className="review-textarea"
              />

              {reviewError && <div className="review-message error">{reviewError}</div>}
              {reviewSuccess && <div className="review-message success">{reviewSuccess}</div>}

              <button onClick={submitReview} className="btn btn-primary submit-review-btn">
                Submit Review
              </button>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="no-reviews-fallback">
              <p>No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="reviews-list-wrapper">
              {reviews.map(r => (
                <div key={r.reviewId} className="single-review-card">
                  <div className="review-card-header">
                    <div>
                      <span className="review-author-name">{r.guestName}</span>
                      <div className="review-stars-row">
                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                        <span className="review-numeric-score">{r.rating}/5</span>
                      </div>
                    </div>
                    <span className="review-date">
                      {new Date(r.reviewDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="review-comment-text">"{r.comment}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HotelDetail;
