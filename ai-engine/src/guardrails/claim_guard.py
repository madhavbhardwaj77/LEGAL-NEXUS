"""
Legal Claim Validation & Excessive Certainty Guardrail
Detects and modulates unsupported claims, guaranteed legal outcomes, and reckless certainty into legally prudent language.
"""

import re
from typing import Dict, Any, Tuple, List

class ClaimGuard:
    # Phrases expressing reckless certainty or guaranteed legal victory
    CERTAINTY_PATTERNS = [
        (r"(?i)\b(?:100%\s*(?:win|victory|guaranteed|success)|guaranteed\s+(?:win|victory|success|verdict)|you\s+will\s+(?:100%|definitely|certainly)\s+win|cannot\s+lose)\b",
         "Under Indian jurisprudence, outcome is subject to evidentiary proof and judicial determination; there is a strong statutory basis to assert this claim."),
        
        (r"(?i)\b(?:the\s+judge\s+will\s+(?:definitely|certainly|surely)\s+rule|court\s+will\s+100%\s+order)\b",
         "The competent Court/Tribunal possesses statutory authority to evaluate the evidence and order appropriate relief."),
        
        (r"(?i)\b(?:opposite\s+party\s+will\s+(?:definitely|surely)\s+go\s+to\s+jail|immediate\s+arrest\s+is\s+guaranteed)\b",
         "The alleged actions constitute non-bailable/cognizable offences where legal recourse includes filing an FIR or complaint for investigation by authorities."),
        
        (r"(?i)\b(?:you\s+do\s+not\s+need\s+a\s+lawyer|no\s+need\s+for\s+legal\s+counsel\s+whatsoever)\b",
         "While pre-litigation notices and consumer e-Daakhil filings can be initiated in person, professional advocate consultation is recommended for contested litigation."),
        
        (r"(?i)\b(?:there\s+is\s+zero\s+risk|completely\s+risk-free\s+litigation)\b",
         "All legal proceedings involve procedural timelines and evidentiary considerations."),
    ]

    @classmethod
    def audit_and_calibrate(cls, text: str) -> Tuple[str, Dict[str, Any]]:
        """
        Scans AI output for excessive certainty and replaces hyperbolic assertions with legally grounded phrasing.
        """
        if not text:
            return "", {"valid": True, "flags_count": 0, "calibrated": False}

        modified_text = text
        detected_flags = []

        for pattern, replacement in cls.CERTAINTY_PATTERNS:
            matches = list(re.finditer(pattern, modified_text))
            if matches:
                for m in matches:
                    detected_flags.append({
                        "phrase": m.group(0),
                        "suggested_calibration": replacement
                    })
                    modified_text = modified_text.replace(m.group(0), replacement)

        has_flags = len(detected_flags) > 0

        report = {
            "valid": not has_flags,
            "flags_count": len(detected_flags),
            "calibrated": has_flags,
            "detected_claims": detected_flags,
            "status": "APPROVED" if not has_flags else "CALIBRATED_FOR_LEGAL_PRUDENCE"
        }

        return modified_text, report
