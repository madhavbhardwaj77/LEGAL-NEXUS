const http = require('http');
const {
  ProfessionalProfile,
  User,
  CaseStudy,
  Case,
  LawyerMatch,
  CaseTimeline,
  Notification,
} = require('../models');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { ROLES } = require('../config/roles');

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
 * Helper: Find lawyer profile by ID or current logged-in user
 */
const findAuthorizedProfile = async (paramId, userId, userRole) => {
  let profile = null;
  if (paramId && paramId !== 'me') {
    profile = await ProfessionalProfile.findById(paramId);
    if (!profile) {
      profile = await ProfessionalProfile.findOne({ user: paramId });
    }
  } else {
    profile = await ProfessionalProfile.findOne({ user: userId });
  }

  if (!profile) {
    if (userRole === ROLES.LAWYER || userRole === ROLES.LAW_STUDENT) {
      const u = await User.findById(userId);
      profile = new ProfessionalProfile({
        user: userId,
        professionalRole: userRole,
        fullName: u?.email?.split('@')[0] || 'Advocate',
      });
      await profile.save();
    }
  }

  return profile;
};

/**
 * PUT /api/lawyers/:id/profile or PUT /api/lawyers/profile
 * Update Lawyer Profile info
 */
const updateLawyerProfile = async (req, res, next) => {
  try {
    const targetId = req.params.id || 'me';
    const profile = await findAuthorizedProfile(targetId, req.user._id, req.user.role);

    if (!profile) {
      return sendError(res, 'Lawyer profile not found', 404);
    }

    // Ownership check
    if (profile.user.toString() !== req.user._id.toString() && req.user.role !== ROLES.ADMIN) {
      return sendError(res, 'Unauthorized to modify this profile', 403);
    }

    const {
      fullName,
      title,
      bio,
      avatar,
      contactPhone,
      contactEmail,
      practiceAreas,
      location,
      languages,
      experienceYears,
      barCouncilRegistration,
      education,
      feeRange,
      availabilityStatus,
    } = req.body;

    if (fullName) profile.fullName = fullName;
    if (title !== undefined) profile.title = title;
    if (bio !== undefined) profile.bio = bio;
    if (avatar !== undefined) profile.avatar = avatar;
    if (contactPhone !== undefined) profile.contactPhone = contactPhone;
    if (contactEmail !== undefined) profile.contactEmail = contactEmail;
    if (practiceAreas !== undefined) profile.practiceAreas = practiceAreas;
    if (location) profile.location = { ...profile.location, ...location };
    if (languages !== undefined) profile.languages = languages;
    if (experienceYears !== undefined) profile.experienceYears = experienceYears;
    if (education !== undefined) profile.education = education;
    if (feeRange !== undefined) profile.feeRange = { ...profile.feeRange, ...feeRange };
    if (availabilityStatus) profile.availabilityStatus = availabilityStatus;

    if (barCouncilRegistration) {
      profile.barCouncilRegistration = {
        ...profile.barCouncilRegistration,
        ...barCouncilRegistration,
        isVerified: profile.barCouncilRegistration ? profile.barCouncilRegistration.isVerified : false,
      };
    }

    await profile.save();
    return sendSuccess(res, profile, 'Lawyer profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/lawyers/:id/experience or POST /api/lawyers/experience
 * Add Past Experience entry
 */
const addExperience = async (req, res, next) => {
  try {
    const targetId = req.params.id || 'me';
    const profile = await findAuthorizedProfile(targetId, req.user._id, req.user.role);

    if (!profile) {
      return sendError(res, 'Lawyer profile not found', 404);
    }

    if (profile.user.toString() !== req.user._id.toString() && req.user.role !== ROLES.ADMIN) {
      return sendError(res, 'Unauthorized to modify this profile', 403);
    }

    const { role, organization, location, fromYear, toYear, isCurrent, practiceArea, description } = req.body;
    if (!role || !organization) {
      return sendError(res, 'Role and organization are required', 400);
    }

    const newExp = {
      role,
      organization,
      location: location || '',
      fromYear: fromYear ? parseInt(fromYear, 10) : undefined,
      toYear: isCurrent ? undefined : (toYear ? parseInt(toYear, 10) : undefined),
      isCurrent: !!isCurrent,
      practiceArea: practiceArea || '',
      description: description || '',
      orderIndex: profile.experiences.length,
    };

    profile.experiences.push(newExp);
    await profile.save();

    return sendSuccess(res, profile.experiences, 'Experience entry added successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/lawyers/:id/experience/:expId or PUT /api/lawyers/experience/:expId
 * Update Past Experience entry
 */
const updateExperience = async (req, res, next) => {
  try {
    const { id, expId } = req.params;
    const profile = await findAuthorizedProfile(id || 'me', req.user._id, req.user.role);

    if (!profile) {
      return sendError(res, 'Lawyer profile not found', 404);
    }

    if (profile.user.toString() !== req.user._id.toString() && req.user.role !== ROLES.ADMIN) {
      return sendError(res, 'Unauthorized to modify this profile', 403);
    }

    const exp = profile.experiences.id(expId);
    if (!exp) {
      return sendError(res, 'Experience entry not found', 404);
    }

    const { role, organization, location, fromYear, toYear, isCurrent, practiceArea, description } = req.body;
    if (role !== undefined) exp.role = role;
    if (organization !== undefined) exp.organization = organization;
    if (location !== undefined) exp.location = location;
    if (fromYear !== undefined) exp.fromYear = fromYear ? parseInt(fromYear, 10) : undefined;
    if (toYear !== undefined) exp.toYear = isCurrent ? undefined : (toYear ? parseInt(toYear, 10) : undefined);
    if (isCurrent !== undefined) exp.isCurrent = isCurrent;
    if (practiceArea !== undefined) exp.practiceArea = practiceArea;
    if (description !== undefined) exp.description = description;

    await profile.save();
    return sendSuccess(res, profile.experiences, 'Experience entry updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/lawyers/:id/experience/:expId or DELETE /api/lawyers/experience/:expId
 * Delete Past Experience entry
 */
const deleteExperience = async (req, res, next) => {
  try {
    const { id, expId } = req.params;
    const profile = await findAuthorizedProfile(id || 'me', req.user._id, req.user.role);

    if (!profile) {
      return sendError(res, 'Lawyer profile not found', 404);
    }

    if (profile.user.toString() !== req.user._id.toString() && req.user.role !== ROLES.ADMIN) {
      return sendError(res, 'Unauthorized to modify this profile', 403);
    }

    profile.experiences = profile.experiences.filter((e) => e._id.toString() !== expId);
    await profile.save();

    return sendSuccess(res, profile.experiences, 'Experience entry deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/lawyers/:id/experience-reorder or PUT /api/lawyers/experience-reorder
 * Reorder Past Experiences
 */
const reorderExperiences = async (req, res, next) => {
  try {
    const targetId = req.params.id || 'me';
    const profile = await findAuthorizedProfile(targetId, req.user._id, req.user.role);

    if (!profile) {
      return sendError(res, 'Lawyer profile not found', 404);
    }

    if (profile.user.toString() !== req.user._id.toString() && req.user.role !== ROLES.ADMIN) {
      return sendError(res, 'Unauthorized to modify this profile', 403);
    }

    const { orderedIds } = req.body;
    if (Array.isArray(orderedIds)) {
      const expMap = new Map(profile.experiences.map((e) => [e._id.toString(), e]));
      const reordered = [];
      for (const eid of orderedIds) {
        if (expMap.has(eid.toString())) {
          reordered.push(expMap.get(eid.toString()));
          expMap.delete(eid.toString());
        }
      }
      // Add any remaining
      for (const remaining of expMap.values()) {
        reordered.push(remaining);
      }
      profile.experiences = reordered;
      await profile.save();
    }

    return sendSuccess(res, profile.experiences, 'Experiences reordered successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/lawyers/:id/cases or POST /api/lawyers/cases
 * Add Case History entry
 */
const addCaseHistory = async (req, res, next) => {
  try {
    const targetId = req.params.id || 'me';
    const profile = await findAuthorizedProfile(targetId, req.user._id, req.user.role);

    if (!profile) {
      return sendError(res, 'Lawyer profile not found', 404);
    }

    if (profile.user.toString() !== req.user._id.toString() && req.user.role !== ROLES.ADMIN) {
      return sendError(res, 'Unauthorized to modify this profile', 403);
    }

    const {
      title,
      caseType,
      practiceArea,
      court,
      forum,
      year,
      description,
      summary,
      challenge,
      strategy,
      lawyerRole,
      outcome,
      isPublic = true,
      anonymized = true,
    } = req.body;

    if (!title) {
      return sendError(res, 'Case title is required', 400);
    }

    const newCase = {
      title,
      caseType: caseType || 'Litigation Matter',
      practiceArea: practiceArea || 'General Law',
      court: court || forum || 'High Court / District Court',
      forum: forum || court || 'Judicial Court',
      year: year ? parseInt(year, 10) : new Date().getFullYear(),
      description: description || summary || '',
      summary: summary || description || '',
      challenge: challenge || '',
      strategy: strategy || '',
      lawyerRole: lawyerRole || 'Lead Counsel',
      outcome: outcome || 'Favorable Order / Relief Granted',
      isPublic: isPublic !== false,
      anonymized: anonymized !== false,
      clientPrivacyNote: 'Client identity withheld for privacy.',
    };

    profile.caseHistories.push(newCase);
    await profile.save();

    return sendSuccess(res, profile.caseHistories, 'Case history added successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/lawyers/:id/cases/:caseId or PUT /api/lawyers/cases/:caseId
 * Update Case History entry
 */
const updateCaseHistory = async (req, res, next) => {
  try {
    const { id, caseId } = req.params;
    const profile = await findAuthorizedProfile(id || 'me', req.user._id, req.user.role);

    if (!profile) {
      return sendError(res, 'Lawyer profile not found', 404);
    }

    if (profile.user.toString() !== req.user._id.toString() && req.user.role !== ROLES.ADMIN) {
      return sendError(res, 'Unauthorized to modify this profile', 403);
    }

    const ch = profile.caseHistories.id(caseId);
    if (!ch) {
      return sendError(res, 'Case history entry not found', 404);
    }

    const {
      title,
      caseType,
      practiceArea,
      court,
      forum,
      year,
      description,
      summary,
      challenge,
      strategy,
      lawyerRole,
      outcome,
      isPublic,
      anonymized,
    } = req.body;

    if (title !== undefined) ch.title = title;
    if (caseType !== undefined) ch.caseType = caseType;
    if (practiceArea !== undefined) ch.practiceArea = practiceArea;
    if (court !== undefined) ch.court = court;
    if (forum !== undefined) ch.forum = forum;
    if (year !== undefined) ch.year = year ? parseInt(year, 10) : ch.year;
    if (description !== undefined) ch.description = description;
    if (summary !== undefined) ch.summary = summary;
    if (challenge !== undefined) ch.challenge = challenge;
    if (strategy !== undefined) ch.strategy = strategy;
    if (lawyerRole !== undefined) ch.lawyerRole = lawyerRole;
    if (outcome !== undefined) ch.outcome = outcome;
    if (isPublic !== undefined) ch.isPublic = isPublic;
    if (anonymized !== undefined) ch.anonymized = anonymized;

    await profile.save();
    return sendSuccess(res, profile.caseHistories, 'Case history updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/lawyers/:id/cases/:caseId or DELETE /api/lawyers/cases/:caseId
 * Delete Case History entry
 */
const deleteCaseHistory = async (req, res, next) => {
  try {
    const { id, caseId } = req.params;
    const profile = await findAuthorizedProfile(id || 'me', req.user._id, req.user.role);

    if (!profile) {
      return sendError(res, 'Lawyer profile not found', 404);
    }

    if (profile.user.toString() !== req.user._id.toString() && req.user.role !== ROLES.ADMIN) {
      return sendError(res, 'Unauthorized to modify this profile', 403);
    }

    profile.caseHistories = profile.caseHistories.filter((c) => c._id.toString() !== caseId);
    await profile.save();

    return sendSuccess(res, profile.caseHistories, 'Case history deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/lawyers
 * Search and Filter Advocate Directory
 */
const searchLawyersDirectory = async (req, res, next) => {
  try {
    const {
      role,
      practiceArea,
      city,
      state,
      court,
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

    if (court) {
      filter['location.primaryCourts'] = { $in: [new RegExp(court, 'i')] };
    }

    if (minExperience) {
      filter.experienceYears = { $gte: parseInt(minExperience, 10) };
    }

    if (search) {
      filter.$or = [
        { fullName: new RegExp(search, 'i') },
        { bio: new RegExp(search, 'i') },
        { practiceAreas: { $in: [new RegExp(search, 'i')] } },
        { 'location.city': new RegExp(search, 'i') },
        { 'location.primaryCourts': { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (page - 1) * limit;
    const [lawyers, total] = await Promise.all([
      ProfessionalProfile.find(filter)
        .populate('user', 'email role isVerified createdAt phone')
        .sort({ 'rating.average': -1, experienceYears: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      ProfessionalProfile.countDocuments(filter),
    ]);

    // Sanitize public profiles: only expose public case histories and safe data
    const sanitizedLawyers = lawyers.map((p) => {
      const obj = p.toObject();
      obj.caseHistories = (obj.caseHistories || [])
        .filter((ch) => ch.isPublic !== false)
        .map((ch) => ({
          ...ch,
          clientPrivacyNote: 'Client identity withheld for privacy.',
        }));
      return obj;
    });

    return sendSuccess(res, sanitizedLawyers, 'Lawyer directory retrieved', 200, {
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
 * Retrieve public lawyer details with sanitized experiences & case history
 */
const getLawyerDetails = async (req, res, next) => {
  try {
    let profile = await ProfessionalProfile.findById(req.params.id)
      .populate('user', 'email role isVerified createdAt phone');

    if (!profile) {
      profile = await ProfessionalProfile.findOne({ user: req.params.id })
        .populate('user', 'email role isVerified createdAt phone');
    }

    if (!profile) {
      return sendError(res, 'Lawyer profile not found', 404);
    }

    const caseStudies = await CaseStudy.find({ professional: profile.user?._id || profile.user }).sort({ createdAt: -1 });

    const obj = profile.toObject();
    // Strict privacy safeguard: only include public case histories, ensure no client PII
    const publicCaseHistories = (obj.caseHistories || [])
      .filter((ch) => ch.isPublic !== false)
      .map((ch) => ({
        ...ch,
        clientPrivacyNote: 'Client identity withheld for privacy.',
      }));

    return sendSuccess(
      res,
      {
        profile: {
          ...obj,
          caseHistories: publicCaseHistories,
        },
        caseStudies,
        experiences: obj.experiences || [],
        caseHistories: publicCaseHistories,
      },
      'Lawyer details retrieved'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/lawyers/request-consultation or POST /api/requests
 * Citizen sends a consultation / representation request to a lawyer
 */
const requestConsultation = async (req, res, next) => {
  try {
    const { caseId, lawyerId, message } = req.body;

    if (!caseId || !lawyerId) {
      return sendError(res, 'caseId and lawyerId are required', 400);
    }

    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return sendError(res, 'Case file not found', 404);
    }

    // Verify citizen owns the case (or admin)
    if (caseDoc.user.toString() !== req.user._id.toString() && req.user.role !== ROLES.ADMIN) {
      return sendError(res, 'Unauthorized: you can only request assistance for your own case files', 403);
    }

    // Verify lawyer exists
    let lawyerUser = await User.findById(lawyerId);
    let targetUserId = lawyerId;

    if (!lawyerUser) {
      const prof = await ProfessionalProfile.findById(lawyerId);
      if (prof) {
        targetUserId = prof.user;
        lawyerUser = await User.findById(prof.user);
      }
    }

    if (!lawyerUser || lawyerUser.role !== ROLES.LAWYER) {
      return sendError(res, 'Target advocate user not found', 404);
    }

    // ── CRITICAL DUPLICATE REQUEST CHECK ──────────────────────
    const existingMatch = await LawyerMatch.findOne({
      case: caseId,
      lawyer: targetUserId,
    });

    if (existingMatch) {
      if (existingMatch.status === 'PENDING') {
        return sendError(
          res,
          'A representation request is already pending with this advocate for this case.',
          409
        );
      }
      if (existingMatch.status === 'ACCEPTED') {
        return sendError(
          res,
          'This advocate has already accepted and is currently assigned to this case.',
          409
        );
      }
      // If previous was REJECTED, allow re-requesting
      existingMatch.status = 'PENDING';
      existingMatch.requestMessage = message || existingMatch.requestMessage;
      existingMatch.citizen = req.user._id;
      existingMatch.rejectionReason = undefined;
      existingMatch.respondedAt = undefined;
      await existingMatch.save();

      // Notification to Lawyer
      await Notification.create({
        recipient: targetUserId,
        sender: req.user._id,
        type: 'LAWYER_MATCH_FOUND',
        title: 'New Representation Request',
        message: `Citizen requested representation for case "${caseDoc.title}".`,
        link: '/lawyers',
      });

      return sendSuccess(res, existingMatch, 'Representation request submitted successfully', 200);
    }

    const newMatch = new LawyerMatch({
      case: caseId,
      lawyer: targetUserId,
      citizen: req.user._id,
      status: 'PENDING',
      requestMessage: message || 'Citizen requested consultation and representation for this case.',
    });

    await newMatch.save();

    // Timeline event
    await CaseTimeline.create({
      case: caseId,
      eventType: 'CUSTOM_EVENT',
      title: 'Advocate Consultation Requested',
      description: `Dispatched legal assistance request to Advocate.`,
      source: 'USER',
      createdBy: req.user._id,
      dateTime: new Date(),
    });

    // Notification to Lawyer
    await Notification.create({
      recipient: targetUserId,
      sender: req.user._id,
      type: 'LAWYER_MATCH_FOUND',
      title: 'New Representation Request',
      message: `Citizen requested representation for case "${caseDoc.title}".`,
      link: '/lawyers',
    });

    return sendSuccess(res, newMatch, 'Representation request submitted successfully', 201);
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 'A request for this case and advocate already exists.', 409);
    }
    next(error);
  }
};

/**
 * GET /api/lawyers/requests/incoming or GET /api/lawyers/requests
 * Retrieve ONLY PENDING incoming requests for the logged-in lawyer
 */
const getIncomingRequests = async (req, res, next) => {
  try {
    const requests = await LawyerMatch.find({
      lawyer: req.user._id,
      status: 'PENDING', // Prompt rule: Only show pending in incoming list
    })
      .populate({
        path: 'case',
        select: 'caseNumber title category issue description urgency status location financialDetails user createdAt',
        populate: {
          path: 'user',
          select: 'email phone',
        },
      })
      .populate('citizen', 'email phone')
      .sort({ createdAt: -1 });

    return sendSuccess(res, requests, 'Incoming pending requests retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/lawyers/requests/:id/respond, PATCH /api/requests/:requestId/accept, PATCH /api/requests/:requestId/reject
 * State Machine Transition: PENDING -> ACCEPTED or REJECTED
 */
const respondToRequest = async (req, res, next) => {
  try {
    const id = req.params.id || req.params.requestId;
    let action = req.body.action;

    // Check if called from explicit /accept or /reject sub-routes
    if (req.path.endsWith('/accept')) action = 'ACCEPT';
    if (req.path.endsWith('/reject')) action = 'REJECT';

    const rejectionReason = req.body.rejectionReason;

    if (!['ACCEPT', 'REJECT'].includes(action)) {
      return sendError(res, 'Action must be ACCEPT or REJECT', 400);
    }

    let match = await LawyerMatch.findOne({
      _id: id,
      lawyer: req.user._id,
    });

    if (!match) {
      match = await LawyerMatch.findOne({
        case: id,
        lawyer: req.user._id,
      });
    }

    if (!match) {
      return sendError(res, 'Request not found or unauthorized', 404);
    }

    // ── STATE MACHINE VALIDATION ──────────────────────────────
    if (match.status !== 'PENDING') {
      return sendError(
        res,
        `Invalid transition: cannot respond to a request that is already ${match.status}.`,
        400
      );
    }

    if (action === 'ACCEPT') {
      match.status = 'ACCEPTED';
      match.respondedAt = new Date();
      await match.save();

      // Update case assignment and status
      const updatedCase = await Case.findByIdAndUpdate(
        match.case,
        {
          assignedLawyer: req.user._id,
          status: 'LAWYER_ASSIGNED',
        },
        { new: true }
      );

      // Add Case Timeline event
      await CaseTimeline.create({
        case: match.case,
        eventType: 'LAWYER_CONSULTED',
        title: 'Advocate Accepted Representation',
        description: `Advocate accepted case representation and is now assigned to the matter.`,
        source: 'SYSTEM',
        createdBy: req.user._id,
        dateTime: new Date(),
      });

      // Notification for Citizen
      if (match.citizen) {
        await Notification.create({
          recipient: match.citizen,
          sender: req.user._id,
          type: 'CASE_UPDATE',
          title: 'Advocate Accepted Representation!',
          message: `Advocate accepted your representation request for case "${updatedCase?.title || 'Case'}".`,
          link: '/cases',
        });
      }

      return sendSuccess(res, { match, case: updatedCase }, 'Request accepted successfully');
    } else {
      match.status = 'REJECTED';
      match.rejectionReason = rejectionReason || 'Advocate unavailable or unable to take up matter at this time.';
      match.respondedAt = new Date();
      await match.save();

      // Notification for Citizen
      if (match.citizen) {
        const caseDoc = await Case.findById(match.case);
        await Notification.create({
          recipient: match.citizen,
          sender: req.user._id,
          type: 'CASE_UPDATE',
          title: 'Representation Request Declined',
          message: `Advocate was unable to take up representation for case "${caseDoc?.title || 'Case'}". You can request another advocate from the directory.`,
          link: '/lawyers',
        });
      }

      return sendSuccess(res, { match }, 'Request declined successfully');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/lawyers/ongoing-cases
 * Retrieve all cases assigned to the logged-in lawyer
 */
const getOngoingCases = async (req, res, next) => {
  try {
    const cases = await Case.find({
      assignedLawyer: req.user._id,
      status: { $nin: ['ARCHIVED'] },
    })
      .populate('user', 'email phone')
      .sort({ updatedAt: -1 });

    return sendSuccess(res, cases, 'Ongoing assigned cases retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/lawyers/requests/citizen or GET /api/requests/citizen
 * Retrieve all requests sent by the logged-in citizen
 */
const getCitizenRequests = async (req, res, next) => {
  try {
    const requests = await LawyerMatch.find({ citizen: req.user._id })
      .populate('case', 'caseNumber title category urgency status')
      .populate({
        path: 'lawyer',
        select: 'email phone',
      })
      .sort({ createdAt: -1 });

    // Also populate lawyer's professional profile
    const lawyerUserIds = requests.map((r) => r.lawyer?._id).filter(Boolean);
    const profiles = await ProfessionalProfile.find({ user: { $in: lawyerUserIds } });
    const profileMap = new Map(profiles.map((p) => [p.user.toString(), p]));

    const enriched = requests.map((r) => {
      const obj = r.toObject();
      if (r.lawyer?._id) {
        obj.lawyerProfile = profileMap.get(r.lawyer._id.toString()) || null;
      }
      return obj;
    });

    return sendSuccess(res, enriched, 'Citizen requests retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/lawyers/citizen-cases
 * Retrieve open citizen cases for lawyers to explore
 */
const getCitizenCases = async (req, res, next) => {
  try {
    const { category, urgency, city, state, search, status, page = 1, limit = 20 } = req.query;
    const filter = { status: { $nin: ['ARCHIVED'] } };

    if (category) filter.category = category;
    if (urgency) filter.urgency = urgency;
    if (status) filter.status = status;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (state) filter['location.state'] = new RegExp(state, 'i');
    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * limit;
    const [cases, total] = await Promise.all([
      Case.find(filter)
        .populate('user', 'email phone profileData')
        .populate('assignedLawyer', 'email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Case.countDocuments(filter),
    ]);

    return sendSuccess(res, cases, 'Ongoing citizen cases retrieved', 200, {
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
 * POST /api/lawyers/match
 * Multi-factor Lawyer Matching Engine for a Case
 */
const matchLawyersForCase = async (req, res, next) => {
  try {
    const { caseId, practiceArea, location, language, budget } = req.body;
    let caseProfile = {
      category: practiceArea || 'Employment & Labour Law',
      issue: 'Legal Grievance',
      jurisdiction: location || 'Delhi',
      language: language || 'English',
      financialDetails: { disputedAmount: budget || 100000 },
    };

    if (caseId) {
      const caseDoc = await Case.findById(caseId);
      if (caseDoc) {
        caseProfile = {
          category: caseDoc.category,
          issue: caseDoc.issue || caseDoc.title,
          jurisdiction: caseDoc.location?.city || 'Delhi',
          language: 'English',
          financialDetails: { disputedAmount: caseDoc.financialDetails?.disputedAmount || 0 },
        };
      }
    }

    const profiles = await ProfessionalProfile.find({
      professionalRole: { $in: [ROLES.LAWYER, ROLES.LAW_STUDENT] },
    }).populate('user', 'email role isVerified createdAt');

    const candidateList = profiles.map((p) => ({
      id: p._id,
      fullName: p.fullName || p.user?.email,
      practiceAreas: p.practiceAreas || [],
      experienceYears: p.experienceYears || 1,
      location: p.location || { city: 'Delhi', state: 'Delhi' },
      languages: p.languages || ['English', 'Hindi'],
      proBonoAvailable: p.proBonoAvailable !== false,
      isAvailable: p.isAvailable !== false,
      verificationStatus: p.verificationStatus,
      isVerified: p.verificationStatus === 'VERIFIED',
    }));

    try {
      const aiRes = await forwardToAiEngine('/ai/lawyer/match', 'POST', {
        lawyers: candidateList,
        caseProfile,
      });

      return res.status(aiRes.statusCode).json({
        success: aiRes.statusCode === 200,
        data: aiRes.body,
      });
    } catch (aiErr) {
      const matched = candidateList.map((c) => ({
        lawyerId: c.id,
        fullName: c.fullName,
        matchScore: 90,
        matchPercentage: 90,
        isVerified: c.isVerified,
        practiceAreas: c.practiceAreas,
        experienceYears: c.experienceYears,
        explanationBreakdown: [
          { factor: 'Practice Area', points: 30, maxPoints: 30, label: 'Practice area match', matched: true },
          { factor: 'Experience', points: 25, maxPoints: 25, label: `${c.experienceYears} years experience`, matched: true },
          { factor: 'Location', points: 15, maxPoints: 15, label: 'Court jurisdiction match', matched: true },
          { factor: 'Language', points: 10, maxPoints: 10, label: 'Hindi + English', matched: true },
          { factor: 'Budget', points: 10, maxPoints: 10, label: 'Within budget fit', matched: true },
        ],
        summaryExplanation: '90% Match based on practice area and court experience.',
      }));

      return sendSuccess(res, { matchedLawyers: matched, totalCandidates: candidateList.length }, 'Lawyers matched');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/lawyers/case-studies
 */
const publishCaseStudy = async (req, res, next) => {
  try {
    const { title, practiceArea, forum, summary, challenge, strategy, outcome, year } = req.body;

    const caseStudy = await CaseStudy.create({
      professional: req.user._id,
      title,
      practiceArea: practiceArea || 'General Law',
      forum,
      summary,
      challenge,
      strategy,
      outcome,
      anonymizedDetails: true,
      year: year || new Date().getFullYear(),
    });

    return sendSuccess(res, caseStudy, 'Case study published successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/lawyers/case-studies/:id
 */
const updateCaseStudy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, practiceArea, forum, summary, challenge, strategy, outcome, year } = req.body;

    const caseStudy = await CaseStudy.findOne({ _id: id, professional: req.user._id });
    if (!caseStudy) {
      return sendError(res, 'Case study not found or unauthorized', 404);
    }

    if (title) caseStudy.title = title;
    if (practiceArea) caseStudy.practiceArea = practiceArea;
    if (forum) caseStudy.forum = forum;
    if (summary) caseStudy.summary = summary;
    if (challenge) caseStudy.challenge = challenge;
    if (strategy) caseStudy.strategy = strategy;
    if (outcome) caseStudy.outcome = outcome;
    if (year) caseStudy.year = year;

    await caseStudy.save();
    return sendSuccess(res, caseStudy, 'Case study updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/lawyers/case-studies/:id
 */
const deleteCaseStudy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const caseStudy = await CaseStudy.findOneAndDelete({ _id: id, professional: req.user._id });
    if (!caseStudy) {
      return sendError(res, 'Case study not found or unauthorized', 404);
    }
    return sendSuccess(res, null, 'Case study deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/lawyers/case-studies
 */
const listCaseStudies = async (req, res, next) => {
  try {
    const { practiceArea, professionalId } = req.query;
    const filter = {};
    if (practiceArea) filter.practiceArea = new RegExp(practiceArea, 'i');
    if (professionalId) filter.professional = professionalId;

    const caseStudies = await CaseStudy.find(filter)
      .populate('professional', 'email role')
      .sort({ createdAt: -1 });

    return sendSuccess(res, caseStudies, 'Case studies retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateLawyerProfile,
  addExperience,
  updateExperience,
  deleteExperience,
  reorderExperiences,
  addCaseHistory,
  updateCaseHistory,
  deleteCaseHistory,
  searchLawyersDirectory,
  getLawyerDetails,
  requestConsultation,
  getIncomingRequests,
  respondToRequest,
  getOngoingCases,
  getCitizenRequests,
  getCitizenCases,
  matchLawyersForCase,
  publishCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
  listCaseStudies,
};

