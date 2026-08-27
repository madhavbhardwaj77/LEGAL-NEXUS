const Redis = require('ioredis');
const logger = require('../utils/logger');
const config = require('./env');

let redisClient = null;
let isConnected = false;

// In-memory cache fallback when Redis is offline
const memoryFallbackStore = new Map();

const getRedisClient = () => {
  if (redisClient) {
    return redisClient;
  }

  if (config.env === 'test') {
    // In test environment, use mock or memory store
    try {
      const RedisMock = require('ioredis-mock');
      redisClient = new RedisMock();
      isConnected = true;
      return redisClient;
    } catch {
      return null;
    }
  }

  try {
    redisClient = new Redis(config.redis.url, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) {
          logger.warn(`Redis connection retry limit reached (${times}). Operating with fallback cache.`);
          return null; // Stop retrying
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    redisClient.on('connect', () => {
      isConnected = true;
      logger.info('Redis Connected successfully.');
    });

    redisClient.on('ready', () => {
      isConnected = true;
      logger.info('Redis Ready to accept commands.');
    });

    redisClient.on('error', (err) => {
      isConnected = false;
      logger.warn(`Redis connection issue: ${err.message}. Fallback mode active.`);
    });

    redisClient.on('close', () => {
      isConnected = false;
      logger.warn('Redis connection closed.');
    });

    // Attempt non-blocking initial connection
    redisClient.connect().catch((err) => {
      logger.warn(`Redis initial connect failed: ${err.message}. Cache fallback enabled.`);
    });

    return redisClient;
  } catch (error) {
    logger.warn(`Redis initialization error: ${error.message}. In-memory fallback will be used.`);
    return null;
  }
};

const isRedisReady = () => isConnected;

const closeRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      isConnected = false;
      redisClient = null;
      logger.info('Redis connection closed.');
    } catch (err) {
      logger.error(`Error closing Redis: ${err.message}`);
    }
  }
};

module.exports = {
  getRedisClient,
  isRedisReady,
  closeRedis,
  memoryFallbackStore,
};
