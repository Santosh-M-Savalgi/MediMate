const express = require('express');
const router = express.Router();
const db = require('../config/db');
const logger = require('../utils/logger');

// Basic health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Detailed health check with DB connection test
router.get('/health/detailed', async (req, res) => {
  const startTime = process.hrtime();
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: {
        status: 'unhealthy',
        responseTime: null
      }
    }
  };

  try {
    // Test database connection
    await db.query('SELECT 1');
    const dbTime = process.hrtime(startTime);
    health.services.database = {
      status: 'healthy',
      responseTime: `${(dbTime[0] * 1000 + dbTime[1] / 1e6).toFixed(2)}ms`
    };
  } catch (error) {
    logger.error('Database health check failed', { error: error.message });
    health.status = 'unhealthy';
    health.services.database.error = 'Database connection failed';
  }

  // System metrics
  health.metrics = {
    memory: {
      total: process.memoryUsage().heapTotal,
      used: process.memoryUsage().heapUsed,
      external: process.memoryUsage().external
    },
    cpu: process.cpuUsage()
  };

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Readiness probe
router.get('/health/ready', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Readiness check failed', { error: error.message });
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});

module.exports = router;