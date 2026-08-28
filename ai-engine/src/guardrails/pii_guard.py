"""
PII Detection & Redaction Guardrail
Detects, isolates, and anonymizes sensitive personal identifiers (Aadhaar, PAN, Cards, Phone, Email, OTP, Bank Accounts, Passports)
"""

import re
from typing import Tuple, Dict, Any, List

class PIIGuard:
    # Regex Patterns for Indian & Global Identifiers
    PATTERNS = {
        "card": r"\b(?:\d{4}[ -]?){3}\d{4}\b",
        "pan": r"\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b",
        "aadhaar": r"\b(?<!\d)\d{4}[ -]?\d{4}[ -]?\d{4}(?!\d)\b",
        "phone": r"\b(?:\+91[\s-]?)?[6789]\d{9}\b",
        "email": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
        "otp": r"\b(?:otp|password|pin|cvv|secret)\s*(?:is|:|=)?\s*([0-9A-Za-z]{3,8})\b",
        "passport": r"\b[A-Z][0-9]{7}\b",
        "bank_account": r"\b(?:a/c|account\s*(?:no|number)?)\s*[:#-]?\s*([0-9]{9,18})\b",
    }

    @classmethod
    def redact(cls, text: str) -> Tuple[str, Dict[str, int], Dict[str, List[str]]]:
        """
        Scans input text for sensitive PII and replaces instances with standardized redaction tokens.
        Returns:
            - sanitized_text: Text with tokens replacing PII
            - counts: Dictionary of detection counts per category
            - tokens_found: Masked / hashed references of detected items (without full raw values)
        """
        if not text:
            return "", {}, {}

        redacted = text
        counts = {
            "aadhaar": 0,
            "pan": 0,
            "card": 0,
            "phone": 0,
            "email": 0,
            "otp": 0,
            "passport": 0,
            "bank_account": 0,
        }
        detected_categories = {}

        # 1. Credit / Debit Cards (16-digit first to prevent 12-digit subset match)
        card_matches = re.findall(cls.PATTERNS["card"], redacted)
        if card_matches:
            counts["card"] = len(card_matches)
            detected_categories["card"] = [f"****-****-****-{m.replace(' ', '').replace('-', '')[-4:]}" for m in card_matches]
            redacted = re.sub(cls.PATTERNS["card"], "[REDACTED_CARD]", redacted)

        # 2. PAN Card
        pan_matches = re.findall(cls.PATTERNS["pan"], redacted, flags=re.IGNORECASE)
        if pan_matches:
            counts["pan"] = len(pan_matches)
            detected_categories["pan"] = [f"{m[:2]}***{m[-2:]}" for m in pan_matches]
            redacted = re.sub(cls.PATTERNS["pan"], "[REDACTED_PAN]", redacted, flags=re.IGNORECASE)

        # 3. Aadhaar Number (12 digits)
        aadhaar_matches = re.findall(cls.PATTERNS["aadhaar"], redacted)
        if aadhaar_matches:
            counts["aadhaar"] = len(aadhaar_matches)
            detected_categories["aadhaar"] = [f"XXXX-XXXX-{m.replace(' ', '').replace('-', '')[-4:]}" for m in aadhaar_matches]
            redacted = re.sub(cls.PATTERNS["aadhaar"], "[REDACTED_AADHAAR]", redacted)

        # 4. Bank Account Number
        bank_matches = re.findall(cls.PATTERNS["bank_account"], redacted, flags=re.IGNORECASE)
        if bank_matches:
            counts["bank_account"] = len(bank_matches)
            detected_categories["bank_account"] = [f"A/C Ending in ***{m[-4:]}" for m in bank_matches]
            redacted = re.sub(cls.PATTERNS["bank_account"], "A/C: [REDACTED_BANK_ACCOUNT]", redacted, flags=re.IGNORECASE)

        # 5. OTP / Passwords / PINs
        otp_matches = re.findall(cls.PATTERNS["otp"], redacted, flags=re.IGNORECASE)
        if otp_matches:
            counts["otp"] = len(otp_matches)
            detected_categories["otp"] = ["[SECRET_TOKEN]"] * len(otp_matches)
            redacted = re.sub(cls.PATTERNS["otp"], "otp/pin: [REDACTED_SECRET]", redacted, flags=re.IGNORECASE)

        # 6. Passport
        passport_matches = re.findall(cls.PATTERNS["passport"], redacted)
        if passport_matches:
            counts["passport"] = len(passport_matches)
            detected_categories["passport"] = [f"{m[0]}******{m[-1]}" for m in passport_matches]
            redacted = re.sub(cls.PATTERNS["passport"], "[REDACTED_PASSPORT]", redacted)

        # 7. Indian Mobile / Phone Numbers
        phone_matches = re.findall(cls.PATTERNS["phone"], redacted)
        if phone_matches:
            counts["phone"] = len(phone_matches)
            detected_categories["phone"] = [f"******{m[-4:]}" for m in phone_matches]
            redacted = re.sub(cls.PATTERNS["phone"], "[REDACTED_PHONE]", redacted)

        # 8. Email Addresses
        email_matches = re.findall(cls.PATTERNS["email"], redacted)
        if email_matches:
            counts["email"] = len(email_matches)
            detected_categories["email"] = [f"{m.split('@')[0][:2]}***@{m.split('@')[1]}" for m in email_matches]
            redacted = re.sub(cls.PATTERNS["email"], "[REDACTED_EMAIL]", redacted)

        return redacted, counts, detected_categories

    @classmethod
    def contains_pii(cls, text: str) -> bool:
        _, counts, _ = cls.redact(text)
        return sum(counts.values()) > 0
