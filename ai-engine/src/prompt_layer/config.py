"""
Prompt Layer Configuration & Temperature Settings
Provides configurable temperature, token limits, and model parameters per legal task.
All settings are dynamically overridable via environment variables.
"""

import os
from enum import Enum
from typing import Dict, Any
from pydantic import BaseModel, Field


class LegalTaskType(str, Enum):
    """
    Standardized task identifiers across the Legal Nexus AI platform.
    """
    CITIZEN_LEGAL_ASSISTANT = "citizen_legal_assistant"
    LEGAL_RESEARCH = "legal_research"
    CASE_ANALYSIS = "case_analysis"
    DOCUMENT_ANALYSIS = "document_analysis"
    EVIDENCE_ANALYSIS = "evidence_analysis"
    DRAFT_GENERATION = "draft_generation"
    LAWYER_ASSISTANT = "lawyer_assistant"
    INTAKE_EXTRACTION = "intake_extraction"
    VERIFICATION = "verification"


class PromptLayerSettings(BaseModel):
    """
    Dynamic configuration for Prompt Layer temperature and generation constraints.
    Default temperatures strictly follow legal domain risk profiles:
      - Factual / Research / Case Analysis / Verification: 0.1 - 0.2
      - Document Intelligence & Clause Extraction: 0.1 - 0.2
      - Legal Notice & Pleading Draft Generation: 0.2 - 0.4
      - Conversational Intake & Citizen Guidance: 0.3 - 0.5
    """

    # Global platform name
    platform_name: str = "Legal Nexus"

    # Task-specific temperatures (configurable via environment variables)
    temp_legal_research: float = Field(
        default_factory=lambda: float(os.getenv("PROMPT_TEMP_LEGAL_RESEARCH", "0.1"))
    )
    temp_case_analysis: float = Field(
        default_factory=lambda: float(os.getenv("PROMPT_TEMP_CASE_ANALYSIS", "0.15"))
    )
    temp_document_analysis: float = Field(
        default_factory=lambda: float(os.getenv("PROMPT_TEMP_DOCUMENT_ANALYSIS", "0.1"))
    )
    temp_evidence_analysis: float = Field(
        default_factory=lambda: float(os.getenv("PROMPT_TEMP_EVIDENCE_ANALYSIS", "0.15"))
    )
    temp_verification: float = Field(
        default_factory=lambda: float(os.getenv("PROMPT_TEMP_VERIFICATION", "0.1"))
    )
    temp_draft_generation: float = Field(
        default_factory=lambda: float(os.getenv("PROMPT_TEMP_DRAFT_GENERATION", "0.25"))
    )
    temp_citizen_assistant: float = Field(
        default_factory=lambda: float(os.getenv("PROMPT_TEMP_CITIZEN_ASSISTANT", "0.35"))
    )
    temp_lawyer_assistant: float = Field(
        default_factory=lambda: float(os.getenv("PROMPT_TEMP_LAWYER_ASSISTANT", "0.2"))
    )
    temp_intake_extraction: float = Field(
        default_factory=lambda: float(os.getenv("PROMPT_TEMP_INTAKE_EXTRACTION", "0.2"))
    )

    # Maximum output token constraints per task
    max_tokens_research: int = int(os.getenv("PROMPT_MAX_TOKENS_RESEARCH", "2048"))
    max_tokens_draft: int = int(os.getenv("PROMPT_MAX_TOKENS_DRAFT", "4096"))
    max_tokens_analysis: int = int(os.getenv("PROMPT_MAX_TOKENS_ANALYSIS", "3072"))
    max_tokens_chat: int = int(os.getenv("PROMPT_MAX_TOKENS_CHAT", "1536"))

    def get_temperature_for_task(self, task_type: LegalTaskType) -> float:
        """
        Resolves the appropriate temperature setting for a specific legal task.
        """
        mapping = {
            LegalTaskType.LEGAL_RESEARCH: self.temp_legal_research,
            LegalTaskType.CASE_ANALYSIS: self.temp_case_analysis,
            LegalTaskType.DOCUMENT_ANALYSIS: self.temp_document_analysis,
            LegalTaskType.EVIDENCE_ANALYSIS: self.temp_evidence_analysis,
            LegalTaskType.VERIFICATION: self.temp_verification,
            LegalTaskType.DRAFT_GENERATION: self.temp_draft_generation,
            LegalTaskType.CITIZEN_LEGAL_ASSISTANT: self.temp_citizen_assistant,
            LegalTaskType.LAWYER_ASSISTANT: self.temp_lawyer_assistant,
            LegalTaskType.INTAKE_EXTRACTION: self.temp_intake_extraction,
        }
        return mapping.get(task_type, 0.2)

    def get_max_tokens_for_task(self, task_type: LegalTaskType) -> int:
        """
        Resolves output token limit for the designated task.
        """
        if task_type == LegalTaskType.DRAFT_GENERATION:
            return self.max_tokens_draft
        elif task_type in (LegalTaskType.LEGAL_RESEARCH, LegalTaskType.DOCUMENT_ANALYSIS):
            return self.max_tokens_research
        elif task_type in (LegalTaskType.CASE_ANALYSIS, LegalTaskType.EVIDENCE_ANALYSIS):
            return self.max_tokens_analysis
        return self.max_tokens_chat


prompt_settings = PromptLayerSettings()
