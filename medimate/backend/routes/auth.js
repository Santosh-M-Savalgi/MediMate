const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticate } = require('../middleware/auth'); // <-- Corrected: import authenticate!

// REGISTER ENDPOINT
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields required' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, name, email, role',
      [name, email, hash, role, true]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// LOGIN ENDPOINT
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  try {
    // Find user by email
    const result = await pool.query(
      'SELECT user_id, name, email, password, role, is_verified FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    // Sign JWT
    const token = jwt.sign(
      { user_id: user.user_id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    // Return user info (without password) and token
    const { password: _, ...userNoPassword } = user;
    res.json({
      user: userNoPassword,
      token
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me — Get current user's profile info
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, name, email, role FROM users WHERE user_id = $1',
      [req.user.user_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
