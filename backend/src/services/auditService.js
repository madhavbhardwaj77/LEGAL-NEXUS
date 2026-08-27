const { AuditLog } = require('../models');
const logger = require('../utils/logger');

/**
 * Record an audit log entry
 */
const recordAuditLog = async ({
  user = null,
  userEmail = null,
  userRole = null,
  action,
  resource,
  resourceId = null,
  method = null,
  endpoint = null,
  statusCode = 200,
  ipAddress = null,
  userAgent = null,
  details = null,
}) => {
  try {
    const log = await AuditLog.create({
      user: user || (user && user._id),
      userEmail,
      userRole,
      action,
      resource,
      resourceId: resourceId ? String(resourceId) : undefined,
      method,
      endpoint,
      statusCode,
      ipAddress,
      userAgent,
      details,
    });
    return log;
  } catch (error) {
    logger.error(`Failed to record audit log: ${error.message}`);
    return null;
  }
};

module.exports = {
  recordAuditLog,
};
