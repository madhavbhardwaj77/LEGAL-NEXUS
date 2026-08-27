const express = require('express');
const { body } = require('express-validator');
const {
  createDraft,
  listDrafts,
  getDraftById,
  updateDraft,
} = require('../controllers/draftController');
const { authenticateJWT } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { auditLogMiddleware } = require('../middleware/auditLog');

const router = express.Router();

router.use(authenticateJWT);

// POST /api/drafts
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Draft title is required'),
    body('draftType').notEmpty().withMessage('Draft type is required'),
    body('contentMarkdown').notEmpty().withMessage('Draft content is required'),
    validate,
  ],
  auditLogMiddleware('DRAFT_CREATED', 'DRAFT'),
  createDraft
);

// GET /api/drafts
router.get('/', listDrafts);

// GET /api/drafts/:id
router.get('/:id', getDraftById);

// PATCH /api/drafts/:id
router.patch(
  '/:id',
  auditLogMiddleware('DRAFT_UPDATED', 'DRAFT'),
  updateDraft
);

module.exports = router;
