import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './HotelList.css';

// All known locations from existing hotels
const KNOWN_LOCATIONS = [
  'Chennai', 'Bangalore', 'Mysore', 'Coimbatore', 'Madurai',
  'Ooty', 'Mumbai', 'Delhi', 'Hyderabad', 'Kolkata', 'Pune',
  'Jaipur', 'Goa', 'Kochi', 'Ahmedabad', 'Surat', 'Bhopal',
  'Chandigarh', 'Agra', 'Varanasi'
];

function HotelList() {
  const [hotels, setHotels] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allLocations, setAllLocations] = useState(KNOWN_LOCATIONS);
  const suggestionsRef = useRef(null);

  // Filter States
  const [selectedStars, setSelectedStars] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState({
    wifi: false,
    parking: false,
    dining: false,
    pool: false,
    gym: false,
    roomService: false
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.search) {
      setSearch(location.state.search);
      searchHotels(location.state.search);
    } else {
      fetchHotels();
    }
    // Load actual locations from DB hotels
    loadLocations();
  }, [location.state]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadLocations = async () => {
    try {
      const res = await axios.get('https://localhost:7077/api/Hotel');
      const dbLocations = [...new Set(res.data.map(h => h.location))];
      setAllLocations(prev => [...new Set([...prev, ...dbLocations])]);
    } catch {}
  };

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://localhost:7077/api/Hotel');
      setHotels(res.data);
    } catch (err) {
      console.error('Error fetching hotels');
    } finally {
      setLoading(false);
    }
  };

  const searchHotels = async (searchTerm = search) => {
    if (!searchTerm.trim()) { fetchHotels(); return; }
    setLoading(true);
    setShowSuggestions(false);
    try {
      const res = await axios.get(`https://localhost:7077/api/Hotel/search/${searchTerm}`);
      setHotels(res.data);
    } catch (err) {
      console.error('Error searching hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val.trim().length >= 1) {
      const filtered = allLocations.filter(loc =>
        loc.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 6));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      fetchHotels();
    }
  };

  const handleSuggestionClick = (loc) => {
    setSearch(loc);
    setShowSuggestions(false);
    searchHotels(loc);
  };

  // Filter Handler Functions
  const handleStarChange = (stars) => {
    setSelectedStars(prev =>
      prev.includes(stars) ? prev.filter(s => s !== stars) : [...prev, stars]
    );
  };

  const handleAmenityChange = (key) => {
    setSelectedAmenities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const clearFilters = () => {
    setSelectedStars([]);
    setSelectedAmenities({
      wifi: false,
      parking: false,
      dining: false,
      pool: false,
      gym: false,
      roomService: false
    });
  };

  // Perform Client-side Filtering
  const filteredHotels = hotels.filter(hotel => {
    if (selectedStars.length > 0 && !selectedStars.includes(hotel.starRating)) {
      return false;
    }
    if (selectedAmenities.wifi && !hotel.hasWifi) return false;
    if (selectedAmenities.parking && !hotel.hasParking) return false;
    if (selectedAmenities.dining && !hotel.hasDining) return false;
    if (selectedAmenities.pool && !hotel.hasPool) return false;
    if (selectedAmenities.gym && !hotel.hasGym) return false;
    if (selectedAmenities.roomService && !hotel.hasRoomService) return false;
    return true;
  });

  return (
    <div className="hotel-list-page">
      {/* Search Header */}
      <div className="search-header">
        <div className="search-bar-container" style={{ position: 'relative' }} ref={suggestionsRef}>
          <Link to="/" className="btn btn-outline" style={{ border: 'none' }}>← Home</Link>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              className="search-bar-input"
              placeholder="Search by city, location or hotel name..."
              value={search}
              onChange={handleSearchChange}
              onKeyDown={e => e.key === 'Enter' && searchHotels()}
              onFocus={() => search && suggestions.length > 0 && setShowSuggestions(true)}
              autoComplete="off"
            />
            {/* SUGGESTIONS DROPDOWN */}
            {showSuggestions && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000,
                background: 'white', border: '1px solid #ddd', borderRadius: '0 0 10px 10px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.12)', overflow: 'hidden'
              }}>
                {suggestions.map((loc, i) => (
                  <div key={i}
                    onClick={() => handleSuggestionClick(loc)}
                    style={{
                      padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                      gap: '10px', fontSize: '14px', color: '#2c3e50',
                      borderBottom: i < suggestions.length - 1 ? '1px solid #f5f5f5' : 'none',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                  >
                    📍 {loc}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="btn btn-primary search-bar-btn" onClick={() => searchHotels()}>Search</button>
        </div>
      </div>

      <div className="content-container">
        <div className="list-layout-wrapper">
          {/* Filters Sidebar */}
          <div className="filters-sidebar">
            <div className="filters-header">
              <h3>Filter by:</h3>
              {(selectedStars.length > 0 || Object.values(selectedAmenities).some(Boolean)) && (
                <button className="clear-filters-btn" onClick={clearFilters}>Clear all</button>
              )}
            </div>

            {/* Star Rating Section */}
            <div className="filter-group">
              <h4>Star Rating</h4>
              {[5, 4, 3, 2, 1].map(stars => (
                <label key={stars} className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedStars.includes(stars)}
                    onChange={() => handleStarChange(stars)}
                  />
                  <span className="star-display">
                    {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
                  </span>
                </label>
              ))}
            </div>

            {/* Amenities Section */}
            <div className="filter-group">
              <h4>Amenities</h4>
              <label className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedAmenities.wifi}
                  onChange={() => handleAmenityChange('wifi')}
                />
                <span>📶 Free WiFi</span>
              </label>
              <label className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedAmenities.parking}
                  onChange={() => handleAmenityChange('parking')}
                />
                <span>🚗 Parking</span>
              </label>
              <label className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedAmenities.dining}
                  onChange={() => handleAmenityChange('dining')}
                />
                <span>🍽️ Restaurant / Dining</span>
              </label>
              <label className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedAmenities.pool}
                  onChange={() => handleAmenityChange('pool')}
                />
                <span>🏊 Swimming Pool</span>
              </label>
              <label className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedAmenities.gym}
                  onChange={() => handleAmenityChange('gym')}
                />
                <span>🏋️ Fitness Center</span>
              </label>
              <label className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedAmenities.roomService}
                  onChange={() => handleAmenityChange('roomService')}
                />
                <span>🛎️ Room Service</span>
              </label>
            </div>
          </div>

          {/* Results List */}
          <div className="results-column">
            <h2 className="results-count">
              {loading ? 'Searching...' : `${filteredHotels.length} properties found`}
            </h2>

            <div className="hotel-list">
              {!loading && filteredHotels.length === 0 && (
                <div className="no-results-card">
                  <p>No hotels match your filters in this location. Try clearing filters or searching another city.</p>
                </div>
              )}
              {filteredHotels.map(hotel => (
                <div key={hotel.hotelId} className="hotel-card">
                  <div className="hotel-image"></div>
                  <div className="hotel-info">
                    <h3 className="hotel-name">{hotel.hotelName}</h3>
                    <div className="hotel-stars">
                      {'★'.repeat(hotel.starRating)}{'☆'.repeat(5 - hotel.starRating)}
                      <span style={{ color: '#737373', fontSize: '13px', marginLeft: '8px' }}>({hotel.starRating} Stars)</span>
                    </div>
                    <div className="hotel-location">📍 {hotel.location}</div>
                    <p className="hotel-desc">{hotel.description}</p>
                    <div className="amenities-tags">
                      {hotel.hasWifi && <span className="amenity-tag">Free WiFi</span>}
                      {hotel.hasParking && <span className="amenity-tag">Parking</span>}
                      {hotel.hasDining && <span className="amenity-tag">Dining</span>}
                      {hotel.hasPool && <span className="amenity-tag">Pool</span>}
                      {hotel.hasGym && <span className="amenity-tag">Gym</span>}
                      {hotel.hasRoomService && <span className="amenity-tag">Room Service</span>}
                    </div>
                  </div>
                  <div className="hotel-price-action">
                    <div style={{ marginBottom: '10px' }}>
                      <span className="price-label">Excellent Choice</span>
                    </div>
                    <button className="btn btn-accent view-btn" onClick={() => navigate(`/hotels/${hotel.hotelId}`)}>
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HotelList;
