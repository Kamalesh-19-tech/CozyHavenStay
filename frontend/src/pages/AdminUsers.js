import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token || localStorage.getItem('role') !== 'Admin') { navigate('/login'); return; }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('https://localhost:7077/api/Admin/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (err) { setError('Failed to load users.'); }
  };

  const deleteUser = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone!`)) return;
    try {
      setError(''); setSuccess('');
      await axios.delete(`https://localhost:7077/api/Admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess(`User "${name}" deleted successfully!`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data || 'Failed to delete user.');
    }
  };

  const roleColor = (role) => {
    if (role === 'Admin') return { bg: '#f0e6ff', color: '#8e44ad' };
    if (role === 'HotelOwner') return { bg: '#e8f4fd', color: '#2980b9' };
    return { bg: '#e8f8f5', color: '#27ae60' };
  };

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '30px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <div>
            <h2 style={{ margin: 0, color: '#2c3e50' }}>👥 User Management</h2>
            <p style={{ color: '#7f8c8d', margin: '5px 0 0' }}>View and manage all registered users on the platform.</p>
          </div>
          <button onClick={() => navigate('/admin-dashboard')} style={{ padding: '10px 18px', background: 'white', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>← Back</button>
        </div>

        {error && <div style={{ padding: '12px', background: '#fdedec', color: '#e74c3c', borderRadius: '8px', marginBottom: '15px' }}>{error}</div>}
        {success && <div style={{ padding: '12px', background: '#e8f8f5', color: '#27ae60', borderRadius: '8px', marginBottom: '15px' }}>{success}</div>}

        {/* Stats Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '15px', marginBottom: '25px' }}>
          {[
            { label: '👤 Total Users', value: users.length, color: '#3498db' },
            { label: '🏨 Hotel Owners', value: users.filter(u => u.role === 'HotelOwner').length, color: '#2980b9' },
            { label: '🛡️ Admins', value: users.filter(u => u.role === 'Admin').length, color: '#8e44ad' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '10px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${s.color}` }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d' }}>{s.label}</p>
              <h2 style={{ margin: '6px 0 0', color: s.color }}>{s.value}</h2>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ecf0f1' }}>
                {['ID', 'Full Name', 'Email', 'Phone', 'Role', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', color: '#2c3e50', textAlign: 'left', fontSize: '13px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr key={u.userId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '13px 16px', color: '#95a5a6', fontSize: '13px' }}>#{index + 1}</td>
                  <td style={{ padding: '13px 16px', fontWeight: 500 }}>{u.fullName}</td>
                  <td style={{ padding: '13px 16px', color: '#7f8c8d', fontSize: '14px' }}>{u.email}</td>
                  <td style={{ padding: '13px 16px', fontSize: '14px' }}>{u.phoneNumber || '—'}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: roleColor(u.role).bg, color: roleColor(u.role).color }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    {u.role !== 'Admin' ? (
                      <button onClick={() => deleteUser(u.userId, u.fullName)}
                        style={{ padding: '6px 14px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                        🗑️ Delete
                      </button>
                    ) : (
                      <span style={{ color: '#bdc3c7', fontSize: '12px' }}>Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;




