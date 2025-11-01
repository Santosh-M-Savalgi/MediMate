const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const { pool } = require('./config/db');

const app = express();

// Use CORS for all routes (allow all origins for development)
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true,
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/chats', require('./routes/chats'));
app.use('/api/users', require('./routes/users'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/queries', require('./routes/queries'));

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({ status: 'OK', message: 'Server and database are running', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: 'Database connection failed', error: error.message });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
