import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

// TypeScript interface for login API response
interface LoginResponse {
  token: string;
  Role?: string;
  role?: string;
  FullName?: string;
  fullName?: string;
  userId: number;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      setError('Please enter email and password!');
      return;
    }
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.post<LoginResponse>(
        'https://localhost:7077/api/Auth/login',
        { email, password }
      );
      const data: LoginResponse = response.data;

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.Role || data.role || '');
      localStorage.setItem('name', data.FullName || data.fullName || '');
      localStorage.setItem('userId', String(data.userId));

      const role: string = data.Role || data.role || '';
      if (role === 'Admin') {
        navigate('/admin-dashboard');
      } else if (role === 'HotelOwner') {
        navigate('/owner-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      if (axiosError.response?.status === 401) {
        setError('Wrong email or password! Try again.');
      } else {
        setError('Server error! Make sure backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-image-side">
        <h1 className="auth-image-title">Welcome Back</h1>
        <p className="auth-image-subtitle">Discover top hotels, homes, and much more for your next adventure.</p>
      </div>
      
      <div className="auth-form-side">
        <Link to="/" className="back-to-home">← Back to Home</Link>
        <div className="auth-form-container">
          <h2 className="auth-title">Sign in</h2>
          <p className="auth-subtitle">For a faster booking experience</p>

          {error && <div className="error-msg">{error}</div>}

          <div className="auth-input-group">
            <label className="auth-label">Email</label>
            <input
              id="email"
              name="email"
              autoComplete="email"
              className="form-input"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setEmail(e.target.value); setError(''); }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Password</label>
            <input
              id="password"
              name="password"
              autoComplete="current-password"
              className="form-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '18px', opacity: loading ? 0.7 : 1 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="auth-footer">
            Don't have an account? <Link to="/register" className="auth-link">Create account</Link>
          </p>
          <p className="auth-footer">
            <Link to="/forgot-password" className="auth-link">🔑 Forgot Password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;




