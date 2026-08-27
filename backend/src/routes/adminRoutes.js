const express = require('express');
const { getAdminStats, getAuditLogs } = require('../controllers/adminController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');
const { ROLES } = require('../config/roles');

const router = express.Router();

// Admin only routes
router.use(authenticateJWT, authorizeRoles(ROLES.ADMIN));

router.get('/stats', getAdminStats);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
