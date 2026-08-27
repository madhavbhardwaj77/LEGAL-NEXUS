"""
AI Safety, Privacy, and Grounding Service
Enforces strict pre-response checks: Fact Check -> Citation Verification -> Privacy Redaction -> Urgency Evaluation -> Statutory Disclaimers
"""

from typing import Dict, Any, List
from ..agents.privacy import PrivacyAgent
from ..agents.risk import RiskUrgencyAgent
from ..agents.verification import VerificationAgent
from ..schemas.case_schemas import StructuredCaseState

class AISafetyService:
    DISCLAIMER = "⚠️ Nyaya Setu is an AI-powered legal access and case navigation system. This output provides legal information and guidance based on Indian statutes and does not constitute professional legal advice."

    def __init__(self, verification_agent: VerificationAgent = None):
        self.verification_agent = verification_agent or VerificationAgent()

    def audit_and_sanitize_response(
        self,
        raw_response: str,
        case: StructuredCaseState = None,
        research_result: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Runs comprehensive pre-flight safety checks on AI response before delivery to user.
        """
        # 1. PII Redaction Check
        redacted_text, pii_counts = PrivacyAgent.redact_pii(raw_response)
        has_pii = sum(pii_counts.values()) > 0

        # 2. Citation & Fact Verification Check
        verification_report = None
        if case:
            verification_report = self.verification_agent.verify_response_and_case(
                case=case,
                research_result=research_result
            )

        # 3. Urgency Evaluation Check
        urgency_assessment = None
        if case:
            urgency_assessment = RiskUrgencyAgent.evaluate_urgency(case)

        # 4. Attach Mandatory Disclaimer
        safe_response = f"{redacted_text.strip()}\n\n---\n*{self.DISCLAIMER}*"

        return {
            "safeResponse": safe_response,
            "piiSanitized": has_pii,
            "piiCounts": pii_counts,
            "verification": verification_report.model_dump() if verification_report else {"valid": True, "status": "APPROVED"},
            "urgency": urgency_assessment.model_dump() if urgency_assessment else None,
            "disclaimer": self.DISCLAIMER,
            "safetyStatus": "APPROVED" if (not verification_report or verification_report.valid) else "NEEDS_REVIEW",
        }

ai_safety_service = AISafetyService()
