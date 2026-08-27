"""
Document Classification Service
Classifies legal documents into 8 categories with confidence estimation
"""

import re
from typing import Dict, Any, Tuple

class DocumentClassifier:
    DOC_TYPES = {
        "EMPLOYMENT": "employment_agreement",
        "RENTAL": "rental_agreement",
        "LEGAL_NOTICE": "legal_notice",
        "CONSUMER": "consumer_complaint",
        "COURT_DOC": "court_document",
        "GOVT_NOTICE": "government_notice",
        "FIR": "fir",
        "CONTRACT": "general_contract",
    }

    PATTERNS = {
        "EMPLOYMENT": [
            r"employment agreement", r"offer letter", r"appointment letter", r"employment contract",
            r"employer and employee", r"salary per annum", r"ctc", r"probation period",
            r"termination of employment", r"employee handbook"
        ],
        "RENTAL": [
            r"rent agreement", r"tenancy agreement", r"lease agreement", r"lessor and lessee",
            r"landlord and tenant", r"security deposit", r"monthly rent", r"premises let out",
            r"demised premises", r"fixtures and fittings"
        ],
        "LEGAL_NOTICE": [
            r"legal notice", r"statutory demand notice", r"notice under section", r"advocate on behalf of",
            r"called upon to pay", r"failing which legal proceedings", r"notice to quit"
        ],
        "CONSUMER": [
            r"consumer complaint", r"district consumer disputes", r"state consumer commission",
            r"deficiency of service", r"unfair trade practice", r"opposite party", r"consumer forum"
        ],
        "COURT_DOC": [
            r"in the high court of", r"in the supreme court of india", r"in the court of district judge",
            r"civil suit no", r"plaintiff vs defendant", r"affidavit", r"vakalatnama", r"written statement"
        ],
        "GOVT_NOTICE": [
            r"show cause notice", r"ministry of", r"department of revenue", r"municipal corporation",
            r"government of india", r"gazette notification"
        ],
        "FIR": [
            r"first information report", r"fir no", r"police station", r"under section 154 crpc",
            r"cognizable offence", r"complainant details", r"investigating officer"
        ],
        "CONTRACT": [
            r"service level agreement", r"memorandum of understanding", r"mou", r"non-disclosure agreement",
            r"nda", r"master service agreement", r"independent contractor"
        ]
    }

    @classmethod
    def classify_document(cls, text: str) -> Dict[str, Any]:
        if not text:
            return {"documentType": "other", "confidence": 0.0, "categoryLabel": "Other Document"}

        text_lower = text.lower()
        scores = {}

        for doc_key, patterns in cls.PATTERNS.items():
            score = 0
            for pat in patterns:
                matches = len(re.findall(pat, text_lower))
                score += matches * 2.0
            scores[doc_key] = score

        best_key = max(scores, key=scores.get)
        best_score = scores[best_key]

        if best_score == 0:
            return {
                "documentType": "general_contract",
                "confidence": 0.40,
                "categoryLabel": "General Contract / Legal Document"
            }

        total_score = sum(scores.values()) or 1
        confidence = min(0.98, 0.55 + (best_score / total_score) * 0.43)

        doc_type_code = cls.DOC_TYPES[best_key]
        category_label = doc_type_code.replace("_", " ").title()

        return {
            "documentType": doc_type_code,
            "confidence": round(confidence, 2),
            "categoryLabel": category_label,
        }
