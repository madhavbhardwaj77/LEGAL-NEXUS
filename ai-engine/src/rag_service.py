"""
Legal RAG Service Orchestrator
Coordinates Domain Detection -> Query Expansion -> Hybrid Retrieval -> Re-ranking -> Source Verification -> Structured Synthesis
"""

from typing import Dict, List, Any, Tuple
from .domain_classifier import LegalDomainClassifier
from .query_expander import QueryExpander
from .hybrid_retriever import HybridRetriever
from .reranker import LegalReranker
from .source_verifier import SourceVerifier

class LegalRAGService:
    def __init__(self, data_dir: str = None):
        self.retriever = HybridRetriever.get_instance(data_dir=data_dir)
        self.verifier = SourceVerifier(hybrid_retriever=self.retriever)

    def conduct_research(
        self,
        query: str,
        jurisdiction: str = "India",
        language: str = "en",
        top_k: int = 4
    ) -> Dict[str, Any]:
        """
        Executes end-to-end legal research with authoritative citations
        """
        # 1. Domain Detection
        domain_name, domain_conf, matched_tags = LegalDomainClassifier.classify_domain(query)

        # 2. Query Decomposition & Expansion
        query_meta = QueryExpander.expand_query(query)
        search_query = query_meta["expandedQuery"]

        # 3. Hybrid Retrieval (Dense + BM25)
        raw_candidates = self.retriever.retrieve(
            query=search_query,
            domain_filter=domain_name if domain_conf > 0.55 else None,
            top_k=top_k * 2
        )

        # 4. Re-ranking
        reranked_candidates = LegalReranker.rerank(
            candidates=raw_candidates,
            query=query,
            explicit_sections=query_meta["explicitSections"]
        )

        top_candidates = reranked_candidates[:top_k]

        # 5. Source Verification and Grounding
        verified_provisions, authoritative_sources = self.verifier.verify_and_ground_candidates(
            candidates=top_candidates,
            query=query
        )

        # 6. Synthesize Plain-Language Explanation & Actionable Remedies
        explanation, remedies = self._synthesize_explanation_and_remedies(
            query=query,
            domain=domain_name,
            provisions=verified_provisions
        )

        # Compute Overall Confidence
        if any(p.get("confidence") == "HIGH" for p in verified_provisions):
            overall_confidence = "HIGH"
        elif any(p.get("confidence") == "MEDIUM" for p in verified_provisions):
            overall_confidence = "MEDIUM"
        else:
            overall_confidence = "NEEDS_PROFESSIONAL_VERIFICATION"

        return {
            "query": query,
            "detectedDomain": domain_name,
            "domainConfidence": round(domain_conf, 2),
            "jurisdiction": jurisdiction,
            "language": language,
            "legalBasis": verified_provisions,
            "explanation": explanation,
            "actionableRemedies": remedies,
            "sources": authoritative_sources,
            "confidence": overall_confidence,
            "verifiedAt": "2026-08-27",
        }

    def _synthesize_explanation_and_remedies(
        self,
        query: str,
        domain: str,
        provisions: List[Dict[str, Any]]
    ) -> Tuple[str, List[Dict[str, str]]]:
        remedies = []

        if not provisions:
            return (
                "Based on the query, no direct statutory provisions were located. Please consult a verified advocate for specific guidance.",
                [{"step": "Consult Advocate", "detail": "Consult a legal professional through the Nyaya Setu directory."}]
            )

        primary = provisions[0]
        act_title = primary.get("act", "the applicable statute")
        section = primary.get("section", "relevant provision")

        explanation = (
            f"Under Indian law ({act_title}), your issue falls within the scope of {section}. "
            f"The law stipulates that rights and liabilities are governed by statutory mandates. "
            f"Specifically: {primary.get('statutorySnippet', '')} "
            f"You have a statutory entitlement to seek full redressal, compensation, and restitution through designated authorities."
        )

        for p in provisions:
            if p.get("actionableRemedy"):
                remedies.append({
                    "provision": p.get("provision"),
                    "remedy": p.get("actionableRemedy"),
                    "sourceUrl": p.get("sourceUrl"),
                })

        return explanation, remedies
