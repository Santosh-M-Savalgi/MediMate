const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { pool } = require('../config/db');



// GET /api/comments?post_id=1 - List comments for a post
router.get('/', authenticate, async (req, res) => {
  const { post_id } = req.query;
  if (!post_id) {
    return res.status(400).json({ error: 'post_id required as query param' });
  }
  try {
    const result = await pool.query(
      `SELECT comments.*, users.name AS doctor_name, users.role AS doctor_role 
       FROM comments JOIN users ON comments.doctor_id = users.user_id 
       WHERE comments.post_id = $1 ORDER BY comments.created_at ASC`,
      [post_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error in GET /api/comments:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/comments - Add new comment to a post
router.post('/', authenticate, async (req, res) => {
  const { post_id, content } = req.body;
  if (!post_id || !content) {
    return res.status(400).json({ error: 'post_id and content required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO comments (post_id, doctor_id, content, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [post_id, req.user.user_id, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error in POST /api/comments:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/comments/:id - Delete own comment
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const exists = await pool.query(
      `SELECT * FROM comments WHERE comment_id = $1 AND doctor_id = $2`,
      [req.params.id, req.user.user_id]
    );
    if (exists.rows.length === 0) return res.status(403).json({ error: 'Unauthorized or not found' });
    await pool.query(`DELETE FROM comments WHERE comment_id = $1`, [req.params.id]);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('Error in DELETE /api/comments:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
