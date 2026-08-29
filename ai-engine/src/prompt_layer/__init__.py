"""
Legal Nexus Centralized Prompt Layer
Provides standardized, grounded system prompts, dynamic temperature resolution,
and anti-hallucination governance for all AI Agents and LLM tasks.
"""

from .config import LegalTaskType, PromptLayerSettings, prompt_settings
from .templates import (
    UNIVERSAL_LEGAL_DIRECTIVES,
    CITIZEN_LEGAL_ASSISTANT_PROMPT,
    LEGAL_RESEARCH_PROMPT,
    CASE_ANALYSIS_PROMPT,
    DOCUMENT_ANALYSIS_PROMPT,
    EVIDENCE_ANALYSIS_PROMPT,
    DRAFT_GENERATION_PROMPT,
    LAWYER_ASSISTANT_PROMPT,
)
from .builder import PromptBuilder
from .manager import PromptManager, prompt_manager

__all__ = [
    "LegalTaskType",
    "PromptLayerSettings",
    "prompt_settings",
    "UNIVERSAL_LEGAL_DIRECTIVES",
    "CITIZEN_LEGAL_ASSISTANT_PROMPT",
    "LEGAL_RESEARCH_PROMPT",
    "CASE_ANALYSIS_PROMPT",
    "DOCUMENT_ANALYSIS_PROMPT",
    "EVIDENCE_ANALYSIS_PROMPT",
    "DRAFT_GENERATION_PROMPT",
    "LAWYER_ASSISTANT_PROMPT",
    "PromptBuilder",
    "PromptManager",
    "prompt_manager",
]
