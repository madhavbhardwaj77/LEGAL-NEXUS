"""
Output Guardrail Coordinator
Coordinates post-execution safety checks: PII leak prevention, citation verification, claim calibration, statutory version notices, and disclaimers.
"""

from typing import Dict, Any, List, Optional
from .pii_guard import PIIGuard
from .citation_guard import CitationGuard
from .claim_guard import ClaimGuard
from .version_guard import LegalVersionGuard
from .escalation_guard import EscalationGuard
from .audit_logger import audit_logger

class OutputGuard:
    MANDATORY_DISCLAIMER = "⚠️ Legal Nexus is an AI-powered legal access and case navigation system grounded in Indian statutory authority. This output provides legal information and guidance based on Indian statutes and does not constitute professional legal advice."

    def __init__(self, citation_guard: CitationGuard = None):
        self.citation_guard = citation_guard or CitationGuard()

    def process_output(
        self,
        raw_output: str,
        retrieved_sources: List[Dict[str, Any]] = None,
        disputed_amount: float = 0.0,
        domain: str = "General",
        user_id: Optional[str] = None,
        role: str = "GUEST"
    ) -> Dict[str, Any]:
        """
        Executes end-to-end output validation pipeline.
        """
        if not raw_output:
            return {
                "safe_response": "",
                "status": "APPROVED",
                "disclaimer": self.MANDATORY_DISCLAIMER,
                "verification": {"valid": True, "grounding_score": 1.0},
                "pii_sanitized": False,
                "version_alerts": [],
                "escalation": None,
                "audit_id": None
            }

        # 1. PII Leakage Check on Generated Response
        sanitized_text, pii_counts, _ = PIIGuard.redact(raw_output)
        has_pii = sum(pii_counts.values()) > 0
        if has_pii:
            audit_logger.log_event(
                event_type="OUTPUT_PII_REDACTED",
                stage="OUTPUT",
                user_id=user_id,
                role=role,
                details={"pii_counts": pii_counts},
                severity="WARNING"
            )

        # 2. Legal Citation & Statutory Source Verification
        text_with_citations, citation_report = self.citation_guard.verify_citations_in_text(
            sanitized_text,
            retrieved_sources=retrieved_sources
        )
        if not citation_report["valid"]:
            audit_logger.log_event(
                event_type="CITATION_UNVERIFIED_FLAGGED",
                stage="OUTPUT",
                user_id=user_id,
                role=role,
                details={"unverified": citation_report.get("unverified_citations", [])},
                severity="WARNING"
            )
        else:
            audit_logger.log_event(
                event_type="CITATION_VERIFIED",
                stage="OUTPUT",
                user_id=user_id,
                role=role,
                details={"total_verified": citation_report.get("verified_count", 0)},
                severity="INFO"
            )

        # 3. Legal Claim & Excessive Certainty Calibration
        calibrated_text, claim_report = ClaimGuard.audit_and_calibrate(text_with_citations)
        if claim_report.get("calibrated", False):
            audit_logger.log_event(
                event_type="CLAIM_CALIBRATED",
                stage="OUTPUT",
                user_id=user_id,
                role=role,
                details={"flags_count": claim_report.get("flags_count", 0)},
                severity="INFO"
            )

        # 4. Statutory Version & Repealed Law Validation
        annotated_text, version_report = LegalVersionGuard.validate_and_annotate(calibrated_text)
        if version_report.get("has_repealed_references", False):
            audit_logger.log_event(
                event_type="STATUTE_VERSION_ALERT",
                stage="OUTPUT",
                user_id=user_id,
                role=role,
                details={"alerts_count": version_report.get("version_alerts_count", 0)},
                severity="INFO"
            )

        # 5. Human Escalation Evaluation
        grounding_score = citation_report.get("grounding_score", 1.0)
        unverified_claims = [c.get("raw") for c in citation_report.get("unverified_citations", [])]
        
        escalation_package = EscalationGuard.evaluate_escalation(
            grounding_score=grounding_score,
            unverified_claims=unverified_claims,
            domain=domain,
            disputed_amount=disputed_amount
        )

        if escalation_package.get("escalation_required", False):
            audit_logger.log_event(
                event_type="HUMAN_ESCALATION_TRIGGERED",
                stage="OUTPUT",
                user_id=user_id,
                role=role,
                details={"reasons": escalation_package.get("escalation_reasons", [])},
                severity="WARNING"
            )

        # 6. Final Safe Text Assembly with Mandatory Statutory Disclaimer
        final_safe_response = f"{annotated_text.strip()}\n\n---\n*{self.MANDATORY_DISCLAIMER}*"

        # Overall Status Determination
        if not citation_report["valid"]:
            status = "NEEDS_REVIEW"
        elif claim_report.get("calibrated", False) or version_report.get("has_repealed_references", False):
            status = "CALIBRATED_SAFE"
        else:
            status = "APPROVED"

        audit_id = audit_logger.log_event(
            event_type="OUTPUT_GUARDRAIL_PASSED",
            stage="OUTPUT",
            user_id=user_id,
            role=role,
            details={"status": status, "grounding_score": grounding_score},
            severity="INFO"
        )

        return {
            "safe_response": final_safe_response,
            "status": status,
            "grounding_score": grounding_score,
            "verification": citation_report,
            "claim_calibration": claim_report,
            "versioning": version_report,
            "pii_sanitized": has_pii,
            "pii_counts": pii_counts,
            "escalation": escalation_package if escalation_package.get("escalation_required") else None,
            "disclaimer": self.MANDATORY_DISCLAIMER,
            "audit_id": audit_id,
        }
