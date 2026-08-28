"""
Nyaya Setu / Legal Nexus AI Guardrail Package
Centralized, modular guardrail subsystem providing 10 core verification and safety capabilities:
1. PII Detection & Redaction
2. Prompt Injection & Adversarial Payload Detection
3. Legal Citation & Statutory Source Verification
4. Legal Claim Validation & Excessive Certainty Calibration
5. Jurisdiction & Statutory Version Validation
6. Risk & Legal Urgency Detection
7. Role & Permission Access Validation
8. Output Safety & PII Leak Prevention
9. Human Escalation Engine
10. Privacy-Preserving Audit Logging
"""

from .manager import GuardrailManager, guardrail_manager
from .pii_guard import PIIGuard
from .injection_guard import InjectionGuard
from .citation_guard import CitationGuard
from .claim_guard import ClaimGuard
from .version_guard import LegalVersionGuard
from .risk_guard import RiskGuard
from .permission_guard import PermissionGuard
from .escalation_guard import EscalationGuard
from .output_guard import OutputGuard
from .audit_logger import GuardrailAuditLogger, audit_logger

__all__ = [
    "GuardrailManager",
    "guardrail_manager",
    "PIIGuard",
    "InjectionGuard",
    "CitationGuard",
    "ClaimGuard",
    "LegalVersionGuard",
    "RiskGuard",
    "PermissionGuard",
    "EscalationGuard",
    "OutputGuard",
    "GuardrailAuditLogger",
    "audit_logger",
]
