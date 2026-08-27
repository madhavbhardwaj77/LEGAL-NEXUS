const express = require('express');
const { body } = require('express-validator');
const {
  uploadDocumentMetadata,
  analyzeTextDirect,
  getCaseDocuments,
  getDocumentById,
  triggerDocumentProcessing,
} = require('../controllers/documentController');
const { authenticateJWT } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { auditLogMiddleware } = require('../middleware/auditLog');

const router = express.Router();

// POST /api/documents/analyze-text (Direct text analysis)
router.post(
  '/analyze-text',
  authenticateJWT,
  [body('content').notEmpty().withMessage('Content is required'), validate],
  analyzeTextDirect
);

// POST /api/documents (Upload / Register Document)
router.post(
  '/',
  authenticateJWT,
  [body('title').notEmpty().withMessage('Title is required'), validate],
  auditLogMiddleware('DOCUMENT_UPLOADED', 'DOCUMENT'),
  uploadDocumentMetadata
);

// GET /api/documents/case/:caseId
router.get('/case/:caseId', authenticateJWT, getCaseDocuments);

// GET /api/documents/:id
router.get('/:id', authenticateJWT, getDocumentById);

// POST /api/documents/:id/process
router.post(
  '/:id/process',
  authenticateJWT,
  auditLogMiddleware('DOCUMENT_PROCESSING_TRIGGERED', 'DOCUMENT'),
  triggerDocumentProcessing
);

module.exports = router;
