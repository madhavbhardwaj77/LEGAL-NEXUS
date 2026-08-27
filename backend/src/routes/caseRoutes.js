const express = require('express');
const { body } = require('express-validator');
const {
  handleCreateCase,
  handleListCases,
  handleGetCaseById,
  handleUpdateCase,
  handleAssignLawyer,
  handleDeleteCase,
} = require('../controllers/caseController');
const {
  addTimelineEvent,
  getCaseTimeline,
  deleteTimelineEvent,
} = require('../controllers/timelineController');
const {
  addEvidence,
  listEvidence,
  deleteEvidence,
} = require('../controllers/evidenceController');
const { authenticateJWT } = require('../middleware/auth');
const { requireCaseAccess, authorizeRoles } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { auditLogMiddleware } = require('../middleware/auditLog');
const { ROLES } = require('../config/roles');

const router = express.Router();

// Apply authentication across all case routes
router.use(authenticateJWT);

// Case CRUD
router.post(
  '/',
  [
    body('category').notEmpty().withMessage('Case category is required'),
    body('issue').notEmpty().withMessage('Issue description is required'),
    body('description').notEmpty().withMessage('Detailed description is required'),
    validate,
  ],
  auditLogMiddleware('CASE_CREATED', 'CASE'),
  handleCreateCase
);

router.get('/', handleListCases);

router.get('/:id', requireCaseAccess, handleGetCaseById);

router.patch(
  '/:id',
  requireCaseAccess,
  auditLogMiddleware('CASE_UPDATED', 'CASE'),
  handleUpdateCase
);

router.delete(
  '/:id',
  requireCaseAccess,
  auditLogMiddleware('CASE_ARCHIVED', 'CASE'),
  handleDeleteCase
);

router.patch(
  '/:id/assign-lawyer',
  authorizeRoles(ROLES.ADMIN, ROLES.LAWYER),
  requireCaseAccess,
  [body('lawyerId').notEmpty().withMessage('Lawyer ID is required'), validate],
  auditLogMiddleware('LAWYER_ASSIGNED', 'CASE'),
  handleAssignLawyer
);

// Case Timeline Events
router.post(
  '/:id/events',
  requireCaseAccess,
  [
    body('title').notEmpty().withMessage('Event title is required'),
    body('description').notEmpty().withMessage('Event description is required'),
    validate,
  ],
  auditLogMiddleware('TIMELINE_EVENT_ADDED', 'TIMELINE'),
  addTimelineEvent
);

router.get('/:id/timeline', requireCaseAccess, getCaseTimeline);

router.delete(
  '/:id/events/:eventId',
  requireCaseAccess,
  auditLogMiddleware('TIMELINE_EVENT_DELETED', 'TIMELINE'),
  deleteTimelineEvent
);

// Case Evidence
router.post(
  '/:id/evidence',
  requireCaseAccess,
  [
    body('title').notEmpty().withMessage('Evidence title is required'),
    validate,
  ],
  auditLogMiddleware('EVIDENCE_ADDED', 'EVIDENCE'),
  addEvidence
);

router.get('/:id/evidence', requireCaseAccess, listEvidence);

router.delete(
  '/:id/evidence/:evidenceId',
  requireCaseAccess,
  auditLogMiddleware('EVIDENCE_DELETED', 'EVIDENCE'),
  deleteEvidence
);

module.exports = router;
