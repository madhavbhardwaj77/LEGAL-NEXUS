const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const { sendError } = require('../utils/apiResponse');

/**
 * Guardrail Layer — Illegal & Harmful Content Detection Middleware
 *
 * Screens all user-submitted text fields before they reach AI controllers.
 * Blocks queries that seek help with illegal activities and returns a
 * structured warning response with an incident ID for audit purposes.
 *
 * Design principles:
 *  - Patterns target INTENT (e.g. "how to forge", "help me hack") rather
 *    than bare keywords, to avoid false-positives on victims describing
 *    crimes committed against them.
 *  - Multi-field scanning: story, message, query, simulatedText, intakeNarrative
 *  - Every blocked request is logged for audit trail.
 */

// ─── Threat Categories & Patterns ────────────────────────────────────────────
// Each pattern uses word-boundary (\b) matching and is case-insensitive.
// The patterns are intentionally phrased to catch *solicitation of illegal acts*
// rather than descriptions of being a victim.

const THREAT_CATEGORIES = {
  VIOLENCE: {
    label: 'Violence & Threats',
    patterns: [
      /\b(?:how\s+(?:to|can\s+i|do\s+i))\s+(?:kill|murder|assassinate|poison)\b/i,
      /\b(?:hire|find|get)\s+(?:a\s+)?(?:hitman|assassin|contract\s+killer|shooter)\b/i,
      /\b(?:how\s+(?:to|can\s+i))\s+(?:assault|attack|beat\s+up|hurt|injure)\s+(?:someone|a\s+person|my|him|her|them)\b/i,
      /\b(?:plan(?:ning)?|commit|execute|carry\s+out)\s+(?:a\s+)?(?:murder|homicide|killing|assassination|kidnapping|abduction)\b/i,
      /\b(?:how\s+(?:to|can\s+i))\s+(?:kidnap|abduct|hold\s+hostage)\b/i,
      /\b(?:want\s+to|help\s+me|need\s+to)\s+(?:kill|murder|eliminate|get\s+rid\s+of)\s+(?:someone|a\s+person|my|him|her|them)\b/i,
      /\b(?:threaten|intimidate)\s+(?:a\s+)?(?:witness|judge|jury|victim)\b/i,
    ],
  },

  DRUGS: {
    label: 'Drug Offenses',
    patterns: [
      /\b(?:how\s+(?:to|can\s+i))\s+(?:make|manufacture|produce|cook|synthesize|grow)\s+(?:drugs|meth|cocaine|heroin|fentanyl|lsd|mdma|ecstasy)\b/i,
      /\b(?:how\s+(?:to|can\s+i))\s+(?:traffic|smuggle|distribute|sell|deal)\s+(?:drugs|narcotics|illegal\s+substances|contraband)\b/i,
      /\b(?:where\s+(?:to|can\s+i))\s+(?:buy|get|procure|source)\s+(?:drugs|narcotics|illegal\s+substances|cocaine|heroin|meth)\b/i,
      /\b(?:set\s+up|start|run)\s+(?:a\s+)?(?:drug\s+lab|meth\s+lab|drug\s+operation|drug\s+ring)\b/i,
      /\b(?:evade|avoid)\s+(?:drug|narcotics)\s+(?:detection|enforcement|police|test)\b/i,
    ],
  },

  FRAUD: {
    label: 'Fraud & Forgery',
    patterns: [
      /\b(?:how\s+(?:to|can\s+i|do\s+i))\s+(?:forge|fake|fabricate|falsify|counterfeit)\s+(?:\w+\s+)*(?:document|signature|certificate|passport|license|id|identity|evidence|will|deed|contract)\b/i,
      /\b(?:how\s+(?:to|can\s+i))\s+(?:commit|do|carry\s+out|pull\s+off)\s+(?:fraud|scam|identity\s+theft|insurance\s+fraud)\b/i,
      /\b(?:help\s+me|want\s+to|need\s+to)\s+(?:forge|fake|fabricate|falsify)\b/i,
      /\b(?:how\s+(?:to|can\s+i))\s+(?:impersonate|pretend\s+to\s+be)\s+(?:a\s+)?(?:lawyer|judge|officer|official|police|doctor)\b/i,
      /\b(?:how\s+(?:to|can\s+i))\s+(?:create|make|produce)\s+(?:\w+\s+)*(?:fake|forged|counterfeit|fraudulent)\s+(?:\w+\s+)*(?:documents?|ids?|passports?|certificates?|evidence|currency|money|notes?|bills?)\b/i,
      /\b(?:how\s+(?:to|can\s+i))\s+(?:tamper\s+with|destroy|hide|suppress)\s+(?:evidence|proof|records?)\b/i,
      /\bfabricate\s+(?:\w+\s+)*evidence\b/i,
      /\b(?:perjury|commit\s+perjury|lie\s+(?:in|under)\s+(?:court|oath))\b/i,
    ],
  },

  CYBERCRIME: {
    label: 'Cybercrime & Hacking',
    patterns: [
      /\b(?:how\s+(?:to|can\s+i|do\s+i))\s+(?:hack|breach|crack|exploit|compromise)\s+(?:into\s+)?(?:[\w']+\s+)*(?:system|server|website|account|network|database|computer|email|phone|bank)\b/i,
      /\b(?:how\s+(?:to|can\s+i))\s+(?:create|make|write|deploy|spread)\s+(?:a\s+)?(?:virus|malware|ransomware|trojan|worm|spyware|keylogger|rootkit|botnet)\b/i,
      /\b(?:how\s+(?:to|can\s+i))\s+(?:launch|execute|perform|carry\s+out)\s+(?:a\s+)?(?:ddos|denial\s+of\s+service|phishing|sql\s+injection|xss|cyber\s*attack)\b/i,
      /\b(?:how\s+(?:to|can\s+i))\s+(?:steal|extract|scrape|dump)\s+(?:personal\s+)?(?:data|credentials|passwords|credit\s+cards?|bank\s+details)\b/i,
      /\b(?:how\s+(?:to|can\s+i))\s+(?:bypass|break|circumvent|defeat)\s+(?:security|encryption|authentication|firewall|2fa|two.factor)\b/i,
    ],
  },

  FINANCIAL_CRIME: {
    label: 'Financial Crime',
    patterns: [
      /\b(?:how\s+(?:to|can\s+i))\s+(?:launder|wash)\s+(?:money|funds|proceeds|cash)\b/i,
      /\b(?:how\s+(?:to|can\s+i))\s+(?:evade|dodge|cheat\s+on|avoid\s+paying)\s+(?:tax|taxes|gst|income\s+tax)\b/i,
      /\b(?:how\s+(?:to|can\s+i))\s+(?:bribe|pay\s+off|grease)\s+(?:a\s+)?(?:judge|officer|official|police|politician|bureaucrat|inspector)\b/i,
      /\b(?:set\s+up|create|run)\s+(?:a\s+)?(?:shell\s+company|ponzi\s+scheme|pyramid\s+scheme|hawala)\s+(?:for|to)\b/i,
      /\b(?:how\s+(?:to|can\s+i))\s+(?:embezzle|misappropriate|siphon)\s+(?:funds?|money|company\s+funds?)\b/i,
      /\b(?:how\s+(?:to|can\s+i))\s+(?:hide|conceal)\s+(?:income|assets?|money|funds?|wealth)\s+(?:from)\s+(?:tax|government|authorities)\b/i,
    ],
  },

  EXPLOITATION: {
    label: 'Exploitation & Trafficking',
    patterns: [
      /\b(?:how\s+(?:to|can\s+i))\s+(?:traffic|smuggle|sell|trade)\s+(?:humans?|people|persons?|children|women|girls?|boys?|organs?)\b/i,
      /\b(?:how\s+(?:to|can\s+i))\s+(?:exploit|abuse|enslave|force)\s+(?:a\s+)?(?:child|minor|worker|labou?rer|person|women)\b/i,
      /\b(?:child)\s+(?:exploitation|pornography|abuse|trafficking)\b/i,
      /\b(?:forced)\s+(?:labour|labor|prostitution|servitude)\b/i,
    ],
  },

  WEAPONS: {
    label: 'Illegal Weapons & Explosives',
    patterns: [
      /\b(?:how\s+(?:to|can\s+i))\s+(?:make|build|construct|assemble|create)\s+(?:a\s+)?(?:bomb|explosive|ied|detonator|grenade|pipe\s+bomb)\b/i,
      /\b(?:how\s+(?:to|can\s+i))\s+(?:get|buy|obtain|acquire|procure)\s+(?:an?\s+)?(?:illegal\s+)?(?:gun|firearm|weapon|pistol|rifle|ak-?47)\s+(?:without|illegally|black\s+market)\b/i,
      /\b(?:how\s+(?:to|can\s+i))\s+(?:make|manufacture|produce)\s+(?:illegal\s+)?(?:weapons|firearms|ammunition|ammo)\b/i,
      /\b(?:how\s+(?:to|can\s+i))\s+(?:smuggle|traffic)\s+(?:weapons|firearms|arms|guns|explosives)\b/i,
    ],
  },

  HARASSMENT: {
    label: 'Harassment & Extortion',
    patterns: [
      /\b(?:how\s+(?:to|can\s+i))\s+(?:stalk|track|follow|monitor)\s+(?:someone|a\s+person|my\s+(?:ex[-\s]?\w*|wife|husband|girlfriend|boyfriend|partner))\s+(?:\w+\s+)*(?:without|secretly|covertly)\b/i,
      /\b(?:how\s+(?:to|can\s+i))\s+(?:blackmail|extort|coerce|threaten)\s+(?:someone|a\s+person|my|him|her|them)\b/i,
      /\b(?:how\s+(?:to|can\s+i))\s+(?:take|get|distribute|share|post|upload)\s+(?:revenge\s+porn|intimate\s+images?|private\s+photos?)\s+(?:without\s+consent|of\s+(?:my|someone|her|him))\b/i,
      /\b(?:how\s+(?:to|can\s+i))\s+(?:intimidate|harass|threaten|terrorize)\s+(?:a\s+)?(?:witness|victim|judge|jury|complainant)\b/i,
    ],
  },

  ILLEGAL_SURVEILLANCE: {
    label: 'Illegal Surveillance',
    patterns: [
      /\b(?:how\s+(?:to|can\s+i))\s+(?:wiretap|tap|bug|record)\s+(?:someone(?:'s)?|a\s+person(?:'s)?|my|his|her|their)\s+(?:phone|calls?|conversations?|house|office|room)\s+(?:without|illegally|secretly)\b/i,
      /\b(?:how\s+(?:to|can\s+i))\s+(?:install|plant|place|hide)\s+(?:a\s+)?(?:spy\s+camera|hidden\s+camera|listening\s+device|tracker|gps\s+tracker)\b[^.?!]*\b(?:without|secretly|covertly)\b/i,
      /\b(?:how\s+(?:to|can\s+i))\s+(?:intercept|read|access)\s+(?:someone(?:'s)?|another\s+person(?:'s)?|my|his|her|their)\s+(?:emails?|messages?|texts?|communications?)\s+(?:without|illegally|secretly)\b/i,
    ],
  },
};

// ─── Text Fields to Scan ─────────────────────────────────────────────────────

const SCANNABLE_FIELDS = ['story', 'message', 'query', 'simulatedText', 'intakeNarrative'];

// ─── Core Detection Function ─────────────────────────────────────────────────

/**
 * Scans text against all threat category patterns.
 * Returns array of matched category keys, or empty array if clean.
 */
const detectThreats = (text) => {
  if (!text || typeof text !== 'string') return [];

  const detected = [];
  for (const [category, { patterns }] of Object.entries(THREAT_CATEGORIES)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        detected.push(category);
        break; // one match per category is enough
      }
    }
  }
  return detected;
};

