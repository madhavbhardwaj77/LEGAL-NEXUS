const http = require('http');
const { Draft, Case } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

const forwardToAiEngine = (path, method = 'GET', payload = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, AI_ENGINE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 8000,
      path: url.pathname + url.search,
      method: method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 8000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ statusCode: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('AI Engine request timed out'));
    });

    if (payload) {
      req.write(JSON.stringify(payload));
    }
    req.end();
  });
};

/**
 * POST /api/drafts/generate-ai
 * AI-assisted Legal Draft Generation & Fact Checking
 */
const generateAiDraft = async (req, res, next) => {
  try {
    const { caseId, draftType, variables = {} } = req.body;
    let caseData = {};

    if (caseId) {
      const caseDoc = await Case.findById(caseId);
      if (caseDoc) {
        caseData = {
          caseNumber: caseDoc.caseNumber,
          category: caseDoc.category,
          issue: caseDoc.issue || caseDoc.title,
          jurisdiction: caseDoc.location?.city || 'Delhi',
          parties: {
            plaintiff: caseDoc.parties?.plaintiff?.name || req.user.profileData?.fullName || 'Citizen Complainant',
            defendant: caseDoc.parties?.defendant?.name || 'Opposite Party',
            employer: caseDoc.parties?.defendant?.name,
            landlord: caseDoc.parties?.defendant?.name,
          },
          financialDetails: {
            disputedAmount: caseDoc.financialDetails?.disputedAmount || 0,
          },
        };
      }
    }

    // Default parameters if no case attached
    if (!caseData.caseNumber) {
      caseData = {
        caseNumber: `NS-DRAFT-${Date.now().toString().slice(-4)}`,
        category: variables.category || 'Employment & Labour Law',
        issue: variables.issue || 'Pending Dues Claim',
        jurisdiction: variables.jurisdiction || 'Delhi',
        parties: {
          plaintiff: variables.plaintiffName || req.user.profileData?.fullName || 'Citizen Complainant',
          defendant: variables.defendantName || 'Opposite Party',
        },
        financialDetails: {
          disputedAmount: parseFloat(variables.disputedAmount) || 50000,
        },
      };
    }

    try {
      const aiRes = await forwardToAiEngine('/ai/draft/generate', 'POST', {
        draftType: draftType || 'STATUTORY_LEGAL_NOTICE',
        caseData,
        variables,
      });

      const draftResult = aiRes.body;

      // Save to database
      const draftRecord = await Draft.create({
        case: caseId || undefined,
        title: draftResult.title,
        draftType: draftType || 'STATUTORY_LEGAL_NOTICE',
        contentMarkdown: draftResult.contentMarkdown,
        variables: {
          ...variables,
          verification: draftResult.verification,
          disclaimer: draftResult.disclaimer,
        },
        generatedBy: 'AI',
        createdBy: req.user._id,
        status: 'DRAFT',
      });

      return sendSuccess(res, draftRecord, 'AI legal draft generated successfully', 201);
    } catch (aiError) {
      // Fallback draft creation
      const fallbackDraft = await Draft.create({
        case: caseId || undefined,
        title: `Legal Notice - ${caseData.issue}`,
        draftType: draftType || 'STATUTORY_LEGAL_NOTICE',
        contentMarkdown: `# STATUTORY LEGAL NOTICE\n\nTo: ${caseData.parties.defendant}\nFrom: ${caseData.parties.plaintiff}\n\nDemanding resolution of ${caseData.issue} amounting to INR ${caseData.financialDetails.disputedAmount}.\n\n⚠️ AI-generated draft — requires user/professional review before submission.`,
        generatedBy: 'AI',
        createdBy: req.user._id,
        status: 'DRAFT',
      });

      return sendSuccess(res, fallbackDraft, 'Legal draft generated with standby template', 201);
    }
  } catch (error) {
    next(error);
  }
};

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
  generateAiDraft,
  createDraft,
  listDrafts,
  getDraftById,
  updateDraft,
};
