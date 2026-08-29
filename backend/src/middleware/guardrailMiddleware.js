/**
 * Pre-Flight Guardrail Middleware
 * Scans incoming user input for Prompt Injection and PII before reaching AI services
 */

const PromptInjectionService = require('../services/guardrails/promptInjectionService');
const PIIService = require('../services/guardrails/piiService');
const { sendError } = require('../utils/apiResponse');
const { logAudit } = require('../services/auditService');

const guardrailMiddleware = (req, res, next) => {
  const textInput = req.body?.story || req.body?.query || req.body?.message || req.body?.content;

  if (textInput && typeof textInput === 'string') {
    // 1. Prompt Injection Scanning
    const injectionCheck = PromptInjectionService.scan(textInput);
    if (injectionCheck.isInjectionDetected) {
      if (req.user) {
        logAudit({
          user: req.user._id,
          userEmail: req.user.email,
          userRole: req.user.role,
          action: 'GUARDRAIL_PROMPT_INJECTION_BLOCKED',
          resource: 'AI_INPUT',
          endpoint: req.originalUrl,
          statusCode: 403,
          details: { violations: injectionCheck.violations },
        });
      }

      return sendError(
        res,
        'Your request was blocked by security guardrails due to prohibited instruction override patterns.',
        403
      );
    }

    // 2. PII Sanitization
    const { sanitizedText, report } = PIIService.redactPII(textInput);
    req.sanitizedInput = sanitizedText;
    req.piiReport = report;
  }

  next();
};

module.exports = {
  guardrailMiddleware,
};
