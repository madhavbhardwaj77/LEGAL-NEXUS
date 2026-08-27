const { ProfessionalProfile, User, CaseStudy } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { ROLES } = require('../config/roles');

/**
 * GET /api/lawyers
 * Search verified lawyers and law students directory
 */
const searchLawyersDirectory = async (req, res, next) => {
  try {
    const {
      role, // LAWYER or LAW_STUDENT
      practiceArea,
      city,
      state,
      verifiedOnly,
      minExperience,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (role) {
      filter.professionalRole = role;
    } else {
      filter.professionalRole = { $in: [ROLES.LAWYER, ROLES.LAW_STUDENT] };
    }

    if (verifiedOnly === 'true') {
      filter.verificationStatus = 'VERIFIED';
    }

    if (practiceArea) {
      filter.practiceAreas = { $in: [new RegExp(practiceArea, 'i')] };
    }

    if (city) {
      filter['location.city'] = new RegExp(city, 'i');
    }

    if (state) {
      filter['location.state'] = new RegExp(state, 'i');
    }

    if (minExperience) {
      filter.experienceYears = { $gte: parseInt(minExperience, 10) };
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const [lawyers, total] = await Promise.all([
      ProfessionalProfile.find(filter)
        .populate('user', 'email role isVerified createdAt')
        .sort({ 'rating.average': -1, experienceYears: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      ProfessionalProfile.countDocuments(filter),
    ]);

    return sendSuccess(res, lawyers, 'Lawyer directory retrieved', 200, {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/lawyers/:id
 * Get full lawyer profile with case studies
 */
const getLawyerDetails = async (req, res, next) => {
  try {
    const profile = await ProfessionalProfile.findById(req.params.id)
      .populate('user', 'email role isVerified createdAt');

    if (!profile) {
      return sendError(res, 'Lawyer profile not found', 404);
    }

    const caseStudies = await CaseStudy.find({ professional: profile.user._id }).sort({ createdAt: -1 });

    return sendSuccess(res, { profile, caseStudies }, 'Lawyer details retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchLawyersDirectory,
  getLawyerDetails,
};
