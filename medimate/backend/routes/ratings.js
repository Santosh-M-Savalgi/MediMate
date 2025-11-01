const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { pool } = require('../config/db');



// GET /api/ratings?doctor_id=2 — List all ratings for a doctor
router.get('/', authenticate, async (req, res) => {
  const { doctor_id } = req.query;
  if (!doctor_id) return res.status(400).json({ error: 'doctor_id required' });
  try {
    const result = await pool.query(
      `SELECT ratings_feedback.*, users.name AS patient_name
       FROM ratings_feedback JOIN users ON ratings_feedback.patient_id = users.user_id
       WHERE ratings_feedback.doctor_id = $1
       ORDER BY ratings_feedback.created_at DESC`,
      [doctor_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error in GET /api/ratings:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/ratings — Create a rating (patient reviewing a doctor after appointment)
router.post('/', authenticate, async (req, res) => {
  const { doctor_id, appointment_id, rating, feedback } = req.body;
  if (!doctor_id || !appointment_id || !rating) {
    return res.status(400).json({ error: 'doctor_id, appointment_id, and rating required' });
  }
  try {
    // validate appointment belongs to this patient and is with the specified doctor
    const apptRes = await pool.query(
      'SELECT * FROM appointments WHERE appointment_id = $1 AND patient_id = $2 AND doctor_id = $3',
      [appointment_id, req.user.user_id, doctor_id]
    );
    if (apptRes.rows.length === 0) {
      return res.status(403).json({ error: 'Invalid appointment: you can only rate doctors you had appointments with' });
    }

    const result = await pool.query(
      `INSERT INTO ratings_feedback (patient_id, doctor_id, appointment_id, rating, feedback, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [req.user.user_id, doctor_id, appointment_id, rating, feedback || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error in POST /api/ratings:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/ratings/:id — Patient deletes their rating
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const exists = await pool.query(
      `SELECT * FROM ratings_feedback WHERE id = $1 AND patient_id = $2`,
      [req.params.id, req.user.user_id]
    );
    if (exists.rows.length === 0) return res.status(403).json({ error: 'Unauthorized or not found' });
    await pool.query(`DELETE FROM ratings_feedback WHERE id = $1`, [req.params.id]);
    res.json({ message: 'Rating deleted' });
  } catch (err) {
    console.error('Error in DELETE /api/ratings:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
