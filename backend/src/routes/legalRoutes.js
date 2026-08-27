const express = require('express');
const { body } = require('express-validator');
const {
  createLegalSource,
  listLegalSources,
  getLegalSourceById,
  addLegalChunk,
  searchLegalCorpus,
} = require('../controllers/legalController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { auditLogMiddleware } = require('../middleware/auditLog');
const { ROLES } = require('../config/roles');

const router = express.Router();

// Search legal corpus (open to all authenticated users)
router.get('/search', authenticateJWT, searchLegalCorpus);
router.get('/sources', authenticateJWT, listLegalSources);
router.get('/sources/:id', authenticateJWT, getLegalSourceById);

// Admin & Lawyer indexers
router.post(
  '/sources',
  authenticateJWT,
  authorizeRoles(ROLES.ADMIN, ROLES.LAWYER),
  [
    body('title').notEmpty().withMessage('Source title is required'),
    validate,
  ],
  auditLogMiddleware('LEGAL_SOURCE_CREATED', 'LEGAL'),
  createLegalSource
);

router.post(
  '/sources/:id/chunks',
  authenticateJWT,
  authorizeRoles(ROLES.ADMIN, ROLES.LAWYER),
  [
    body('content').notEmpty().withMessage('Chunk content is required'),
    validate,
  ],
  auditLogMiddleware('LEGAL_CHUNK_ADDED', 'LEGAL'),
  addLegalChunk
);

module.exports = router;
