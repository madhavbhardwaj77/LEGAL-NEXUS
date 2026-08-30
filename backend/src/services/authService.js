const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { User, CitizenProfile, ProfessionalProfile, VerificationRequest } = require('../models');
const { ROLES, PROFESSIONAL_ROLES } = require('../config/roles');

/**
 * Generate Access and Refresh JWT tokens for a user
 */
const generateTokens = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

  return { accessToken, refreshToken };
};

/**
 * Verify an Access Token
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

/**
 * Verify a Refresh Token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};

/**
 * Register a new user with corresponding profile skeleton
 */
const registerUser = async ({ email, password, role = ROLES.CITIZEN, phone, profileData = {} }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('User already exists with this email address.');
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await User.hashPassword(password);
  
  const user = await User.create({
    email,
    passwordHash,
    role,
    phone,
    isVerified: role === ROLES.CITIZEN, // Citizens don't require Bar verification by default
  });

  // Create initial profile based on role
  if (role === ROLES.CITIZEN) {
    await CitizenProfile.create({
      user: user._id,
      fullName: profileData.fullName || email.split('@')[0],
      ageRange: profileData.ageRange,
      gender: profileData.gender,
      location: profileData.location || {},
      preferredLanguage: profileData.preferredLanguage || 'English',
      contactInfo: {
        alternatePhone: phone,
      },
    });
  } else if (PROFESSIONAL_ROLES.includes(role)) {
    await ProfessionalProfile.create({
      user: user._id,
      professionalRole: role,
      fullName: profileData.fullName || email.split('@')[0],
      title: profileData.title || (role === ROLES.LAWYER ? 'Advocate' : role === ROLES.LAW_STUDENT ? 'Law Student' : 'Legal Organization'),
      bio: profileData.bio,
      practiceAreas: profileData.practiceAreas || [],
      location: profileData.location || {},
      languages: profileData.languages || ['English', 'Hindi'],
      experienceYears: profileData.experienceYears || 0,
      barCouncilRegistration: profileData.barCouncilRegistration || {},
      lawStudentDetails: profileData.lawStudentDetails || {},
      feeRange: profileData.feeRange || {},
      verificationStatus: 'PENDING',
    });

    // Auto-create pending verification request if bar details were provided
    if (role === ROLES.LAWYER && profileData.barCouncilRegistration?.registrationNumber) {
      await VerificationRequest.create({
        professional: user._id,
        requestedRole: ROLES.LAWYER,
        submittedData: {
          fullName: profileData.fullName || email.split('@')[0],
          barRegistrationNumber: profileData.barCouncilRegistration.registrationNumber,
          stateBarCouncil: profileData.barCouncilRegistration.stateBarCouncil || '',
          enrollmentYear: profileData.barCouncilRegistration.yearOfEnrollment,
        },
        status: 'PENDING',
      });
    }
  }

  const tokens = generateTokens(user);
  return { user, tokens };
};

/**
 * Authenticate existing user credentials
 */
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Account is deactivated. Please contact support.');
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = generateTokens(user);
  return { user, tokens };
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  registerUser,
  loginUser,
};