// ─── Middleware ───────────────────────────────────────────────────────────────

/**
 * Express middleware that screens request body text fields for illegal content.
 * If a threat is detected, returns 403 with a structured warning and logs the incident.
 * If the content is clean, calls next().
 */
const guardrailCheck = (req, res, next) => {
  try {
    const body = req.body || {};
    const allDetected = [];
    const scannedTexts = [];

    for (const field of SCANNABLE_FIELDS) {
      const value = body[field];
      if (value && typeof value === 'string') {
        scannedTexts.push(value);
        const threats = detectThreats(value);
        for (const t of threats) {
          if (!allDetected.includes(t)) {
            allDetected.push(t);
          }
        }
      }
    }

    // Also scan nested fields that some endpoints use
    if (body.variables && typeof body.variables === 'object') {
      for (const val of Object.values(body.variables)) {
        if (val && typeof val === 'string') {
          const threats = detectThreats(val);
          for (const t of threats) {
            if (!allDetected.includes(t)) {
              allDetected.push(t);
            }
          }
        }
      }
    }

    if (allDetected.length === 0) {
      return next();
    }

    // ── Threat detected — build warning response ──────────────────────────
    const incidentId = uuidv4();
    const primaryCategory = allDetected[0];
    const categoryLabel = THREAT_CATEGORIES[primaryCategory]?.label || primaryCategory;

    // Log the blocked request
    logger.warn(
      `[GUARDRAIL BLOCK] IncidentId=${incidentId} | ` +
      `Categories=${allDetected.join(',')} | ` +
      `IP=${req.ip || req.headers['x-forwarded-for'] || 'unknown'} | ` +
      `User=${req.user?.email || req.user?._id || 'anonymous'} | ` +
      `Endpoint=${req.method} ${req.originalUrl}`
    );

    // Attempt async audit log (non-blocking, fire-and-forget)
    try {
      const { recordAuditLog } = require('../services/auditService');
      recordAuditLog({
        user: req.user?._id || null,
        userEmail: req.user?.email || null,
        userRole: req.user?.role || 'ANONYMOUS',
        action: 'GUARDRAIL_BLOCKED',
        resource: 'AI_GUARDRAIL',
        method: req.method,
        endpoint: req.originalUrl,
        statusCode: 403,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
        userAgent: req.get('User-Agent'),
        details: {
          incidentId,
          detectedCategories: allDetected,
          categoryLabels: allDetected.map(c => THREAT_CATEGORIES[c]?.label || c),
        },
      });
    } catch (_auditErr) {
      // Silently catch — audit log failure must not disrupt the guardrail response
    }

    return res.status(403).json({
      success: false,
      message: '⚠️ GUARDRAIL WARNING: Your query has been blocked.',
      guardrailWarning: true,
      warning: {
        code: 'ILLEGAL_CONTENT_DETECTED',
        incidentId,
        category: primaryCategory,
        categoryLabel,
        allCategories: allDetected,
        severity: 'HIGH',
        detail:
          'This platform is exclusively for lawful legal assistance. Queries seeking help ' +
          'with illegal activities, including but not limited to fraud, violence, drug offenses, ' +
          'cybercrime, or any criminal conduct, are strictly prohibited.',
        guidance:
          'If you are a victim of a crime, please describe your situation as a victim seeking ' +
          'legal protection. If you believe this is an error, please rephrase your query to ' +
          'clarify your lawful intent.',
      },
    });
  } catch (err) {
    // Guardrail must never crash the request pipeline — log and let through
    logger.error(`[GUARDRAIL ERROR] Middleware failure: ${err.message}`, err);
    return next();
  }
};

module.exports = {
  guardrailCheck,
  detectThreats,
  THREAT_CATEGORIES,
  SCANNABLE_FIELDS,
};
