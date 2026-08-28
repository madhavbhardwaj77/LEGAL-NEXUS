"""
AI Safety, Privacy, and Grounding Service
Delegates to the Centralized Guardrail Layer: Fact Check -> Citation Verification -> Privacy Redaction -> Urgency Evaluation -> Statutory Disclaimers
"""

import re
from typing import Dict, Any, List, Tuple
from ..agents.verification import VerificationAgent
from ..schemas.case_schemas import StructuredCaseState
from ..guardrails.manager import guardrail_manager

class AISafetyService:
    DISCLAIMER = "⚠️ Legal Nexus is an AI-powered legal access and case navigation system. This output provides legal information and guidance based on Indian statutes and does not constitute professional legal advice."

    def __init__(self, verification_agent: VerificationAgent = None):
        self.verification_agent = verification_agent or VerificationAgent()
        self.guardrails = guardrail_manager

    def verify_text_citations(self, text: str) -> Tuple[str, List[Dict[str, Any]], bool]:
        """
        Parses text for citations and cross-references them against the statutory database using CitationGuard.
        """
        modified_text, report = self.guardrails.citation_guard.verify_citations_in_text(text)
        unsupported = [
            {"act": c["act"], "section": c["section"], "status": "UNVERIFIED_FABRICATED"}
            for c in report.get("unverified_citations", [])
        ]
        has_fabricated = len(unsupported) > 0
        return modified_text, unsupported, has_fabricated

    def audit_and_sanitize_response(
        self,
        raw_response: str,
        case: StructuredCaseState = None,
        research_result: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Runs comprehensive pre-flight safety checks on AI response through GuardrailManager.
        """
        sources = research_result.get("legalBasis", []) if research_result else []
        disputed_amount = case.financialDetails.get("disputedAmount", 0.0) if case and hasattr(case, 'financialDetails') else 0.0
        domain = case.category if case and hasattr(case, 'category') else "General"

        # Execute centralized output guardrail pipeline
        guard_res = self.guardrails.process_output(
            raw_output=raw_response,
            retrieved_sources=sources,
            disputed_amount=disputed_amount,
            domain=domain
        )

        # Verification report
        verification_report = None
        if case:
            verification_report = self.verification_agent.verify_response_and_case(
                case=case,
                research_result=research_result
            )
            if not guard_res["verification"]["valid"]:
                verification_report.valid = False
                verification_report.status = "NEEDS_REVIEW"
                if not hasattr(verification_report, 'unsupportedClaims') or verification_report.unsupportedClaims is None:
                    verification_report.unsupportedClaims = []
                for fc in guard_res["verification"].get("unverified_citations", []):
                    msg = f"Fabricated statutory citation: {fc.get('section')} of {fc.get('act')}"
                    if msg not in verification_report.unsupportedClaims:
                        verification_report.unsupportedClaims.append(msg)
                verification_report.groundingScore = max(0.0, round(verification_report.groundingScore - 0.3, 2))

        # Urgency check
        urgency_assessment = None
        if case:
            from ..agents.risk import RiskUrgencyAgent
            urgency_assessment = RiskUrgencyAgent.evaluate_urgency(case)

        return {
            "safeResponse": guard_res["safe_response"],
            "piiSanitized": guard_res["pii_sanitized"],
            "piiCounts": guard_res["pii_counts"],
            "verification": verification_report.model_dump() if verification_report else guard_res["verification"],
            "urgency": urgency_assessment.model_dump() if urgency_assessment else None,
            "disclaimer": self.DISCLAIMER,
            "safetyStatus": "APPROVED" if guard_res["status"] == "APPROVED" and (not verification_report or verification_report.valid) else "NEEDS_REVIEW",
            "guardrailAuditId": guard_res.get("audit_id"),
            "guardrailSummary": {
                "groundingScore": guard_res.get("grounding_score"),
                "calibrated": guard_res.get("claim_calibration", {}).get("calibrated", False),
                "versionAlerts": guard_res.get("versioning", {}).get("version_alerts_count", 0),
                "escalation": guard_res.get("escalation")
            }
        }

ai_safety_service = AISafetyService()
