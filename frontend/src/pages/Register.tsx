import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

// TypeScript interfaces
interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  gender: string;
  role: string;
}

interface PasswordStrength {
  label: string;
  color: string;
  width: string;
}

const Register: React.FC = () => {
  const [form, setForm] = useState<RegisterForm>({
    fullName: '', email: '', password: '',
    phoneNumber: '', address: '', gender: '', role: 'Guest'
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [pwStrength, setPwStrength] = useState<PasswordStrength>({ label: '', color: '', width: '0%' });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    if (e.target.name === 'password') checkStrength(e.target.value);
  };

  const checkStrength = (pw: string): void => {
    let score: number = 0;
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

  const handleRegister = async (): Promise<void> => {
    if (!form.fullName || !form.email || !form.password) {
      setError('Name, email, and password are required!');
      return;
    }

    setLoading(true);
    try {
      await axios.post('https://localhost:7077/api/Auth/register', form);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const axiosError = err as AxiosError<string>;
      setError(axiosError.response?.data || 'Registration failed! Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-image-side">
        <h1 className="auth-image-title">Join CozyHaven</h1>
        <p className="auth-image-subtitle">Unlock member-only deals and manage your bookings effortlessly.</p>
      </div>

      <div className="auth-form-side">
        <Link to="/" className="back-to-home">← Back to Home</Link>
        <div className="auth-form-container" style={{ maxWidth: '500px' }}>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">It's quick and easy</p>

          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="auth-input-group">
              <label className="auth-label">Full Name</label>
              <input className="form-input" name="fullName" placeholder="John Doe" onChange={handleChange} />
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Email</label>
              <input id="email" autoComplete="email" className="form-input" type="email" name="email" placeholder="name@example.com" onChange={handleChange} />
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Password</label>
              <input id="password" autoComplete="new-password" className="form-input" type="password" name="password" placeholder="Min 8 chars, include number & symbol" onChange={handleChange} />
              {form.password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ background: '#eee', borderRadius: '10px', height: '6px', overflow: 'hidden' }}>
                    <div style={{ width: pwStrength.width, background: pwStrength.color, height: '100%', borderRadius: '10px', transition: 'all 0.3s' }} />
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: pwStrength.color, fontWeight: 'bold' }}>{pwStrength.label}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#95a5a6' }}>Use 8+ chars, uppercase, number & special character</p>
                </div>
              )}
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Phone Number</label>
              <input className="form-input" name="phoneNumber" placeholder="Phone Number" onChange={handleChange} />
            </div>

            <div className="auth-input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="auth-label">Address</label>
              <input className="form-input" name="address" placeholder="Address" onChange={handleChange} />
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Gender</label>
              <select className="form-input" name="gender" onChange={handleChange} defaultValue="">
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Account Type</label>
              <select className="form-input" name="role" onChange={handleChange} defaultValue="Guest">
                <option value="Guest">👤 Guest (Book hotels)</option>
                <option value="HotelOwner">🏨 Hotel Owner (List hotels)</option>
                <option value="Admin">🛡️ Admin (Manage platform)</option>
              </select>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '18px', marginTop: '15px', opacity: loading ? 0.7 : 1 }}
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="auth-footer">
            Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
          <p className="auth-footer">
            <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;




