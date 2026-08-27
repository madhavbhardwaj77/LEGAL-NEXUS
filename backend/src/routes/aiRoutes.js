const express = require('express');
const { body } = require('express-validator');
const {
  handleStoryIntake,
  handleCaseAnalyze,
  handleChatIntake,
  handleConvertIntakeToCase,
  handleLegalResearch,
  handleVerifyCitation,
  handleGetDomains,
  dispatchAiTask,
  getAiTaskStatus,
  getAiWorkerStatus,
} = require('../controllers/aiController');
const { authenticateJWT } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { auditLogMiddleware } = require('../middleware/auditLog');

const router = express.Router();

// GET /api/ai/status
router.get('/status', getAiWorkerStatus);

// GET /api/ai/domains
router.get('/domains', handleGetDomains);

// POST /api/ai/intake (Parse story & clarifying questions)
router.post(
  '/intake',
  authenticateJWT,
  [body('story').notEmpty().withMessage('Story is required'), validate],
  auditLogMiddleware('AI_INTAKE_PROCESSED', 'AI_CASE'),
  handleStoryIntake
);

// POST /api/ai/analyze (Full multi-agent case analysis)
router.post(
  '/analyze',
  authenticateJWT,
  [body('story').notEmpty().withMessage('Story is required'), validate],
  auditLogMiddleware('AI_CASE_ANALYZED', 'AI_CASE'),
  handleCaseAnalyze
);

// POST /api/ai/chat (Conversational case intake turn)
router.post(
  '/chat',
  authenticateJWT,
  [body('message').notEmpty().withMessage('Message is required'), validate],
  handleChatIntake
);

// POST /api/ai/intake-to-case (Convert AI intake to formal Case record)
router.post(
  '/intake-to-case',
  authenticateJWT,
  [body('structuredCase').notEmpty().withMessage('Structured case is required'), validate],
  auditLogMiddleware('CASE_CREATED_FROM_AI_INTAKE', 'CASE'),
  handleConvertIntakeToCase
);

// POST /api/ai/research (Legal RAG endpoint)
router.post(
  '/research',
  authenticateJWT,
  [body('query').notEmpty().withMessage('Query is required'), validate],
  auditLogMiddleware('LEGAL_RESEARCH_QUERIED', 'AI_RESEARCH'),
  handleLegalResearch
);

// POST /api/ai/verify-citation
router.post(
  '/verify-citation',
  authenticateJWT,
  [
    body('act').notEmpty().withMessage('Act is required'),
    body('section').notEmpty().withMessage('Section is required'),
    validate,
  ],
  handleVerifyCitation
);

// POST /api/ai/tasks (Background queue dispatch)
router.post(
  '/tasks',
  authenticateJWT,
  [body('taskType').notEmpty().withMessage('taskType is required'), validate],
  auditLogMiddleware('AI_TASK_DISPATCHED', 'AI'),
  dispatchAiTask
);

// GET /api/ai/tasks/:jobId
router.get('/tasks/:jobId', authenticateJWT, getAiTaskStatus);

module.exports = router;
