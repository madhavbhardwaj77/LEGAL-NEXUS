/**
 * Node.js Prompt Injection Detection Service
 * Protects API gateway against jailbreak attempts and system instruction manipulation
 */

class PromptInjectionService {
  static PATTERNS = [
    /ignore\s+(?:all\s+)?(?:previous|prior|above|system)\s+(?:instructions|prompts|rules|commands)/i,
    /disregard\s+(?:all\s+)?(?:previous|prior|system)\s+(?:directives|rules|guidelines)/i,
    /forget\s+(?:everything|all\s+previous\s+instructions|your\s+role)/i,
    /override\s+(?:system|safety|guardrail|security)\s+(?:rules|prompts|settings)/i,
    /new\s+system\s+prompt\s*:/i,
    /reveal\s+(?:your\s+)?(?:system\s+prompt|initial\s+prompt|hidden\s+instructions)/i,
    /(?:show|list|dump|give)\s+(?:me\s+)?(?:all\s+)?(?:other\s+)?users?'?\s+(?:cases?|data|files?)/i,
    /bypass\s+(?:case\s+access|authorization|permissions|ownership)/i,
    /ignore\s+(?:the\s+)?(?:legal\s+sources|statutes|official\s+gazette|acts|laws)/i,
  ];

  static scan(text) {
    if (!text || typeof text !== 'string') {
      return { isInjectionDetected: false, violations: [] };
    }

    const violations = [];
    for (const pattern of this.PATTERNS) {
      if (pattern.test(text)) {
        violations.push(`Prompt injection attempt matching: ${pattern.toString()}`);
      }
    }

    return {
      isInjectionDetected: violations.length > 0,
      violations,
    };
  }
}

module.exports = PromptInjectionService;
