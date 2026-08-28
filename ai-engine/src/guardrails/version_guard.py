"""
Jurisdiction & Statutory Version Validation Guardrail
Validates the currency and effective status of cited Indian statutes, detecting repealed laws and annotating modern replacements (BNS, BNSS, BSA, CPA 2019).
"""

import re
from typing import Dict, Any, Tuple, List

class LegalVersionGuard:
    # Statutory Version Mapping Table for Indian Law
    REPEALED_STATUTE_MAPPINGS = {
        "INDIAN_PENAL_CODE": {
            "patterns": [r"\bIndian\s+Penal\s+Code\b", r"\bIPC\b", r"\bI\.P\.C\.\b"],
            "repealed_name": "Indian Penal Code, 1860 (IPC)",
            "current_law": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
            "effective_date": "1 July 2024",
            "section_crosswalk": {
                "420": "Section 318(4) of Bharatiya Nyaya Sanhita, 2023 (Cheating)",
                "406": "Section 316 of Bharatiya Nyaya Sanhita, 2023 (Criminal Breach of Trust)",
                "379": "Section 303(2) of Bharatiya Nyaya Sanhita, 2023 (Theft)",
                "506": "Section 351 of Bharatiya Nyaya Sanhita, 2023 (Criminal Intimidation)",
            },
            "note": "Note: For offences committed on or after July 1, 2024, the Bharatiya Nyaya Sanhita (BNS), 2023 applies in place of the Indian Penal Code (IPC)."
        },
        "CRIMINAL_PROCEDURE_CODE": {
            "patterns": [r"\bCode\s+of\s+Criminal\s+Procedure\b", r"\bCrPC\b", r"\bCr\.P\.C\.\b"],
            "repealed_name": "Code of Criminal Procedure, 1973 (CrPC)",
            "current_law": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
            "effective_date": "1 July 2024",
            "section_crosswalk": {
                "154": "Section 173 of Bharatiya Nagarik Suraksha Sanhita, 2023 (Information in cognizable cases / FIR)",
                "438": "Section 482 of Bharatiya Nagarik Suraksha Sanhita, 2023 (Direction for grant of bail / Anticipatory Bail)",
                "437": "Section 480 of Bharatiya Nagarik Suraksha Sanhita, 2023 (Bail in non-bailable offences)",
            },
            "note": "Note: Procedural actions initiated on or after July 1, 2024 are governed by the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023."
        },
        "INDIAN_EVIDENCE_ACT": {
            "patterns": [r"\bIndian\s+Evidence\s+Act\b", r"\bEvidence\s+Act,\s+1872\b"],
            "repealed_name": "Indian Evidence Act, 1872",
            "current_law": "Bharatiya Sakshya Adhiniyam, 2023 (BSA)",
            "effective_date": "1 July 2024",
            "section_crosswalk": {
                "65B": "Section 63 of Bharatiya Sakshya Adhiniyam, 2023 (Admissibility of electronic records)",
            },
            "note": "Note: Evidence and electronic records tendered on or after July 1, 2024 are governed by Bharatiya Sakshya Adhiniyam (BSA), 2023."
        },
        "CONSUMER_PROTECTION_1986": {
            "patterns": [r"\bConsumer\s+Protection\s+Act,\s+1986\b", r"\bCPA\s+1986\b"],
            "repealed_name": "Consumer Protection Act, 1986",
            "current_law": "Consumer Protection Act, 2019 (Act No. 35 of 2019)",
            "effective_date": "20 July 2020",
            "section_crosswalk": {
                "12": "Section 35 of Consumer Protection Act, 2019 (Manner in which complaint shall be made / e-Daakhil)",
            },
            "note": "Note: The Consumer Protection Act, 1986 was repealed and replaced in full by the Consumer Protection Act, 2019."
        }
    }

    @classmethod
    def validate_and_annotate(cls, text: str) -> Tuple[str, Dict[str, Any]]:
        """
        Scans text for references to repealed Indian enactments and attaches currency crosswalks.
        """
        if not text:
            return "", {"valid": True, "version_alerts": [], "annotations_count": 0}

        version_alerts = []
        modified_text = text

        for statute_key, info in cls.REPEALED_STATUTE_MAPPINGS.items():
            matched = any(re.search(pat, text, re.IGNORECASE) for pat in info["patterns"])
            if matched:
                alert = {
                    "statute_key": statute_key,
                    "repealed_statute": info["repealed_name"],
                    "current_enactment": info["current_law"],
                    "effective_date": info["effective_date"],
                    "guidance_note": info["note"],
                }
                version_alerts.append(alert)

                # Check if specific section crosswalks exist in text
                crosswalk_details = []
                for old_sec, new_sec_desc in info["section_crosswalk"].items():
                    if re.search(rf"\bSection\s+{old_sec}\b", text, re.IGNORECASE):
                        crosswalk_details.append(f"Section {old_sec} {info['repealed_name']} → {new_sec_desc}")

                if crosswalk_details:
                    alert["section_crosswalks"] = crosswalk_details

        has_repealed = len(version_alerts) > 0

        report = {
            "valid": True,  # Non-blocking advisory
            "has_repealed_references": has_repealed,
            "version_alerts_count": len(version_alerts),
            "version_alerts": version_alerts,
            "status": "APPROVED_WITH_VERSION_NOTICES" if has_repealed else "UP_TO_DATE"
        }

        return modified_text, report
