import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import API from '../api';

function Navbar() {
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/auth/me')
      .then(res => setRole(res.data.role))
      .catch(() => setRole(''));
  }, []);

  return (
    <header className={styles.siteHeader}>
      <div className={styles.topRow}>
        <div className={styles.brand}>MEDIMATE</div>

        <div>
          <button className={styles.logoutBtn} onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}>Logout</button>
        </div>
      </div>

      <div className={styles.divider} />

      <nav className={styles.centerNav}>
        <div className={styles.navLinks}>
          <NavLink className={({isActive}) => `${styles.navLink} ${isActive?styles.active:''}`} to="/dashboard">Dashboard</NavLink>
          <NavLink className={({isActive}) => `${styles.navLink} ${isActive?styles.active:''}`} to="/posts">Posts</NavLink>
          {role === 'patient' && (
            <NavLink className={({isActive}) => `${styles.navLink} ${isActive?styles.active:''}`} to="/appointments">Appointments</NavLink>
          )}
          <NavLink className={({isActive}) => `${styles.navLink} ${isActive?styles.active:''}`} to="/chat">Chat</NavLink>
          <NavLink className={({isActive}) => `${styles.navLink} ${isActive?styles.active:''}`} to="/comments">Comments</NavLink>
          <NavLink className={({isActive}) => `${styles.navLink} ${isActive?styles.active:''}`} to="/ratings">Ratings</NavLink>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
