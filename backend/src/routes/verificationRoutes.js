const express = require('express');
const { body } = require('express-validator');
const {
  submitVerificationRequest,
  listVerificationRequests,
  reviewVerificationRequest,
} = require('../controllers/verificationController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { auditLogMiddleware } = require('../middleware/auditLog');
const { ROLES, PROFESSIONAL_ROLES } = require('../config/roles');

const router = express.Router();

router.use(authenticateJWT);

// Professional submits verification
router.post(
  '/request',
  authorizeRoles(...PROFESSIONAL_ROLES),
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    validate,
  ],
  auditLogMiddleware('VERIFICATION_SUBMITTED', 'VERIFICATION'),
  submitVerificationRequest
);

// Admin list verification requests
router.get(
  '/requests',
  authorizeRoles(ROLES.ADMIN),
  listVerificationRequests
);

// Admin approve or reject
router.patch(
  '/requests/:id',
  authorizeRoles(ROLES.ADMIN),
  [
    body('status').isIn(['VERIFIED', 'REJECTED']).withMessage('Status must be VERIFIED or REJECTED'),
    validate,
  ],
  auditLogMiddleware('VERIFICATION_REVIEWED', 'VERIFICATION'),
  reviewVerificationRequest
);

module.exports = router;
