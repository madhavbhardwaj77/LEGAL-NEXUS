const { CaseEvidence, Case, CaseTimeline } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { deleteCache } = require('../services/redisService');

/**
 * POST /api/cases/:id/evidence
 */
const addEvidence = async (req, res, next) => {
  try {
    const caseId = req.params.id;
    const { title, description, evidenceType, fileUrl, fileSize, mimeType, dateOfOccurrence, tags } = req.body;

    const existingCase = await Case.findById(caseId);
    if (!existingCase) {
      return sendError(res, 'Case not found', 404);
    }

    const evidence = await CaseEvidence.create({
      case: caseId,
      title,
      description,
      evidenceType: evidenceType || 'DOCUMENT',
      fileUrl,
      fileSize,
      mimeType,
      dateOfOccurrence,
      tags,
      uploadedBy: req.user._id,
    });

    // Add timeline entry for evidence submission
    await CaseTimeline.create({
      case: caseId,
      eventType: 'DOCUMENT_SUBMITTED',
      title: `Evidence Submitted: ${title}`,
      description: `New evidence item (${evidenceType}) added to case record.`,
      source: req.user.role === 'CITIZEN' ? 'USER' : 'LAWYER',
      createdBy: req.user._id,
    });

    await deleteCache(`cases:detail:${caseId}`);
    return sendSuccess(res, evidence, 'Evidence added successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/cases/:id/evidence
 */
const listEvidence = async (req, res, next) => {
  try {
    const caseId = req.params.id;
    const evidenceList = await CaseEvidence.find({ case: caseId })
      .populate('uploadedBy', 'email role')
      .sort({ createdAt: -1 });

    return sendSuccess(res, evidenceList, 'Evidence list retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/cases/:id/evidence/:evidenceId
 */
const deleteEvidence = async (req, res, next) => {
  try {
    const { id: caseId, evidenceId } = req.params;
    const evidence = await CaseEvidence.findOneAndDelete({ _id: evidenceId, case: caseId });

    if (!evidence) {
      return sendError(res, 'Evidence not found', 404);
    }

    await deleteCache(`cases:detail:${caseId}`);
    return sendSuccess(res, null, 'Evidence deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addEvidence,
  listEvidence,
  deleteEvidence,
};
