const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { pool } = require('../config/db');


// GET /api/chats?with_user=2 - List messages to/from a specific user (doctor or patient)
router.get('/', authenticate, async (req, res) => {
  const { with_user } = req.query; // user_id to chat with
  if (!with_user) {
    return res.status(400).json({ error: 'with_user query param required' });
  }
  try {
    const result = await pool.query(
      `SELECT * FROM chats 
       WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) 
       ORDER BY sent_at ASC`,
      [req.user.user_id, with_user]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error in GET /api/chats:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/chats - Send a message
router.post('/', authenticate, async (req, res) => {
  const { receiver_id, message } = req.body;
  if (!receiver_id || !message) {
    return res.status(400).json({ error: 'receiver_id and message required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO chats (sender_id, receiver_id, message, sent_at) VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [req.user.user_id, receiver_id, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error in POST /api/chats:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
