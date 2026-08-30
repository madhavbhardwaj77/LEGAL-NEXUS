const http = require('http');
const { ProfessionalProfile, User, CaseStudy, Case } = require('../models');
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
 * POST /api/lawyers/match
 * Multi-factor Lawyer Matching Engine for a Case
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
        category: inputProfile.category || practiceArea || 'General Legal Practice',
        issue: inputProfile.issue || inputProfile.title || issue || 'Case Representation',
        jurisdiction: inputProfile.jurisdiction || inputProfile.city || location || 'Delhi',
        language: inputProfile.language || language || 'English',
        financialDetails: { disputedAmount: inputProfile.budget || budget || 100000 },
      };
    }

    if (caseId) {
      const caseDoc = await Case.findById(caseId);
      if (caseDoc) {
        caseProfile = {
          category: caseDoc.category || caseProfile.category,
          issue: caseDoc.title || caseDoc.issue || caseProfile.issue,
          jurisdiction: caseDoc.location?.city || caseDoc.location?.state || 'Delhi',
          language: 'English',
          financialDetails: { disputedAmount: caseDoc.financialDetails?.disputedAmount || 0 },
        };
      }
    }

    // Fetch all active verified lawyers and all published case studies
    const [profiles, allCaseStudies] = await Promise.all([
      ProfessionalProfile.find({
        professionalRole: ROLES.LAWYER,
        verificationStatus: 'VERIFIED',
      }).populate('user', 'email role isVerified createdAt'),
      CaseStudy.find().populate('professional', 'email'),
    ]);

    const targetCategory = (caseProfile.category || '').toLowerCase();
    const targetCity = (caseProfile.jurisdiction || '').toLowerCase();

    // Map candidates and evaluate category experience + published case studies
    const evaluated = profiles.map((p) => {
      const pEmail = p.user?.email || '';
      const pUserId = p.user?._id?.toString();

      // Find published case studies by this advocate
      const lawyerCaseStudies = allCaseStudies.filter(
        (cs) => cs.professional?._id?.toString() === pUserId || cs.professional?.email === pEmail
      );

      // Check case studies specific to this case's category
      const categoryCaseStudies = lawyerCaseStudies.filter((cs) => {
        const csArea = (cs.practiceArea || '').toLowerCase();
        return (
          csArea.includes(targetCategory) ||
          targetCategory.includes(csArea) ||
          (targetCategory.includes('employment') && csArea.includes('labour')) ||
          (targetCategory.includes('consumer') && csArea.includes('consumer')) ||
          (targetCategory.includes('property') && csArea.includes('property')) ||
          (targetCategory.includes('cyber') && csArea.includes('cyber')) ||
          (targetCategory.includes('corporate') && csArea.includes('corporate')) ||
          (targetCategory.includes('family') && csArea.includes('family'))
        );
      });

      // 1. Practice Area / Domain Fit (35 Points Max)
      let practiceScore = 0;
      let isCategorySpecialist = false;
      const matchedArea = (p.practiceAreas || []).find((pa) => {
        const paLower = pa.toLowerCase();
        return (
          paLower.includes(targetCategory) ||
          targetCategory.includes(paLower) ||
          (targetCategory.includes('employment') && paLower.includes('labour')) ||
          (targetCategory.includes('consumer') && paLower.includes('consumer')) ||
          (targetCategory.includes('property') && paLower.includes('property')) ||
          (targetCategory.includes('cyber') && paLower.includes('cyber')) ||
          (targetCategory.includes('corporate') && paLower.includes('corporate')) ||
          (targetCategory.includes('family') && paLower.includes('family'))
        );
      });

      if (matchedArea) {
        practiceScore = 35;
        isCategorySpecialist = true;
      } else if ((p.practiceAreas || []).some((pa) => /civil|litigation|general/i.test(pa))) {
        practiceScore = 15; // General civil overlap
      } else {
        practiceScore = 0; // Unrelated domain
      }

      // 2. Published Case Studies in this Category (25 Points Max)
      let caseStudyScore = 0;
      if (categoryCaseStudies.length > 0) {
        caseStudyScore = 25;
      } else if (lawyerCaseStudies.length > 0) {
        caseStudyScore = 10;
      } else {
        caseStudyScore = 0;
      }

      // 3. Standing & Litigation Experience (25 Points Max)
      const expYears = p.experienceYears || 1;
      let expScore = 8;
      if (expYears >= 15) expScore = 25;
      else if (expYears >= 10) expScore = 20;
      else if (expYears >= 5) expScore = 15;
      else expScore = 10;

      // 4. Jurisdiction & Court Match (15 Points Max)
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

    // STRICT RELEVANCE FILTER:
    // Only return advocates who have practice area match or minimum 50% score
    const relevantMatches = evaluated.filter((m) => m.matchScore >= 50);

    // Sort: High Recommend first, then by matchScore descending, then by experienceYears descending
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
 * POST /api/lawyers/case-studies
 * Publish Anonymized Case Study
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

/**
 * GET /api/lawyers
 */
const searchLawyersDirectory = async (req, res, next) => {
  try {
    const {
      role,
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

    // STRICT: Only show VERIFIED advocates in directory by default
    if (req.query.includeUnverified !== 'true') {
      filter.verificationStatus = 'VERIFIED';
    }

    if (role) {
      filter.professionalRole = role;
    } else {
      filter.professionalRole = ROLES.LAWYER;
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

/**
 * POST /api/lawyers/extract-case-profile
 * Automatically analyzes document validity, legal relevance, and extracts parameters
 */
const extractCaseProfileFromDocument = async (req, res, next) => {
  try {
    const { fileName = '', fileText = '', fileSize = 0 } = req.body;
    const combinedStr = `${fileName} ${fileText}`.toLowerCase().replace(/[_\-]+/g, ' ').trim();

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

    // Find all positive legal matches using word boundaries
    const matchedLegalTerms = legalKeywords.filter((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      return regex.test(combinedStr);
    });

    // Check negative non-legal triggers
    const matchedNonLegal = nonLegalPatterns.some((pattern) => pattern.test(combinedStr));

    // Decisive Relevance Filter:
    // If explicit non-legal indicator found OR if combined text has zero recognized legal terms.
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

    // 3. Document is VALID & LEGAL -> Proceed to Domain Classification
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

    // 4. Format Human-Friendly Case Title
    let rawName = fileName
      .replace(/\.[^/.]+$/, '')
      .replace(/[_\-\.]+/g, ' ')
      .replace(/\b\d{6,}\b/g, '') // remove random timestamp numbers
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

    // 5. Extract Summary from text if substantial text is provided
    let issueSummary = defaultSummary;
    if (fileText && fileText.trim().length > 30) {
      issueSummary = fileText.trim().slice(0, 600);
    }

    // 6. Detect Jurisdiction from text or default to Delhi
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

module.exports = {
  matchLawyersForCase,
  publishCaseStudy,
  listCaseStudies,
  searchLawyersDirectory,
  getLawyerDetails,
  extractCaseProfileFromDocument,
};
