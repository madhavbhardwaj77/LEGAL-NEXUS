"""
Legal Domain Classifier & Query Intent Analyzer
Supports English, Hindi, and Hinglish query understanding
"""

import re
from typing import Dict, List, Tuple

class LegalDomainClassifier:
    DOMAINS = {
        "EMPLOYMENT": "Employment & Labour Law",
        "CONSUMER": "Consumer Protection Law",
        "TENANCY": "Landlord & Tenant / Rental Law",
        "CYBERCRIME": "Cybercrime & Data Privacy",
        "CIVIL_LEGAL_AID": "Civil Law & Legal Aid",
    }

    # Multilingual Keyword Map with compound priority
    DOMAIN_KEYWORDS = {
        "TENANCY": [
            "makan malik", "मकान मालिक", "landlord", "tenant", "tenancy", "rent", "rental",
            "security deposit", "deposit refund", "lease agreement", "evict", "eviction",
            "ghar se nikal", "घर से निकाल", "bijli kat", "बिजली काट", "pani band", "पानी बंद",
            "arbitrary eviction", "flat khali", "kamra", "room rent", "rent authority", "notice to quit",
            "किरायेदार", "किराया", "सिक्योरिटी डिपॉजिट", "जमानत राशि", "बेदखल"
        ],
        "EMPLOYMENT": [
            "unpaid salary", "withholding wages", "delayed salary", "salary", "wage", "wages",
            "employer", "employee", "boss", "terminate", "wrongful termination", "fired",
            "retrenchment", "severance", "bonus", "overtime", "gratuity", "provident fund",
            "maternity leave", "pregnant employee", "workplace harassment", "posh act",
            "full and final", "fnf", "pension",
            # Hindi
            "वेतन", "मजदूरी", "तनख्वाह", "नौकरी से निकाला", "नौकरी", "मातृत्व लाभ", "ग्रेच्युटी",
            # Hinglish
            "tankhwah", "naukri", "vetan", "salary nahi aayi", "salary nahi mila", "company ne nikal diya"
        ],
        "CONSUMER": [
            "consumer", "product", "goods", "service", "defective", "warranty", "guarantee",
            "refund", "replacement", "e-commerce", "ecommerce", "amazon", "flipkart",
            "delivery", "fake product", "counterfeit", "misleading ad", "unfair trade", "deficiency in service",
            "e-daakhil", "helpline 1915", "nch", "district commission", "consumer court",
            # Hindi
            "उपभोक्ता", "ग्राहक", "सामान खराब", "रिफंड", "वारंटी", "नकली सामान", "सेवा में कमी", "उपभोक्ता फोरम",
            # Hinglish
            "saman kharab", "paise wapas", "order cancel", "kharab service", "grahak"
        ],
        "CYBERCRIME": [
            "cyber", "hacked", "hacking", "otp", "phishing", "scam", "fraud", "online fraud",
            "bank fraud", "upi fraud", "paytm", "gpay", "phonepe", "identity theft", "cloned sim",
            "blackmail", "obscene message", "fake profile", "sim swap", "data breach", "privacy leak",
            "1930 helpline", "cybercrime portal", "cfcfrms",
            # Hindi
            "साइबर", "हैक", "धोखाधड़ी", "ऑनलाइन ठगी", "ओटीपी फ्रॉड", "बैंक फ्रॉड", "पैसे कट गए", "अश्लील मैसेज", "ब्लैकमेल",
            # Hinglish
            "paise kat gaye", "online thagi", "fake call", "kyc fraud", "otp le liya", "bank se paise gayab"
        ],
        "CIVIL_LEGAL_AID": [
            "property dispute", "illegal dispossession", "land encroachment", "plot", "stay order",
            "perpetual injunction", "encroachment", "contract breach", "specific performance",
            "limitation period", "time barred suit", "free legal aid", "free lawyer", "nalsa",
            "dlsa", "lok adalat", "court fee refund",
            # Hindi
            "जमीन विवाद", "अवैध कब्जा", "स्टे ऑर्डर", "मुफ्त वकील", "कानूनी सहायता", "समझौता", "लोक अदालत",
            # Hinglish
            "kabza", "zameen", "stay order", "muft vakil", "free aid", "kanooni sahayata"
        ]
    }

    @classmethod
    def classify_domain(cls, query: str) -> Tuple[str, float, List[str]]:
        if not query:
            return cls.DOMAINS["CIVIL_LEGAL_AID"], 0.0, []

        query_lower = query.lower()
        scores = {}
        matched_tags = {}

        for domain_code, keywords in cls.DOMAIN_KEYWORDS.items():
            score = 0
            matched = []
            for kw in keywords:
                kw_lower = kw.lower()
                if kw_lower in query_lower:
                    # Multi-word or specific terms get significantly higher weight
                    weight = len(kw.split()) * 4 + (2 if len(kw) > 6 else 1)
                    score += weight
                    matched.append(kw)
            scores[domain_code] = score
            matched_tags[domain_code] = matched

        # Find highest scoring domain
        best_code = max(scores, key=scores.get)
        best_score = scores[best_code]

        if best_score == 0:
            # Fallback default
            return "General Legal Inquiry", 0.3, []

        total_score = sum(scores.values()) or 1
        confidence = min(0.98, 0.4 + (best_score / total_score) * 0.58)

        return cls.DOMAINS[best_code], confidence, matched_tags[best_code]
