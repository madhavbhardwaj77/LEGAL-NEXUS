"""
Case Classification Agent
Determines legal domain, case type, court jurisdiction, and urgency
"""

from typing import Dict, Any
from ..domain_classifier import LegalDomainClassifier
from ..schemas.case_schemas import IntakeResult

class ClassificationAgent:
    CASE_TYPES = {
        "Employment & Labour Law": "Employment & Labour Dispute",
        "Consumer Protection Law": "Consumer Protection Complaint",
        "Landlord & Tenant / Rental Law": "Tenancy & Eviction Dispute",
        "Cybercrime & Data Privacy": "Cybercrime & Information Technology Offence",
        "Civil Law & Legal Aid": "Civil Property & Injunction Suit",
    }

    @classmethod
    def classify_case(cls, intake_result: IntakeResult) -> Dict[str, Any]:
        domain = intake_result.domain
        case_type = cls.CASE_TYPES.get(domain, "General Civil Case")
        facts = intake_result.extractedFacts
        location = facts.get("location", "Delhi")

        # Initial urgency heuristic
        urgency = "GENERAL_GUIDANCE"
        if facts.get("disputedAmount", 0) > 100000 or intake_result.issue == "Online Financial Cyber Fraud":
            urgency = "URGENT_ASSISTANCE"
        elif "Terminated" in str(facts.get("employmentStatus", "")) or "deposit" in intake_result.issue.lower():
            urgency = "ATTENTION_RECOMMENDED"

        return {
            "domain": domain,
            "caseType": case_type,
            "issue": intake_result.issue,
            "jurisdiction": location,
            "urgency": urgency,
            "missingInformation": intake_result.missingFields,
        }
