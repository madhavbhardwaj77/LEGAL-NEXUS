"""
AI Safety, Privacy, and Grounding Service
Enforces strict pre-response checks: Fact Check -> Citation Verification -> Privacy Redaction -> Urgency Evaluation -> Statutory Disclaimers
"""

import re
from typing import Dict, Any, List, Tuple
from ..agents.privacy import PrivacyAgent
from ..agents.risk import RiskUrgencyAgent
from ..agents.verification import VerificationAgent
from ..schemas.case_schemas import StructuredCaseState

class AISafetyService:
    DISCLAIMER = "⚠️ Legal Nexus is an AI-powered legal access and case navigation system. This output provides legal information and guidance based on Indian statutes and does not constitute professional legal advice."

    def __init__(self, verification_agent: VerificationAgent = None):
        self.verification_agent = verification_agent or VerificationAgent()

    def verify_text_citations(self, text: str) -> Tuple[str, List[Dict[str, Any]], bool]:
        """
        Parses text for citations (e.g., Section 15 of the Payment of Wages Act)
        and cross-references them against the statutory database.
        """
        # Match patterns like: Section X of the Y Act
        pattern = r"(?:Section|Sec\.)\s+([0-9A-Za-z\(\)]+)\s+(?:of\s+the\s+|of\s+)?([A-Za-z\s&,]+Act(?:,\s+\d{4})?)"
        matches = list(re.finditer(pattern, text, re.IGNORECASE))
        
        has_fabricated = False
        unsupported = []
        modified_text = text
        
        for m in matches:
            full_match_text = m.group(0)
            sec = m.group(1).strip()
            act = m.group(2).strip()
            
            verifier = self.verification_agent.source_verifier
            # Check Section X
            verification = verifier.verify_citation(act=act, section=f"Section {sec}")
            if not verification.get("valid", False):
                # Fallback to check just X
                verification = verifier.verify_citation(act=act, section=sec)
                
            if not verification.get("valid", False):
                has_fabricated = True
                unsupported.append({
                    "act": act,
                    "section": sec,
                    "status": "UNVERIFIED_FABRICATED"
                })
                # Handle uncertainty by substituting text with an unverified placeholder
                modified_text = modified_text.replace(
                    full_match_text,
                    f"[Unverified Statutory Citation: Section {sec} of {act}]"
                )
                
        return modified_text, unsupported, has_fabricated

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

        # 2. Extract & verify explicit citations from response
        sanitized_text, fabricated_citations, has_fabricated = self.verify_text_citations(redacted_text)

        # 3. Citation & Fact Verification Check
        verification_report = None
        if case:
            verification_report = self.verification_agent.verify_response_and_case(
                case=case,
                research_result=research_result
            )
            
            # Incorporate text-based fabricated citation findings
            if has_fabricated:
                verification_report.valid = False
                verification_report.status = "NEEDS_REVIEW"
                if not hasattr(verification_report, 'unsupportedClaims') or verification_report.unsupportedClaims is None:
                    verification_report.unsupportedClaims = []
                for fc in fabricated_citations:
                    msg = f"Fabricated statutory citation: Section {fc['section']} of {fc['act']}"
                    if msg not in verification_report.unsupportedClaims:
                        verification_report.unsupportedClaims.append(msg)
                verification_report.groundingScore = max(0.0, round(verification_report.groundingScore - 0.3, 2))

        # 4. Urgency Evaluation Check
        urgency_assessment = None
        if case:
            urgency_assessment = RiskUrgencyAgent.evaluate_urgency(case)

        # 5. Attach Mandatory Disclaimer
        safe_response = f"{sanitized_text.strip()}\n\n---\n*{self.DISCLAIMER}*"

        return {
            "safeResponse": safe_response,
            "piiSanitized": has_pii,
            "piiCounts": pii_counts,
            "verification": verification_report.model_dump() if verification_report else {"valid": not has_fabricated, "status": "NEEDS_REVIEW" if has_fabricated else "APPROVED"},
            "urgency": urgency_assessment.model_dump() if urgency_assessment else None,
            "disclaimer": self.DISCLAIMER,
            "safetyStatus": "APPROVED" if (not has_fabricated and (not verification_report or verification_report.valid)) else "NEEDS_REVIEW",
        }

ai_safety_service = AISafetyService()
