"""
Legal Entity & Citation Normalizer
"""

import re

class LegalNormalizer:
    STATUTE_ALIASES = {
        "payment of wages": "The Payment of Wages Act, 1936",
        "wages act": "The Payment of Wages Act, 1936",
        "industrial disputes": "The Industrial Disputes Act, 1947",
        "id act": "The Industrial Disputes Act, 1947",
        "consumer protection": "The Consumer Protection Act, 2019",
        "copra": "The Consumer Protection Act, 2019",
        "cpa": "The Consumer Protection Act, 2019",
        "it act": "The Information Technology Act, 2000",
        "information technology act": "The Information Technology Act, 2000",
        "cyber law": "The Information Technology Act, 2000",
        "model tenancy": "Model Tenancy Act, 2021",
        "mta": "Model Tenancy Act, 2021",
        "transfer of property": "The Transfer of Property Act, 1882",
        "tpa": "The Transfer of Property Act, 1882",
        "specific relief": "The Specific Relief Act, 1963",
        "sra": "The Specific Relief Act, 1963",
        "limitation act": "The Limitation Act, 1963",
        "nalsa": "The Legal Services Authorities Act, 1987",
        "legal aid": "The Legal Services Authorities Act, 1987",
        "dpdp": "Digital Personal Data Protection Act, 2023",
        "data protection": "Digital Personal Data Protection Act, 2023",
    }

    @classmethod
    def normalize_statute_name(cls, name: str) -> str:
        if not name:
            return ""
        name_clean = name.strip()
        lower = name_clean.lower()
        for alias, canonical in cls.STATUTE_ALIASES.items():
            if alias in lower:
                return canonical
        return name_clean

    @classmethod
    def extract_section_numbers(cls, query: str):
        """
        Extract section numbers like Section 15, Section 66D, Section 2(11)
        """
        pattern = r"\b(?:Section|Sec\.?|u/s\.?)\s*([0-9]+(?:\([0-9A-Za-z]+\))*(?:[A-Za-z]+)?)"
        matches = re.findall(pattern, query, flags=re.IGNORECASE)
        return [f"Section {m}" for m in matches]
