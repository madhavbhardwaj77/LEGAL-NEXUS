"""
Prompt Layer Manager for Legal Nexus
Central orchestrator that interfaces between Agents/Tasks, RAG Services, and LLM Inference.
"""

from typing import Dict, Any, List, Optional
from .config import LegalTaskType, prompt_settings, PromptLayerSettings
from .builder import PromptBuilder


class PromptManager:
    """
    Centralized Gateway for Prompt Construction, Governance, and LLM Temperature Management.
    """

    def __init__(self, settings: PromptLayerSettings = None):
        self.settings = settings or prompt_settings

    def create_builder(self, task_type: LegalTaskType) -> PromptBuilder:
        """Instantiates a new PromptBuilder for a specific legal task."""
        return PromptBuilder(task_type)

    def get_citizen_assistant_prompt(
        self,
        user_message: str,
        case_facts: Optional[Dict[str, Any]] = None,
        rag_chunks: Optional[List[Dict[str, Any]]] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        language: str = "en",
    ) -> Dict[str, Any]:
        """Builds prompt for Citizen Legal Assistant task."""
        builder = (
            self.create_builder(LegalTaskType.CITIZEN_LEGAL_ASSISTANT)
            .with_user_message(user_message)
            .with_user_role("CITIZEN")
            .with_language(language)
        )
        if case_facts:
            builder.with_case_facts(case_facts)
        if rag_chunks:
            builder.with_rag_context(rag_chunks)
        if conversation_history:
            builder.with_conversation_history(conversation_history)

        return builder.build()

    def get_legal_research_prompt(
        self,
        query: str,
        rag_chunks: List[Dict[str, Any]],
        jurisdiction: str = "India",
        language: str = "en",
    ) -> Dict[str, Any]:
        """Builds prompt for Legal Research task with RAG groundings."""
        builder = (
            self.create_builder(LegalTaskType.LEGAL_RESEARCH)
            .with_user_message(query)
            .with_rag_context(rag_chunks)
            .with_language(language)
            .add_instruction(f"Jurisdiction focus: {jurisdiction}")
        )
        return builder.build()

    def get_case_analysis_prompt(
        self,
        story: str,
        existing_case: Optional[Dict[str, Any]] = None,
        rag_chunks: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """Builds prompt for Case Analysis and Intelligence task."""
        builder = (
            self.create_builder(LegalTaskType.CASE_ANALYSIS)
            .with_user_message(story)
        )
        if existing_case:
            builder.with_case_facts(existing_case)
        if rag_chunks:
            builder.with_rag_context(rag_chunks)

        return builder.build()

    def get_document_analysis_prompt(
        self,
        document_content: str,
        filename: str = "document.pdf",
        document_type: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Builds prompt for Document Intelligence and Clause Audit task."""
        builder = (
            self.create_builder(LegalTaskType.DOCUMENT_ANALYSIS)
            .with_user_message(f"DOCUMENT CONTENT (Filename: {filename}):\n{document_content}")
        )
        if document_type:
            builder.add_instruction(f"Target Document Type: {document_type}")

        return builder.build()

    def get_evidence_analysis_prompt(
        self,
        case_facts: Dict[str, Any],
        available_evidence: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """Builds prompt for Evidence Audit and Admissibility task."""
        message = "Evaluate evidence sufficiency, missing records, and admissibility for this dispute."
        if available_evidence:
            message += f"\nCurrently Available Evidence:\n{available_evidence}"

        builder = (
            self.create_builder(LegalTaskType.EVIDENCE_ANALYSIS)
            .with_case_facts(case_facts)
            .with_user_message(message)
        )
        return builder.build()

    def get_draft_generation_prompt(
        self,
        draft_type: str,
        case_data: Dict[str, Any],
        variables: Optional[Dict[str, Any]] = None,
        rag_chunks: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """Builds prompt for Legal Draft Notice / Pleading Generation."""
        msg = f"Generate formal legal draft of type: {draft_type}."
        if variables:
            msg += f"\nCustom Drafting Variables:\n{variables}"

        builder = (
            self.create_builder(LegalTaskType.DRAFT_GENERATION)
            .with_case_facts(case_data)
            .with_user_message(msg)
            .add_instruction(f"Required Draft Type: {draft_type}")
        )
        if rag_chunks:
            builder.with_rag_context(rag_chunks)

        return builder.build()

    def get_lawyer_assistant_prompt(
        self,
        query: str,
        case_facts: Optional[Dict[str, Any]] = None,
        rag_chunks: Optional[List[Dict[str, Any]]] = None,
        role: str = "LAWYER",
    ) -> Dict[str, Any]:
        """Builds prompt for Lawyer / Legal Professional Co-Pilot task."""
        builder = (
            self.create_builder(LegalTaskType.LAWYER_ASSISTANT)
            .with_user_message(query)
            .with_user_role(role)
        )
        if case_facts:
            builder.with_case_facts(case_facts)
        if rag_chunks:
            builder.with_rag_context(rag_chunks)

        return builder.build()


# Centralized singleton instance
prompt_manager = PromptManager()
