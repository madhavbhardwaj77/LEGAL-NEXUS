const { CitizenProfile, ProfessionalProfile, User } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { ROLES } = require('../config/roles');

/**
 * GET /api/profiles/citizen
 */
const getCitizenProfile = async (req, res, next) => {
  try {
    const profile = await CitizenProfile.findOne({ user: req.user._id });
    if (!profile) {
      return sendError(res, 'Citizen profile not found', 404);
    }
    return sendSuccess(res, profile, 'Citizen profile retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/profiles/citizen
 */
const updateCitizenProfile = async (req, res, next) => {
  try {
    const { fullName, ageRange, gender, location, preferredLanguage, contactInfo, preferences } = req.body;
    
    let profile = await CitizenProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new CitizenProfile({ user: req.user._id });
    }

    if (fullName) profile.fullName = fullName;
    if (ageRange) profile.ageRange = ageRange;
    if (gender) profile.gender = gender;
    if (location) profile.location = { ...profile.location, ...location };
    if (preferredLanguage) profile.preferredLanguage = preferredLanguage;
    if (contactInfo) profile.contactInfo = { ...profile.contactInfo, ...contactInfo };
    if (preferences) profile.preferences = { ...profile.preferences, ...preferences };

    await profile.save();
    return sendSuccess(res, profile, 'Citizen profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/profiles/professional
 */
const getProfessionalProfile = async (req, res, next) => {
  try {
    const profile = await ProfessionalProfile.findOne({ user: req.user._id });
    if (!profile) {
      return sendError(res, 'Professional profile not found', 404);
    }
    return sendSuccess(res, profile, 'Professional profile retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/profiles/professional
 */
const updateProfessionalProfile = async (req, res, next) => {
  try {
    const {
      fullName,
      title,
      bio,
      practiceAreas,
      location,
      languages,
      experienceYears,
      barCouncilRegistration,
      lawStudentDetails,
      education,
      certifications,
      feeRange,
      availabilityStatus,
    } = req.body;

    let profile = await ProfessionalProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new ProfessionalProfile({
        user: req.user._id,
        professionalRole: req.user.role,
        fullName: fullName || req.user.email.split('@')[0],
      });
    }

    if (fullName) profile.fullName = fullName;
    if (title) profile.title = title;
    if (bio) profile.bio = bio;
    if (practiceAreas) profile.practiceAreas = practiceAreas;
    if (location) profile.location = { ...profile.location, ...location };
    if (languages) profile.languages = languages;
    if (experienceYears !== undefined) profile.experienceYears = experienceYears;
    if (barCouncilRegistration) {
      profile.barCouncilRegistration = {
        ...profile.barCouncilRegistration,
        ...barCouncilRegistration,
        isVerified: profile.barCouncilRegistration ? profile.barCouncilRegistration.isVerified : false,
      };
    }
    if (lawStudentDetails) profile.lawStudentDetails = { ...profile.lawStudentDetails, ...lawStudentDetails };
    if (education) profile.education = education;
    if (certifications) profile.certifications = certifications;
    if (feeRange) profile.feeRange = { ...profile.feeRange, ...feeRange };
    if (availabilityStatus) profile.availabilityStatus = availabilityStatus;

    await profile.save();
    return sendSuccess(res, profile, 'Professional profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/profiles/user/:userId
 */
const getProfileByUserId = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) {
      return sendError(res, 'User not found', 404);
    }

    let profile = null;
    if (targetUser.role === ROLES.CITIZEN) {
      profile = await CitizenProfile.findOne({ user: targetUser._id });
    } else {
      profile = await ProfessionalProfile.findOne({ user: targetUser._id });
    }

    return sendSuccess(
      res,
      {
        user: {
          id: targetUser._id,
          email: targetUser.email,
          role: targetUser.role,
          isVerified: targetUser.isVerified,
        },
        profile,
      },
      'User profile retrieved'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCitizenProfile,
  updateCitizenProfile,
  getProfessionalProfile,
  updateProfessionalProfile,
  getProfileByUserId,
};
