const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { pool } = require('../config/db');

// GET appointments
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM appointments WHERE patient_id = $1 OR doctor_id = $1 ORDER BY appointment_date DESC, appointment_time DESC`,
      [req.user.user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error in GET /api/appointments:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST appointment
router.post('/', authenticate, async (req, res) => {
  const { doctor_id, appointment_date, appointment_time, notes } = req.body;
  if (!doctor_id || !appointment_date || !appointment_time || !notes) {
    return res.status(400).json({ error: 'doctor_id, appointment_date, appointment_time, and notes required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, notes, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [req.user.user_id, doctor_id, appointment_date, appointment_time, notes, 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error in POST /api/appointments:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT appointment (update status, appointment_date, appointment_time, notes)
router.put('/:id', authenticate, async (req, res) => {
  const { status, appointment_date, appointment_time, notes } = req.body;
  try {
    const updates = [];
    const params = [];
    let i = 1;
    if (status) { updates.push(`status = $${i++}`); params.push(status); }
    if (appointment_date) { updates.push(`appointment_date = $${i++}`); params.push(appointment_date); }
    if (appointment_time) { updates.push(`appointment_time = $${i++}`); params.push(appointment_time); }
    if (notes) { updates.push(`notes = $${i++}`); params.push(notes); }
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    params.push(req.params.id);
    const result = await pool.query(
      `UPDATE appointments SET ${updates.join(', ')} WHERE appointment_id = $${i} RETURNING *`,
      params
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error in PUT /api/appointments:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE appointment
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const exists = await pool.query(
      `SELECT * FROM appointments WHERE appointment_id = $1 AND (patient_id = $2 OR doctor_id = $2)`, 
      [req.params.id, req.user.user_id]
    );
    if (exists.rows.length === 0) return res.status(403).json({ error: 'Unauthorized or not found' });
    await pool.query(`DELETE FROM appointments WHERE appointment_id = $1`, [req.params.id]);
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    console.error('Error in DELETE /api/appointments:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
