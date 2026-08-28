"""
Privacy-Preserving Audit Logger & Security Event Monitor
Records security events, guardrail enforcements, blocked injection attempts, and verification metrics without persisting raw sensitive citizen data.
"""

import time
import hashlib
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

class GuardrailAuditLogger:
    def __init__(self, max_in_memory_logs: int = 500):
        self.max_logs = max_in_memory_logs
        self.logs: List[Dict[str, Any]] = []
        self.metrics = {
            "total_requests_audited": 0,
            "pii_redaction_events": 0,
            "prompt_injections_neutralized": 0,
            "prompt_injections_blocked": 0,
            "unauthorized_access_blocked": 0,
            "citations_verified": 0,
            "citations_unverified": 0,
            "statute_version_alerts": 0,
            "claims_calibrated": 0,
            "human_escalations_triggered": 0,
            "clean_requests": 0,
        }

    def _hash_identifier(self, raw_str: Optional[str]) -> str:
        if not raw_str:
            return "ANONYMOUS"
        return hashlib.sha256(raw_str.encode("utf-8")).hexdigest()[:12]

    def log_event(
        self,
        event_type: str,
        stage: str,  # "INPUT" | "OUTPUT" | "ACCESS"
        user_id: Optional[str] = None,
        role: str = "GUEST",
        details: Dict[str, Any] = None,
        severity: str = "INFO"  # "INFO" | "WARNING" | "CRITICAL"
    ) -> str:
        """
        Appends a sanitized, privacy-safe audit record.
        """
        audit_id = f"AUD-{int(time.time() * 1000)}-{hashlib.md5(str(time.time()).encode()).hexdigest()[:6]}"
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Clean details to ensure NO raw PII values are stored in logs
        sanitized_details = dict(details or {})
        for k in ["raw_text", "raw_response", "aadhaar", "pan", "phone", "email", "card", "otp"]:
            if k in sanitized_details:
                sanitized_details[k] = "[MASKED_FOR_AUDIT_LOG_PRIVACY]"

        record = {
            "audit_id": audit_id,
            "timestamp": timestamp,
            "event_type": event_type,
            "stage": stage,
            "user_hash": self._hash_identifier(user_id),
            "role": role,
            "severity": severity,
            "details": sanitized_details
        }

        # Update metrics
        self.metrics["total_requests_audited"] += 1
        if "PII" in event_type:
            self.metrics["pii_redaction_events"] += 1
        elif "INJECTION_BLOCKED" in event_type:
            self.metrics["prompt_injections_blocked"] += 1
        elif "INJECTION" in event_type:
            self.metrics["prompt_injections_neutralized"] += 1
        elif "UNAUTHORIZED" in event_type or "FORBIDDEN" in event_type:
            self.metrics["unauthorized_access_blocked"] += 1
        elif "CITATION_UNVERIFIED" in event_type:
            self.metrics["citations_unverified"] += 1
        elif "CITATION_VERIFIED" in event_type:
            self.metrics["citations_verified"] += 1
        elif "VERSION_ALERT" in event_type:
            self.metrics["statute_version_alerts"] += 1
        elif "CALIBRATED" in event_type:
            self.metrics["claims_calibrated"] += 1
        elif "ESCALATION" in event_type:
            self.metrics["human_escalations_triggered"] += 1
        else:
            self.metrics["clean_requests"] += 1

        self.logs.append(record)
        if len(self.logs) > self.max_logs:
            self.logs.pop(0)

        return audit_id

    def get_logs(self, limit: int = 50, event_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        filtered = self.logs
        if event_filter:
            filtered = [l for l in filtered if l["event_type"] == event_filter or event_filter in l["event_type"]]
        return list(reversed(filtered[-limit:]))

    def get_metrics(self) -> Dict[str, Any]:
        return {
            "metrics": self.metrics,
            "total_logs_stored": len(self.logs),
            "engine_status": "MONITORING_ACTIVE",
            "last_active": datetime.now(timezone.utc).isoformat()
        }

audit_logger = GuardrailAuditLogger()
