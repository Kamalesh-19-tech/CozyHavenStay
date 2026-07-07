import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function BookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId, amount, hotelName } = location.state || { bookingId: 'BK10245', amount: '0', hotelName: 'Golden Orchid Resort' };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="booking-success-page" style={{ backgroundColor: 'var(--secondary)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' }}>
      
      {/* Inject print-specific media styles directly in a style tag so it works seamlessly without separate files */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-invoice-card, .printable-invoice-card * {
            visibility: visible;
          }
          .printable-invoice-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <div className="printable-invoice-card" style={{ background: 'white', maxWidth: '550px', width: '100%', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        
        {/* Success Header */}
        <div className="success-header no-print" style={{ backgroundColor: '#2ecc71', color: 'white', padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '50px', marginBottom: '10px' }}>✅</div>
          <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '700' }}>Booking Confirmed</h2>
          <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '14px' }}>Thank you for booking with CozyHavenStay!</p>
        </div>

        {/* Printable Invoice Body */}
        <div style={{ padding: '40px 35px' }}>
          
          {/* Invoice Company Details (shown in print layout) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '20px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-brand)' }}>
                <span style={{ color: '#5392f9' }}>Cozy</span>
                <span style={{ color: 'var(--text-dark)' }}>Haven</span>
                <span style={{ color: '#e12d2d' }}>Stay</span>
              </h2>
              <span style={{ fontSize: '12px', color: '#7f8c8d' }}>Online Hotel Reservations Receipt</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#2c3e50', display: 'block' }}>Invoice Receipt</span>
              <span style={{ fontSize: '12px', color: '#7f8c8d' }}>Date: {new Date().toLocaleDateString('en-IN')}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px', fontSize: '15px' }}>
              <span style={{ color: '#7f8c8d', fontWeight: '500' }}>Booking ID</span>
              <span style={{ fontWeight: '700', color: '#2c3e50', fontFamily: 'monospace', fontSize: '16px' }}>{bookingId}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px', fontSize: '15px' }}>
              <span style={{ color: '#7f8c8d', fontWeight: '500' }}>Hotel Name</span>
              <span style={{ fontWeight: '700', color: '#2c3e50' }}>{hotelName}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px', fontSize: '15px' }}>
              <span style={{ color: '#7f8c8d', fontWeight: '500' }}>Payment Status</span>
              <span style={{ fontWeight: '700', color: '#27ae60', background: 'rgba(39,174,96,0.1)', padding: '2px 10px', borderRadius: '4px', fontSize: '13px' }}>PAID - SUCCESS</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', fontSize: '18px' }}>
              <span style={{ color: '#2c3e50', fontWeight: '700' }}>Total Amount Paid</span>
              <span style={{ fontWeight: '800', color: '#27ae60' }}>₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Terms Footer (shown in print layout) */}
          <div style={{ borderTop: '1px dashed #ccc', paddingTop: '20px', marginTop: '20px', fontSize: '12px', color: '#95a5a6', textAlign: 'center', lineHeight: '1.5' }}>
            <p style={{ margin: 0 }}>This is an electronically generated reservation confirmation document. No signature is required.</p>
            <p style={{ margin: '5px 0 0 0' }}>For customer support or booking cancellations, please contact support@cozyhaven.com.</p>
          </div>

          {/* Action Buttons */}
          <div className="no-print" style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
            <button 
              className="btn btn-outline" 
              style={{ flex: 1, padding: '12px', fontSize: '15px', borderRadius: '8px', border: '1px solid #ccc', color: '#2c3e50', background: 'white' }}
              onClick={handlePrint}
            >
              🖨️ Print Invoice
            </button>
            <button 
              className="btn btn-primary" 
              style={{ flex: 1, padding: '12px', fontSize: '15px', borderRadius: '8px' }}
              onClick={() => navigate('/dashboard')}
            >
              My Bookings
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default BookingSuccess;
