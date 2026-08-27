const rateLimit = require('express-rate-limit');
const config = require('../config/env');
const { sendError } = require('../utils/apiResponse');

// Standard API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      'Too many requests from this IP, please try again after 15 minutes.',
      429
    );
  },
  skip: () => config.env === 'test', // Skip in tests
});

// Stricter Rate Limiter for Authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // max 30 login/signup attempts per 15 min window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      'Too many authentication attempts, please try again after 15 minutes.',
      429
    );
  },
  skip: () => config.env === 'test',
});

module.exports = {
  apiLimiter,
  authLimiter,
};
