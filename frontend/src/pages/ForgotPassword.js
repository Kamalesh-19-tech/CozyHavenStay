import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1=enter email, 2=enter new password
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwStrength, setPwStrength] = useState({ label: '', color: '', width: '0%' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const checkStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (pw.length >= 12) score++;
    if (score <= 1) setPwStrength({ label: '🔴 Weak', color: '#e74c3c', width: '25%' });
    else if (score === 2) setPwStrength({ label: '🟠 Fair', color: '#e67e22', width: '50%' });
    else if (score === 3) setPwStrength({ label: '🟡 Medium', color: '#f39c12', width: '65%' });
    else if (score === 4) setPwStrength({ label: '🟢 Strong', color: '#27ae60', width: '85%' });
    else setPwStrength({ label: '💪 Very Strong', color: '#1a8a4a', width: '100%' });
  };

  const handleCheckEmail = async () => {
    if (!email) { setError('Please enter your email.'); return; }
    setLoading(true); setError('');
    try {
      await axios.post('https://localhost:7077/api/Auth/check-email', { email });
      setStep(2);
      setSuccess('Email found! Now set your new password.');
    } catch (err) {
      setError('No account found with this email address.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) { setError('Please fill in both fields.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match!'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      await axios.post('https://localhost:7077/api/Auth/reset-password', { email, newPassword });
      setSuccess('✅ Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data || 'Failed to reset password. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-image-side">
        <h1 className="auth-image-title">Reset Password</h1>
        <p className="auth-image-subtitle">Enter your email and we'll help you set a new password securely.</p>
      </div>

      <div className="auth-form-side">
        <Link to="/login" className="back-to-home">← Back to Login</Link>
        <div className="auth-form-container">
          <h2 className="auth-title">🔑 Forgot Password</h2>
          <p className="auth-subtitle">
            {step === 1 ? 'Enter your registered email' : 'Set your new password'}
          </p>

          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}

          {/* Step 1 — Enter Email */}
          {step === 1 && (
            <>
              <div className="auth-input-group">
                <label className="auth-label">Email Address</label>
                <input className="form-input" type="email" placeholder="Enter your registered email"
                  value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleCheckEmail()} />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px', marginTop: '15px', opacity: loading ? 0.7 : 1 }}
                onClick={handleCheckEmail} disabled={loading}>
                {loading ? 'Checking...' : 'Continue →'}
              </button>
            </>
          )}

          {/* Step 2 — Enter New Password */}
          {step === 2 && (
            <>
              <div className="auth-input-group">
                <label className="auth-label">New Password</label>
                <input className="form-input" type="password" placeholder="Enter new password"
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); checkStrength(e.target.value); setError(''); }} />
                {newPassword && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ background: '#eee', borderRadius: '10px', height: '6px', overflow: 'hidden' }}>
                      <div style={{ width: pwStrength.width, background: pwStrength.color, height: '100%', borderRadius: '10px', transition: 'all 0.3s' }} />
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: pwStrength.color, fontWeight: 'bold' }}>{pwStrength.label}</p>
                  </div>
                )}
              </div>
              <div className="auth-input-group">
                <label className="auth-label">Confirm Password</label>
                <input className="form-input" type="password" placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError(''); }} />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>❌ Passwords do not match</p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p style={{ color: '#27ae60', fontSize: '12px', marginTop: '4px' }}>✅ Passwords match</p>
                )}
              </div>
              <button className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px', marginTop: '15px', opacity: loading ? 0.7 : 1 }}
                onClick={handleResetPassword} disabled={loading}>
                {loading ? 'Resetting...' : '🔐 Reset Password'}
              </button>
            </>
          )}

          <p className="auth-footer">
            Remember your password? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;




