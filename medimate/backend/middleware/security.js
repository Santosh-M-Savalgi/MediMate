const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const config = require('../config/config');

const securityMiddleware = {
  // Rate limiting middleware
  rateLimiter: rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: 'Too many requests from this IP, please try again later.'
  }),

  // Security headers middleware
  securityHeaders: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }),

  // CORS middleware
  corsConfig: cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),

  // Error handling middleware
  errorHandler: (err, req, res, next) => {
    console.error(err.stack);
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation Error', 
        details: err.message 
      });
    }
    
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({ 
        error: 'Unauthorized',
        details: 'Invalid or expired token'
      });
    }

    // Default error
    res.status(500).json({ 
      error: 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  }
};

module.exports = securityMiddleware;