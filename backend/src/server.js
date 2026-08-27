const app = require('./app');
const config = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const { getRedisClient, closeRedis } = require('./config/redis');
const logger = require('./utils/logger');

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize Redis client
    getRedisClient();

    // Start Express Server
    const server = app.listen(config.port, () => {
      logger.info(`=================================================`);
      logger.info(` Nyaya Setu Backend Server Started              `);
      logger.info(` Port:        http://localhost:${config.port}   `);
      logger.info(` Environment: ${config.env}                     `);
      logger.info(` HealthCheck: http://localhost:${config.port}/api/health`);
      logger.info(`=================================================`);
    });

    // Graceful Shutdown Handler
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDB();
        await closeRedis();
        logger.info('Process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error(`Failed to start Nyaya Setu Server: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = startServer;
