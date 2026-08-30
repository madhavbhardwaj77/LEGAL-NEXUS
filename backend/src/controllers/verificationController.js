const { VerificationRequest, ProfessionalProfile, User, Notification } = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * POST /api/verification/request
 * Professional submits Bar Council verification
 */
const submitVerificationRequest = async (req, res, next) => {
  try {
    const {
      fullName,
      barRegistrationNumber,
      stateBarCouncil,
      enrollmentYear,
      institutionName,
      degree,
      idCardUrl,
      certificateUrl,
      additionalNotes,
    } = req.body;

    // Check if there is an existing pending request
    const existing = await VerificationRequest.findOne({
      professional: req.user._id,
      status: 'PENDING',
    });

    if (existing) {
      return sendError(res, 'You already have a pending verification request in review.', 400);
    }

    const verification = await VerificationRequest.create({
      professional: req.user._id,
      requestedRole: req.user.role,
      submittedData: {
        fullName,
        barRegistrationNumber,
        stateBarCouncil,
        enrollmentYear,
        institutionName,
        degree,
        idCardUrl,
        certificateUrl,
        additionalNotes,
      },
      status: 'PENDING',
    });

    // Update profile status & bar details
    await ProfessionalProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        verificationStatus: 'PENDING',
        ...(barRegistrationNumber && { 'barCouncilRegistration.registrationNumber': barRegistrationNumber }),
        ...(stateBarCouncil && { 'barCouncilRegistration.stateBarCouncil': stateBarCouncil }),
        ...(enrollmentYear && { 'barCouncilRegistration.yearOfEnrollment': enrollmentYear }),
      }
    );

    return sendSuccess(res, verification, 'Verification request submitted successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/verification/requests (Admin only)
 */
const listVerificationRequests = async (req, res, next) => {
  try {
    const { status = 'PENDING', page = 1, limit = 50 } = req.query;

    // Auto-sync: Ensure every unverified lawyer with PENDING status has a VerificationRequest
    const pendingProfiles = await ProfessionalProfile.find({
      verificationStatus: 'PENDING',
    }).populate('user');

    for (const prof of pendingProfiles) {
      if (prof.user) {
        const existingReq = await VerificationRequest.findOne({ professional: prof.user._id });
        if (!existingReq) {
          await VerificationRequest.create({
            professional: prof.user._id,
            requestedRole: prof.professionalRole || 'LAWYER',
            submittedData: {
              fullName: prof.fullName || prof.user.email?.split('@')[0],
              barRegistrationNumber: prof.barCouncilRegistration?.registrationNumber || 'Pending Submission',
              stateBarCouncil: prof.barCouncilRegistration?.stateBarCouncil || prof.location?.state || 'State Bar Council',
              enrollmentYear: prof.barCouncilRegistration?.yearOfEnrollment || (prof.experienceYears ? new Date().getFullYear() - prof.experienceYears : undefined),
            },
            status: 'PENDING',
          });
        }
      }
    }

    const filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [requests, total] = await Promise.all([
      VerificationRequest.find(filter)
        .populate('professional', 'email role phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      VerificationRequest.countDocuments(filter),
    ]);

    return sendSuccess(res, requests, 'Verification requests retrieved', 200, {
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
 * PATCH /api/verification/requests/:id (Admin only)
 * Approve or Reject verification
 */
const reviewVerificationRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes, rejectionReason } = req.body;

    if (!['IN_REVIEW', 'VERIFIED', 'REJECTED'].includes(status)) {
      return sendError(res, 'Status must be IN_REVIEW, VERIFIED, or REJECTED', 400);
    }

    const request = await VerificationRequest.findById(id);
    if (!request) {
      return sendError(res, 'Verification request not found', 404);
    }

    request.status = status;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    request.reviewNotes = reviewNotes;
    if (rejectionReason) request.rejectionReason = rejectionReason;
    await request.save();

    // Update user & profile
    const isApproved = status === 'VERIFIED';
    if (status === 'VERIFIED' || status === 'REJECTED') {
      await User.findByIdAndUpdate(request.professional, { isVerified: isApproved });
    }
    
    await ProfessionalProfile.findOneAndUpdate(
      { user: request.professional },
      {
        verificationStatus: status,
        verificationReviewedBy: req.user._id,
        verificationReviewedAt: new Date(),
        'barCouncilRegistration.isVerified': isApproved,
      }
    );

    // Notify user
    await Notification.create({
      recipient: request.professional,
      sender: req.user._id,
      type: 'VERIFICATION_STATUS_CHANGED',
      title: `Verification Request ${status.replace('_', ' ')}`,
      message: isApproved
        ? 'Congratulations! Your Bar Council / Professional verification has been approved.'
        : status === 'IN_REVIEW'
        ? 'Your Bar ID verification request is now under active administrative review.'
        : `Your verification request was rejected: ${rejectionReason || 'Please check submitted documents.'}`,
    });

    return sendSuccess(res, request, `Verification request marked as ${status}`);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/verification/my-status
 * Lawyer checks their own verification status
 */
const getMyVerificationStatus = async (req, res, next) => {
  try {
    const [request, profile] = await Promise.all([
      VerificationRequest.findOne({ professional: req.user._id }).sort({ createdAt: -1 }),
      ProfessionalProfile.findOne({ user: req.user._id }),
    ]);

    return sendSuccess(res, {
      verificationStatus: profile?.verificationStatus || 'PENDING',
      barCouncilRegistration: profile?.barCouncilRegistration || {},
      latestRequest: request || null,
    }, 'Verification status fetched');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitVerificationRequest,
  listVerificationRequests,
  reviewVerificationRequest,
  getMyVerificationStatus,
};
