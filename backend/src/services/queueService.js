const { v4: uuidv4 } = require('uuid');
const { getRedisClient, isRedisReady } = require('../config/redis');
const logger = require('../utils/logger');

const QUEUES = {
  DOCUMENT_PROCESSING: 'queue:document_processing',
  AI_TASKS: 'queue:ai_tasks',
  NOTIFICATIONS: 'queue:notifications',
};

// In-memory queue fallback for offline/development mode
const inMemoryQueue = {
  [QUEUES.DOCUMENT_PROCESSING]: [],
  [QUEUES.AI_TASKS]: [],
  [QUEUES.NOTIFICATIONS]: [],
};

/**
 * Enqueue a job for background processing
 * @param {string} queueName - Name of the queue
 * @param {object} payload - Job payload
 * @returns {object} Job metadata including jobId
 */
const enqueueJob = async (queueName, payload) => {
  const jobId = `job_${uuidv4()}`;
  const jobData = {
    jobId,
    queueName,
    payload,
    status: 'QUEUED',
    enqueuedAt: new Date().toISOString(),
    attempts: 0,
  };

  try {
    const client = getRedisClient();
    if (client && isRedisReady()) {
      // Push serialized job to Redis List
      await client.rpush(queueName, JSON.stringify(jobData));
      // Store job status key with 24-hour expiration
      await client.set(`job:status:${jobId}`, JSON.stringify(jobData), 'EX', 86400);
      logger.info(`Enqueued job ${jobId} to Redis queue [${queueName}]`);
    } else {
      // In-memory queue fallback
      if (!inMemoryQueue[queueName]) {
        inMemoryQueue[queueName] = [];
      }
      inMemoryQueue[queueName].push(jobData);
      logger.info(`Enqueued job ${jobId} to in-memory queue fallback [${queueName}]`);
    }

    return jobData;
  } catch (error) {
    logger.error(`Error enqueueing job to ${queueName}: ${error.message}`);
    // Fallback store
    if (!inMemoryQueue[queueName]) inMemoryQueue[queueName] = [];
    inMemoryQueue[queueName].push(jobData);
    return jobData;
  }
};

/**
 * Get job status by ID
 */
const getJobStatus = async (jobId) => {
  try {
    const client = getRedisClient();
    if (client && isRedisReady()) {
      const data = await client.get(`job:status:${jobId}`);
      if (data) return JSON.parse(data);
    }

    // Search in-memory fallback
    for (const queue of Object.values(inMemoryQueue)) {
      const found = queue.find((j) => j.jobId === jobId);
      if (found) return found;
    }

    return null;
  } catch (error) {
    logger.warn(`Error getting job status ${jobId}: ${error.message}`);
    return null;
  }
};

module.exports = {
  QUEUES,
  enqueueJob,
  getJobStatus,
};
