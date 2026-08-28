"""
Harm & Violent Crime Refusal Guardrail
Detects and blocks intent, planning, or solicitation of violent crimes, murder, bodily harm, self-harm, weapons, and illegal acts.
"""

import re
from typing import Dict, Any, Tuple

class HarmGuard:
    HARM_PATTERNS = [
        # Intent / inquiry to commit murder / violent crimes
        (
            r"(?i)\b(?:going\s+to|planning\s+to|want\s+to|will|how\s+to|how\s+can\s+i|help\s+me)\s+(?:commit\s+(?:a\s+)?(?:murder|crime|robbery|theft|fraud)|kill|murder|assassinate|slaughter|attack|shoot|stab|poison|strangle|bomb|harm|lynch)\b",
            "VIOLENT_CRIME_INTENT",
            "⚠️ Safety Alert: Legal Nexus strictly prohibits facilitating, encouraging, or advising on the commission of violent crimes, murder, or illegal acts. If you are experiencing a crisis, contact emergency services (112) or the Tele-MANAS Helpline (14416)."
        ),
        (
            r"(?i)\b(?:commit\s+(?:a\s+)?murder|committing\s+murder|how\s+to\s+murder|charges\s+(?:will|if\s+i)\s+(?:commit\s+murder|kill\s+someone))\b",
            "MURDER_INQUIRY",
            "⚠️ Safety Alert: Legal Nexus is designed for lawful legal redressal, dispute resolution, and civil rights guidance. We strictly refuse requests involving the commission of violent crimes. If you are in crisis, please dial 112 (Emergency Police) or 14416 (National Mental Health Helpline)."
        ),
        # Self-harm & suicide
        (
            r"(?i)\b(?:kill\s+myself|commit\s+suicide|end\s+my\s+life|hang\s+myself|self[- ]harm|want\s+to\s+die)\b",
            "SELF_HARM_CRISIS",
            "⚠️ Mental Health Crisis Support: If you are having thoughts of self-harm or suicide, please know that help is available. You are not alone. Please call the National Tele-MANAS Mental Health Helpline at 14416 (or 1800-891-4416) or the KIRAN Helpline at 1800-599-0019 immediately for free, confidential support."
        ),
        # Hiding evidence / evading law enforcement
        (
            r"(?i)\b(?:how\s+to\s+(?:hide|dispose\s+of)\s+(?:a\s+)?(?:body|corpse)|destroy\s+murder\s+evidence|evade\s+arrest\s+after\s+killing)\b",
            "CRIME_CONCEALMENT",
            "⚠️ Safety Alert: Requests regarding destruction of evidence or evading criminal justice cannot be fulfilled."
        ),
        # Explosives, weapons, and terrorism
        (
            r"(?i)\b(?:make\s+(?:a\s+)?bomb|build\s+explosive|manufacture\s+(?:weapons?|poisons?)|terrorist\s+attack)\b",
            "WEAPONS_EXPLOSIVES",
            "⚠️ Safety Alert: Content involving explosive manufacture or violent weapons is strictly prohibited."
        ),
    ]

    @classmethod
    def inspect(cls, text: str) -> Dict[str, Any]:
        """
        Inspects text for violent crime intent, self-harm, or severe illegal acts.
        """
        if not text:
            return {
                "is_harmful": False,
                "should_block": False,
                "category": None,
                "refusal_message": None
            }

        for pattern, category, message in cls.HARM_PATTERNS:
            if re.search(pattern, text):
                return {
                    "is_harmful": True,
                    "should_block": True,
                    "category": category,
                    "refusal_message": message
                }

        return {
            "is_harmful": False,
            "should_block": False,
            "category": None,
            "refusal_message": None
        }
