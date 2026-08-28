"""
Prompt Injection & Adversarial Payload Detection Guardrail
Detects, neutralizes, and blocks malicious injection attacks from user inputs, uploaded documents, and RAG context.
"""

import re
from typing import Dict, Any, Tuple, List

class InjectionGuard:
    # High-Risk Attack Vectors & Jailbreak Patterns
    INJECTION_PATTERNS = [
        # System override / rule cancellation
        (r"(?i)\b(?:ignore|disregard|override|forget|bypass)\s+(?:all\s+)?(?:previous|prior|system|initial|existing)\s+(?:instructions|rules|prompts|guidelines|directives|commands)\b", "SYSTEM_OVERRIDE"),
        (r"(?i)\b(?:you\s+are\s+now|act\s+as|pretend\s+to\s+be)\s+(?:in\s+)?(?:dan|developer\s+mode|unrestricted|jailbroken|godmode|an\s+unfiltered\s+ai|admin\s+mode)\b", "ROLE_HIJACKING"),
        (r"(?i)\b(?:reveal|print|show|output|leak|dump)\s+(?:your\s+)?(?:internal\s+)?(?:system\s+prompt|initial\s+prompt|developer\s+instructions|internal\s+rules|api\s+keys?|secret\s+keys?|database\s+credentials)\b", "SYSTEM_LEAKAGE"),
        (r"(?i)\b(?:grant|give|enable)\s+(?:me\s+)?(?:full\s+)?(?:admin|administrator|root|superuser)\s+access\b", "PRIVILEGE_ESCALATION"),
        (r"(?i)\b(?:switch\s+to|enter)\s+(?:developer\s+mode|maintenance\s+mode|root\s+mode|debug\s+mode)\b", "PRIVILEGE_ESCALATION"),
        # Adversarial Delimiters and Injection Enclosures
        (r"(?i)<\s*(?:system|system_override|instruction|developer_prompt)\s*>", "TAG_INJECTION"),
        (r"(?i)\[\s*(?:system\s+note|admin\s+override|instruction|priority\s+directive)\s*:\s*[^\]]+\]", "DELIMITER_INJECTION"),
        # Base64 or Hex instruction triggers
        (r"(?i)\b(?:execute|run|eval)\s+(?:base64|hex|encoded)\s+(?:payload|instruction|string)\b", "ENCODED_EXECUTION"),
        # Indirect Document / RAG Injections
        (r"(?i)(?:note\s+to\s+ai|instruction\s+for\s+language\s+model|attention\s+ai\s+assistant)\s*:", "INDIRECT_DOC_INJECTION"),
    ]

    @classmethod
    def inspect_and_sanitize(cls, text: str, source_type: str = "USER_INPUT") -> Dict[str, Any]:
        """
        Analyzes text for injection payloads.
        Returns:
            - is_injected: Boolean flag
            - sanitized_text: Text with neutralization applied
            - confidence: Threat confidence score (0.0 to 1.0)
            - attack_types: List of detected attack categories
            - should_block: Boolean indicating whether the request must be halted immediately
        """
        if not text:
            return {
                "is_injected": False,
                "sanitized_text": "",
                "confidence": 0.0,
                "attack_types": [],
                "should_block": False,
                "details": "Empty input"
            }

        detected_attacks = []
        sanitized = text

        for pattern, attack_name in cls.INJECTION_PATTERNS:
            matches = list(re.finditer(pattern, text))
            if matches:
                detected_attacks.append(attack_name)
                # Neutralize matched injection fragment
                sanitized = re.sub(pattern, f"[NEUTRALIZED_ADVERSARIAL_DIRECTIVE: {attack_name}]", sanitized)

        # Risk scoring
        confidence = min(1.0, len(detected_attacks) * 0.45)
        is_injected = len(detected_attacks) > 0
        
        # Severe attacks warrant full block
        critical_categories = {"SYSTEM_OVERRIDE", "ROLE_HIJACKING", "SYSTEM_LEAKAGE", "TAG_INJECTION", "PRIVILEGE_ESCALATION"}
        should_block = any(att in critical_categories for att in detected_attacks)

        return {
            "is_injected": is_injected,
            "sanitized_text": sanitized if not should_block else "[BLOCKED_PROMPT_INJECTION_DETECTED]",
            "confidence": round(confidence, 2),
            "attack_types": list(set(detected_attacks)),
            "should_block": should_block,
            "source_type": source_type,
            "details": f"Detected {len(detected_attacks)} injection pattern(s): {', '.join(detected_attacks)}" if is_injected else "Clean input payload"
        }
