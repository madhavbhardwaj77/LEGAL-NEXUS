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
 * POST /api/lawyers/experience
 */
const addExperience = async (req, res, next) => {
  try {
    const targetId = req.params.id || 'me';
    const profile = await findAuthorizedProfile(targetId, req.user._id, req.user.role);
    if (!profile) return sendError(res, 'Profile not found', 404);

    const { title, role, organization, courtOrForum, practiceArea, startYear, endYear, isCurrent, description } = req.body;
    profile.experiences.push({
      title,
      role: role || title,
      organization,
      courtOrForum,
      practiceArea,
      startYear,
      endYear,
      isCurrent: isCurrent || false,
      description,
      displayOrder: profile.experiences.length,
    });

    await profile.save();
    return sendSuccess(res, profile.experiences, 'Experience added successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/lawyers/experience/:expId
 */
const updateExperience = async (req, res, next) => {
  try {
    const targetId = req.params.id || 'me';
    const profile = await findAuthorizedProfile(targetId, req.user._id, req.user.role);
    if (!profile) return sendError(res, 'Profile not found', 404);

    const exp = profile.experiences.id(req.params.expId);
    if (!exp) return sendError(res, 'Experience item not found', 404);

    const fields = ['title', 'role', 'organization', 'courtOrForum', 'practiceArea', 'startYear', 'endYear', 'isCurrent', 'description', 'displayOrder'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) exp[f] = req.body[f];
    });

    await profile.save();
    return sendSuccess(res, profile.experiences, 'Experience updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/lawyers/experience/:expId
 */
const deleteExperience = async (req, res, next) => {
  try {
    const targetId = req.params.id || 'me';
    const profile = await findAuthorizedProfile(targetId, req.user._id, req.user.role);
    if (!profile) return sendError(res, 'Profile not found', 404);

    profile.experiences = profile.experiences.filter((e) => e._id.toString() !== req.params.expId);
    await profile.save();
    return sendSuccess(res, profile.experiences, 'Experience deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/lawyers/experience-reorder
 */
const reorderExperiences = async (req, res, next) => {
  try {
    const targetId = req.params.id || 'me';
    const profile = await findAuthorizedProfile(targetId, req.user._id, req.user.role);
    if (!profile) return sendError(res, 'Profile not found', 404);

    const { orderedIds } = req.body;
    if (Array.isArray(orderedIds)) {
      orderedIds.forEach((id, idx) => {
        const item = profile.experiences.id(id);
        if (item) item.displayOrder = idx;
      });
      profile.experiences.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      await profile.save();
    }
    return sendSuccess(res, profile.experiences, 'Experiences reordered');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/lawyers/cases (Case History)
 */
const addCaseHistory = async (req, res, next) => {
  try {
    const targetId = req.params.id || 'me';
    const profile = await findAuthorizedProfile(targetId, req.user._id, req.user.role);
    if (!profile) return sendError(res, 'Profile not found', 404);

    const { title, caseNumber, courtOrForum, practiceArea, year, summary, challenge, strategy, outcome, anonymizedDetails } = req.body;
    profile.caseHistories.push({
      title,
      caseNumber,
      courtOrForum,
      practiceArea,
      year,
      summary,
      challenge,
      strategy,
      outcome,
      anonymizedDetails: anonymizedDetails !== false,
      displayOrder: profile.caseHistories.length,
    });

    await profile.save();
    return sendSuccess(res, profile.caseHistories, 'Case history added', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/lawyers/cases/:caseId
 */
const updateCaseHistory = async (req, res, next) => {
  try {
    const targetId = req.params.id || 'me';
    const profile = await findAuthorizedProfile(targetId, req.user._id, req.user.role);
    if (!profile) return sendError(res, 'Profile not found', 404);

    const c = profile.caseHistories.id(req.params.caseId);
    if (!c) return sendError(res, 'Case item not found', 404);

    const fields = ['title', 'caseNumber', 'courtOrForum', 'practiceArea', 'year', 'summary', 'challenge', 'strategy', 'outcome', 'anonymizedDetails', 'displayOrder'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) c[f] = req.body[f];
    });

    await profile.save();
    return sendSuccess(res, profile.caseHistories, 'Case history updated');
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/lawyers/cases/:caseId
 */
const deleteCaseHistory = async (req, res, next) => {
  try {
    const targetId = req.params.id || 'me';
    const profile = await findAuthorizedProfile(targetId, req.user._id, req.user.role);
    if (!profile) return sendError(res, 'Profile not found', 404);

    profile.caseHistories = profile.caseHistories.filter((c) => c._id.toString() !== req.params.caseId);
    await profile.save();
    return sendSuccess(res, profile.caseHistories, 'Case history deleted');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/lawyers
 * Public & Verified Directory Search
 */
const searchLawyersDirectory = async (req, res, next) => {
  try {
    const { practiceArea, city, state, search, language, verifiedOnly } = req.query;

    const filter = {
      professionalRole: ROLES.LAWYER,
      'barCouncilRegistration.isVerified': true,
      verificationStatus: 'VERIFIED',
    };

    if (practiceArea) {
      filter.practiceAreas = { $in: [new RegExp(practiceArea, 'i')] };
    }
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (state) filter['location.state'] = new RegExp(state, 'i');
    if (language) filter.languages = { $in: [language] };
    if (search) {
      filter.$or = [
        { fullName: new RegExp(search, 'i') },
        { title: new RegExp(search, 'i') },
        { practiceAreas: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const profiles = await ProfessionalProfile.find(filter)
      .populate('user', 'email role isVerified createdAt')
      .sort({ experienceYears: -1, createdAt: -1 });

    const lawyerUserIds = profiles.map((p) => p.user?._id).filter(Boolean);
    const caseStudies = await CaseStudy.find({ professional: { $in: lawyerUserIds } });
    const studyMap = new Map();
    caseStudies.forEach((cs) => {
      const pid = cs.professional.toString();
      if (!studyMap.has(pid)) studyMap.set(pid, []);
      studyMap.get(pid).push(cs);
    });

    const enriched = profiles.map((p) => {
      const pObj = p.toObject();
      pObj.publishedCaseStudies = studyMap.get(p.user?._id?.toString()) || [];
      return pObj;
    });

    return sendSuccess(res, enriched, 'Verified advocate directory retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/lawyers/:id
 */
const getLawyerDetails = async (req, res, next) => {
  try {
    const profile = await ProfessionalProfile.findById(req.params.id)
      .populate('user', 'email role isVerified createdAt');

    if (!profile) return sendError(res, 'Lawyer profile not found', 404);

    const caseStudies = await CaseStudy.find({ professional: profile.user._id });
    const pObj = profile.toObject();
    pObj.publishedCaseStudies = caseStudies;

    return sendSuccess(res, pObj, 'Lawyer profile details retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/lawyers/request-consultation
 */
const requestConsultation = async (req, res, next) => {
  try {
    const { lawyerId, caseId, requestMessage, urgency = 'MEDIUM', contactMode = 'VIDEO' } = req.body;
    let lawyerUser = null;

    const profile = await ProfessionalProfile.findById(lawyerId);
    if (profile && profile.user) {
      lawyerUser = profile.user;
    } else {
      lawyerUser = lawyerId;
    }

    const matchReq = await LawyerMatch.create({
      case: caseId || undefined,
      citizen: req.user._id,
      lawyer: lawyerUser,
      requestMessage: requestMessage || 'Legal Consultation Requested',
      status: 'PENDING',
      meta: { urgency, contactMode },
    });

    return sendSuccess(res, matchReq, 'Consultation request sent successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/lawyers/requests/incoming
 */
const getIncomingRequests = async (req, res, next) => {
  try {
    const requests = await LawyerMatch.find({ lawyer: req.user._id })
      .populate('citizen', 'email phone profileData')
      .populate('case', 'caseNumber title category urgency status financialDetails location')
      .sort({ createdAt: -1 });

    return sendSuccess(res, requests, 'Incoming consultation requests retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/lawyers/requests/:id/respond
 */
const respondToRequest = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const matchReq = await LawyerMatch.findOne({ _id: req.params.id, lawyer: req.user._id });
    if (!matchReq) return sendError(res, 'Request not found or unauthorized', 404);

    matchReq.status = status;
    if (notes) matchReq.responseNotes = notes;
    matchReq.respondedAt = new Date();
    await matchReq.save();

    if (status === 'ACCEPTED' && matchReq.case) {
      await Case.findByIdAndUpdate(matchReq.case, {
        assignedLawyer: req.user._id,
        status: 'UNDER_REVIEW',
      });
    }

    return sendSuccess(res, matchReq, 'Request response updated');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/lawyers/ongoing-cases
 */
const getOngoingCases = async (req, res, next) => {
  try {
    const cases = await Case.find({ assignedLawyer: req.user._id })
      .populate('user', 'email phone profileData')
      .sort({ updatedAt: -1 });

    return sendSuccess(res, cases, 'Ongoing cases retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/lawyers/requests/citizen
 */
const getCitizenRequests = async (req, res, next) => {
  try {
    const requests = await LawyerMatch.find({ citizen: req.user._id })
      .populate('case', 'caseNumber title category urgency status')
      .populate('lawyer', 'email phone')
      .sort({ createdAt: -1 });

    return sendSuccess(res, requests, 'Citizen requests retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/lawyers/citizen-cases
 */
const getCitizenCases = async (req, res, next) => {
  try {
    const cases = await Case.find({ status: { $nin: ['ARCHIVED'] } })
      .populate('user', 'email phone profileData')
      .populate('assignedLawyer', 'email phone')
      .sort({ createdAt: -1 })
      .limit(30);

    return sendSuccess(res, cases, 'Citizen cases retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/lawyers/match
 * Multi-factor Weighted Ranking Matcher Engine
 */
const matchLawyersForCase = async (req, res, next) => {
  try {
    const { caseId, practiceArea, location, language, budget, issue, caseProfile: inputProfile } = req.body;
    let caseProfile = {
      category: practiceArea || 'Employment & Labour Law',
      issue: issue || 'Legal Grievance & Dispute Resolution',
      jurisdiction: location || 'Delhi',
      language: language || 'English',
      financialDetails: { disputedAmount: budget || 100000 },
    };

    if (inputProfile) {
      caseProfile = {
        category: inputProfile.category || caseProfile.category,
        issue: inputProfile.issue || caseProfile.issue,
        jurisdiction: inputProfile.jurisdiction || caseProfile.jurisdiction,
        language: inputProfile.language || caseProfile.language,
        financialDetails: { disputedAmount: inputProfile.budget || caseProfile.financialDetails.disputedAmount },
      };
    } else if (caseId) {
      const caseDoc = await Case.findById(caseId);
      if (caseDoc) {
        caseProfile = {
          category: caseDoc.category || 'General Civil Law',
          issue: caseDoc.issue || caseDoc.title || 'Civil Litigation Matter',
          jurisdiction: caseDoc.location?.city || 'Delhi',
          language: 'English',
          financialDetails: { disputedAmount: caseDoc.financialDetails?.disputedAmount || 100000 },
        };
      }
    }

    const profiles = await ProfessionalProfile.find({
      professionalRole: ROLES.LAWYER,
      'barCouncilRegistration.isVerified': true,
      verificationStatus: 'VERIFIED',
    }).populate('user', 'email role isVerified createdAt');

    const allCaseStudies = await CaseStudy.find({});
    const caseStudyByLawyer = new Map();
    allCaseStudies.forEach((cs) => {
      const pid = cs.professional.toString();
      if (!caseStudyByLawyer.has(pid)) {
        caseStudyByLawyer.set(pid, []);
      }
      caseStudyByLawyer.get(pid).push(cs);
    });

    const targetCategory = (caseProfile.category || '').toLowerCase();
    const targetCity = (caseProfile.jurisdiction || 'Delhi').toLowerCase();

    const evaluated = profiles.map((p) => {
      const userKey = p.user?._id?.toString() || p._id.toString();
      const lawyerCaseStudies = caseStudyByLawyer.get(userKey) || [];

      const categoryCaseStudies = lawyerCaseStudies.filter((cs) => {
        const csArea = (cs.practiceArea || '').toLowerCase();
        const csTitle = (cs.title || '').toLowerCase();
        const csSum = (cs.summary || '').toLowerCase();
        return (
          csArea.includes(targetCategory) ||
          targetCategory.includes(csArea) ||
          csTitle.includes(targetCategory) ||
          csSum.includes(targetCategory)
        );
      });

      const matchedArea = (p.practiceAreas || []).find((pa) => {
        const paLower = pa.toLowerCase();
        return (
          paLower.includes(targetCategory) ||
          targetCategory.includes(paLower) ||
          (targetCategory.includes('consumer') && paLower.includes('consumer')) ||
          (targetCategory.includes('employment') && paLower.includes('employment')) ||
          (targetCategory.includes('labour') && paLower.includes('labour')) ||
          (targetCategory.includes('property') && paLower.includes('property')) ||
          (targetCategory.includes('cyber') && paLower.includes('cyber')) ||
          (targetCategory.includes('family') && (paLower.includes('family') || paLower.includes('matrimonial'))) ||
          (targetCategory.includes('corporate') && (paLower.includes('corporate') || paLower.includes('commercial'))) ||
          (targetCategory.includes('criminal') && paLower.includes('criminal'))
        );
      });

      const isCategorySpecialist = Boolean(matchedArea);
      let practiceScore = isCategorySpecialist ? 35 : 10;

      let caseStudyScore = 0;
      if (categoryCaseStudies.length > 0) {
        caseStudyScore = 25;
      } else if (lawyerCaseStudies.length > 0) {
        caseStudyScore = 15;
      } else {
        caseStudyScore = 5;
      }

      const expYears = p.experienceYears || 0;
      let expScore = 10;
      if (expYears >= 15) expScore = 25;
      else if (expYears >= 10) expScore = 20;
      else if (expYears >= 5) expScore = 15;
      else expScore = 10;

      const cCity = (p.location?.city || '').toLowerCase();
      const cState = (p.location?.state || '').toLowerCase();
      let locScore = 8;
      if (targetCity && (cCity.includes(targetCity) || cState.includes(targetCity) || targetCity.includes(cCity))) {
        locScore = 15;
      }

      const totalScore = Math.min(100, practiceScore + caseStudyScore + expScore + locScore);
      const isHighRecommend = totalScore >= 70 && isCategorySpecialist;

      const factors = [
        {
          factor: 'Practice Area Fit',
          points: practiceScore,
          maxPoints: 35,
          label: isCategorySpecialist ? `Core Specialist in ${matchedArea || caseProfile.category}` : 'General Civil Litigator',
          matched: isCategorySpecialist,
        },
        {
          factor: 'Published Precedents',
          points: caseStudyScore,
          maxPoints: 25,
          label: categoryCaseStudies.length > 0 
            ? `${categoryCaseStudies.length} Published Precedent Case in ${caseProfile.category}` 
            : lawyerCaseStudies.length > 0
            ? `${lawyerCaseStudies.length} Published Case Studies`
            : 'No published case studies in this domain',
          matched: categoryCaseStudies.length > 0,
        },
        {
          factor: 'Court Experience',
          points: expScore,
          maxPoints: 25,
          label: `${expYears} Years Standing at the Bar`,
          matched: expYears >= 5,
        },
        {
          factor: 'Jurisdiction Match',
          points: locScore,
          maxPoints: 15,
          label: `${p.location?.city || 'Delhi'} Courts & Tribunals`,
          matched: locScore === 15,
        },
      ];

      let summary = `${totalScore}% Match: ${p.fullName} brings ${expYears} years of verified standing with core practice in ${(p.practiceAreas || []).slice(0, 2).join(' & ')}.`;
      if (categoryCaseStudies.length > 0) {
        summary = `${totalScore}% High Match: ${p.fullName} (${expYears} yrs exp) has successfully published precedent "${categoryCaseStudies[0].title}" in ${caseProfile.category}.`;
      }

      return {
        lawyerId: p._id,
        fullName: p.fullName || p.user?.email,
        matchScore: totalScore,
        matchPercentage: totalScore,
        isVerified: p.verificationStatus === 'VERIFIED',
        isHighRecommend,
        practiceAreas: p.practiceAreas || [],
        experienceYears: expYears,
        location: p.location || { city: 'Delhi', state: 'Delhi' },
        title: p.title || 'Advocate on Record',
        barRegistrationNumber: p.barCouncilRegistration?.registrationNumber,
        publishedCaseStudies: categoryCaseStudies.map(cs => ({
          title: cs.title,
          practiceArea: cs.practiceArea,
          outcome: cs.outcome,
          forum: cs.forum,
          year: cs.year,
        })),
        totalPublishedCases: lawyerCaseStudies.length,
        explanationBreakdown: factors,
        summaryExplanation: summary,
      };
    });

    const relevantMatches = evaluated.filter((m) => m.matchScore >= 50);

    relevantMatches.sort((a, b) => {
      if (b.isHighRecommend !== a.isHighRecommend) {
        return b.isHighRecommend ? 1 : -1;
      }
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return b.experienceYears - a.experienceYears;
    });

    return sendSuccess(
      res,
      {
        matchedLawyers: relevantMatches,
        totalCandidates: profiles.length,
        matchedCount: relevantMatches.length,
        caseProfile,
      },
      'Lawyer matching completed successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/lawyers/extract-case-profile
 * Automatically analyzes document validity, legal relevance, and extracts parameters
 */
const extractCaseProfileFromDocument = async (req, res, next) => {
  try {
    const { fileName = '', fileText = '', fileSize = 0 } = req.body;
    const combinedStr = `${fileName} ${fileText}`.toLowerCase().replace(/[_-]+/g, ' ').trim();

    // 1. Explicit Non-Legal / Inappropriate Negative Lexicon
    const nonLegalPatterns = [
      /\b(recipe|recipes|ingredients|cooking|baking|cuisine|calories|dish|restaurant|pasta|pizza|cake)\b/i,
      /\b(resume|cv|curriculum vitae|biodata|bio-data|portfolio|work experience|hobbies|education history)\b/i,
      /\b(movie|cinema|ticket|boarding pass|flight ticket|train ticket|pnr|seat number)\b/i,
      /\b(game|gaming|gameplay|playstation|xbox|minecraft|roblox|gta|fortnite)\b/i,
      /\b(homework|classwork|assignment|maths|algebra|physics notes|chemistry notes|biology notes|essay on)\b/i,
      /\b(song|lyrics|music album|mp3|playlist|tracklist|singer)\b/i,
      /\b(gym|workout|bodybuilding|diet chart|meal plan|supplement|protein)\b/i,
      /\b(wallpaper|meme|joke|jokes|fiction story|novel chapter|comics)\b/i,
      /\b(hotel booking|tour package|itinerary|resort|travel guide)\b/i,
    ];

    // 2. Positive Legal Indicators Lexicon (Word-boundary matching)
    const legalKeywords = [
      'complaint', 'petition', 'notice', 'agreement', 'contract', 'affidavit',
      'plaint', 'vakalatnama', 'fir', 'chargesheet', 'bail', 'injunction',
      'suit', 'appeal', 'revision', 'tribunal', 'court', 'high court',
      'supreme court', 'district court', 'sessions', 'consumer forum', 'ncdrc',
      'rera', 'nclt', 'drt', 'arbitration', 'legal', 'dispute', 'grievance',
      'advocate', 'counsel', 'jurisdiction', 'statutory', 'section',
      'clauses', 'breach', 'covenants', 'liability', 'damages', 'remedy',
      'relief', 'petitioner', 'respondent', 'plaintiff', 'defendant', 'appellant',
      'accused', 'complainant', 'cheque bounce', '138', 'ni act', 'termination',
      'wages', 'salary', 'labour', 'employment', 'cybercrime', 'property',
      'matrimonial', 'divorce', 'maintenance', 'custody', 'dowry', 'defective',
      'unfair trade', 'compensation', 'versus', 'judgement', 'order',
      'writ', 'police station', 'encroachment', 'lease', 'tenant', 'landlord',
      'ndps', 'posh', 'quashing', 'probate', 'succession', 'power of attorney', 'poa'
    ];

    const matchedLegalTerms = legalKeywords.filter((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      return regex.test(combinedStr);
    });

    const matchedNonLegal = nonLegalPatterns.some((pattern) => pattern.test(combinedStr));

    const isInvalidOrInappropriate =
      matchedNonLegal ||
      matchedLegalTerms.length === 0;

    if (isInvalidOrInappropriate) {
      return sendSuccess(
        res,
        {
          isValidLegalDocument: false,
          isAppropriate: false,
          fileName,
          fileSize: fileSize ? `${(fileSize / 1024).toFixed(1)} KB` : 'Attached',
          reason:
            'Inappropriate or Non-Legal Document: The uploaded file does not contain recognized legal terms, court filings, statutory notices, or case dispute facts. Please upload a valid legal document (e.g. Legal Notice, Petition, Contract, FIR, Consumer Complaint, or Court Plaint).',
          detectedType: 'NON_LEGAL_DOCUMENT',
          confidence: 98,
        },
        'Document analyzed: Inappropriate / Non-legal document detected'
      );
    }

    let category = 'Civil Litigation';
    let defaultSummary = 'Legal petition seeking representation and judicial remedy.';
    let defaultBudget = 100000;

    if (/consumer|forum|defective|ncdrc|warranty|merchant|product liability|unfair trade/i.test(combinedStr)) {
      category = 'Consumer Protection';
      defaultSummary = 'Grievance petition seeking compensation and statutory relief for deficiency in service and unfair trade practice under Consumer Protection Act, 2019.';
      defaultBudget = 150000;
    } else if (/employment|labour|termination|wages|salary|layoff|pf|gratuity|retrenchment|workplace/i.test(combinedStr)) {
      category = 'Employment & Labour Law';
      defaultSummary = 'Dispute regarding unlawful termination, withheld severance benefits, and statutory dues under Industrial Disputes and Payment of Wages legislation.';
      defaultBudget = 250000;
    } else if (/property|real estate|rera|tenant|rent|plot|possession|encroachment|boundary|lease|builder/i.test(combinedStr)) {
      category = 'Property & Real Estate';
      defaultSummary = 'Dispute concerning title rights, possession delay, illegal encroachment, and recovery of security deposit/damages.';
      defaultBudget = 500000;
    } else if (/cyber|it act|phishing|fraud|data leak|crypto|hacking|identity theft|cybercrime/i.test(combinedStr)) {
      category = 'Cybercrime & IT Act';
      defaultSummary = 'Complaint regarding unauthorized digital transactions, cybersecurity breach, and statutory remedies under the Information Technology Act.';
      defaultBudget = 300000;
    } else if (/divorce|matrimonial|custody|maintenance|dowry|family|domestic violence|alimony/i.test(combinedStr)) {
      category = 'Family & Matrimonial';
      defaultSummary = 'Matrimonial petition filed seeking judicial separation, spousal maintenance, and child custody arrangements.';
      defaultBudget = 100000;
    } else if (/cheque|138|ni act|banking|drt|loan|recovery|nbfc|mortgage/i.test(combinedStr)) {
      category = 'Banking & Financial Disputes';
      defaultSummary = 'Statutory notice and proceedings for dishonour of negotiable instruments and debt recovery under Section 138 NI Act.';
      defaultBudget = 400000;
    } else if (/contract|agreement|commercial|corporate|nda|partnership|breach of contract|mou/i.test(combinedStr)) {
      category = 'Corporate & Contracts';
      defaultSummary = 'Commercial dispute arising from material breach of contractual covenants, non-compete enforcement, and commercial damages.';
      defaultBudget = 750000;
    } else if (/bail|fir|ipc|bns|crpc|criminal|police|quashing/i.test(combinedStr)) {
      category = 'Criminal Defense';
      defaultSummary = 'Criminal application for anticipatory bail, quashing of complaint, and protection under constitutional criminal jurisprudence.';
      defaultBudget = 200000;
    }

    let rawName = fileName
      .replace(/\.[^/.]+$/, '')
      .replace(/[_-\.]+/g, ' ')
      .replace(/\b\d{6,}\b/g, '')
      .trim();

    let formattedTitle = rawName
      ? rawName
          .split(' ')
          .filter(Boolean)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      : `${category} Case Petition`;

    if (formattedTitle.length < 5) {
      formattedTitle = `${category} Grievance Petition`;
    }

    let issueSummary = defaultSummary;
    if (fileText && fileText.trim().length > 30) {
      issueSummary = fileText.trim().slice(0, 600);
    }

    let jurisdiction = 'Delhi';
    if (/mumbai|bombay|maharashtra/i.test(combinedStr)) jurisdiction = 'Mumbai';
    else if (/bengaluru|bangalore|karnataka/i.test(combinedStr)) jurisdiction = 'Bengaluru';
    else if (/chennai|madras|tamil nadu/i.test(combinedStr)) jurisdiction = 'Chennai';
    else if (/kolkata|calcutta|west bengal/i.test(combinedStr)) jurisdiction = 'Kolkata';
    else if (/hyderabad|telangana/i.test(combinedStr)) jurisdiction = 'Hyderabad';
    else if (/chandigarh|punjab|haryana/i.test(combinedStr)) jurisdiction = 'Chandigarh';
    else if (/noida|lucknow|uttar pradesh/i.test(combinedStr)) jurisdiction = 'Delhi NCR / UP';

    return sendSuccess(
      res,
      {
        isValidLegalDocument: true,
        isAppropriate: true,
        title: formattedTitle,
        category,
        issue: issueSummary,
        jurisdiction,
        budget: defaultBudget,
        language: 'Hindi + English',
        fileName,
        fileSize: fileSize ? `${(fileSize / 1024).toFixed(1)} KB` : 'Attached',
        autoExtracted: true,
        confidence: 96,
        legalIndicatorsFound: matchedLegalTerms.slice(0, 5),
      },
      'Case profile extracted successfully from valid legal document'
    );
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
  extractCaseProfileFromDocument,
};
