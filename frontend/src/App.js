import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import HotelList from './pages/HotelList';
import HotelDetail from './pages/HotelDetail';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminBookings from './pages/AdminBookings';
import AdminUsers from './pages/AdminUsers';
import AdminHotels from './pages/AdminHotels';
import AdminReviews from './pages/AdminReviews';
import AddHotel from './pages/AddHotel';
import ManageRooms from './pages/ManageRooms';
import Payment from './pages/Payment';
import BookingSuccess from './pages/BookingSuccess';
import Profile from './pages/Profile';
import ManageBookings from './pages/ManageBookings';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isSweeping, setIsSweeping] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      setIsSweeping(true);
      const hideTimer = setTimeout(() => {
        setShowSplash(false);
        document.body.style.overflow = '';
      }, 800); // match transition duration
      return () => clearTimeout(hideTimer);
    }, 5000); // 5-second hold

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <>
      {showSplash && (
        <div className={`splash-container ${isSweeping ? 'sweep-up' : ''}`}>
          <div className="hexaware-logo">
            <svg className="hex-badge" viewBox="0 0 100 100" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="#1b365d"/>
              <polygon points="50,15 82,31 82,69 50,85 18,69 18,31" fill="#00a4e4"/>
              <polygon points="50,28 72,39 72,61 50,72 28,61 28,39" fill="#f37021"/>
              <polygon points="50,38 62,45 62,55 50,62 38,55 38,45" fill="#ffffff"/>
            </svg>
            <span className="hexaware-wordmark">hexaware</span>
          </div>
          <div className="splash-center">
            <svg className="splash-logo-icon" viewBox="0 0 24 24" width="72" height="72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 6v6c0 5.5 4.5 10 9 10s9-4.5 9-10V6l-9-4z" fill="url(#splash-logo-grad)" />
              <path d="M12 6.5l5 3.5v6.5H7V10l5-3.5z" fill="#ffffff" opacity="0.9" />
              <circle cx="12" cy="11.5" r="2" fill="#e12d2d" />
              <defs>
                <linearGradient id="splash-logo-grad" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#5392f9" />
                  <stop stopColor="#3b71ca" />
                </linearGradient>
              </defs>
            </svg>
            <h1 className="splash-title">
              {"CozyHavenStay".split("").map((char, index) => (
                <span key={index} style={{ animationDelay: `${index * 0.12}s` }}>
                  {char}
                </span>
              ))}
            </h1>
            <p className="splash-subtitle">Find Your Perfect Stay</p>
          </div>
        </div>
      )}
      <Router>
        <Routes>
        {/* Public Pages — anyone can visit */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Pages — only logged in users */}
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/hotels" element={
          <PrivateRoute><HotelList /></PrivateRoute>
        } />
        <Route path="/hotels/:id" element={
          <PrivateRoute><HotelDetail /></PrivateRoute>
        } />
        <Route path="/booking/:roomId" element={
          <PrivateRoute><Booking /></PrivateRoute>
        } />
        <Route path="/payment" element={
          <PrivateRoute><Payment /></PrivateRoute>
        } />
        <Route path="/success" element={
          <PrivateRoute><BookingSuccess /></PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute><Profile /></PrivateRoute>
        } />
        <Route path="/manage-bookings" element={
          <PrivateRoute><ManageBookings /></PrivateRoute>
        } />
        <Route path="/owner-dashboard" element={
          <PrivateRoute><OwnerDashboard /></PrivateRoute>
        } />
        <Route path="/admin-dashboard" element={
          <PrivateRoute><AdminDashboard /></PrivateRoute>
        } />
        <Route path="/admin-bookings" element={
          <PrivateRoute><AdminBookings /></PrivateRoute>
        } />
        <Route path="/admin-users" element={
          <PrivateRoute><AdminUsers /></PrivateRoute>
        } />
        <Route path="/admin-hotels" element={
          <PrivateRoute><AdminHotels /></PrivateRoute>
        } />
        <Route path="/admin-reviews" element={
          <PrivateRoute><AdminReviews /></PrivateRoute>
        } />
        <Route path="/add-hotel" element={
          <PrivateRoute><AddHotel /></PrivateRoute>
        } />
        <Route path="/manage-rooms/:hotelId" element={
          <PrivateRoute><ManageRooms /></PrivateRoute>
        } />
      </Routes>
    </Router>
  </>
  );
}

export default App;