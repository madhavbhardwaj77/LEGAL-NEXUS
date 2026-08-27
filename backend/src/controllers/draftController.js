const { Draft, Case } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * POST /api/drafts
 */
const createDraft = async (req, res, next) => {
  try {
    const { caseId, title, draftType, templateId, contentMarkdown, variables, generatedBy } = req.body;

    if (caseId) {
      const caseExists = await Case.findById(caseId);
      if (!caseExists) {
        return sendError(res, 'Associated case not found', 404);
      }
    }

    const draft = await Draft.create({
      case: caseId || undefined,
      title,
      draftType,
      templateId,
      contentMarkdown,
      variables,
      generatedBy: generatedBy || (req.user.role === 'CITIZEN' ? 'USER' : 'LAWYER'),
      createdBy: req.user._id,
      status: 'DRAFT',
    });

    return sendSuccess(res, draft, 'Draft created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/drafts
 */
const listDrafts = async (req, res, next) => {
  try {
    const { caseId, draftType, status } = req.query;
    const filter = {};

    if (caseId) filter.case = caseId;
    if (draftType) filter.draftType = draftType;
    if (status) filter.status = status;

    if (req.user.role === 'CITIZEN') {
      filter.createdBy = req.user._id;
    }

    const drafts = await Draft.find(filter)
      .populate('case', 'title category caseNumber')
      .populate('createdBy', 'email role')
      .sort({ updatedAt: -1 });

    return sendSuccess(res, drafts, 'Drafts retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/drafts/:id
 */
const getDraftById = async (req, res, next) => {
  try {
    const draft = await Draft.findById(req.params.id)
      .populate('case', 'title category caseNumber parties location')
      .populate('createdBy', 'email role')
      .populate('reviewedBy', 'email role');

    if (!draft) {
      return sendError(res, 'Draft not found', 404);
    }

    return sendSuccess(res, draft, 'Draft details retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/drafts/:id
 */
const updateDraft = async (req, res, next) => {
  try {
    const { title, contentMarkdown, status, variables } = req.body;
    const draft = await Draft.findById(req.params.id);

    if (!draft) {
      return sendError(res, 'Draft not found', 404);
    }

    if (title) draft.title = title;
    if (contentMarkdown) {
      draft.contentMarkdown = contentMarkdown;
      draft.version += 1;
    }
    if (status) draft.status = status;
    if (variables) draft.variables = { ...draft.variables, ...variables };

    await draft.save();
    return sendSuccess(res, draft, 'Draft updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDraft,
  listDrafts,
  getDraftById,
  updateDraft,
};
