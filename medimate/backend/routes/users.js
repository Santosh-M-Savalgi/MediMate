const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { authenticate } = require('../middleware/auth');

// GET /api/users - list or search users. Query: ?search=abc
router.get('/', authenticate, async (req, res) => {
  const { search } = req.query;
  try {
    const q = search ? `%${search}%` : '%';
    const result = await pool.query(
      'SELECT user_id, name, email, role FROM users WHERE name ILIKE $1 ORDER BY name ASC LIMIT 50',
      [q]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error in GET /api/users:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/lookup?username=alice - lookup user by name (case-insensitive)
router.get('/lookup', authenticate, async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'username query param required' });
  try {
    const result = await pool.query(
      'SELECT user_id, name, email, role FROM users WHERE name ILIKE $1 LIMIT 1',
      [username]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error in GET /api/users/lookup:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
