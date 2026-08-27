const { User, Case, VerificationRequest, Document, AuditLog } = require('../models');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * GET /api/admin/stats
 */
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCases,
      openCases,
      pendingVerifications,
      totalDocuments,
      recentAuditLogs,
    ] = await Promise.all([
      User.countDocuments(),
      Case.countDocuments(),
      Case.countDocuments({ status: { $in: ['OPEN', 'UNDER_REVIEW', 'IN_PROGRESS'] } }),
      VerificationRequest.countDocuments({ status: 'PENDING' }),
      Document.countDocuments(),
      AuditLog.find().sort({ createdAt: -1 }).limit(10),
    ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const casesByCategory = await Case.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    return sendSuccess(
      res,
      {
        totalUsers,
        totalCases,
        openCases,
        pendingVerifications,
        totalDocuments,
        usersByRole,
        casesByCategory,
        recentAuditLogs,
      },
      'Admin metrics retrieved'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/audit-logs
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const { action, resource, userId, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (action) filter.action = new RegExp(action, 'i');
    if (resource) filter.resource = resource;
    if (userId) filter.user = userId;

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)),
      AuditLog.countDocuments(filter),
    ]);

    return sendSuccess(res, logs, 'Audit logs retrieved', 200, {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAuditLogs,
};
