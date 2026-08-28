"""
Centralized Guardrail Manager
Unifies Input Guardrails (Harm & Safety Refusal, PII, Prompt Injection, Permissions, Risk) and Output Guardrails (Citation Grounding, Claim Calibration, Version Currency, Escalation, Audit Logging).
"""

from typing import Dict, Any, List, Optional
from .harm_guard import HarmGuard
from .pii_guard import PIIGuard
from .injection_guard import InjectionGuard
from .citation_guard import CitationGuard
from .claim_guard import ClaimGuard
from .version_guard import LegalVersionGuard
from .risk_guard import RiskGuard
from .permission_guard import PermissionGuard
from .escalation_guard import EscalationGuard
from .output_guard import OutputGuard
from .audit_logger import audit_logger

class GuardrailManager:
    def __init__(self):
        self.harm_guard = HarmGuard()
        self.pii_guard = PIIGuard()
        self.injection_guard = InjectionGuard()
        self.citation_guard = CitationGuard()
        self.claim_guard = ClaimGuard()
        self.version_guard = LegalVersionGuard()
        self.risk_guard = RiskGuard()
        self.permission_guard = PermissionGuard()
        self.escalation_guard = EscalationGuard()
        self.output_guard = OutputGuard(citation_guard=self.citation_guard)
        self.audit_logger = audit_logger

    def process_input(
        self,
        input_text: str,
        role: str = "CITIZEN",
        user_id: Optional[str] = None,
        tool_name: str = "PUBLIC_LEGAL_RESEARCH",
        resource_owner_id: Optional[str] = None,
        financial_amount: float = 0.0
    ) -> Dict[str, Any]:
        """
        Executes Input Guardrail Pipeline:
        1. Violent Crime & Harmful Intent Safety Refusal Check
        2. Role & Permission Authorization
        3. Prompt Injection & Adversarial Payload Detection / Neutralization
        4. PII Detection & Anonymization
        5. Emergency Risk & Urgency Evaluation
        6. Privacy-Preserving Audit Logging
        """
        if not input_text:
            return {
                "passed": True,
                "sanitized_text": "",
                "blocked": False,
                "pii_detected": False,
                "injection_detected": False,
                "urgency": {"urgency_level": "GENERAL_GUIDANCE", "is_emergency": False},
                "status": "APPROVED",
                "audit_id": None
            }

        # 1. Harm & Violent Crime / Self-Harm Refusal Check
        harm_result = self.harm_guard.inspect(input_text)
        if harm_result["should_block"]:
            audit_id = self.audit_logger.log_event(
                event_type="HARMFUL_INTENT_BLOCKED",
                stage="INPUT",
                user_id=user_id,
                role=role,
                details={"category": harm_result["category"]},
                severity="CRITICAL"
            )
            return {
                "passed": False,
                "blocked": True,
                "sanitized_text": "[BLOCKED_HARMFUL_INTENT]",
                "error_message": harm_result["refusal_message"],
                "harm_detected": True,
                "category": harm_result["category"],
                "status": "BLOCKED_HARMFUL_INTENT",
                "audit_id": audit_id
            }

        # 2. Role & Permission Check
        perm_check = self.permission_guard.validate_access(
            role=role,
            tool_name=tool_name,
            resource_owner_id=resource_owner_id,
            requesting_user_id=user_id
        )
        if not perm_check["authorized"]:
            audit_id = self.audit_logger.log_event(
                event_type="UNAUTHORIZED_ACCESS_BLOCKED",
                stage="ACCESS",
                user_id=user_id,
                role=role,
                details={"tool": tool_name, "reason": perm_check["reason"]},
                severity="WARNING"
            )
            return {
                "passed": False,
                "blocked": True,
                "sanitized_text": "[ACCESS_DENIED_UNAUTHORIZED_ROLE]",
                "error_message": perm_check["reason"],
                "status": "FORBIDDEN",
                "audit_id": audit_id
            }

        # 3. Prompt Injection & Jailbreak Check
        injection_result = self.injection_guard.inspect_and_sanitize(input_text)
        if injection_result["should_block"]:
            audit_id = self.audit_logger.log_event(
                event_type="PROMPT_INJECTION_BLOCKED",
                stage="INPUT",
                user_id=user_id,
                role=role,
                details={"attack_types": injection_result["attack_types"], "confidence": injection_result["confidence"]},
                severity="CRITICAL"
            )
            return {
                "passed": False,
                "blocked": True,
                "sanitized_text": "[PROMPT_INJECTION_BLOCKED]",
                "error_message": "⚠️ Security Alert: Input blocked by Legal Nexus Guardrail Layer. Adversarial prompt injection or system override directive detected.",
                "injection_detected": True,
                "attack_types": injection_result["attack_types"],
                "status": "BLOCKED_ADVERSARIAL_INJECTION",
                "audit_id": audit_id
            }

        text_after_injection = injection_result["sanitized_text"]
        if injection_result["is_injected"]:
            self.audit_logger.log_event(
                event_type="PROMPT_INJECTION_NEUTRALIZED",
                stage="INPUT",
                user_id=user_id,
                role=role,
                details={"attack_types": injection_result["attack_types"]},
                severity="WARNING"
            )

        # 4. PII Redaction
        redacted_text, pii_counts, tokens = self.pii_guard.redact(text_after_injection)
        has_pii = sum(pii_counts.values()) > 0
        if has_pii:
            self.audit_logger.log_event(
                event_type="INPUT_PII_REDACTED",
                stage="INPUT",
                user_id=user_id,
                role=role,
                details={"pii_counts": pii_counts},
                severity="INFO"
            )

        # 5. Emergency Risk / Urgency Evaluation
        risk_result = self.risk_guard.evaluate_risk(redacted_text, financial_amount=financial_amount)
        if risk_result.get("is_emergency", False):
            self.audit_logger.log_event(
                event_type="EMERGENCY_RISK_DETECTED",
                stage="INPUT",
                user_id=user_id,
                role=role,
                details={"triggers": risk_result.get("triggers", [])},
                severity="CRITICAL"
            )

        audit_id = self.audit_logger.log_event(
            event_type="INPUT_GUARDRAIL_PASSED",
            stage="INPUT",
            user_id=user_id,
            role=role,
            details={"has_pii": has_pii, "is_emergency": risk_result.get("is_emergency", False)},
            severity="INFO"
        )

        return {
            "passed": True,
            "blocked": False,
            "sanitized_text": redacted_text,
            "pii_detected": has_pii,
            "pii_counts": pii_counts,
            "injection_detected": injection_result["is_injected"],
            "urgency": risk_result,
            "status": "APPROVED",
            "audit_id": audit_id
        }

    def process_output(
        self,
        raw_output: str,
        retrieved_sources: List[Dict[str, Any]] = None,
        disputed_amount: float = 0.0,
        domain: str = "General",
        user_id: Optional[str] = None,
        role: str = "CITIZEN"
    ) -> Dict[str, Any]:
        """
        Executes Output Guardrail Pipeline through OutputGuard coordinator.
        """
        return self.output_guard.process_output(
            raw_output=raw_output,
            retrieved_sources=retrieved_sources,
            disputed_amount=disputed_amount,
            domain=domain,
            user_id=user_id,
            role=role
        )

    def get_audit_logs(self, limit: int = 50, event_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        return self.audit_logger.get_logs(limit=limit, event_filter=event_filter)

    def get_metrics(self) -> Dict[str, Any]:
        return self.audit_logger.get_metrics()

# Singleton master instance
guardrail_manager = GuardrailManager()
