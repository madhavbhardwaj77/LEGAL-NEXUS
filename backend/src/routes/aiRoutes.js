const express = require('express');
const { body } = require('express-validator');
const {
  dispatchAiTask,
  getAiTaskStatus,
  getAiWorkerStatus,
} = require('../controllers/aiController');
const { authenticateJWT } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { auditLogMiddleware } = require('../middleware/auditLog');

const router = express.Router();

router.use(authenticateJWT);

// GET /api/ai/status
router.get('/status', getAiWorkerStatus);

// POST /api/ai/tasks
router.post(
  '/tasks',
  [
    body('taskType').notEmpty().withMessage('taskType is required'),
    validate,
  ],
  auditLogMiddleware('AI_TASK_DISPATCHED', 'AI'),
  dispatchAiTask
);

// GET /api/ai/tasks/:jobId
router.get('/tasks/:jobId', getAiTaskStatus);

module.exports = router;
