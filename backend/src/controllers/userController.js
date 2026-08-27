const { User, CitizenProfile, ProfessionalProfile } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * GET /api/users/profile
 */
const getCurrentUserProfile = async (req, res, next) => {
  try {
    const user = req.user;
    let profile = null;

    if (user.role === 'CITIZEN') {
      profile = await CitizenProfile.findOne({ user: user._id });
    } else {
      profile = await ProfessionalProfile.findOne({ user: user._id });
    }

    return sendSuccess(res, { user, profile }, 'Profile retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/settings
 */
const updateUserSettings = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const user = await User.findById(req.user._id);

    if (phone !== undefined) user.phone = phone;
    await user.save();

    return sendSuccess(res, { user }, 'Settings updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users (Admin only)
 */
const listUsers = async (req, res, next) => {
  try {
    const { role, isActive, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)),
      User.countDocuments(filter),
    ]);

    return sendSuccess(
      res,
      {
        users,
        pagination: { total, page: parseInt(page, 10), limit: parseInt(limit, 10), totalPages: Math.ceil(total / limit) },
      },
      'Users list retrieved'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCurrentUserProfile,
  updateUserSettings,
  listUsers,
};
