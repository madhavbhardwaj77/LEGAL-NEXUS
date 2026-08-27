const express = require('express');
const {
  getCitizenProfile,
  updateCitizenProfile,
  getProfessionalProfile,
  updateProfessionalProfile,
  getProfileByUserId,
} = require('../controllers/profileController');
const { authenticateJWT } = require('../middleware/auth');
const { auditLogMiddleware } = require('../middleware/auditLog');

const router = express.Router();

// Citizen Profile
router.get('/citizen', authenticateJWT, getCitizenProfile);
router.put(
  '/citizen',
  authenticateJWT,
  auditLogMiddleware('CITIZEN_PROFILE_UPDATED', 'PROFILE'),
  updateCitizenProfile
);

// Professional Profile
router.get('/professional', authenticateJWT, getProfessionalProfile);
router.put(
  '/professional',
  authenticateJWT,
  auditLogMiddleware('PROFESSIONAL_PROFILE_UPDATED', 'PROFILE'),
  updateProfessionalProfile
);

// Public / Authenticated user profile lookup
router.get('/user/:userId', authenticateJWT, getProfileByUserId);

module.exports = router;
