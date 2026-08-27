const { getRedisClient, isRedisReady, memoryFallbackStore } = require('../config/redis');
const logger = require('../utils/logger');

const DEFAULT_TTL = 3600; // 1 hour in seconds

/**
 * Get cached value by key
 */
const getCache = async (key) => {
  try {
    const client = getRedisClient();
    if (client && isRedisReady()) {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    }
    
    // Fallback to in-memory store
    const memoryItem = memoryFallbackStore.get(key);
    if (memoryItem) {
      if (memoryItem.expiresAt && memoryItem.expiresAt < Date.now()) {
        memoryFallbackStore.delete(key);
        return null;
      }
      return memoryItem.value;
    }
    return null;
  } catch (error) {
    logger.warn(`Redis getCache failed for key ${key}: ${error.message}`);
    return null;
  }
};

/**
 * Set cached value by key with optional TTL (in seconds)
 */
const setCache = async (key, value, ttlSeconds = DEFAULT_TTL) => {
  try {
    const serialized = JSON.stringify(value);
    const client = getRedisClient();
    if (client && isRedisReady()) {
      if (ttlSeconds) {
        await client.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await client.set(key, serialized);
      }
      return true;
    }

    // Fallback to in-memory store
    memoryFallbackStore.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
    return true;
  } catch (error) {
    logger.warn(`Redis setCache failed for key ${key}: ${error.message}`);
    return false;
  }
};

/**
 * Delete cached value by key
 */
const deleteCache = async (key) => {
  try {
    const client = getRedisClient();
    if (client && isRedisReady()) {
      await client.del(key);
    }
    memoryFallbackStore.delete(key);
    return true;
  } catch (error) {
    logger.warn(`Redis deleteCache failed for key ${key}: ${error.message}`);
    return false;
  }
};

/**
 * Invalidate all cache keys matching a pattern (e.g. "cases:*")
 */
const invalidatePattern = async (pattern) => {
  try {
    const client = getRedisClient();
    if (client && isRedisReady()) {
      const keys = await client.keys(pattern);
      if (keys && keys.length > 0) {
        await client.del(...keys);
      }
    }

    // Clear matching keys in memory fallback
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of memoryFallbackStore.keys()) {
      if (regex.test(key)) {
        memoryFallbackStore.delete(key);
      }
    }
    return true;
  } catch (error) {
    logger.warn(`Redis invalidatePattern failed for pattern ${pattern}: ${error.message}`);
    return false;
  }
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
  invalidatePattern,
};
