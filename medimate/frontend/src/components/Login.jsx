import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/posts');
    } catch (error) {
      setErr('Login failed. Check credentials.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card card">
        <div className="text-center">
          <h2 className="form-title">Welcome back</h2>
          <div className="form-sub">Sign in to your MediMate account</div>
        </div>
        <form onSubmit={handleSubmit} style={{marginTop:16}}>
          <input
            className="form-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="form-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button className="btn btn-primary btn-block" type="submit">Login</button>
          {err && <div className="msg-error">{err}</div>}
        </form>
        <div className="text-center" style={{marginTop:14}}>
          <Link to="/register" className="link-muted">Need an account? Register</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
