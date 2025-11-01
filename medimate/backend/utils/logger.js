const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize } = format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

// Create the logger
const logger = createLogger({
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    // Console transport for development
    new transports.Console({
      format: combine(
        colorize(),
        logFormat
      ),
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
    }),
    // File transport for errors
    new transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport for all logs
    new transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// Log unhandled rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection', {
    error: error.message,
    stack: error.stack
  });
});

// Log uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  // Give time for logs to be written before exiting
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

module.exports = logger;