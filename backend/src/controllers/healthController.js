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
    service: 'Legal Nexus Core Backend API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      mongo: mongoStatus,
      mongoStorageMode: global.__MONGO_STORAGE_MODE__ || (global.__MONGO_MEMORY_SERVER__ ? 'EPHEMERAL_IN_MEMORY' : 'PERSISTENT_DISK'),
      redis: redisStatus,
    },
    system: {
      nodeVersion: process.version,
      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
  };

  return sendSuccess(res, healthData, 'Legal Nexus Backend is healthy');
};

module.exports = {
  getHealthStatus,
};
