const express = require('express');
const { getCurrentUserProfile, updateUserSettings, listUsers } = require('../controllers/userController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');
const { auditLogMiddleware } = require('../middleware/auditLog');
const { ROLES } = require('../config/roles');

const router = express.Router();

// GET /api/users/profile
router.get('/profile', authenticateJWT, getCurrentUserProfile);

// PATCH /api/users/settings
router.patch(
  '/settings',
  authenticateJWT,
  auditLogMiddleware('USER_SETTINGS_UPDATED', 'USER'),
  updateUserSettings
);

// GET /api/users (Admin only)
router.get('/', authenticateJWT, authorizeRoles(ROLES.ADMIN), listUsers);

module.exports = router;
