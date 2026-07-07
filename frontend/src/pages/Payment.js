import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Payment.css';

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingPayload, totalFare, subTotal, tax, extraCharges, nights, roomBaseFare } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Form Fields State
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [upiId, setUpiId] = useState('');

  if (!bookingPayload) {
    return <div style={{padding: '50px', textAlign: 'center'}}>No booking details found. Please go back and try again.</div>;
  }

  const handlePayment = async () => {
    // Validate inputs based on payment method
    if (paymentMethod === 'Credit Card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        setError('Please enter a valid 16-digit card number.');
        return;
      }
      if (!expiryDate || !expiryDate.includes('/') || expiryDate.length < 5) {
        setError('Please enter expiry date in MM/YY format.');
        return;
      }
      if (!cvv || cvv.length < 3) {
        setError('Please enter a valid 3-digit CVV.');
        return;
      }
      if (!cardName.trim()) {
        setError('Please enter the name on the card.');
        return;
      }
    } else if (paymentMethod === 'UPI') {
      if (!upiId.trim() || !upiId.includes('@')) {
        setError('Please enter a valid UPI ID (e.g. username@bank).');
        return;
      }
    }

    setIsProcessing(true);
    setError('');

    // Simulate payment processing delay
    setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          'https://localhost:7077/api/Booking',
          bookingPayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setIsProcessing(false);
        // The backend returns { BookingId: ... }
        const bookingId = response.data.bookingId || response.data.BookingId;
        
        navigate('/success', { 
          state: { 
            bookingId: `BK${bookingId || Math.floor(Math.random() * 10000)}`,
            amount: totalFare,
            hotelName: "Your Stay"
          } 
        });
      } catch (err) {
        setIsProcessing(false);
        const data = err.response?.data;
        const backendError = data?.errors ? JSON.stringify(data.errors) : (data?.title || data || err.message);
        setError(`Payment failed! Details: ${typeof backendError === 'object' ? JSON.stringify(backendError) : backendError}`);
      }
    }, 2000);
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <h2>Secure Checkout</h2>
          <p style={{margin: '5px 0 0 0', opacity: 0.8}}>Complete your payment to confirm booking</p>
        </div>

        <div className="payment-body">
          {error && <div className="alert-error" style={{color: 'red', marginBottom: '15px'}}>{error}</div>}

          {isProcessing ? (
            <div className="payment-processing">
              <div className="spinner"></div>
              <h3>Processing Payment...</h3>
              <p>Please do not close or refresh this page.</p>
            </div>
          ) : (
            <>
              <div className="payment-summary">
                <div className="payment-summary-row">
                  <span>Room Base Fare ({nights} Nights)</span>
                  <span>₹{roomBaseFare * nights}</span>
                </div>
                {extraCharges > 0 && (
                  <div className="payment-summary-row">
                    <span>Extra Guest Charges</span>
                    <span>₹{extraCharges * nights}</span>
                  </div>
                )}
                <div className="payment-summary-row">
                  <span>Taxes & Fees (10%)</span>
                  <span>₹{tax}</span>
                </div>
                <div className="payment-summary-total">
                  <span>Total Amount</span>
                  <span>₹{totalFare}</span>
                </div>
              </div>

              <div className="payment-methods">
                <div className={`payment-method ${paymentMethod === 'Credit Card' ? 'active' : ''}`} onClick={() => setPaymentMethod('Credit Card')}>
                  💳 Credit/Debit Card
                </div>
                <div className={`payment-method ${paymentMethod === 'UPI' ? 'active' : ''}`} onClick={() => setPaymentMethod('UPI')}>
                  📱 UPI
                </div>
                <div className={`payment-method ${paymentMethod === 'Net Banking' ? 'active' : ''}`} onClick={() => setPaymentMethod('Net Banking')}>
                  🏦 Net Banking
                </div>
              </div>

              {paymentMethod === 'Credit Card' && (
                <div className="payment-form">
                  <div className="form-group">
                    <label>Card Number</label>
                    <input 
                      type="text" 
                      placeholder="XXXX XXXX XXXX XXXX" 
                      maxLength="19" 
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9\s]/g, ''))}
                      autoComplete="cc-number"
                    />
                  </div>
                  <div className="payment-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        maxLength="5" 
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value.replace(/[^0-9/]/g, ''))}
                        autoComplete="off"
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input 
                        type="password" 
                        placeholder="XXX" 
                        maxLength="3" 
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Name on Card</label>
                    <input 
                      type="text" 
                      placeholder="John Doe" 
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      autoComplete="cc-name"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'UPI' && (
                <div className="payment-form">
                  <div className="form-group">
                    <label>Enter UPI ID</label>
                    <input 
                      type="text" 
                      placeholder="username@bank" 
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <p style={{fontSize: '13px', color: '#7f8c8d', textAlign: 'center'}}>You will receive a payment request on your UPI app.</p>
                </div>
              )}

              {paymentMethod === 'Net Banking' && (
                <div className="payment-form">
                  <div className="form-group">
                    <label>Select Bank</label>
                    <select style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '15px'}}>
                      <option>State Bank of India</option>
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                    </select>
                  </div>
                </div>
              )}

              <button className="pay-btn" onClick={handlePayment} disabled={isProcessing}>
                Pay ₹{totalFare} Securely
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Payment;




