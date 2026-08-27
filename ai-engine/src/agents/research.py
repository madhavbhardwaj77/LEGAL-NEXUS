"""
Legal Research Agent
Connects the structured case to the Milestone 2 Hybrid RAG Engine
"""

from typing import Dict, Any
from ..rag_service import LegalRAGService
from ..schemas.case_schemas import StructuredCaseState

class ResearchAgent:
    def __init__(self, rag_service: LegalRAGService = None):
        self.rag_service = rag_service or LegalRAGService()

    def research_case(self, case: StructuredCaseState, user_query: str = None) -> Dict[str, Any]:
        """
        Executes hybrid retrieval and legal grounding based on structured case
        """
        # Formulate optimal research prompt from case facts
        facts_summary = f"{case.category} - {case.issue}."
        if case.financialDetails.get("disputedAmount"):
            facts_summary += f" Disputed claim amount: INR {case.financialDetails.get('disputedAmount')}."

        target_query = f"{user_query or ''} {facts_summary}".strip()

        result = self.rag_service.conduct_research(
            query=target_query,
            jurisdiction=case.jurisdiction or "India",
            top_k=4
        )

        return result
