const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { pool } = require('../config/db');



// GET /api/posts - List all posts
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT posts.*, users.name AS author_name, users.role AS author_role
       FROM posts JOIN users ON posts.user_id = users.user_id
       ORDER BY posts.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/posts - Create a new post
router.post('/', authenticate, async (req, res) => {
  const { title, description, category } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO posts (user_id, title, description, category)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.user_id, title, description, category || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/posts/:id - Delete a post by ID (only author allowed)
router.delete('/:id', authenticate, async (req, res) => {
  const post_id = req.params.id;
  try {
    // Only allow deletion if the user owns the post
    const exists = await pool.query("SELECT * FROM posts WHERE post_id = $1 AND user_id = $2", [post_id, req.user.user_id]);
    if (exists.rows.length === 0) {
      return res.status(403).json({ error: "You can only delete your own posts" });
    }
    await pool.query("DELETE FROM posts WHERE post_id = $1", [post_id]);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
