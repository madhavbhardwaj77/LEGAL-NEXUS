const { registerUser, loginUser, verifyRefreshToken, generateTokens } = require('../services/authService');
const { User, CitizenProfile, ProfessionalProfile } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { ROLES } = require('../config/roles');

/**
 * POST /api/auth/signup
 */
const signup = async (req, res, next) => {
  try {
    const { email, password, role = ROLES.CITIZEN, phone, profileData } = req.body;
    const { user, tokens } = await registerUser({ email, password, role, phone, profileData });

    return sendSuccess(
      res,
      {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          phone: user.phone,
          isVerified: user.isVerified,
        },
        tokens,
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, tokens } = await loginUser({ email, password });

    return sendSuccess(
      res,
      {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          phone: user.phone,
          isVerified: user.isVerified,
          lastLoginAt: user.lastLoginAt,
        },
        tokens,
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh
 */
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return sendError(res, 'Refresh token is required', 400);
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return sendError(res, 'Invalid refresh token or user inactive', 401);
    }

    const tokens = generateTokens(user);
    return sendSuccess(res, { tokens }, 'Tokens refreshed successfully');
  } catch (error) {
    return sendError(res, 'Invalid or expired refresh token', 401);
  }
};

/**
 * GET /api/auth/me
 */
const me = async (req, res, next) => {
  try {
    const user = req.user;
    let profile = null;

    if (user.role === ROLES.CITIZEN) {
      profile = await CitizenProfile.findOne({ user: user._id });
    } else {
      profile = await ProfessionalProfile.findOne({ user: user._id });
    }

    return sendSuccess(
      res,
      {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          phone: user.phone,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
        profile,
      },
      'User profile retrieved'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  // In a stateless JWT setup, client deletes token; server returns success
  return sendSuccess(res, null, 'Logged out successfully');
};

module.exports = {
  signup,
  login,
  refresh,
  me,
  logout,
};
