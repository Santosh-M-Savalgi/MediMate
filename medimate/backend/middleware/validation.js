const { body, validationResult } = require('express-validator');

const validationMiddleware = {
  validateUser: [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email').trim().isEmail().normalizeEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])/).withMessage('Password must include one lowercase letter, one uppercase letter, one number, and one special character'),
    body('role').optional().isIn(['doctor', 'patient']).withMessage('Invalid role specified'),
  ],

  validatePost: [
    body('title').trim().isLength({ min: 5, max: 150 }).withMessage('Title must be between 5 and 150 characters'),
    body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
    body('category').trim().notEmpty().withMessage('Category is required'),
  ],

  validateAppointment: [
    body('appointment_date').isDate().withMessage('Invalid appointment date'),
    body('appointment_time').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (use HH:MM)'),
    body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  ],

  validateComment: [
    body('content').trim().isLength({ min: 2, max: 1000 }).withMessage('Comment must be between 2 and 1000 characters'),
  ],

  validateRating: [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('feedback').optional().trim().isLength({ max: 500 }).withMessage('Feedback cannot exceed 500 characters'),
  ],

  validate: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation Error',
        details: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }
    next();
  }
};

module.exports = validationMiddleware;