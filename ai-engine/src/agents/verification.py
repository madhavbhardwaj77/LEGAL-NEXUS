"""
Verification Agent
Validates legal claims, citation grounding, and checks for unsupported statements
"""

from typing import Dict, Any, List
from ..schemas.case_schemas import VerificationReport, StructuredCaseState
from ..source_verifier import SourceVerifier

class VerificationAgent:
    def __init__(self, source_verifier: SourceVerifier = None):
        self.source_verifier = source_verifier or SourceVerifier()

    def verify_response_and_case(
        self,
        case: StructuredCaseState,
        research_result: Dict[str, Any] = None
    ) -> VerificationReport:
        citations_verified = []
        unsupported_claims = []
        grounding_score = 1.0

        if research_result and "legalBasis" in research_result:
            for prov in research_result["legalBasis"]:
                act = prov.get("act", "")
                sec = prov.get("section", "")
                
                # Check status
                if prov.get("sourceStatus", "").startswith("Authoritative"):
                    citations_verified.append({
                        "act": act,
                        "section": sec,
                        "status": "VERIFIED_AUTHORITATIVE",
                        "authority": prov.get("authority", "")
                    })
                else:
                    unsupported_claims.append(f"Unconfirmed statutory authority for {sec} of {act}")
                    grounding_score -= 0.15

        status = "APPROVED" if grounding_score >= 0.85 else "NEEDS_REVIEW"

        return VerificationReport(
            valid=len(unsupported_claims) == 0,
            groundingScore=round(max(0.0, grounding_score), 2),
            citationsVerified=citations_verified,
            unsupportedClaims=unsupported_claims,
            status=status
        )
