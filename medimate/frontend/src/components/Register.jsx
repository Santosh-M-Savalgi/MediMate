import React, { useState } from 'react';
import API from '../api';

function Register({ onRegisterSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    try {
      await API.post('/auth/register', { name, email, password, role });
      setMsg('Registration successful! You can now login.');
      onRegisterSuccess && onRegisterSuccess();
    } catch (error) {
      setErr('Registration failed. Try again.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card card">
        <div className="text-center">
          <h2 className="form-title">Create account</h2>
          <div className="form-sub">Start using MediMate — fast and secure</div>
        </div>
        <form onSubmit={handleSubmit} style={{marginTop:16}}>
          <input className="form-input" type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
          <input className="form-input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="form-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <select className="form-input" value={role} onChange={e => setRole(e.target.value)}>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
          <button className="btn btn-primary btn-block" type="submit">Register</button>
          {err && <div className="msg-error">{err}</div>}
          {msg && <div className="msg-ok">{msg}</div>}
        </form>
      </div>
    </div>
  );
}

export default Register;
