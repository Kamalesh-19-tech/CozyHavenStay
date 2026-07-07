import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  const [searchLocation, setSearchLocation] = useState('');

  const handleSearch = () => {
    if (searchLocation.trim()) {
      navigate('/hotels', { state: { search: searchLocation } });
    } else {
      navigate('/hotels');
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="home-navbar">
        <Link to="/" className="nav-brand">
          <svg className="brand-logo-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 6v6c0 5.5 4.5 10 9 10s9-4.5 9-10V6l-9-4z" fill="url(#nav-logo-grad)" />
            <path d="M12 6.5l5 3.5v6.5H7V10l5-3.5z" fill="#ffffff" opacity="0.9" />
            <circle cx="12" cy="11.5" r="2" fill="#e12d2d" />
            <defs>
              <linearGradient id="nav-logo-grad" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#5392f9" />
                <stop stopColor="#3b71ca" />
              </linearGradient>
            </defs>
          </svg>
          <span className="brand-text">
            <span className="text-cozy">Cozy</span>
            <span className="text-haven">Haven</span>
            <span className="text-stay">Stay</span>
          </span>
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/hotels" className="nav-link">Hotels</Link>
          {token ? (
            <button className="btn btn-primary" onClick={() => navigate(role === 'HotelOwner' ? '/owner-dashboard' : '/dashboard')}>
              My Dashboard
            </button>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Log in</Link>
              <Link to="/register" className="btn btn-primary">Create account</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title">Find Your Perfect Stay</h1>
        <p className="hero-subtitle">Search deals on hotels, homes, and much more...</p>
        
        <div className="search-box">
          <div className="search-input-group">
            <span className="search-label">LOCATION</span>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Where are you going?" 
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button className="btn btn-accent search-btn" onClick={handleSearch}>
            SEARCH
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="features-section">
        <h2 className="section-title">Why book with CozyHavenStay?</h2>
        <div className="features-grid">
          <div className="feature-card" style={{cursor: 'pointer'}} onClick={() => navigate('/hotels')}>
            <span className="feature-icon">
              <svg className="feature-icon-svg" viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#5392f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <circle cx="12" cy="20" r="1.5" fill="#5392f9" />
              </svg>
            </span>
            <h3 className="feature-title">Free WiFi</h3>
            <p className="feature-desc">Stay connected with high-speed internet available in all our properties.</p>
          </div>
          <div className="feature-card" style={{cursor: 'pointer'}} onClick={() => navigate('/hotels')}>
            <span className="feature-icon">
              <svg className="feature-icon-svg" viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#5392f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 10c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0" />
                <path d="M2 14c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0" />
                <path d="M2 18c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0" />
              </svg>
            </span>
            <h3 className="feature-title">Swimming Pool</h3>
            <p className="feature-desc">Relax and unwind in our premium swimming facilities.</p>
          </div>
          <div className="feature-card" style={{cursor: 'pointer'}} onClick={() => navigate('/hotels')}>
            <span className="feature-icon">
              <svg className="feature-icon-svg" viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#5392f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="4" />
                <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
              </svg>
            </span>
            <h3 className="feature-title">Secure Parking</h3>
            <p className="feature-desc">Safe and convenient parking spaces for your vehicle.</p>
          </div>
          <div className="feature-card" style={{cursor: 'pointer'}} onClick={() => navigate('/hotels')}>
            <span className="feature-icon">
              <svg className="feature-icon-svg" viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#5392f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 15h18c0-4.5-3.5-8-8-8H9c-4.5 0-8 3.5-8 8z" />
                <path d="M12 2v5" />
                <path d="M5 20h14" />
              </svg>
            </span>
            <h3 className="feature-title">Room Service</h3>
            <p className="feature-desc">24/7 dedicated service to make your stay comfortable.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 Cozy Haven Stay. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;