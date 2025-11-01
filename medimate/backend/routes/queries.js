const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { pool } = require('../config/db');



// POST /api/queries — Run a custom SQL query (SELECT only)
router.post('/', authenticate, async (req, res) => {
  const { sql } = req.body;
  if (!sql || typeof sql !== 'string') {
    return res.status(400).json({ error: 'SQL string required' });
  }

  // Allow only "SELECT" queries for safety
  if (!sql.trim().toLowerCase().startsWith('select')) {
    return res.status(400).json({ error: 'Only SELECT queries allowed.' });
  }

  try {
    const result = await pool.query(sql);
    res.json({ rows: result.rows, fields: result.fields.map(f => f.name) });
  } catch (err) {
    console.error('Error in POST /api/queries:', err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
