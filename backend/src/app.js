const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/env');
const apiRoutes = require('./routes');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

const app = express();

// Security Headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.clientUrl || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP Request Logging
if (config.env !== 'test') {
  app.use(morgan('combined'));
}

// Global API Rate Limiter
app.use('/api', apiLimiter);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Nyaya Setu API',
    description: 'Bridge to Justice - Legal Tech & AI Case Intelligence Platform for India',
    version: '1.0.0',
    documentation: '/docs',
    healthCheck: '/api/health',
  });
});

// Main API Routes
app.use('/api', apiRoutes);

// Catch 404
app.use(notFoundHandler);

// Centralized Error Handling
app.use(globalErrorHandler);

module.exports = app;
