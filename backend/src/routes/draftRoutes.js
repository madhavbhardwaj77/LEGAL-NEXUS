const express = require('express');
const { body } = require('express-validator');
const {
  generateAiDraft,
  createDraft,
  listDrafts,
  getDraftById,
  updateDraft,
} = require('../controllers/draftController');
const { authenticateJWT } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { auditLogMiddleware } = require('../middleware/auditLog');
const { guardrailCheck } = require('../middleware/guardrail');

const router = express.Router();

// POST /api/drafts/generate-ai (AI Draft Generation)
router.post(
  '/generate-ai',
  authenticateJWT,
  [body('draftType').notEmpty().withMessage('Draft type is required'), validate],
  guardrailCheck,
  auditLogMiddleware('AI_DRAFT_GENERATED', 'DRAFT'),
  generateAiDraft
);

// POST /api/drafts
router.post(
  '/',
  authenticateJWT,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('draftType').notEmpty().withMessage('Draft type is required'),
    validate,
  ],
  auditLogMiddleware('DRAFT_CREATED', 'DRAFT'),
  createDraft
);

// GET /api/drafts
router.get('/', authenticateJWT, listDrafts);

// GET /api/drafts/:id
router.get('/:id', authenticateJWT, getDraftById);

// PATCH /api/drafts/:id
router.patch('/:id', authenticateJWT, updateDraft);

module.exports = router;
