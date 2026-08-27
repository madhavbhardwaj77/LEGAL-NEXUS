const { enqueueJob, getJobStatus, QUEUES } = require('../services/queueService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * POST /api/ai/tasks
 * Dispatch an asynchronous AI job to the Redis queue
 */
const dispatchAiTask = async (req, res, next) => {
  try {
    const { taskType, caseId, inputData, parameters } = req.body;
    if (!taskType) {
      return sendError(res, 'Task type is required (e.g. CASE_INTAKE_ANALYSIS, DRAFT_GENERATION, LEGAL_RESEARCH)', 400);
    }

    const job = await enqueueJob(QUEUES.AI_TASKS, {
      taskType,
      caseId,
      inputData,
      parameters,
      requestedBy: req.user._id,
      timestamp: new Date().toISOString(),
    });

    return sendSuccess(res, job, 'AI task successfully queued for execution', 202);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ai/tasks/:jobId
 * Check the status of an AI queue job
 */
const getAiTaskStatus = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const status = await getJobStatus(jobId);

    if (!status) {
      return sendError(res, 'Task job not found or expired', 404);
    }

    return sendSuccess(res, status, 'Task status retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ai/status
 */
const getAiWorkerStatus = async (req, res) => {
  return sendSuccess(
    res,
    {
      status: 'READY',
      queue: 'queue:ai_tasks',
      supportedTasks: [
        'CASE_INTAKE_ANALYSIS',
        'DOCUMENT_OCR_AND_EXTRACTION',
        'LEGAL_RESEARCH_RAG',
        'DRAFT_GENERATION',
        'LAWYER_MATCH_SCORING',
      ],
      aiEngineEndpoint: 'http://localhost:8000',
    },
    'AI Engine Gateway operational'
  );
};

module.exports = {
  dispatchAiTask,
  getAiTaskStatus,
  getAiWorkerStatus,
};
