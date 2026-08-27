"""
Legal Query Expander & Decomposition Service
"""

import re
from typing import Dict, List, Any

class QueryExpander:
    SYNONYM_MAP = {
        "unpaid salary": ["withholding of wages", "delayed wages", "Section 15 Payment of Wages Act", "wage period Section 4", "termination dues Section 5", "arrears of salary"],
        "wrongful termination": ["illegal dismissal", "Section 2A Industrial Disputes Act", "retrenchment compensation Section 25F", "severance pay"],
        "security deposit": ["refund of security deposit Section 10 Model Tenancy Act", "withholding deposit", "two months rent limit", "rent authority petition"],
        "eviction": ["arbitrary eviction Section 21 Model Tenancy Act", "Section 106 Transfer of Property Act 15 days notice", "forceful lockout"],
        "electricity cut": ["essential services Section 14 Model Tenancy Act", "water supply disconnection penalty"],
        "defective product": ["deficiency in service Section 2(11) Consumer Protection Act", "unfair trade practice Section 2(47)", "refund replacement Section 39"],
        "online fraud": ["Section 66D IT Act cheating by personation", "Section 66C identity theft", "1930 cyber helpline", "financial cyber fraud", "cybercrime reporting portal"],
        "fake product": ["counterfeit goods", "e-commerce rules 2020", "misleading advertisement", "consumer commission"],
        "free lawyer": ["Section 12 Legal Services Authorities Act", "free legal aid NALSA", "DLSA panel advocate", "indigent legal assistance"],
    }

    @classmethod
    def expand_query(cls, raw_query: str) -> Dict[str, Any]:
        raw_clean = raw_query.strip()
        lower_query = raw_clean.lower()

        # 1. Extract explicit section references
        section_pattern = r"\b(?:section|sec\.?|u/s\.?)\s*([0-9]+(?:\([0-9A-Za-z]+\))*(?:[A-Za-z]+)?)"
        explicit_sections = re.findall(section_pattern, lower_query)
        formatted_sections = [f"Section {s}" for s in explicit_sections]

        # 2. Extract explicit act names
        explicit_acts = []
        for act_key in ["payment of wages", "industrial disputes", "consumer protection", "information technology", "it act", "model tenancy", "transfer of property", "specific relief", "limitation act", "nalsa", "maternity benefit", "dpdp"]:
            if act_key in lower_query:
                explicit_acts.append(act_key)

        # 3. Add legal conceptual expansions
        expanded_terms = []
        for phrase, expansions in cls.SYNONYM_MAP.items():
            if phrase in lower_query or any(w in lower_query for w in phrase.split()):
                expanded_terms.extend(expansions[:2])

        # Combine into search target
        expanded_query_string = f"{raw_clean} {' '.join(formatted_sections)} {' '.join(expanded_terms)}"

        return {
            "originalQuery": raw_clean,
            "expandedQuery": expanded_query_string.strip(),
            "explicitSections": formatted_sections,
            "explicitActs": explicit_acts,
            "expandedKeywords": list(set(expanded_terms)),
        }
