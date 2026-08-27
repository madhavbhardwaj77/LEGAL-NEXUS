const { CaseTimeline, Case } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { deleteCache } = require('../services/redisService');

/**
 * POST /api/cases/:id/events
 * Add a new timeline event
 */
const addTimelineEvent = async (req, res, next) => {
  try {
    const caseId = req.params.id;
    const { eventType, title, dateTime, description, source, attachments } = req.body;

    const existingCase = await Case.findById(caseId);
    if (!existingCase) {
      return sendError(res, 'Case not found', 404);
    }

    const event = await CaseTimeline.create({
      case: caseId,
      eventType: eventType || 'CUSTOM_EVENT',
      title,
      dateTime: dateTime || new Date(),
      description,
      source: source || (req.user.role === 'CITIZEN' ? 'USER' : req.user.role === 'LAWYER' ? 'LAWYER' : 'SYSTEM'),
      createdBy: req.user._id,
      attachments,
    });

    // Invalidate cached case
    await deleteCache(`cases:detail:${caseId}`);

    return sendSuccess(res, event, 'Timeline event added successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/cases/:id/timeline
 * Get all timeline events for a case sorted chronologically
 */
const getCaseTimeline = async (req, res, next) => {
  try {
    const caseId = req.params.id;
    const events = await CaseTimeline.find({ case: caseId })
      .populate('createdBy', 'email role')
      .sort({ dateTime: 1, createdAt: 1 });

    return sendSuccess(res, events, 'Case timeline events retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/cases/:id/events/:eventId
 * Delete a specific timeline event
 */
const deleteTimelineEvent = async (req, res, next) => {
  try {
    const { id: caseId, eventId } = req.params;
    const event = await CaseTimeline.findOneAndDelete({ _id: eventId, case: caseId });

    if (!event) {
      return sendError(res, 'Timeline event not found', 404);
    }

    await deleteCache(`cases:detail:${caseId}`);
    return sendSuccess(res, null, 'Timeline event deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addTimelineEvent,
  getCaseTimeline,
  deleteTimelineEvent,
};
