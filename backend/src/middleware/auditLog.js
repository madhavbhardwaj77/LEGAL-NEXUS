const { recordAuditLog } = require('../services/auditService');

/**
 * Middleware to record mutating HTTP actions in the audit log
 */
const auditLogMiddleware = (actionName, resourceName) => {
  return (req, res, next) => {
    // Intercept response finish
    const originalSend = res.send;

    res.send = function (data) {
      res.send = originalSend;
      res.send(data);

      // Async audit log record after response is sent
      try {
        const user = req.user;
        const resourceId = req.params.id || req.params.caseId || (req.body && req.body.caseId) || undefined;
        
        recordAuditLog({
          user: user ? user._id : null,
          userEmail: user ? user.email : null,
          userRole: user ? user.role : 'ANONYMOUS',
          action: actionName || `${req.method}_${req.baseUrl}${req.path}`,
          resource: resourceName || req.baseUrl.replace('/api/', '').toUpperCase(),
          resourceId,
          method: req.method,
          endpoint: req.originalUrl,
          statusCode: res.statusCode,
          ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.get('User-Agent'),
          details: {
            params: req.params,
            query: req.query,
            bodySummary: req.body ? Object.keys(req.body) : null,
          },
        });
      } catch (err) {
        // Silently catch audit log failure to not disrupt API responses
      }
    };

    next();
  };
};

module.exports = {
  auditLogMiddleware,
};
