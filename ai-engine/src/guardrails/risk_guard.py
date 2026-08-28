"""
Risk & Legal Urgency Detection Guardrail
Detects critical emergencies, time-sensitive statutory limitation deadlines, and triggers immediate legal escalations.
"""

import re
from typing import Dict, Any, List

class RiskGuard:
    EMERGENCY_TRIGGERS = [
        {
            "id": "CYBER_FRAUD_GOLDEN_HOUR",
            "keywords": [r"\bcyber\s+fraud\b", r"\bunauthorized\s+transaction\b", r"\botp\s+scam\b", r"\bmoney\s+deducted\b", r"\bphishing\b", r"\bbank\s+fraud\b"],
            "urgency": "URGENT_ASSISTANCE",
            "color": "RED",
            "score": 0.95,
            "escalation_title": "Active Cyber Financial Fraud — Golden Hour Window",
            "recommendation": "CRITICAL EMERGENCY: Dial 1930 immediately or log in to cybercrime.gov.in to freeze beneficiary accounts within the golden hour.",
            "emergency_helpline": "1930 (National Cyber Crime Reporting Helpline)"
        },
        {
            "id": "ILLEGAL_DISCONNECTION_LOCKOUT",
            "keywords": [r"\bcut\s+electricity\b", r"\bcut\s+water\b", r"\bbijli\s+kaat\s+di\b", r"\bpaani\s+band\b", r"\blockout\b", r"\bthrown\s+out\s+without\s+notice\b", r"\bforceful\s+eviction\b"],
            "urgency": "URGENT_ASSISTANCE",
            "color": "RED",
            "score": 0.90,
            "escalation_title": "Unlawful Cutting of Essential Amenities & Physical Lockout",
            "recommendation": "URGENT: Section 14 of Model Tenancy Act strictly prohibits landlords from cutting essential supplies. File an interim emergency petition before the Rent Authority.",
            "emergency_helpline": "112 (Emergency Police Response) / Local Rent Authority"
        },
        {
            "id": "MATERNITY_TERMINATION",
            "keywords": [r"\bterminated\s+during\s+pregnancy\b", r"\bmaternity\s+leave\s+firing\b", r"\bpregnant\s+fired\b", r"\bmaternity\s+benefit\b"],
            "urgency": "URGENT_ASSISTANCE",
            "color": "RED",
            "score": 0.88,
            "escalation_title": "Unlawful Termination of Pregnant Employee",
            "recommendation": "URGENT: Section 12 of the Maternity Benefit Act, 1961 makes dismissal of a pregnant employee unlawful and void. Immediate legal notice and complaint to Labour Inspector is advised.",
            "emergency_helpline": "Ministry of Labour & Employment / NALSA (15100)"
        },
        {
            "id": "THREAT_OF_VIOLENCE_OR_HARASSMENT",
            "keywords": [r"\bthreatened\s+to\s+kill\b", r"\bphysical\s+violence\b", r"\bdomestic\s+violence\b", r"\bassault\b", r"\bgoons\b", r"\bextortion\b"],
            "urgency": "URGENT_ASSISTANCE",
            "color": "RED",
            "score": 0.98,
            "escalation_title": "Immediate Threat to Physical Safety or Violence",
            "recommendation": "CRITICAL SAFETY ALERT: If you are in immediate physical danger, dial 112 (Emergency Police) or 1091 (Women Helpline) immediately before proceeding with civil legal claims.",
            "emergency_helpline": "112 (National Emergency Number) / 1091 (Women Helpline)"
        },
        {
            "id": "LIMITATION_PERIOD_EXPIRY",
            "keywords": [r"\b11\s+months\s+ago\b", r"\balmost\s+1\s+year\b", r"\b2\s+years\s+ago\b", r"\blimitation\s+period\b"],
            "urgency": "ATTENTION_RECOMMENDED",
            "color": "YELLOW",
            "score": 0.70,
            "escalation_title": "Impending Statutory Limitation Period Expiry",
            "recommendation": "ATTENTION: Statutory limitation periods (e.g. 12 months for wage claims under Payment of Wages Act, 2 years for Consumer Claims) may soon expire. Immediate filing required.",
            "emergency_helpline": "NALSA Legal Aid Helpline: 15100"
        }
    ]

    @classmethod
    def evaluate_risk(cls, text: str, financial_amount: float = 0.0) -> Dict[str, Any]:
        """
        Evaluates input text and context for emergency risk triggers.
        """
        if not text:
            return {
                "urgency_level": "GENERAL_GUIDANCE",
                "risk_score": 0.1,
                "color_code": "GREEN",
                "is_emergency": False,
                "triggers": [],
                "recommendation": "Standard legal guidance applicable.",
                "escalation_required": False
            }

        text_lower = text.lower()
        matched_triggers = []

        for trigger in cls.EMERGENCY_TRIGGERS:
            for kw in trigger["keywords"]:
                if re.search(kw, text_lower):
                    matched_triggers.append(trigger)
                    break

        if matched_triggers:
            # Sort by highest risk score
            matched_triggers.sort(key=lambda x: x["score"], reverse=True)
            top_trigger = matched_triggers[0]
            is_emergency = top_trigger["urgency"] == "URGENT_ASSISTANCE"

            return {
                "urgency_level": top_trigger["urgency"],
                "risk_score": top_trigger["score"],
                "color_code": top_trigger["color"],
                "is_emergency": is_emergency,
                "triggers": [t["escalation_title"] for t in matched_triggers],
                "recommendation": top_trigger["recommendation"],
                "emergency_helpline": top_trigger.get("emergency_helpline"),
                "escalation_required": is_emergency
            }

        # Check financial amount threshold
        if financial_amount and financial_amount > 100000:
            return {
                "urgency_level": "ATTENTION_RECOMMENDED",
                "risk_score": 0.65,
                "color_code": "YELLOW",
                "is_emergency": False,
                "triggers": [f"High financial quantum under dispute: INR {financial_amount:,.2f}"],
                "recommendation": "High financial claim. Issue a formal 15-day statutory demand notice before approaching the tribunal.",
                "escalation_required": False
            }

        return {
            "urgency_level": "GENERAL_GUIDANCE",
            "risk_score": 0.2,
            "color_code": "GREEN",
            "is_emergency": False,
            "triggers": [],
            "recommendation": "Standard legal dispute process; no emergency trigger detected.",
            "escalation_required": False
        }
