"""
Legal Re-ranker Service
Reranks candidates based on authority hierarchy and section-specific alignment
"""

from typing import List, Dict, Any

class LegalReranker:
    AUTHORITY_WEIGHTS = {
        "statute": 1.0,
        "judgment": 0.95,
        "scheme": 0.88,
    }

    @classmethod
    def rerank(
        cls,
        candidates: List[Dict[str, Any]],
        query: str,
        explicit_sections: List[str] = None
    ) -> List[Dict[str, Any]]:
        if not candidates:
            return []

        query_lower = query.lower()
        explicit_sections_lower = [s.lower() for s in (explicit_sections or [])]

        reranked = []
        for item in candidates:
            chunk = item.get("chunk", {})
            base_score = item.get("score", 0.0)
            doc_type = chunk.get("documentType", "statute")
            authority_multiplier = cls.AUTHORITY_WEIGHTS.get(doc_type, 0.85)

            final_score = base_score * authority_multiplier

            # Boost if query explicitly mentioned this exact section
            section_name = str(chunk.get("section", "")).lower()
            if any(s in section_name for s in explicit_sections_lower):
                final_score *= 2.0

            # Boost if act name was explicitly queried
            act_name = str(chunk.get("act", "")).lower()
            if any(w in query_lower for w in act_name.split() if len(w) > 4):
                final_score *= 1.25

            item["finalRerankScore"] = final_score
            reranked.append(item)

        reranked.sort(key=lambda x: x["finalRerankScore"], reverse=True)
        return reranked
