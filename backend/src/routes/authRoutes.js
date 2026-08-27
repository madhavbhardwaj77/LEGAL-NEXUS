const express = require('express');
const { body } = require('express-validator');
const { signup, login, refresh, me, logout } = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');
const { auditLogMiddleware } = require('../middleware/auditLog');
const { ALL_ROLES } = require('../config/roles');

const router = express.Router();

// POST /api/auth/signup
router.post(
  '/signup',
  authLimiter,
  [
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('role')
      .optional()
      .isIn(ALL_ROLES)
      .withMessage(`Role must be one of: ${ALL_ROLES.join(', ')}`),
    validate,
  ],
  auditLogMiddleware('AUTH_SIGNUP', 'USER'),
  signup
);

// POST /api/auth/login
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  auditLogMiddleware('AUTH_LOGIN', 'USER'),
  login
);

// POST /api/auth/refresh
router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required'), validate],
  refresh
);

// GET /api/auth/me
router.get('/me', authenticateJWT, me);

// POST /api/auth/logout
router.post('/logout', authenticateJWT, logout);

module.exports = router;
