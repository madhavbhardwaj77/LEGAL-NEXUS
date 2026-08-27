"""
Privacy & PII Redaction Agent
Detects and masks Credit Cards, Aadhaar numbers, PAN, Passwords, and sensitive identifiers
"""

import re
from typing import Tuple, Dict, Any

class PrivacyAgent:
    @staticmethod
    def redact_pii(text: str) -> Tuple[str, Dict[str, int]]:
        if not text:
            return "", {}

        redacted = text
        counts = {"aadhaar": 0, "pan": 0, "card": 0, "phone": 0, "password": 0}

        # 1. 16-digit credit/debit card numbers (Match 16 digits first before 12-digit Aadhaar)
        card_pattern = r"\b(?:\d{4}[ -]?){3}\d{4}\b"
        card_matches = re.findall(card_pattern, redacted)
        if card_matches:
            counts["card"] = len(card_matches)
            redacted = re.sub(card_pattern, "[REDACTED_CARD]", redacted)

        # 2. Indian PAN Card (5 letters, 4 digits, 1 letter: e.g. ABCDE1234F)
        pan_pattern = r"\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b"
        pan_matches = re.findall(pan_pattern, redacted, flags=re.IGNORECASE)
        if pan_matches:
            counts["pan"] = len(pan_matches)
            redacted = re.sub(pan_pattern, "[REDACTED_PAN]", redacted)

        # 3. Aadhaar (Exactly 12 digits with spaces/hyphens)
        aadhaar_pattern = r"\b(?<!\d)\d{4}[ -]?\d{4}[ -]?\d{4}(?!\d)\b"
        aadhaar_matches = re.findall(aadhaar_pattern, redacted)
        if aadhaar_matches:
            counts["aadhaar"] = len(aadhaar_matches)
            redacted = re.sub(aadhaar_pattern, "[REDACTED_AADHAAR]", redacted)

        # 4. Passwords / OTP mentions
        otp_pattern = r"\b(?:otp|password|pin)\s*(?:is|:)?\s*([0-9]{4,8})\b"
        otp_matches = re.findall(otp_pattern, redacted, flags=re.IGNORECASE)
        if otp_matches:
            counts["password"] = len(otp_matches)
            redacted = re.sub(otp_pattern, r"otp/pin: [REDACTED_SECRET]", redacted, flags=re.IGNORECASE)

        return redacted, counts
