/**
 * Node.js PII Detection & Redaction Service
 * Detects and masks Aadhaar, PAN, Cards, Phone Numbers, Emails, Bank Details, Passwords
 */

class PIIService {
  static AADHAAR_REGEX = /\b(?<!\d)\d{4}[ -]?\d{4}[ -]?\d{4}(?!\d)\b/g;
  static PAN_REGEX = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/gi;
  static CARD_REGEX = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;
  static PHONE_REGEX = /\b(?:(?:\+91|0)?[ -]?)?[6-9]\d{9}\b/g;
  static EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/gi;
  static IFSC_REGEX = /\b[A-Z]{4}0[A-Z0-9]{6}\b/gi;
  static BANK_ACC_REGEX = /\b(?:a\/c|acc|account(?:\s+no)?)\s*[:#-]?\s*([0-9]{9,18})\b/gi;
  static SECRET_REGEX = /\b(?:otp|password|passcode|secret|pin|cvv)\s*(?:is|:|=)?\s*([A-Za-z0-9@#$%^&*]{3,16})\b/gi;

  static detectPII(text) {
    if (!text || typeof text !== 'string') {
      return { hasPII: false, counts: {}, totalCount: 0 };
    }

    // Match 16-digit cards first to prevent 12-digit subset from being counted as Aadhaar
    const cardMatches = text.match(this.CARD_REGEX) || [];
    const textWithoutCards = text.replace(this.CARD_REGEX, ' ');

    const counts = {
      card: cardMatches.length,
      aadhaar: (textWithoutCards.match(this.AADHAAR_REGEX) || []).length,
      pan: (text.match(this.PAN_REGEX) || []).length,
      phone: (textWithoutCards.match(this.PHONE_REGEX) || []).length,
      email: (text.match(this.EMAIL_REGEX) || []).length,
      bankAccount: (text.match(this.BANK_ACC_REGEX) || []).length,
      ifsc: (text.match(this.IFSC_REGEX) || []).length,
      secret: (text.match(this.SECRET_REGEX) || []).length,
    };

    const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

    return {
      hasPII: totalCount > 0,
      counts,
      totalCount,
    };
  }

  static redactPII(text) {
    if (!text || typeof text !== 'string') {
      return { sanitizedText: text, report: { hasPII: false } };
    }

    const report = this.detectPII(text);
    if (!report.hasPII) {
      return { sanitizedText: text, report };
    }

    let sanitized = text
      .replace(this.CARD_REGEX, '[REDACTED_CARD]')
      .replace(this.PAN_REGEX, '[REDACTED_PAN]')
      .replace(this.AADHAAR_REGEX, '[REDACTED_AADHAAR]')
      .replace(this.EMAIL_REGEX, '[REDACTED_EMAIL]')
      .replace(this.PHONE_REGEX, '[REDACTED_PHONE]')
      .replace(this.BANK_ACC_REGEX, 'account: [REDACTED_BANK_ACC]')
      .replace(this.IFSC_REGEX, '[REDACTED_IFSC]')
      .replace(this.SECRET_REGEX, 'secret: [REDACTED_SECRET]');

    return {
      sanitizedText: sanitized,
      report,
    };
  }

  static maskPII(text) {
    const { sanitizedText } = this.redactPII(text);
    return sanitizedText;
  }
}

module.exports = PIIService;
