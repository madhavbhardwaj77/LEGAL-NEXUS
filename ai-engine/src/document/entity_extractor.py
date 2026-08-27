"""
Legal Entity Extraction Service
Extracts parties, dates, monetary amounts, notice periods, locations, and case numbers
"""

import re
from typing import Dict, List, Any

class EntityExtractor:
    @classmethod
    def extract_entities(cls, text: str) -> Dict[str, Any]:
        if not text:
            return {}

        text_clean = text.replace("\r\n", " ")

        entities = {
            "parties": {},
            "dates": [],
            "monetaryAmounts": [],
            "noticePeriods": [],
            "jurisdiction": None,
            "legalIdentifiers": [],
        }

        # 1. Extract Parties (e.g. "between X and Y", "Employer: X, Employee: Y", "Lessor: X, Lessee: Y")
        party_match = re.search(r"between\s+([A-Za-z0-9\s,\.\(\)]+?)\s+(?:and|AND)\s+([A-Za-z0-9\s,\.\(\)]+?)(?:\s+dated|\s+herein|\s+witnesseth|\.)", text_clean, re.IGNORECASE)
        if party_match:
            entities["parties"]["partyOne"] = party_match.group(1).strip()[:80]
            entities["parties"]["partyTwo"] = party_match.group(2).strip()[:80]

        # Named party headers
        for p_type, pat in [
            ("employer", r"(?:employer|company|first party)\s*[:–-]\s*([A-Za-z0-9\s,\.]{3,60})"),
            ("employee", r"(?:employee|workman|second party)\s*[:–-]\s*([A-Za-z0-9\s,\.]{3,60})"),
            ("landlord", r"(?:landlord|lessor)\s*[:–-]\s*([A-Za-z0-9\s,\.]{3,60})"),
            ("tenant", r"(?:tenant|lessee)\s*[:–-]\s*([A-Za-z0-9\s,\.]{3,60})"),
        ]:
            m = re.search(pat, text_clean, re.IGNORECASE)
            if m:
                entities["parties"][p_type] = m.group(1).strip()

        # 2. Extract Dates (DD/MM/YYYY, DD-MM-YYYY, Month DD, YYYY)
        date_patterns = [
            r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b",
            r"\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b",
            r"\b\d{1,2}(?:st|nd|rd|th)?\s+day\s+of\s+(?:January|February|March|April|May|June|July|August|September|October|November|December),?\s+\d{4}\b"
        ]
        found_dates = []
        for pat in date_patterns:
            found_dates.extend(re.findall(pat, text_clean, re.IGNORECASE))
        entities["dates"] = list(set(found_dates))[:5]

        # 3. Extract Monetary Amounts
        money_pattern = r"(?:Rs\.?|INR|₹)\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)\s*(?:lakh|lac|crore|per month|per annum|\/-)?"
        money_matches = re.findall(money_pattern, text_clean, re.IGNORECASE)
        for m in money_matches[:5]:
            val_str = m.replace(",", "").strip()
            try:
                entities["monetaryAmounts"].append({
                    "raw": m,
                    "value": float(val_str)
                })
            except ValueError:
                pass

        # 4. Extract Notice Periods
        notice_pattern = r"\b([0-9]+|fifteen|thirty|sixty|ninety|one|two|three)\s*(?:days?|months?)\s*(?:written\s+)?notice\b"
        notices = re.findall(notice_pattern, text_clean, re.IGNORECASE)
        if notices:
            entities["noticePeriods"] = list(set(notices))

        # 5. Extract Jurisdiction & Location
        for loc in ["Delhi", "Mumbai", "Bengaluru", "Bangalore", "Hyderabad", "Pune", "Chennai", "Kolkata", "Noida", "Gurugram", "Ahmedabad"]:
            if re.search(rf"\b{loc}\b", text_clean, re.IGNORECASE):
                entities["jurisdiction"] = loc
                break

        # 6. Extract Legal Identifiers (FIR, Case No, Suit No, etc.)
        for id_pat in [
            r"\bFIR\s*No\.?\s*[0-9]+/[0-9]+\b",
            r"\bSuit\s*No\.?\s*[0-9]+/[0-9]+\b",
            r"\bCC\s*No\.?\s*[0-9]+/[0-9]+\b",
            r"\bSection\s+[0-9]+[A-Za-z]*\b"
        ]:
            ids = re.findall(id_pat, text_clean, re.IGNORECASE)
            entities["legalIdentifiers"].extend(ids)

        entities["legalIdentifiers"] = list(set(entities["legalIdentifiers"]))[:8]

        return entities
