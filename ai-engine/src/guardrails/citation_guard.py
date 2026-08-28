"""
Legal Citation & Statutory Source Verification Guardrail
Verifies that statutory sections, Acts, constitutional articles, and legal claims are grounded in authoritative legal sources.
"""

import re
from typing import Dict, Any, List, Tuple
from ..source_verifier import SourceVerifier

class CitationGuard:
    def __init__(self, verifier: SourceVerifier = None):
        self.verifier = verifier or SourceVerifier()

    def extract_citations(self, text: str) -> List[Dict[str, str]]:
        """
        Parses text for statutory citations across standard Indian legal citation formats.
        """
        if not text:
            return []

        citations = []

        # 1. Pattern: Section X of the [Act Name]
        p1 = r"(?:Section|Sec\.)\s+([0-9A-Za-z\(\)]+)\s+(?:of\s+the\s+|of\s+)?([A-Za-z\s&,]+(?:Act|Code|Sanhita|Adhiniyam)(?:,\s+\d{4})?)"
        for m in re.finditer(p1, text, re.IGNORECASE):
            citations.append({
                "raw": m.group(0),
                "section": f"Section {m.group(1).strip()}",
                "act": m.group(2).strip(),
            })

        # 2. Pattern: Article X of the Constitution
        p2 = r"(?:Article|Art\.)\s+([0-9A-Za-z]+)\s+(?:of\s+the\s+)?(?:Constitution\s+of\s+India|Constitution)"
        for m in re.finditer(p2, text, re.IGNORECASE):
            citations.append({
                "raw": m.group(0),
                "section": f"Article {m.group(1).strip()}",
                "act": "Constitution of India",
            })

        return citations

    def verify_citations_in_text(
        self,
        text: str,
        retrieved_sources: List[Dict[str, Any]] = None
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Validates extracted citations against authoritative sources.
        Returns:
            - sanitized_text: Text with any fabricated citations flagged
            - verification_report: Detailed grounding score, verified vs unverified citations
        """
        if not text:
            return "", {"valid": True, "grounding_score": 1.0, "citations": []}

        extracted = self.extract_citations(text)
        if not extracted:
            return text, {
                "valid": True,
                "grounding_score": 1.0,
                "total_citations": 0,
                "verified_count": 0,
                "unverified_count": 0,
                "citations": [],
                "status": "NO_CITATIONS_FOUND"
            }

        verified_list = []
        unverified_list = []
        modified_text = text

        # Check in retrieved RAG context if available
        rag_text_corpus = ""
        if retrieved_sources:
            for s in retrieved_sources:
                rag_text_corpus += f"{s.get('title', '')} {s.get('act', '')} {s.get('section', '')} {s.get('text', '')} "

        for c in extracted:
            act = c["act"]
            section = c["section"]
            raw = c["raw"]

            # 1. Check with SourceVerifier (Gazette database)
            statutory_check = self.verifier.verify_citation(act=act, section=section)
            if not statutory_check.get("valid", False):
                # Fallback check raw section number without 'Section' prefix
                raw_num = section.replace("Section", "").replace("Article", "").strip()
                statutory_check = self.verifier.verify_citation(act=act, section=raw_num)

            is_in_rag = False
            if rag_text_corpus and (act.lower() in rag_text_corpus.lower() or section.lower() in rag_text_corpus.lower()):
                is_in_rag = True

            if statutory_check.get("valid", False) or is_in_rag:
                verified_list.append({
                    "raw": raw,
                    "act": act,
                    "section": section,
                    "status": "VERIFIED_AUTHORITATIVE",
                    "authority": statutory_check.get("authority", "Retrieved Legal Roll"),
                    "confidence": 1.0 if statutory_check.get("valid") else 0.85
                })
            else:
                unverified_list.append({
                    "raw": raw,
                    "act": act,
                    "section": section,
                    "status": "UNVERIFIED_OR_FABRICATED",
                    "reason": f"No authoritative gazette record found for {section} of {act}."
                })
                # Tag in output so user is not misled
                modified_text = modified_text.replace(
                    raw,
                    f"{raw} [⚠️ Unverified Statutory Citation]"
                )

        total = len(extracted)
        verified_count = len(verified_list)
        unverified_count = len(unverified_list)
        grounding_score = round(verified_count / total, 2) if total > 0 else 1.0

        is_valid = unverified_count == 0

        report = {
            "valid": is_valid,
            "grounding_score": grounding_score,
            "total_citations": total,
            "verified_count": verified_count,
            "unverified_count": unverified_count,
            "verified_citations": verified_list,
            "unverified_citations": unverified_list,
            "status": "APPROVED" if is_valid else "NEEDS_REVIEW"
        }

        return modified_text, report
