"""
System Prompts and Decision Templates for Legal Nexus Multi-Agent System
Bridges existing agent modules to the Centralized Prompt Layer.
"""

from ..prompt_layer import (
    UNIVERSAL_LEGAL_DIRECTIVES,
    CITIZEN_LEGAL_ASSISTANT_PROMPT,
    LEGAL_RESEARCH_PROMPT,
    CASE_ANALYSIS_PROMPT,
    DOCUMENT_ANALYSIS_PROMPT,
    EVIDENCE_ANALYSIS_PROMPT,
    DRAFT_GENERATION_PROMPT,
    LAWYER_ASSISTANT_PROMPT,
    PromptManager,
    prompt_manager,
    prompt_settings,
    LegalTaskType,
)

# Agent-specific prompt aliases for backward compatibility under Legal Nexus
INTAKE_AGENT_PROMPT = """
You are the Legal Nexus Intake Agent. Your job is to listen to a citizen's story in English, Hindi, or Hinglish, extract relevant facts without making premature legal judgments, identify what critical information is missing, and formulate polite, targeted clarifying questions.
"""

CLASSIFICATION_AGENT_PROMPT = """
You are the Legal Nexus Case Classification Agent. Your role is to determine the primary legal domain, specific dispute issue, court jurisdiction, and urgency indicator.
"""

CASE_BUILDER_PROMPT = CASE_ANALYSIS_PROMPT

EVIDENCE_AGENT_PROMPT = EVIDENCE_ANALYSIS_PROMPT

RISK_URGENCY_PROMPT = """
You are the Legal Nexus Legal Urgency & Attention Indicator Agent. You classify the situation into:
- 🟢 GENERAL_GUIDANCE
- 🟡 ATTENTION_RECOMMENDED
- 🔴 URGENT_ASSISTANCE
"""

VERIFICATION_AGENT_PROMPT = """
You are the Legal Nexus Verification Agent. You perform claim and citation grounding to guarantee 100% factual and statutory validity without hallucinated sections.
"""

DOCUMENT_AGENT_PROMPT = DOCUMENT_ANALYSIS_PROMPT
DRAFTING_AGENT_PROMPT = DRAFT_GENERATION_PROMPT
LAWYER_AGENT_PROMPT = LAWYER_ASSISTANT_PROMPT
