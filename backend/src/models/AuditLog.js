const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    userEmail: {
      type: String,
    },
    userRole: {
      type: String,
    },
    action: {
      type: String,
      required: true,
      index: true, // e.g. "AUTH_LOGIN", "CASE_CREATED", "TIMELINE_EVENT_ADDED", "DOCUMENT_UPLOADED", "PROFILE_UPDATED", "VERIFICATION_STATUS_CHANGED"
    },
    resource: {
      type: String,
      required: true, // e.g. "CASE", "USER", "TIMELINE", "DOCUMENT", "PROFILE"
      index: true,
    },
    resourceId: {
      type: String,
      index: true,
    },
    method: {
      type: String, // GET, POST, PATCH, DELETE
    },
    endpoint: {
      type: String,
    },
    statusCode: {
      type: Number,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
