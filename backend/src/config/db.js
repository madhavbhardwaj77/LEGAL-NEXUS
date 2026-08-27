const mongoose = require('mongoose');
const logger = require('../utils/logger');
const config = require('./env');

const connectDB = async (customUri = null) => {
  const uri = customUri || config.mongo.uri;
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    logger.info(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB connection lost. Reconnecting...');
    });

    return conn;
  } catch (error) {
    logger.error(`MongoDB Connection Failed: ${error.message}`);
    if (config.env !== 'test') {
      logger.warn('Continuing execution in disconnected DB mode or waiting for database to spin up.');
    }
    return null;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB Disconnected successfully.');
  } catch (error) {
    logger.error(`Error disconnecting MongoDB: ${error.message}`);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
