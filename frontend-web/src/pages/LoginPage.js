import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import { useAuth } from '../context/AuthContext';
import '../App.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    try {
      await login(email, password);
      
      setSuccess('Login successful! Redirecting to home...');
      console.log('Login successful.');
      
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      console.error('Login error detailed:', err);
      setError(err.response?.data?.message || 'Login failed. Invalid email or password.');
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {/* Thêm liên kết đến trang đăng ký ở đây */}
      <p style={{ marginTop: '20px', color: '#ccc' }}>
        Don't have an account? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>Sign Up</Link>
      </p>
    </div>
  );
}

export default LoginPage;