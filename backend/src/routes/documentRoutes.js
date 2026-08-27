const express = require('express');
const { body } = require('express-validator');
const {
  uploadDocumentMetadata,
  getCaseDocuments,
  getDocumentById,
  triggerDocumentProcessing,
} = require('../controllers/documentController');
const { authenticateJWT } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { auditLogMiddleware } = require('../middleware/auditLog');

const router = express.Router();

router.use(authenticateJWT);

// POST /api/documents
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Document title is required'),
    body('fileUrl').notEmpty().withMessage('File URL or storage path is required'),
    validate,
  ],
  auditLogMiddleware('DOCUMENT_UPLOADED', 'DOCUMENT'),
  uploadDocumentMetadata
);

// GET /api/documents/case/:caseId
router.get('/case/:caseId', getCaseDocuments);

// GET /api/documents/:id
router.get('/:id', getDocumentById);

// POST /api/documents/:id/process
router.post(
  '/:id/process',
  auditLogMiddleware('DOCUMENT_PROCESSING_QUEUED', 'DOCUMENT'),
  triggerDocumentProcessing
);

module.exports = router;
