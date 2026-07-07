import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './Booking.css';

function Booking() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  const [room, setRoom] = useState(null);
  
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState([{ guestName: '', age: '' }]);
  
  const [totalFare, setTotalFare] = useState(0);
  const [extraCharges, setExtraCharges] = useState(0);
  const [nights, setNights] = useState(1);
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  useEffect(() => {
    // Fetch room details to calculate live pricing
    const fetchRoom = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`https://localhost:7077/api/Room/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRoom(res.data);
      } catch (err) {
        console.error("Error fetching room", err);
      }
    };
    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    // Live price calculation
    if (!room || !checkInDate || !checkOutDate) return;
    
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end - start);
    let calculatedNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (calculatedNights <= 0) calculatedNights = 1;
    setNights(calculatedNights);

    let baseCapacity = 1;
    let bed = (room.bedType || room.BedType || '').toLowerCase();
    if (bed.includes('double')) baseCapacity = 2;
    if (bed.includes('king')) baseCapacity = 4;

    const baseFare = room.baseFare || room.BaseFare || 0;

    let extra = 0;
    guests.forEach((g, index) => {
      if (index >= baseCapacity && g.age) {
        if (parseInt(g.age) > 14) {
          extra += baseFare * 0.40;
        } else {
          extra += baseFare * 0.20;
        }
      }
    });

    setExtraCharges(extra);
    setTotalFare((baseFare + extra) * calculatedNights);
    
  }, [room, checkInDate, checkOutDate, guests]);

  const handleAddGuest = () => {
    setGuests([...guests, { guestName: '', age: '' }]);
  };

  const handleGuestChange = (index, field, value) => {
    const updated = [...guests];
    updated[index][field] = value;
    setGuests(updated);
  };

  const handleBooking = async () => {
    if (!checkInDate || !checkOutDate || guests[0].guestName === '') {
      setError('Please fill in all required fields.');
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    if (checkInDate < todayStr) {
      setError('Check-in date cannot be in the past.');
      return;
    }
    if (checkOutDate <= checkInDate) {
      setError('Check-out date must be after the check-in date.');
      return;
    }
    setError('');
    
    const userId = localStorage.getItem('userId');
    const payload = {
      roomId: parseInt(roomId),
      userId: parseInt(userId),
      checkInDate,
      checkOutDate,
      noOfRooms: 1,
      guests: guests.map(g => ({ guestName: g.guestName, age: parseInt(g.age) || 25 }))
    };

    // Redirect to the dedicated payment page with the booking payload and price details
    navigate('/payment', { 
      state: { 
        bookingPayload: payload, 
        subTotal: totalFare.toFixed(2),
        tax: (totalFare * 0.10).toFixed(2),
        totalFare: (totalFare * 1.10).toFixed(2), 
        extraCharges, 
        nights, 
        roomBaseFare: room.baseFare || room.BaseFare 
      } 
    });
  };

  if (!room) return <div style={{padding: '50px', textAlign: 'center'}}>Loading...</div>;

  return (
    <div className="booking-page">
      <div className="booking-container">
        
        {/* Left Form Section */}
        <div className="booking-form-section">
          <h2>Complete your booking</h2>
          {error && <div className="alert-error" style={{color: 'red', marginBottom: '15px'}}>{error}</div>}
          {success && <div className="alert-success" style={{color: 'green', marginBottom: '15px', fontWeight: 'bold'}}>{success}</div>}
          
          <div className="date-inputs">
            <div className="form-group">
              <label>Check-in Date</label>
              <input type="date" className="form-input" value={checkInDate}
                min={today}
                onChange={e => { setCheckInDate(e.target.value); if(checkOutDate && e.target.value >= checkOutDate) setCheckOutDate(''); }} />
            </div>
            <div className="form-group">
              <label>Check-out Date</label>
              <input type="date" className="form-input" value={checkOutDate}
                min={checkInDate || today}
                onChange={e => setCheckOutDate(e.target.value)} />
            </div>
          </div>

          <div className="guests-section">
            <h3>Guest Details</h3>
            <p style={{fontSize: '14px', color: '#737373', marginBottom: '15px'}}>
              Base capacity: {(room.bedType || room.BedType || '').toLowerCase().includes('king') ? 4 : (room.bedType || room.BedType || '').toLowerCase().includes('double') ? 2 : 1}. Extra guests are charged.
            </p>
            
            {guests.map((guest, index) => (
              <div className="guest-row" key={index}>
                <div className="form-group" style={{flex: 1, marginBottom: 0}}>
                  <label>Guest {index + 1} Full Name</label>
                  <input type="text" className="form-input" value={guest.guestName} onChange={e => handleGuestChange(index, 'guestName', e.target.value)} placeholder="John Doe" />
                </div>
                <div className="form-group age-input" style={{marginBottom: 0}}>
                  <label>Age</label>
                  <input type="number" className="form-input" value={guest.age} onChange={e => handleGuestChange(index, 'age', e.target.value)} placeholder="30" />
                </div>
              </div>
            ))}
            <button className="add-guest-btn" onClick={handleAddGuest}>
              + Add Another Guest
            </button>
          </div>
        </div>
        
        {/* Right Summary Section */}
        <div className="booking-summary-section">
          <h3 className="summary-title">Price Summary</h3>
          
          <div className="summary-row">
            <span>Room Base Fare</span>
            <span>₹{room.baseFare || room.BaseFare} x {nights} nights</span>
          </div>
          <div className="summary-row" style={{justifyContent: 'flex-end', fontWeight: 600}}>
            ₹{(room.baseFare || room.BaseFare) * nights}
          </div>

          {extraCharges > 0 && (
            <>
              <div className="summary-row" style={{marginTop: '15px'}}>
                <span>Extra Guest Charges</span>
                <span>₹{extraCharges.toFixed(2)} x {nights} nights</span>
              </div>
              <div className="summary-row" style={{justifyContent: 'flex-end', fontWeight: 600}}>
                ₹{(extraCharges * nights).toFixed(2)}
              </div>
            </>
          )}

          <div className="summary-row" style={{marginTop: '15px'}}>
            <span>Taxes & Fees (10%)</span>
            <span>₹{(totalFare * 0.10).toFixed(2)}</span>
          </div>
          <div className="summary-row" style={{justifyContent: 'flex-end', fontWeight: 600}}>
            ₹{(totalFare * 0.10).toFixed(2)}
          </div>

          <div className="summary-total">
            <span>Total Payable</span>
            <span>₹{(totalFare * 1.10).toFixed(2)}</span>
          </div>

          <button className="btn btn-primary" style={{width: '100%', marginTop: '20px', padding: '15px', fontSize: '18px'}} onClick={handleBooking}>
            Proceed to Payment ➔
          </button>
        </div>

      </div>
    </div>
  );
}

export default Booking;



