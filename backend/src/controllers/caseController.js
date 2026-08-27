const { createCase, getCaseById, updateCase, listCases } = require('../services/caseService');
const { Case, CaseTimeline, User } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { ROLES } = require('../config/roles');

/**
 * POST /api/cases
 * Create a new case
 */
const handleCreateCase = async (req, res, next) => {
  try {
    const {
      title,
      category,
      issue,
      description,
      parties,
      location,
      urgency,
      legalQuestions,
      recommendedActions,
      financialDetails,
      tags,
    } = req.body;

    const caseData = {
      title: title || `${category}: ${issue.slice(0, 50)}`,
      category,
      issue,
      description,
      parties,
      location,
      urgency,
      legalQuestions,
      recommendedActions,
      financialDetails,
      tags,
    };

    const newCase = await createCase(caseData, req.user._id);

    return sendSuccess(res, newCase, 'Case registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/cases
 * List cases with filters
 */
const handleListCases = async (req, res, next) => {
  try {
    const { category, status, urgency, city, state, page = 1, limit = 20, search } = req.query;
    const filter = {};

    // Role-based visibility
    if (req.user.role === ROLES.CITIZEN) {
      // Citizen only sees their own cases
      filter.user = req.user._id;
    } else if (req.user.role === ROLES.LAWYER || req.user.role === ROLES.LAW_STUDENT) {
      // Lawyers see either assigned cases or all open/available cases for intake
      if (req.query.assignedOnly === 'true') {
        filter.$or = [{ assignedLawyer: req.user._id }, { assignedLawStudent: req.user._id }];
      }
    }
    // Admin sees all cases

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (urgency) filter.urgency = urgency;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (state) filter['location.state'] = new RegExp(state, 'i');
    if (search) {
      filter.$text = { $search: search };
    }

    const result = await listCases({
      filter,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    return sendSuccess(res, result.cases, 'Cases retrieved successfully', 200, result.pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/cases/:id
 * Get single case details (cached)
 */
const handleGetCaseById = async (req, res, next) => {
  try {
    const foundCase = await getCaseById(req.params.id);
    if (!foundCase) {
      return sendError(res, 'Case not found', 404);
    }
    return sendSuccess(res, foundCase, 'Case details retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/cases/:id
 * Update case fields or status
 */
const handleUpdateCase = async (req, res, next) => {
  try {
    const updatedCase = await updateCase(req.params.id, req.body, req.user._id);
    return sendSuccess(res, updatedCase, 'Case updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/cases/:id/assign-lawyer
 * Assign a lawyer to the case
 */
const handleAssignLawyer = async (req, res, next) => {
  try {
    const { lawyerId } = req.body;
    const lawyer = await User.findById(lawyerId);
    if (!lawyer || lawyer.role !== ROLES.LAWYER) {
      return sendError(res, 'Target user is not a valid lawyer', 400);
    }

    const updatedCase = await updateCase(
      req.params.id,
      { assignedLawyer: lawyer._id, status: 'LAWYER_ASSIGNED' },
      req.user._id
    );

    // Create timeline event
    await CaseTimeline.create({
      case: updatedCase._id,
      eventType: 'LAWYER_CONSULTED',
      title: 'Lawyer Assigned to Case',
      description: `Advocate assigned to handle case proceedings.`,
      source: 'SYSTEM',
      createdBy: req.user._id,
    });

    return sendSuccess(res, updatedCase, 'Lawyer assigned successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/cases/:id
 * Archive / delete case
 */
const handleDeleteCase = async (req, res, next) => {
  try {
    const updatedCase = await updateCase(
      req.params.id,
      { status: 'ARCHIVED' },
      req.user._id
    );
    return sendSuccess(res, updatedCase, 'Case archived successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleCreateCase,
  handleListCases,
  handleGetCaseById,
  handleUpdateCase,
  handleAssignLawyer,
  handleDeleteCase,
};
