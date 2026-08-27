const mongoose = require('mongoose');
const { isRedisReady } = require('../config/redis');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * GET /api/health
 */
const getHealthStatus = async (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
  const redisStatus = isRedisReady() ? 'CONNECTED' : 'STANDBY_FALLBACK';

  const healthData = {
    status: 'OPERATIONAL',
    service: 'Nyaya Setu Core Backend API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      mongo: mongoStatus,
      redis: redisStatus,
    },
    system: {
      nodeVersion: process.version,
      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
  };

  return sendSuccess(res, healthData, 'Nyaya Setu Backend is healthy');
};

module.exports = {
  getHealthStatus,
};
