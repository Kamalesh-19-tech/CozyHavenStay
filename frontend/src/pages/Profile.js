import React from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();
  const name = localStorage.getItem('name') || 'Guest User';
  const role = localStorage.getItem('role') || 'User';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ backgroundColor: 'var(--secondary)', minHeight: '100vh', padding: '60px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', borderRadius: '12px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        <div style={{ padding: '30px', textAlign: 'center', borderBottom: '1px solid #eee' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold', margin: '0 auto 15px auto' }}>
            {name.charAt(0)}
          </div>
          <h2 style={{ margin: 0, color: 'var(--text-dark)' }}>{name}</h2>
          <span style={{ display: 'inline-block', marginTop: '10px', padding: '5px 15px', backgroundColor: '#ebf5fb', color: '#2980b9', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
            {role}
          </span>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              style={{ padding: '15px', textAlign: 'left', background: 'none', border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', display: 'flex', justifyContent: 'space-between' }}
              onClick={() => navigate('/dashboard')}
            >
              <span>📋 Booking History</span>
              <span style={{ color: '#bdc3c7' }}>➔</span>
            </button>
            <button 
              style={{ padding: '15px', textAlign: 'left', background: 'none', border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', display: 'flex', justifyContent: 'space-between' }}
              onClick={() => alert("Edit Profile feature coming soon!")}
            >
              <span>⚙️ Edit Profile</span>
              <span style={{ color: '#bdc3c7' }}>➔</span>
            </button>
            <button 
              style={{ padding: '15px', textAlign: 'left', background: 'none', border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', color: '#e74c3c', display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}
              onClick={handleLogout}
            >
              <span>🚪 Logout</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;
